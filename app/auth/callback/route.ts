import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // Helper redirect to ensure correct host (especially behind Vercel proxy)
  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocalEnv = process.env.NODE_ENV === "development";

  const getRedirectUrl = (path: string) => {
    if (isLocalEnv || !forwardedHost) {
      return `${origin}${path}`;
    }
    return `https://${forwardedHost}${path}`;
  };

  // 1. ตรวจสอบ Error จาก Google OAuth
  if (error) {
    console.error("OAuth callback error:", error, errorDescription);

    return NextResponse.redirect(
      getRedirectUrl(
        `/login?error=${encodeURIComponent(errorDescription || error)}`
      )
    );
  }

  // 2. ตรวจสอบ Authorization Code
  if (!code) {
    return NextResponse.redirect(getRedirectUrl("/login?error=no_code"));
  }

  const supabase = await createClient();

  // 3. แลก Code เป็น Session
  const { error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    console.error("Exchange code error:", exchangeError.message);

    return NextResponse.redirect(
      getRedirectUrl(
        `/login?error=${encodeURIComponent(exchangeError.message)}`
      )
    );
  }

  // 4. ดึงข้อมูลผู้ใช้ที่ Login
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.redirect(getRedirectUrl("/login?error=user_not_found"));
  }

  // 5. ดึง Profile จาก Database
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, full_name, phone")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Error fetching profile:", profileError);

    return NextResponse.redirect(
      getRedirectUrl(
        `/login?error=${encodeURIComponent(
          "ไม่สามารถตรวจสอบข้อมูลผู้ใช้ได้",
        )}`
      )
    );
  }

  let destination = "/onboarding/role";

  // Account ใหม่ หรือยังไม่ได้เลือก role จะได้ destination = "/onboarding/role"
  if (profile && profile.role) {
    const role = profile.role;
    let companionProfile: { verification_status: string } | null = null;

    if (role === "customer") {
      if (!profile.full_name || !profile.phone) {
        destination = "/onboarding/customer";
      } else {
        destination = "/customer";
      }
    } else if (role === "companion") {
      const { data: comp } = await supabase
        .from("companion_profiles")
        .select("verification_status")
        .eq("user_id", user.id)
        .maybeSingle();

      companionProfile = comp;

      if (!comp) {
        destination = "/onboarding/companion";
      } else if (comp.verification_status === "approved") {
        destination = "/companion";
      } else {
        destination = "/onboarding/companion/status";
      }
    } else if (role === "admin") {
      destination = "/admin";
    }

    // 7. ตรวจสอบหน้าที่ผู้ใช้ต้องการไป
    const requestedNext = searchParams.get("next");

    const customerProfileComplete =
      role === "customer" &&
      Boolean(profile?.full_name) &&
      Boolean(profile?.phone);

    const companionApproved =
      role === "companion" &&
      companionProfile?.verification_status === "approved";

    if (
      requestedNext &&
      requestedNext.startsWith("/") &&
      !requestedNext.startsWith("//") &&
      !requestedNext.startsWith("/\\") &&
      !requestedNext.includes("\\") &&
      role !== "admin" &&
      ((role === "customer" && customerProfileComplete) ||
        (role === "companion" && companionApproved))
    ) {
      const allowedPrefix = `/${role}`;

      if (
        requestedNext === allowedPrefix ||
        requestedNext.startsWith(`${allowedPrefix}/`)
      ) {
        destination = requestedNext;
      }
    }
  }

  // 8. Redirect ไปยังหน้าที่ถูกต้อง
  return NextResponse.redirect(getRedirectUrl(destination));
}
