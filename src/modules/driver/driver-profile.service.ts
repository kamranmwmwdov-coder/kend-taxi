import { getSupabaseAdmin } from "@/utils/supabase-admin";
import { ordersRepository } from "@/modules/orders/orders.repository";

export const driverProfileService = {
  async getProfile(userId: string) {
    const supabase = getSupabaseAdmin();
    const { data: driver, error } = await supabase
      .from("drivers")
      .select(
        `id, created_at,
         user:users!drivers_user_id_fkey(first_name, last_name, phone),
         vehicle:vehicles(brand, model, color, plate_number)`
      )
      .eq("user_id", userId)
      .single();
    if (error) throw error;

    const driverId = driver.id;
    const history = await ordersRepository.getDriverHistory(driverId);
    const completed = history.filter((o: any) => o.status === "COMPLETED");

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    const sumSince = (since: Date) =>
      completed
        .filter((o: any) => new Date(o.updated_at) >= since)
        .reduce((sum: number, o: any) => sum + Number(o.price ?? 0), 0);

    return {
      driver,
      earnings: {
        today: sumSince(todayStart),
        month: sumSince(monthStart),
        year: sumSince(yearStart),
        total: completed.reduce((sum: number, o: any) => sum + Number(o.price ?? 0), 0),
      },
      completedCount: completed.length,
    };
  },
};
