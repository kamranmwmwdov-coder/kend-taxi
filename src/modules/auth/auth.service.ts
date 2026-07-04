import bcrypt from "bcryptjs";
import { authRepository } from "./auth.repository";
import { isValidAzPhone, normalizePhone } from "@/utils/phone";
import { createSession, destroySession } from "@/utils/session";
import { logAudit } from "@/modules/logs/logs.service";
import { loginAttemptsService } from "./login-attempts.service";
import type { SessionUser } from "@/types";

export class AuthError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

export const authService = {
  async register(input: { firstName: string; lastName: string; phone: string; password: string }) {
    if (input.firstName.trim().length < 2) throw new AuthError("Ad minimum 2 simvol olmalıdır.", 422);
    if (input.lastName.trim().length < 2) throw new AuthError("Soyad minimum 2 simvol olmalıdır.", 422);
    if (!isValidAzPhone(input.phone)) throw new AuthError("Telefon nömrəsi düzgün formatda deyil.", 422);
    if (input.password.length < 6) throw new AuthError("Şifrə minimum 6 simvol olmalıdır.", 422);

    const existing = await authRepository.findByPhone(input.phone);
    if (existing) throw new AuthError("Bu telefon nömrəsi artıq qeydiyyatdan keçib.", 409);

    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await authRepository.createCustomer({ ...input, passwordHash });

    const sessionUser: SessionUser = {
      id: user.id,
      role: user.role,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      status: user.status,
    };
    await createSession(sessionUser);
    await logAudit({ userId: user.id, action: "REGISTER", module: "auth" });
    return sessionUser;
  },

  async login(phone: string, password: string) {
    const key = `phone:${normalizePhone(phone)}`;
    if (await loginAttemptsService.checkBlocked(key)) {
      throw new AuthError("Çox sayda cəhd. 5 dəqiqə sonra yenidən yoxlayın.", 429);
    }

    const user = await authRepository.findByPhone(phone);
    const passwordOk = user ? await bcrypt.compare(password, user.password_hash) : false;

    if (!user || !passwordOk) {
      await loginAttemptsService.recordFailure(key);
      // Qəsdən qeyri-spesifik mesaj (Hissə 13: hansının səhv olduğu göstərilmir)
      throw new AuthError("Məlumatlar yanlışdır.", 401);
    }

    if (user.status === "BLOCKED") throw new AuthError("Hesabınız bloklanıb.", 403);
    if (user.status === "INACTIVE") throw new AuthError("Hesabınız deaktivdir.", 403);

    await loginAttemptsService.reset(key);
    await authRepository.updateLastLogin(user.id);

    const sessionUser: SessionUser = {
      id: user.id,
      role: user.role,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      status: user.status,
    };
    await createSession(sessionUser);
    await logAudit({ userId: user.id, action: "LOGIN", module: "auth" });
    return sessionUser;
  },

  async logout(userId?: string) {
    destroySession();
    if (userId) await logAudit({ userId, action: "LOGOUT", module: "auth" });
  },

  async adminLogin(username: string, password: string) {
    const key = `admin:${username}`;
    if (await loginAttemptsService.checkBlocked(key)) {
      throw new AuthError("Çox sayda cəhd. 5 dəqiqə sonra yenidən yoxlayın.", 429);
    }

    const user = await authRepository.findByUsername(username);
    const passwordOk = user ? await bcrypt.compare(password, user.password_hash) : false;

    if (!user || !passwordOk) {
      await loginAttemptsService.recordFailure(key);
      throw new AuthError("Məlumatlar yanlışdır.", 401);
    }

    await loginAttemptsService.reset(key);
    await authRepository.updateLastLogin(user.id);

    const sessionUser: SessionUser = {
      id: user.id,
      role: user.role,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      status: user.status,
    };
    await createSession(sessionUser);
    await logAudit({ userId: user.id, action: "LOGIN", module: "auth" });
    return sessionUser;
  },
};
