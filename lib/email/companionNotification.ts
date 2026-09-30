import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "./mailer";

type CompanionContactInfo = {
  email: string | null;
  fullName: string;
};

/**
 * ดึงข้อมูลชื่อและอีเมลของ Companion จาก profiles หรือ Supabase Auth Admin
 */
export async function getCompanionContactInfo(
  companionId: string
): Promise<CompanionContactInfo> {
  const supabase = await createClient();

  let fullName = "Companion";
  let email: string | null = null;

  // 1. ดึงข้อมูลพื้นฐานจาก profiles
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", companionId)
    .maybeSingle();

  if (profile?.full_name) {
    fullName = profile.full_name;
  }

  // 2. ตรวจสอบว่ามี column email ในตาราง profiles หรือไม่
  try {
    const { data: profileWithEmail, error: emailColError } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", companionId)
      .maybeSingle();

    if (!emailColError && profileWithEmail?.email) {
      email = profileWithEmail.email;
    }
  } catch {
    // ถ้า profiles ยังไม่มี column email จะข้ามไปขั้นตอนถัดไป
  }

  // 3. หากยังไม่ได้ email ให้ลองดึงจาก Supabase Auth Admin (ต้องมี SUPABASE_SERVICE_ROLE_KEY)
  if (!email) {
    const adminClient = createAdminClient();
    if (adminClient) {
      try {
        const { data, error } =
          await adminClient.auth.admin.getUserById(companionId);

        if (!error && data?.user) {
          if (data.user.email) {
            email = data.user.email;
          }
          if (
            fullName === "Companion" &&
            (data.user.user_metadata?.full_name || data.user.user_metadata?.name)
          ) {
            fullName =
              data.user.user_metadata.full_name ||
              data.user.user_metadata.name;
          }
        }
      } catch (adminError) {
        console.warn(
          "[Notification] ไม่สามารถดึงข้อมูลผู้ใช้ผ่าน Auth Admin ได้:",
          adminError
        );
      }
    }
  }

  return { email, fullName };
}

/**
 * ส่งอีเมลแจ้งเตือนผลการตรวจสอบใบสมัครไปยัง Companion
 */
export async function sendCompanionReviewEmail({
  companionId,
  action,
  rejectionReason,
  targetEmail,
}: {
  companionId: string;
  action: "approve" | "reject";
  rejectionReason?: string;
  targetEmail?: string | null;
}) {
  const contact = await getCompanionContactInfo(companionId);
  const email = targetEmail || contact.email;
  const fullName = contact.fullName;

  if (!email) {
    console.warn(
      `[Email Service] ไม่พบอีเมลสำหรับ Companion ID: ${companionId} กรุณาตรวจสอบว่ามีคอลัมน์ email ใน profiles หรือตั้งค่า SUPABASE_SERVICE_ROLE_KEY ใน .env.local`
    );
    return {
      success: false,
      reason: "email_not_found",
    };
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : null) ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    "http://localhost:2709";

  if (action === "approve") {
    return sendApprovalEmail({ email, fullName, appUrl });
  } else {
    return sendRejectionEmail({
      email,
      fullName,
      rejectionReason: rejectionReason || "ข้อมูลหรือเอกสารไม่ถูกต้องตามเกณฑ์",
      appUrl,
    });
  }
}

