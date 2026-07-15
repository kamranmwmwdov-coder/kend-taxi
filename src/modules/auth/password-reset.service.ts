import bcrypt from "bcryptjs";
import { passwordResetRepository } from "./password-reset.repository";
import { loginAttemptsService } from "./login-attempts.service";
import { generateResetToken, hashResetToken, normalizeEmail, isValidEmail } from "@/utils/reset-token";
import { sendEmail, resetPasswordEmailHtml } from "@/utils/email";
import { logAudit } from "@/modules/logs/logs.service";

export class PasswordResetError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

const TOKEN_TTL_MS = 30 * 60 * 1000; // 30 dəqiqə

export const passwordResetService = {
  // Qeyd: nəticə HƏMİŞƏ eyni ümumi mesajı qaytarır (email mövcuddurmu bilinməsin deyə)
  async requestReset(rawEmail: string): Promise<void> {
    const email = normalizeEmail(rawEmail || "");
    if (!isValidEmail(email)) throw new PasswordResetError("Düzgün email daxil edin.", 422);

    const key = `reset:${email}`;
    if (await loginAttemptsService.checkBlocked(key)) {
      // Eyni "çox cəhd" mexanizmi giriş cəhdləri üçün istifadə olunanla eynidir
      throw new PasswordResetError("Çox sayda cəhd. Bir az sonra yenidən yoxlayın.", 429);
    }
    await loginAttemptsService.recordFailure(key); // hər tələbi sayır (spam-ın qarşısını almaq üçün)

    const user = await passwordResetRepository.findUserByEmail(email);
    if (!user || user.status === "BLOCKED" || user.status === "INACTIVE") return;

    const { token, tokenHash } = generateResetToken();
    await passwordResetRepository.createToken({
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    await sendEmail({
      to: email,
      subject: "Şifrə bərpası",
      html: resetPasswordEmailHtml({ firstName: user.first_name, resetUrl }),
    });

    await logAudit({ userId: user.id, action: "PASSWORD_RESET_REQUEST", module: "auth" });
  },

  async confirmReset(token: string, newPassword: string): Promise<void> {
    if (!token) throw new PasswordResetError("Token tapılmadı.", 422);
    if (!newPassword || newPassword.length < 6) throw new PasswordResetError("Yeni şifrə minimum 6 simvol olmalıdır.", 422);

    const tokenHash = hashResetToken(token);
    const record = await passwordResetRepository.findValidToken(tokenHash);
    if (!record) throw new PasswordResetError("Link etibarsızdır və ya vaxtı bitib.", 410);

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await passwordResetRepository.updatePassword(record.user_id, passwordHash);
    await passwordResetRepository.markTokenUsed(record.id);
    await loginAttemptsService.reset(`reset:${record.user_id}`);

    await logAudit({ userId: record.user_id, action: "PASSWORD_RESET_CONFIRM", module: "auth" });
  },
};
