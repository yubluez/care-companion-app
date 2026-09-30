import nodemailer from "nodemailer";

export type SendEmailOptions = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export type SendEmailResult = {
  success: boolean;
  messageId?: string;
  reason?: string;
  error?: string;
};

export function getMailerTransporter() {
  const user =
    process.env.EMAIL_SERVER_USER ||
    process.env.GMAIL_USER;
  const pass =
    process.env.EMAIL_SERVER_PASSWORD ||
    process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    return null;
  }

  const host = process.env.EMAIL_SERVER_HOST;
  const port = process.env.EMAIL_SERVER_PORT
    ? Number(process.env.EMAIL_SERVER_PORT)
    : undefined;

  if (host && port) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  // ค่าเริ่มต้นคือ Gmail SMTP
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  });
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: SendEmailOptions): Promise<SendEmailResult> {
  const transporter = getMailerTransporter();

  if (!transporter) {
    console.warn(
      `[Email Service] ไม่พบการตั้งค่า EMAIL_SERVER_USER หรือ EMAIL_SERVER_PASSWORD ใน .env.local (ข้ามการส่งอีเมลไปยัง: ${to})`
    );

    return {
      success: false,
      reason: "credentials_missing",
    };
  }

  const defaultFrom =
    process.env.EMAIL_FROM ||
    `"Care Companion" <${process.env.EMAIL_SERVER_USER || process.env.GMAIL_USER}>`;

  try {
    const info = await transporter.sendMail({
      from: defaultFrom,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>?/gm, ""),
    });

    console.log(`[Email Service] ส่งอีเมลสำเร็จไปยัง ${to} (Message ID: ${info.messageId})`);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[Email Service] เกิดข้อผิดพลาดในการส่งอีเมลไปยัง ${to}:`, message);

    return {
      success: false,
      error: message,
    };
  }
}