async function sendApprovalEmail({
  email,
  fullName,
  appUrl,
}: {
  email: string;
  fullName: string;
  appUrl: string;
}) {
  const loginUrl = `${appUrl}/companion`;

  const subject = "🎉 ยินดีด้วย! ใบสมัคร Care Companion ของคุณได้รับการอนุมัติแล้ว";

  const html = `
    <!DOCTYPE html>
    <html lang="th">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        .header { background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
        .badge { display: inline-block; background-color: rgba(255, 255, 255, 0.2); padding: 4px 14px; border-radius: 9999px; font-size: 13px; font-weight: 600; margin-bottom: 12px; }
        .title { margin: 0; font-size: 22px; font-weight: bold; }
        .content { padding: 32px 24px; line-height: 1.6; }
        .greeting { font-size: 18px; font-weight: 600; color: #0f172a; margin-top: 0; }
        .highlight-box { background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 16px 20px; margin: 20px 0; }
        .btn-wrapper { text-align: center; margin: 32px 0 20px; }
        .btn { display: inline-block; background-color: #0284c7; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: bold; font-size: 15px; }
        .footer { padding: 20px 24px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #64748b; line-height: 1.5; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="badge">✓ ผ่านการอนุมัติแล้ว</div>
          <h1 class="title">Care Companion Application</h1>
        </div>

        <div class="content">
          <p class="greeting">สวัสดีคุณ ${fullName},</p>
          <p>
            เรามีความยินดีที่จะแจ้งให้ทราบว่า <strong>ใบสมัครเป็นผู้ดูแล (Care Companion)</strong> ของคุณได้รับการตรวจสอบและอนุมัติจากผู้ดูแลระบบเรียบร้อยแล้ว
          </p>

          <div class="highlight-box">
            <h4 style="margin: 0 0 8px; color: #0369a1; font-size: 15px;">สิ่งที่คุณสามารถทำได้แล้วตอนนี้:</h4>
            <ul style="margin: 0; padding-left: 20px; color: #334155; font-size: 14px;">
              <li>เข้าสู่ระบบแดชบอร์ด Companion</li>
              <li>ตรวจสอบและรับคำขอจ้างงานจากลูกค้า</li>
              <li>อัปเดตพื้นที่ให้บริการและเวลาที่สะดวกได้ตลอดเวลา</li>
            </ul>
          </div>

          <div class="btn-wrapper">
            <a href="${loginUrl}" class="btn">เข้าสู่ระบบเพื่อเริ่มรับงาน</a>
          </div>

          <p style="font-size: 13px; color: #64748b; margin-top: 24px;">
            หากปุ่มด้านบนไม่ทำงาน คุณสามารถคัดลอกลิงก์นี้เพื่อเข้าสู่ระบบ: <br>
            <a href="${loginUrl}" style="color: #0284c7; word-break: break-all;">${loginUrl}</a>
          </p>
        </div>

        <div class="footer">
          <p style="margin: 0;">Care Companion System • ระบบดูแลและช่วยเหลือผู้สูงอายุ</p>
          <p style="margin: 4px 0 0;">อีเมลนี้เป็นการแจ้งเตือนอัตโนมัติ กรุณาอย่าตอบกลับอีเมลนี้</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject,
    html,
  });
}

async function sendRejectionEmail({
  email,
  fullName,
  rejectionReason,
  appUrl,
}: {
  email: string;
  fullName: string;
  rejectionReason: string;
  appUrl: string;
}) {
  const statusUrl = `${appUrl}/onboarding/companion/status`;

  const subject = "แจ้งผลการพิจารณาใบสมัคร Care Companion";

  const html = `
    <!DOCTYPE html>
    <html lang="th">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        .header { background: linear-gradient(135deg, #e11d48 0%, #be123c 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
        .badge { display: inline-block; background-color: rgba(255, 255, 255, 0.2); padding: 4px 14px; border-radius: 9999px; font-size: 13px; font-weight: 600; margin-bottom: 12px; }
        .title { margin: 0; font-size: 22px; font-weight: bold; }
        .content { padding: 32px 24px; line-height: 1.6; }
        .greeting { font-size: 18px; font-weight: 600; color: #0f172a; margin-top: 0; }
        .reason-box { background-color: #fff1f2; border: 1px solid #fecdd3; border-radius: 12px; padding: 18px 20px; margin: 20px 0; }
        .reason-title { margin: 0 0 6px; color: #9f1239; font-size: 14px; font-weight: bold; }
        .reason-text { margin: 0; color: #881337; font-size: 14px; white-space: pre-wrap; line-height: 1.5; }
        .btn-wrapper { text-align: center; margin: 32px 0 20px; }
        .btn { display: inline-block; background-color: #475569; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: bold; font-size: 15px; }
        .footer { padding: 20px 24px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #64748b; line-height: 1.5; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="badge">ใบสมัครยังไม่ผ่านการอนุมัติ</div>
          <h1 class="title">Care Companion Application</h1>
        </div>

        <div class="content">
          <p class="greeting">สวัสดีคุณ ${fullName},</p>
          <p>
            ขอขอบคุณสำหรับความสนใจในการร่วมเป็นส่วนหนึ่งของ Care Companion ทีมผู้ดูแลระบบได้ทำการตรวจสอบข้อมูลและเอกสารในใบสมัครของคุณแล้ว ทางเราขอเรียนแจ้งว่า <strong>ใบสมัครของคุณยังไม่ผ่านการอนุมัติในครั้งนี้</strong>
          </p>

          <div class="reason-box">
            <p class="reason-title">เหตุผลจากผู้ดูแลระบบ:</p>
            <p class="reason-text">${rejectionReason}</p>
          </div>

          <p style="font-size: 14px; color: #475569;">
            คุณสามารถตรวจสอบสถานะและรายละเอียดในระบบ หรือติดต่อผู้ดูแลระบบเพื่อขอข้อมูลเพิ่มเติมหรือส่งเอกสารแก้ไขใหม่ได้ครับ
          </p>

          <div class="btn-wrapper">
            <a href="${statusUrl}" class="btn">ดูสถานะใบสมัครของคุณ</a>
          </div>

          <p style="font-size: 13px; color: #64748b; margin-top: 24px;">
            ลิงก์สำหรับตรวจสอบสถานะ: <br>
            <a href="${statusUrl}" style="color: #0284c7; word-break: break-all;">${statusUrl}</a>
          </p>
        </div>

        <div class="footer">
          <p style="margin: 0;">Care Companion System • ระบบดูแลและช่วยเหลือผู้สูงอายุ</p>
          <p style="margin: 4px 0 0;">อีเมลนี้เป็นการแจ้งเตือนอัตโนมัติ กรุณาอย่าตอบกลับอีเมลนี้</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject,
    html,
  });
}
