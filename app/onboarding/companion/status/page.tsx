import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function CompanionStatusPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "companion") {
    redirect("/onboarding/role");
  }

  const { data: companion } = await supabase
    .from("companion_profiles")
    .select("verification_status, rejection_reason")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!companion) {
    redirect("/onboarding/companion");
  }

  if (companion.verification_status === "approved") {
    redirect("/companion");
  }

  const rejected = companion.verification_status === "rejected";

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
        <div
          className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center text-2xl ${
            rejected
              ? "bg-rose-100 text-rose-600"
              : "bg-amber-100 text-amber-600"
          }`}
        >
          {rejected ? "!" : "✓"}
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mt-5">
          {rejected ? "ใบสมัครยังไม่ผ่านการตรวจสอบ" : "ส่งใบสมัครเรียบร้อยแล้ว"}
        </h1>

        {rejected ? (
          <>
            <p className="text-slate-500 mt-3">
              ผู้ดูแลระบบได้ตรวจสอบใบสมัครของคุณแล้ว
            </p>

            {companion.rejection_reason && (
              <div className="mt-6 bg-rose-50 border border-rose-100 rounded-xl p-4 text-left">
                <p className="text-sm font-semibold text-rose-700">เหตุผล</p>

                <p className="text-sm text-rose-600 mt-1">
                  {companion.rejection_reason}
                </p>
              </div>
            )}
          </>
        ) : (
          <>
            <p className="text-slate-500 mt-3">
              ข้อมูลของคุณอยู่ระหว่างการตรวจสอบโดยผู้ดูแลระบบ
            </p>

            <div className="inline-flex items-center gap-2 mt-6 bg-amber-50 text-amber-700 px-4 py-2 rounded-full text-sm font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              รอการตรวจสอบ
            </div>

            <p className="text-xs text-slate-400 mt-6">
              เมื่อใบสมัครได้รับการอนุมัติ คุณจะสามารถเข้าใช้งานระบบ Companion
              ได้
            </p>
          </>
        )}
      </div>
    </main>
  );
}
