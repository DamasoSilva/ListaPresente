import nodemailer from "nodemailer";

type MailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

let transporter: nodemailer.Transporter | null = null;
let cached = false;

function getTransporter(): nodemailer.Transporter | null {
  if (cached) return transporter;
  cached = true;
  const host = process.env.SMTP_HOST?.trim();
  if (!host) return null;
  transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
      : undefined,
  });
  return transporter;
}

export type SendResult = { sent: boolean };

export async function sendEmail(mail: MailInput): Promise<SendResult> {
  const t = getTransporter();
  const from = process.env.MAIL_FROM || "Lista de Presentes <no-reply@exemplo.com.br>";
  if (!t) {
    console.log(
      "[email:dev] SMTP não configurado — e-mail NÃO enviado. Conteúdo:",
      JSON.stringify({ from, to: mail.to, subject: mail.subject }, null, 2)
    );
    return { sent: false };
  }
  try {
    await t.sendMail({ from, ...mail });
    return { sent: true };
  } catch (err) {
    console.error("[email] Falha ao enviar e-mail:", err);
    return { sent: false };
  }
}

export function verificationEmailHtml(link: string, coupleNames: string): string {
  return `<!doctype html>
<html lang="pt-BR">
<body style="margin:0;background:#faf6f2;font-family:Arial,Helvetica,sans-serif;color:#1f2a44;">
  <div style="max-width:480px;margin:0 auto;padding:32px 20px;">
    <h1 style="font-size:22px;margin:0 0 8px;">Confirme seu e-mail ❤️</h1>
    <p style="font-size:15px;line-height:1.5;color:#4b5168;">
      Oi! Para acompanhar suas reservas de presente para a nova casa da
      <strong>${coupleNames}</strong>, confirme seu endereço de e-mail.
    </p>
    <p style="margin:24px 0;">
      <a href="${link}"
         style="display:inline-block;background:#1f2a44;color:#fff;text-decoration:none;
                padding:12px 24px;border-radius:999px;font-size:15px;font-weight:600;">
        Confirmar meu e-mail
      </a>
    </p>
    <p style="font-size:12px;color:#8a8fa3;">
      Se você não criou uma conta, pode ignorar este e-mail. O link expira em 24 horas.
    </p>
  </div>
</body>
</html>`;
}

export function verificationEmailText(link: string): string {
  return `Confirme seu e-mail para acompanhar suas reservas: ${link}`;
}
