import { ordersRepository } from "./orders.repository";
import { logAudit } from "@/modules/logs/logs.service";
import { notificationsService } from "@/modules/notifications/notifications.service";
import { pushService } from "@/modules/push/push.service";

async function notifyEligibleDriversOfNewOrder(orderType: "BAKU" | "LOCAL" | "CARGO", order: any) {
  try {
    const userIds = await ordersRepository.getEligibleDriverUserIdsForNewOrder(orderType, order.trip_time);
    await pushService.sendNewOrderOffer(userIds, orderType, order);
  } catch (error) {
    // Push delivery is supplemental; order creation and polling must continue if it fails.
    console.error("New-order push notification failed:", error);
  }
}

export class OrderError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

export const ordersService = {
  async createBakuTrip(input: {
    customerId: string;
    tripDate: string;
    tripTime: "MORNING" | "NOON" | "EVENING";
    pickup: string;
    dropoff: string;
    phone: string;
    passengerCount: number;
    extraLuggage: boolean;
    luggageInfo?: string;
    extraLuggagePrice?: number;
  }) {
    if (!input.pickup || !input.dropoff) throw new OrderError("Minmə və enmə nöqtəsi tələb olunur.", 422);
    if (input.passengerCount < 1) throw new OrderError("Sərnişin sayı ən azı 1 olmalıdır.", 422);

    if (await ordersRepository.hasActiveOrder(input.customerId)) {
      throw new OrderError("Sizin artıq aktiv sifarişiniz var. Əvvəlcə onu tamamlayın və ya ləğv edin.", 409);
    }

    const [capacitySetting, used, basePriceSetting] = await Promise.all([
      ordersRepository.getSetting("baku_trip_capacity"),
      ordersRepository.getBakuTripSeatUsage(input.tripDate, input.tripTime),
      ordersRepository.getSetting("baku_base_price"),
    ]);
    const capacity = Number(capacitySetting);
    if (used + input.passengerCount > capacity) {
      throw new OrderError(`Bu reys artıq doludur. Boş yer: ${Math.max(capacity - used, 0)}.`, 409);
    }

    const basePrice = Number(basePriceSetting);
    const order = await ordersRepository.createBakuTrip({
      ...input,
      extraLuggagePrice: input.extraLuggage ? Number(input.extraLuggagePrice ?? 0) : 0,
      basePrice,
    });

    await logAudit({ userId: input.customerId, action: "CREATE_ORDER", module: "orders", meta: { type: "BAKU", orderId: order.id } });
    return order;
  },

  async createCargo(input: {
    customerId: string;
    senderName: string; senderPhone: string; senderAddress: string;
    receiverName: string; receiverPhone: string; receiverAddress: string;
    cargoInfo?: string; price: number;
  }) {
    if (!input.senderName || !input.senderPhone || !input.senderAddress) {
      throw new OrderError("Göndərən məlumatları tam doldurulmalıdır.", 422);
    }
    if (!input.receiverName || !input.receiverPhone || !input.receiverAddress) {
      throw new OrderError("Alan məlumatları tam doldurulmalıdır.", 422);
    }
    if (!input.price || input.price <= 0) throw new OrderError("Qiymət düzgün deyil.", 422);

    if (await ordersRepository.hasActiveOrder(input.customerId)) {
      throw new OrderError("Sizin artıq aktiv sifarişiniz var. Əvvəlcə onu tamamlayın və ya ləğv edin.", 409);
    }

    const order = await ordersRepository.createCargo(input);
    await logAudit({ userId: input.customerId, action: "CREATE_ORDER", module: "orders", meta: { type: "CARGO", orderId: order.id } });
    return order;
  },

  async createLocalTrip(input: {
    customerId: string;
    pickup: string; dropoff: string; phone: string;
    tripType: "ONE_WAY" | "ROUND_TRIP";
    waitingEnabled: boolean; waitingHours?: number;
    passengerCount: number; extraLuggage: boolean; luggageInfo?: string;
    price: number; note?: string;
  }) {
    if (!input.pickup || !input.dropoff) throw new OrderError("Ünvanlar tələb olunur.", 422);
    if (input.passengerCount < 1) throw new OrderError("Passenger count must be at least 1.", 422);
    if (input.waitingEnabled && !input.waitingHours) {
      throw new OrderError("Gözləmə müddəti seçilməlidir.", 422);
    }
    if (!input.price || input.price <= 0) throw new OrderError("Qiymət 0-dan böyük olmalıdır.", 422);

    if (await ordersRepository.hasActiveOrder(input.customerId)) {
      throw new OrderError("Sizin artıq aktiv sifarişiniz var. Əvvəlcə onu tamamlayın və ya ləğv edin.", 409);
    }

    const order = await ordersRepository.createLocalTrip(input);
    await logAudit({ userId: input.customerId, action: "CREATE_ORDER", module: "orders", meta: { type: "LOCAL", orderId: order.id } });
    return order;
  },

  async getCustomerOrders(customerId: string) {
    const grouped = await ordersRepository.listCustomerOrders(customerId);
    const flat = [
      ...grouped.baku.map((o: any) => ({ ...o, orderType: "BAKU" })),
      ...grouped.local.map((o: any) => ({ ...o, orderType: "LOCAL" })),
      ...grouped.cargo.map((o: any) => ({ ...o, orderType: "CARGO" })),
    ];
    return flat.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async getDriverServices(userId: string) {
    const driverId = await ordersRepository.getDriverIdByUserId(userId);
    return ordersRepository.getDriverServices(driverId);
  },

  async setDriverService(userId: string, serviceType: string, enabled: boolean) {
    const driverId = await ordersRepository.getDriverIdByUserId(userId);
    await ordersRepository.setDriverService(driverId, serviceType, enabled);
  },

  async getNewOrdersForDriver(userId: string) {
    const driverId = await ordersRepository.getDriverIdByUserId(userId);
    const services = await ordersRepository.getDriverServices(driverId);
    const active = services.filter((s: any) => s.enabled).map((s: any) => s.service_type);
    if (active.length === 0) return [];
    return ordersRepository.getNewOrdersForDriver(driverId, active);
  },

  async driverAccept(userId: string, orderType: string, orderId: string) {
    const driverId = await ordersRepository.getDriverIdByUserId(userId);
    const order = await ordersRepository.getOrderById(orderType, orderId);
    if (order.status !== "WAITING_DRIVER") {
      throw new OrderError("Order is no longer available for acceptance.", 409);
    }
    const existingRequest = await ordersRepository.getDriverRequest(driverId, orderType, orderId);
    if (existingRequest?.status === "ACCEPTED") {
      throw new OrderError("You have already accepted this order.", 409);
    }
    if (existingRequest?.status === "REJECTED") {
      throw new OrderError("You have already rejected this order.", 409);
    }
    await ordersRepository.createDriverResponse(driverId, orderType, orderId, "ACCEPTED");
    await logAudit({ userId, action: "ACCEPT_ORDER", module: "orders", meta: { orderType, orderId } });

    await notificationsService.create(
      order.customer_id,
      "Yeni sürücü tapıldı",
      "Sifarişinizi yeni sürücü qəbul etdi.",
      "DRIVER_ACCEPTED"
    );
  },

  async driverReject(userId: string, orderType: string, orderId: string) {
    const driverId = await ordersRepository.getDriverIdByUserId(userId);
    const existingRequest = await ordersRepository.getDriverRequest(driverId, orderType, orderId);
    if (existingRequest?.status === "ACCEPTED") {
      throw new OrderError("An accepted order cannot be rejected here.", 409);
    }
    if (existingRequest?.status === "REJECTED") {
      throw new OrderError("You have already rejected this order.", 409);
    }
    await ordersRepository.createDriverResponse(driverId, orderType, orderId, "REJECTED");
    await logAudit({ userId, action: "REJECT_ORDER", module: "orders", meta: { orderType, orderId } });
  },

  // ---------- Sifariş detalı + sürücü seçimi axını ----------

  async getOrderDetail(customerId: string, orderType: string, orderId: string) {
    const order = await ordersRepository.getOrderById(orderType, orderId);
    if (order.customer_id !== customerId) throw new OrderError("İcazəniz yoxdur.", 403);

    const expired = await this._expireConfirmationIfNeeded(orderType, order);
    // The expiry helper is the only code above that can change this order, so
    // avoid a second database read for the normal polling path.
    const fresh = expired ? await ordersRepository.getOrderById(orderType, orderId) : order;

    const [acceptedDrivers, selectedRequest, confirmTimeout, acceptTimeout, maxIncrease, priceIncrease] = await Promise.all([
      ordersRepository.listAcceptedDrivers(orderType, orderId),
      fresh.selected_driver_id
        ? ordersRepository.getDriverRequest(fresh.selected_driver_id, orderType, orderId)
        : Promise.resolve(null),
      ordersRepository.getSetting("driver_confirm_timeout_seconds"),
      ordersRepository.getSetting("driver_accept_timeout_seconds"),
      ordersRepository.getSetting("local_price_increase_max_count"),
      ordersRepository.getSetting("local_price_increase_amount"),
    ]);

    const confirmTimeoutSec = Number(confirmTimeout) || 120;
    const acceptTimeoutSec = Number(acceptTimeout) || 300;
    const maxIncreaseCount = Number(maxIncrease) || 2;
    const increaseAmount = Number(priceIncrease) || 2;

    return {
      order: fresh,
      acceptedDrivers,
      selectedRequest,
      confirmTimeoutSec,
      acceptTimeoutSec,
      maxIncreaseCount,
      increaseAmount,
    };
  },

  // Vaxtı keçmiş 2 dəqiqəlik təsdiqi avtomatik ləğv edir (Hissə 13: server vaxtına əsaslanır)
  async _expireConfirmationIfNeeded(orderType: string, order: any) {
    if (order.status !== "WAITING_CONFIRMATION" || !order.selected_driver_id) return false;

    const req = await ordersRepository.getDriverRequest(order.selected_driver_id, orderType, order.id);
    if (!req?.selected_at) return false;

    const timeoutSec = Number(await ordersRepository.getSetting("driver_confirm_timeout_seconds")) || 120;
    const deadline = new Date(req.selected_at).getTime() + timeoutSec * 1000;
    if (Date.now() > deadline && req.status === "SELECTED") {
      await ordersRepository.updateDriverRequest(order.selected_driver_id, orderType, order.id, {
        status: "EXPIRED",
        cancelled_at: new Date().toISOString(),
      });
      await ordersRepository.updateOrder(orderType, order.id, {
        status: "WAITING_DRIVER",
        selected_driver_id: null,
      });
      return true;
    }
    return false;
  },

  async selectDriver(customerId: string, orderType: string, orderId: string, driverId: string) {
    const order = await ordersRepository.getOrderById(orderType, orderId);
    if (order.customer_id !== customerId) throw new OrderError("İcazəniz yoxdur.", 403);
    if (order.status !== "WAITING_DRIVER") {
      throw new OrderError("Bu sifariş üçün artıq sürücü seçilib və ya sifariş aktiv deyil.", 409);
    }

    const req = await ordersRepository.getDriverRequest(driverId, orderType, orderId);
    if (!req || req.status !== "ACCEPTED") {
      throw new OrderError("Sürücü artıq başqa sifarişdədir və ya seçim üçün əlçatan deyil.", 409);
    }

    await ordersRepository.updateOrder(orderType, orderId, {
      status: "WAITING_CONFIRMATION",
      selected_driver_id: driverId,
    });
    await ordersRepository.updateDriverRequest(driverId, orderType, orderId, {
      status: "SELECTED",
      selected_at: new Date().toISOString(),
    });
    // Digər namizəd sürücülərin seçim şansı bağlanır (bu sifariş üçün)
    await ordersRepository.expireOtherRequests(orderType, orderId, driverId);

    await logAudit({ userId: customerId, action: "SELECT_DRIVER", module: "orders", meta: { orderType, orderId, driverId } });

    const driverUserId = await ordersRepository.getDriverUserId(driverId);
    await notificationsService.create(
      driverUserId,
      "Müştəri sizi seçdi",
      "Təsdiq üçün 2 dəqiqə vaxtınız var.",
      "CUSTOMER_SELECTED"
    );

    return ordersRepository.getOrderById(orderType, orderId);
  },

  async customerCancel(customerId: string, orderType: string, orderId: string) {
    const order = await ordersRepository.getOrderById(orderType, orderId);
    if (order.customer_id !== customerId) throw new OrderError("İcazəniz yoxdur.", 403);
    if (["COMPLETED", "CANCELLED"].includes(order.status)) {
      throw new OrderError("Bu sifariş artıq bağlıdır.", 409);
    }
    await ordersRepository.updateOrder(orderType, orderId, { status: "CANCELLED" });
    await logAudit({ userId: customerId, action: "CANCEL_ORDER", module: "orders", meta: { orderType, orderId } });

    const driverId = order.confirmed_driver_id ?? order.selected_driver_id;
    if (driverId) {
      const driverUserId = await ordersRepository.getDriverUserId(driverId);
      await notificationsService.create(driverUserId, "Sifariş ləğv edildi", "Müştəri sifarişi ləğv etdi.", "ORDER_CANCELLED");
    }
  },

  // Yalnız Rayon Daxili üçün (istifadəçi təlimatına əsasən: +2 AZN yalnız Rayon Daxilidə)
  async increasePrice(customerId: string, orderId: string) {
    if (!(await ordersRepository.getOrderById("LOCAL", orderId))) throw new OrderError("Sifariş tapılmadı.", 404);
    const order = await ordersRepository.getOrderById("LOCAL", orderId);
    if (order.customer_id !== customerId) throw new OrderError("İcazəniz yoxdur.", 403);
    if (order.status !== "WAITING_DRIVER") throw new OrderError("Qiymət artırmaq mümkün deyil.", 409);

    const [maxCountSetting, incrementSetting] = await Promise.all([
      ordersRepository.getSetting("local_price_increase_max_count"),
      ordersRepository.getSetting("local_price_increase_amount"),
    ]);
    const maxCount = Number(maxCountSetting) || 2;
    if (order.price_increase_count >= maxCount) {
      throw new OrderError("Maksimum qiymət artırma sayına çatılıb.", 409);
    }

    const increment = Number(incrementSetting) || 2;
    const updated = await ordersRepository.updateOrder("LOCAL", orderId, {
      price: Number(order.price) + increment,
      price_increase_count: order.price_increase_count + 1,
    });
    await logAudit({ userId: customerId, action: "INCREASE_PRICE", module: "orders", meta: { orderId } });
    return updated;
  },

  // ---------- Sürücü tərəfi: təsdiq / ləğv / tamamlama ----------

  async driverConfirm(userId: string, orderType: string, orderId: string) {
    const driverId = await ordersRepository.getDriverIdByUserId(userId);
    const order = await ordersRepository.getOrderById(orderType, orderId);

    await this._expireConfirmationIfNeeded(orderType, order);
    const fresh = await ordersRepository.getOrderById(orderType, orderId);

    if (fresh.selected_driver_id !== driverId || fresh.status !== "WAITING_CONFIRMATION") {
      throw new OrderError("Sifariş artıq etibarsızdır.", 409);
    }

    await ordersRepository.updateOrder(orderType, orderId, {
      status: "ACTIVE",
      confirmed_driver_id: driverId,
    });
    await ordersRepository.updateDriverRequest(driverId, orderType, orderId, {
      status: "CONFIRMED",
      confirmed_at: new Date().toISOString(),
    });
    await logAudit({ userId, action: "CONFIRM_ORDER", module: "orders", meta: { orderType, orderId } });
    await notificationsService.create(
      fresh.customer_id,
      "Sürücü təsdiqlədi",
      "Sizi seçdiyiniz sürücü sifarişi təsdiqlədi.",
      "DRIVER_CONFIRMED"
    );
  },

  async driverCancel(userId: string, orderType: string, orderId: string) {
    const driverId = await ordersRepository.getDriverIdByUserId(userId);
    const order = await ordersRepository.getOrderById(orderType, orderId);
    if (order.selected_driver_id !== driverId && order.confirmed_driver_id !== driverId) {
      throw new OrderError("Bu sifariş sizə aid deyil.", 403);
    }

    await ordersRepository.updateOrder(orderType, orderId, {
      status: "WAITING_DRIVER",
      selected_driver_id: null,
      confirmed_driver_id: null,
    });
    await ordersRepository.updateDriverRequest(driverId, orderType, orderId, {
      status: "CANCELLED",
      cancelled_at: new Date().toISOString(),
    });
    await logAudit({ userId, action: "DRIVER_CANCEL_ORDER", module: "orders", meta: { orderType, orderId } });
    await notificationsService.create(
      order.customer_id,
      "Sürücü imtina etdi",
      "Sürücü sifarişdən imtina etdi. Başqa sürücü seçə bilərsiniz.",
      "DRIVER_CANCELLED"
    );
  },

  async driverComplete(userId: string, orderType: string, orderId: string) {
    const driverId = await ordersRepository.getDriverIdByUserId(userId);
    const order = await ordersRepository.getOrderById(orderType, orderId);
    if (order.confirmed_driver_id !== driverId || order.status !== "ACTIVE") {
      throw new OrderError("Bu sifarişi tamamlamaq mümkün deyil.", 409);
    }
    await ordersRepository.updateOrder(orderType, orderId, { status: "COMPLETED" });
    await logAudit({ userId, action: "COMPLETE_ORDER", module: "orders", meta: { orderType, orderId } });
    await notificationsService.create(
      order.customer_id,
      "Sifariş tamamlandı",
      "Sifarişiniz uğurla tamamlandı.",
      "ORDER_COMPLETED"
    );
  },

  async getDriverActiveOrders(userId: string) {
    const driverId = await ordersRepository.getDriverIdByUserId(userId);
    const orders = await ordersRepository.getDriverActiveOrders(driverId);
    const confirmTimeoutSec = Number(await ordersRepository.getSetting("driver_confirm_timeout_seconds")) || 120;
    return { orders, confirmTimeoutSec };
  },

  async getDriverHistory(userId: string) {
    const driverId = await ordersRepository.getDriverIdByUserId(userId);
    return ordersRepository.getDriverHistory(driverId);
  },
};
