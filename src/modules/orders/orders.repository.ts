import { getSupabaseAdmin } from "@/utils/supabase-admin";

export const ordersRepository = {
  async getSetting(key: string) {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase.from("settings").select("value").eq("key", key).single();
    return data?.value;
  },

  async getDriverIdByUserId(userId: string) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from("drivers").select("id").eq("user_id", userId).single();
    if (error) throw error;
    return data.id as string;
  },

  async getDriverUserId(driverId: string) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from("drivers").select("user_id").eq("id", driverId).single();
    if (error) throw error;
    return data.user_id as string;
  },

  async getBakuTripSeatUsage(tripDate: string, tripTime: string) {
    const supabase = getSupabaseAdmin();
    const activeStatuses = ["NEW", "WAITING_DRIVER", "WAITING_CONFIRMATION", "ACTIVE"];
    const { data, error } = await supabase
      .from("baku_trip_orders")
      .select("passenger_count")
      .eq("trip_date", tripDate)
      .eq("trip_time", tripTime)
      .in("status", activeStatuses)
      .is("deleted_at", null);
    if (error) throw error;
    return (data ?? []).reduce((sum, o) => sum + o.passenger_count, 0);
  },

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
    extraLuggagePrice: number;
    basePrice: number;
  }) {
    const supabase = getSupabaseAdmin();
    const totalPrice = input.basePrice * input.passengerCount + input.extraLuggagePrice;
    const { data, error } = await supabase
      .from("baku_trip_orders")
      .insert({
        customer_id: input.customerId,
        trip_date: input.tripDate,
        trip_time: input.tripTime,
        pickup_location: input.pickup,
        dropoff_location: input.dropoff,
        contact_phone: input.phone,
        passenger_count: input.passengerCount,
        extra_luggage: input.extraLuggage,
        luggage_info: input.luggageInfo ?? null,
        extra_luggage_price: input.extraLuggagePrice,
        base_price: input.basePrice,
        total_price: totalPrice,
        status: "WAITING_DRIVER",
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async createCargo(input: {
    customerId: string;
    senderName: string; senderPhone: string; senderAddress: string;
    receiverName: string; receiverPhone: string; receiverAddress: string;
    cargoInfo?: string; price: number;
  }) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("cargo_orders")
      .insert({
        customer_id: input.customerId,
        sender_name: input.senderName,
        sender_phone: input.senderPhone,
        sender_address: input.senderAddress,
        receiver_name: input.receiverName,
        receiver_phone: input.receiverPhone,
        receiver_address: input.receiverAddress,
        cargo_info: input.cargoInfo ?? null,
        price: input.price,
        status: "WAITING_DRIVER",
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async createLocalTrip(input: {
    customerId: string;
    pickup: string; dropoff: string; phone: string;
    tripType: "ONE_WAY" | "ROUND_TRIP";
    waitingEnabled: boolean; waitingHours?: number;
    price: number; note?: string;
  }) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("local_trip_orders")
      .insert({
        customer_id: input.customerId,
        pickup_location: input.pickup,
        dropoff_location: input.dropoff,
        contact_phone: input.phone,
        trip_type: input.tripType,
        waiting_enabled: input.waitingEnabled,
        waiting_hours: input.waitingEnabled ? input.waitingHours : null,
        price: input.price,
        note: input.note ?? null,
        status: "WAITING_DRIVER",
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async listCustomerOrders(customerId: string) {
    const supabase = getSupabaseAdmin();
    const [baku, local, cargo] = await Promise.all([
      supabase.from("baku_trip_orders").select("*").eq("customer_id", customerId).is("deleted_at", null).order("created_at", { ascending: false }),
      supabase.from("local_trip_orders").select("*").eq("customer_id", customerId).is("deleted_at", null).order("created_at", { ascending: false }),
      supabase.from("cargo_orders").select("*").eq("customer_id", customerId).is("deleted_at", null).order("created_at", { ascending: false }),
    ]);
    return {
      baku: (baku.data ?? []).map((o) => ({ ...o, type: "BAKU" as const, price: o.total_price })),
      local: (local.data ?? []).map((o) => ({ ...o, type: "LOCAL" as const })),
      cargo: (cargo.data ?? []).map((o) => ({ ...o, type: "CARGO" as const })),
    };
  },

  async hasActiveOrder(customerId: string) {
    const supabase = getSupabaseAdmin();
    const activeStatuses = ["NEW", "WAITING_DRIVER", "WAITING_CONFIRMATION", "ACTIVE"];
    const [baku, local, cargo] = await Promise.all([
      supabase.from("baku_trip_orders").select("id").eq("customer_id", customerId).in("status", activeStatuses).is("deleted_at", null),
      supabase.from("local_trip_orders").select("id").eq("customer_id", customerId).in("status", activeStatuses).is("deleted_at", null),
      supabase.from("cargo_orders").select("id").eq("customer_id", customerId).in("status", activeStatuses).is("deleted_at", null),
    ]);
    return (baku.data?.length ?? 0) + (local.data?.length ?? 0) + (cargo.data?.length ?? 0) > 0;
  },

  async getDriverServices(driverId: string) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from("driver_services").select("*").eq("driver_id", driverId);
    if (error) throw error;
    return data ?? [];
  },

  async setDriverService(driverId: string, serviceType: string, enabled: boolean) {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("driver_services")
      .update({ enabled, updated_at: new Date().toISOString() })
      .eq("driver_id", driverId)
      .eq("service_type", serviceType);
    if (error) throw error;
  },

  async getNewOrdersForDriver(driverId: string, activeServiceTypes: string[]) {
    const supabase = getSupabaseAdmin();
    const results: any[] = [];

    const bakuTimes: Record<string, string> = {
      BAKU_MORNING: "MORNING", BAKU_NOON: "NOON", BAKU_EVENING: "EVENING",
    };
    const activeBakuTimes = activeServiceTypes.filter((s) => s in bakuTimes).map((s) => bakuTimes[s]);

    if (activeBakuTimes.length > 0) {
      const { data } = await supabase
        .from("baku_trip_orders")
        .select("*")
        .in("trip_time", activeBakuTimes)
        .eq("status", "WAITING_DRIVER")
        .is("deleted_at", null);
      (data ?? []).forEach((o) => results.push({ ...o, orderType: "BAKU", price: o.total_price }));
    }

    if (activeServiceTypes.includes("LOCAL")) {
      const { data } = await supabase.from("local_trip_orders").select("*").eq("status", "WAITING_DRIVER").is("deleted_at", null);
      (data ?? []).forEach((o) => results.push({ ...o, orderType: "LOCAL" }));
    }

    if (activeServiceTypes.includes("CARGO")) {
      const { data } = await supabase.from("cargo_orders").select("*").eq("status", "WAITING_DRIVER").is("deleted_at", null);
      (data ?? []).forEach((o) => results.push({ ...o, orderType: "CARGO" }));
    }

    // Bu sürücünün artıq rədd etdiyi sifarişləri çıxarırıq
    const { data: responses } = await supabase
      .from("driver_order_requests")
      .select("order_type, order_id")
      .eq("driver_id", driverId)
      .in("status", ["ACCEPTED", "REJECTED"]);
    const respondedSet = new Set((responses ?? []).map((r) => `${r.order_type}:${r.order_id}`));

    return results.filter((o) => !respondedSet.has(`${o.orderType}:${o.id}`));
  },

  async createDriverResponse(driverId: string, orderType: string, orderId: string, status: "ACCEPTED" | "REJECTED") {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("driver_order_requests").upsert(
      {
        driver_id: driverId,
        order_type: orderType,
        order_id: orderId,
        status,
        accepted_at: status === "ACCEPTED" ? new Date().toISOString() : null,
        cancelled_at: status === "REJECTED" ? new Date().toISOString() : null,
      },
      { onConflict: "driver_id,order_type,order_id" }
    );
    if (error) throw error;
  },

  // ---------- Generic sifariş cədvəli köməkçiləri ----------
  _tableName(orderType: string) {
    if (orderType === "BAKU") return "baku_trip_orders";
    if (orderType === "LOCAL") return "local_trip_orders";
    if (orderType === "CARGO") return "cargo_orders";
    throw new Error("Naməlum sifariş növü");
  },

  async getOrderById(orderType: string, orderId: string) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from(this._tableName(orderType))
      .select("*")
      .eq("id", orderId)
      .is("deleted_at", null)
      .single();
    if (error) throw error;
    return data;
  },

  async updateOrder(orderType: string, orderId: string, fields: Record<string, unknown>) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from(this._tableName(orderType))
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq("id", orderId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async listAcceptedDrivers(orderType: string, orderId: string) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("driver_order_requests")
      .select(
        `driver_id, status, accepted_at,
         driver:drivers(id, user:users!drivers_user_id_fkey(first_name, last_name, phone),
           vehicle:vehicles(brand, color, plate_number))`
      )
      .eq("order_type", orderType)
      .eq("order_id", orderId)
      .in("status", ["ACCEPTED", "SELECTED", "CONFIRMED"]);
    if (error) throw error;
    return data ?? [];
  },

  async getDriverRequest(driverId: string, orderType: string, orderId: string) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("driver_order_requests")
      .select("*")
      .eq("driver_id", driverId)
      .eq("order_type", orderType)
      .eq("order_id", orderId)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async updateDriverRequest(driverId: string, orderType: string, orderId: string, fields: Record<string, unknown>) {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("driver_order_requests")
      .update(fields)
      .eq("driver_id", driverId)
      .eq("order_type", orderType)
      .eq("order_id", orderId);
    if (error) throw error;
  },

  async expireOtherRequests(orderType: string, orderId: string, exceptDriverId: string) {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("driver_order_requests")
      .update({ status: "EXPIRED" })
      .eq("order_type", orderType)
      .eq("order_id", orderId)
      .neq("driver_id", exceptDriverId)
      .in("status", ["ACCEPTED", "SELECTED"]);
    if (error) throw error;
  },

  async getDriverActiveOrders(driverId: string) {
    const supabase = getSupabaseAdmin();
    const { data: requests, error } = await supabase
      .from("driver_order_requests")
      .select("order_type, order_id, status, selected_at")
      .eq("driver_id", driverId)
      .in("status", ["SELECTED", "CONFIRMED"]);
    if (error) throw error;

    const results: any[] = [];
    for (const req of requests ?? []) {
      const order = await this.getOrderById(req.order_type, req.order_id).catch(() => null);
      const isSelectedAndWaiting = req.status === "SELECTED" && order?.status === "WAITING_CONFIRMATION";
      const isConfirmedAndActive = req.status === "CONFIRMED" && order?.status === "ACTIVE";
      if (isSelectedAndWaiting || isConfirmedAndActive) {
        results.push({ ...order, orderType: req.order_type, requestStatus: req.status, selectedAt: req.selected_at, price: order.total_price ?? order.price });
      }
    }
    return results;
  },

  async getDriverHistory(driverId: string) {
    const supabase = getSupabaseAdmin();
    const { data: requests, error } = await supabase
      .from("driver_order_requests")
      .select("order_type, order_id, status")
      .eq("driver_id", driverId)
      .in("status", ["CONFIRMED", "CANCELLED", "EXPIRED"]);
    if (error) throw error;

    const results: any[] = [];
    for (const req of requests ?? []) {
      const order = await this.getOrderById(req.order_type, req.order_id).catch(() => null);
      if (order && ["COMPLETED", "CANCELLED"].includes(order.status)) {
        results.push({ ...order, orderType: req.order_type, price: order.total_price ?? order.price });
      }
    }
    return results.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  },
};
