// Sadə email göndərmə xidməti (Resend API, sadəcə fetch ilə — əlavə paket tələb olunmur).
// .env-ə RESEND_API_KEY və RESEND_FROM_EMAIL əlavə edilməlidir (bax .env.example).

export async function sendEmail(input: { to: string; subject: string; html: string }): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    // Development mühitində açar qoyulmayıbsa, xəta atmaq əvəzinə console-a yazırıq
    // ki, əsas axın (məsələn test zamanı) qırılmasın.
    console.warn("RESEND_API_KEY / RESEND_FROM_EMAIL təyin edilməyib — email göndərilmədi:", input.to);
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: input.to,
      subject: input.subject,
      html: input.html,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Email göndərilmədi (${res.status}): ${text}`);
  }
}

export function resetPasswordEmailHtml(input: { firstName: string; resetUrl: string }): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #111;">
      <h2 style="color:#111;">Şifrə bərpası</h2>
      <p>Salam ${escapeHtml(input.firstName)},</p>
      <p>Hesabınız üçün şifrə bərpası tələb olundu. Aşağıdakı düyməyə klikləyərək yeni şifrə təyin edə bilərsiniz.</p>
      <p style="margin: 24px 0;">
        <a href="${input.resetUrl}" style="background:#111;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600;">
          Şifrəni bərpa et
        </a>
      </p>
      <p style="font-size:13px;color:#666;">Bu link 30 dəqiqə ərzində etibarlıdır və yalnız bir dəfə istifadə oluna bilər.</p>
      <p style="font-size:13px;color:#666;">Əgər bu tələbi siz etməmisinizsə, bu emaili nəzərə almayın — hesabınızda heç nə dəyişməyəcək.</p>
    </div>
  `;
}

function escapeHtml(input: string): string {
  return input.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
}
