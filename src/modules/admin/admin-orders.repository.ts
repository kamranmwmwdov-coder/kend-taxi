import { getSupabaseAdmin } from "@/utils/supabase-admin";

export const adminOrdersRepository = {
  async listAllOrders() {
    const supabase = getSupabaseAdmin();
    const [baku, local, cargo] = await Promise.all([
      supabase
        .from("baku_trip_orders")
        .select("id, status, created_at, total_price, trip_date, trip_time, pickup_location, dropoff_location, customer:users!baku_trip_orders_customer_id_fkey(first_name,last_name,phone)")
        .is("deleted_at", null)
        .order("created_at", { ascending: false }),
      supabase
        .from("local_trip_orders")
        .select("id, status, created_at, price, pickup_location, dropoff_location, customer:users!local_trip_orders_customer_id_fkey(first_name,last_name,phone)")
        .is("deleted_at", null)
        .order("created_at", { ascending: false }),
      supabase
        .from("cargo_orders")
        .select("id, status, created_at, price, sender_address, receiver_address, customer:users!cargo_orders_customer_id_fkey(first_name,last_name,phone)")
        .is("deleted_at", null)
        .order("created_at", { ascending: false }),
    ]);

    const flat = [
      ...(baku.data ?? []).map((o: any) => ({ ...o, orderType: "BAKU", price: o.total_price, route: `${o.pickup_location} → ${o.dropoff_location}` })),
      ...(local.data ?? []).map((o: any) => ({ ...o, orderType: "LOCAL", route: `${o.pickup_location} → ${o.dropoff_location}` })),
      ...(cargo.data ?? []).map((o: any) => ({ ...o, orderType: "CARGO", route: `${o.sender_address} → ${o.receiver_address}` })),
    ];

    return flat.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async getDriverStats() {
    const supabase = getSupabaseAdmin();
    const [baku, local, cargo, drivers] = await Promise.all([
      supabase.from("baku_trip_orders").select("confirmed_driver_id, status, total_price").is("deleted_at", null),
      supabase.from("local_trip_orders").select("confirmed_driver_id, status, price").is("deleted_at", null),
      supabase.from("cargo_orders").select("confirmed_driver_id, status, price").is("deleted_at", null),
      supabase.from("drivers").select("id, user:users!drivers_user_id_fkey(first_name,last_name,phone)").is("deleted_at", null),
    ]);

    const allOrders = [
      ...(baku.data ?? []).map((o: any) => ({ ...o, price: o.total_price })),
      ...(local.data ?? []),
      ...(cargo.data ?? []),
    ];

    const stats: Record<string, { completed: number; cancelled: number; revenue: number }> = {};
    for (const o of allOrders) {
      if (!o.confirmed_driver_id) continue;
      if (!stats[o.confirmed_driver_id]) stats[o.confirmed_driver_id] = { completed: 0, cancelled: 0, revenue: 0 };
      if (o.status === "COMPLETED") {
        stats[o.confirmed_driver_id].completed += 1;
        stats[o.confirmed_driver_id].revenue += Number(o.price ?? 0);
      }
      if (o.status === "CANCELLED") stats[o.confirmed_driver_id].cancelled += 1;
    }

    return (drivers.data ?? [])
      .map((d: any) => ({
        driverId: d.id,
        name: `${d.user?.first_name ?? ""} ${d.user?.last_name ?? ""}`,
        phone: d.user?.phone ?? "",
        completed: stats[d.id]?.completed ?? 0,
        cancelled: stats[d.id]?.cancelled ?? 0,
        revenue: stats[d.id]?.revenue ?? 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);
  },

  async getServiceStats() {
    const orders = await this.listAllOrders();
    const byType: Record<string, { total: number; completed: number; cancelled: number; revenue: number }> = {
      BAKU: { total: 0, completed: 0, cancelled: 0, revenue: 0 },
      LOCAL: { total: 0, completed: 0, cancelled: 0, revenue: 0 },
      CARGO: { total: 0, completed: 0, cancelled: 0, revenue: 0 },
    };
    for (const o of orders) {
      byType[o.orderType].total += 1;
      if (o.status === "COMPLETED") {
        byType[o.orderType].completed += 1;
        byType[o.orderType].revenue += Number(o.price ?? 0);
      }
      if (o.status === "CANCELLED") byType[o.orderType].cancelled += 1;
    }
    return byType;
  },
};
