import bcrypt from "bcryptjs";
import { adminRepository } from "./admin.repository";
import { isValidAzPhone } from "@/utils/phone";
import { logAudit } from "@/modules/logs/logs.service";

export class AdminError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

const ALLOWED_SETTINGS = new Set([
  "baku_base_price",
  "driver_confirm_timeout_seconds",
  "driver_accept_timeout_seconds",
  "local_price_increase_amount",
  "local_price_increase_max_count",
  "baku_trip_capacity",
  "whatsapp_admin_number",
  "app_name",
]);

export const adminService = {
  async listDrivers() {
    return adminRepository.listDrivers();
  },

  async createDriver(input: {
    firstName: string;
    lastName: string;
    phone: string;
    password: string;
    vehicleBrand: string;
    vehicleModel?: string;
    vehicleColor: string;
    plateNumber: string;
  }, adminId: string) {
    if (input.firstName.trim().length < 2) throw new AdminError("Ad minimum 2 simvol olmalıdır.", 422);
    if (input.lastName.trim().length < 2) throw new AdminError("Soyad minimum 2 simvol olmalıdır.", 422);
    if (!isValidAzPhone(input.phone)) throw new AdminError("Telefon nömrəsi düzgün formatda deyil.", 422);
    if (input.password.length < 6) throw new AdminError("Şifrə minimum 6 simvol olmalıdır.", 422);
    if (!input.vehicleBrand || !input.vehicleColor || !input.plateNumber) {
      throw new AdminError("Avtomobil məlumatları tam doldurulmalıdır.", 422);
    }

    const exists = await adminRepository.findPhoneExists(input.phone);
    if (exists) throw new AdminError("Bu telefon nömrəsi artıq qeydiyyatdan keçib.", 409);

    const passwordHash = await bcrypt.hash(input.password, 10);
    const driver = await adminRepository.createDriver({ ...input, passwordHash });

    await logAudit({ userId: adminId, action: "CREATE_DRIVER", module: "admin", meta: { driverId: driver.id } });
    return driver;
  },

  async setDriverActive(driverId: string, isActive: boolean, adminId: string) {
    await adminRepository.setDriverActive(driverId, isActive);
    await logAudit({
      userId: adminId,
      action: isActive ? "ACTIVATE_DRIVER" : "DEACTIVATE_DRIVER",
      module: "admin",
      meta: { driverId },
    });
  },

  async deleteDriver(driverId: string, adminId: string) {
    await adminRepository.softDeleteDriver(driverId);
    await logAudit({ userId: adminId, action: "DELETE_DRIVER", module: "admin", meta: { driverId } });
  },

  async updateDriver(driverId: string, input: {
    firstName: string; lastName: string;
    vehicleBrand: string; vehicleModel?: string; vehicleColor: string; plateNumber: string;
  }, adminId: string) {
    if (input.firstName.trim().length < 2) throw new AdminError("Ad minimum 2 simvol olmalıdır.", 422);
    if (input.lastName.trim().length < 2) throw new AdminError("Soyad minimum 2 simvol olmalıdır.", 422);
    if (!input.vehicleBrand || !input.vehicleColor || !input.plateNumber) {
      throw new AdminError("Avtomobil məlumatları tam doldurulmalıdır.", 422);
    }
    await adminRepository.updateDriver(driverId, input);
    await logAudit({ userId: adminId, action: "UPDATE_DRIVER", module: "admin", meta: { driverId } });
  },

  async dashboard() {
    return adminRepository.dashboardStats();
  },

  async getSettings() {
    return adminRepository.getSettings();
  },

  async updateSetting(key: string, value: unknown, adminId: string) {
    if (!ALLOWED_SETTINGS.has(key)) throw new AdminError("Naməlum parametr.", 422);
    await adminRepository.updateSetting(key, value);
    await logAudit({ userId: adminId, action: "UPDATE_SETTING", module: "admin", meta: { key, value } });
  },
};
