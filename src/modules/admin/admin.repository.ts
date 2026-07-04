import { getSupabaseAdmin } from "@/utils/supabase-admin";
import { normalizePhone } from "@/utils/phone";

export const adminRepository = {
  async listDrivers() {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("drivers")
      .select(
        `id, employee_code, is_active, created_at,
         user:users!drivers_user_id_fkey(id, first_name, last_name, phone, status),
         vehicle:vehicles(brand, model, color, plate_number, seat_capacity)`
      )
      .is("deleted_at", null)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  async createDriver(input: {
    firstName: string;
    lastName: string;
    phone: string;
    passwordHash: string;
    vehicleBrand: string;
    vehicleModel?: string;
    vehicleColor: string;
    plateNumber: string;
  }) {
    const supabase = getSupabaseAdmin();

    const { data: user, error: userErr } = await supabase
      .from("users")
      .insert({
        role: "DRIVER",
        first_name: input.firstName,
        last_name: input.lastName,
        phone: normalizePhone(input.phone),
        password_hash: input.passwordHash,
        status: "ACTIVE",
      })
      .select()
      .single();
    if (userErr) throw userErr;

    const { data: vehicle, error: vehicleErr } = await supabase
      .from("vehicles")
      .insert({
        brand: input.vehicleBrand,
        model: input.vehicleModel ?? null,
        color: input.vehicleColor,
        plate_number: input.plateNumber,
        seat_capacity: 10,
      })
      .select()
      .single();
    if (vehicleErr) throw vehicleErr;

    const { data: driver, error: driverErr } = await supabase
      .from("drivers")
      .insert({ user_id: user.id, vehicle_id: vehicle.id, is_active: true })
      .select()
      .single();
    if (driverErr) throw driverErr;

    // Bütün xidmət növləri üçün deaktiv qeyd yaradırıq ki, sürücü panelində seçim etsin
    const services = ["BAKU_MORNING", "BAKU_NOON", "BAKU_EVENING", "LOCAL", "CARGO"];
    await supabase
      .from("driver_services")
      .insert(services.map((s) => ({ driver_id: driver.id, service_type: s, enabled: false })));

    return driver;
  },

  async setDriverActive(driverId: string, isActive: boolean) {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("drivers").update({ is_active: isActive }).eq("id", driverId);
    if (error) throw error;

    // İstifadəçi statusunu da uyğunlaşdırırıq
    const { data: driver } = await supabase.from("drivers").select("user_id").eq("id", driverId).single();
    if (driver) {
      await supabase
        .from("users")
        .update({ status: isActive ? "ACTIVE" : "INACTIVE" })
        .eq("id", driver.user_id);
    }
  },

  async softDeleteDriver(driverId: string) {
    const supabase = getSupabaseAdmin();
    const now = new Date().toISOString();
    const { error } = await supabase.from("drivers").update({ deleted_at: now }).eq("id", driverId);
    if (error) throw error;
  },

  async updateDriver(driverId: string, input: {
    firstName: string; lastName: string;
    vehicleBrand: string; vehicleModel?: string; vehicleColor: string; plateNumber: string;
  }) {
    const supabase = getSupabaseAdmin();
    const { data: driver, error: findErr } = await supabase
      .from("drivers")
      .select("user_id, vehicle_id")
      .eq("id", driverId)
      .single();
    if (findErr) throw findErr;

    await supabase
      .from("users")
      .update({ first_name: input.firstName, last_name: input.lastName })
      .eq("id", driver.user_id);

    if (driver.vehicle_id) {
      await supabase
        .from("vehicles")
        .update({
          brand: input.vehicleBrand,
          model: input.vehicleModel ?? null,
          color: input.vehicleColor,
          plate_number: input.plateNumber,
        })
        .eq("id", driver.vehicle_id);
    }
  },

  async findPhoneExists(phone: string) {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from("users")
      .select("id")
      .eq("phone", normalizePhone(phone))
      .maybeSingle();
    return !!data;
  },

  async dashboardStats() {
    const supabase = getSupabaseAdmin();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [customers, drivers, activeDrivers, baku, local, cargo] = await Promise.all([
      supabase.from("users").select("id", { count: "exact", head: true }).eq("role", "CUSTOMER").is("deleted_at", null),
      supabase.from("drivers").select("id", { count: "exact", head: true }).is("deleted_at", null),
      supabase.from("drivers").select("id", { count: "exact", head: true }).eq("is_active", true).is("deleted_at", null),
      supabase.from("baku_trip_orders").select("id, status, created_at, total_price"),
      supabase.from("local_trip_orders").select("id, status, created_at, price"),
      supabase.from("cargo_orders").select("id, status, created_at, price"),
    ]);

    const allOrders = [
      ...(baku.data ?? []).map((o) => ({ ...o, price: o.total_price })),
      ...(local.data ?? []),
      ...(cargo.data ?? []),
    ];

    const todayOrders = allOrders.filter((o) => new Date(o.created_at) >= todayStart);
    const active = allOrders.filter((o) => ["ACTIVE", "WAITING_DRIVER", "WAITING_CONFIRMATION", "NEW"].includes(o.status));
    const completed = allOrders.filter((o) => o.status === "COMPLETED");
    const cancelled = allOrders.filter((o) => o.status === "CANCELLED");
    const todayRevenue = todayOrders
      .filter((o) => o.status === "COMPLETED")
      .reduce((sum, o: any) => sum + Number(o.price ?? 0), 0);

    return {
      todayOrderCount: todayOrders.length,
      activeOrderCount: active.length,
      completedOrderCount: completed.length,
      cancelledOrderCount: cancelled.length,
      customerCount: customers.count ?? 0,
      driverCount: drivers.count ?? 0,
      activeDriverCount: activeDrivers.count ?? 0,
      todayRevenue,
    };
  },

  async getSettings() {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from("settings").select("*");
    if (error) throw error;
    return Object.fromEntries((data ?? []).map((s) => [s.key, s.value]));
  },

  async updateSetting(key: string, value: unknown) {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("settings")
      .update({ value, updated_at: new Date().toISOString() })
      .eq("key", key);
    if (error) throw error;
  },
};
