"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { setUserRole, type UserRole } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/client";
import {
  User,
  HeartHandshake,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

export default function SelectRolePage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkExistingRole() {
      try {
        const supabase = createClient();

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.replace("/login");
          return;
        }

        // ดึง Role จาก Database
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role, full_name, phone")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
          setError("ไม่สามารถตรวจสอบข้อมูลผู้ใช้ได้");
          return;
        }

        // ตรวจสอบ Role และ Redirect
        if (profile.role === "customer") {
          if (!profile.full_name || !profile.phone) {
            router.replace("/onboarding/customer");
          } else {
            router.replace("/customer");
          }
          return;
        }

        if (profile.role === "companion") {
          const { data: companionProfile } = await supabase
            .from("companion_profiles")
            .select("verification_status")
            .eq("user_id", user.id)
            .maybeSingle();

          if (!companionProfile) {
            router.replace("/onboarding/companion");
          } else if (companionProfile.verification_status === "approved") {
            router.replace("/companion");
          } else {
            router.replace("/onboarding/companion/status");
          }
          return;
        }

        if (profile.role === "admin") {
          router.replace("/admin");
          return;
        }
      } catch (err) {
        console.error("Error checking role:", err);
        setError("เกิดข้อผิดพลาดในการตรวจสอบข้อมูล");
      } finally {
        setChecking(false);
      }
    }

    checkExistingRole();
  }, [router]);

  const handleSelectRole = async (role: UserRole) => {
    try {
      setSelectedRole(role);
      setError(null);

      const result = await setUserRole(role);

      if (!result.success) {
        setError(result.error || "ไม่สามารถบันทึกบทบาทได้");
        setSelectedRole(null);
        return;
      }

      // เลือก Role สำเร็จ → ไปกรอกข้อมูลส่วนตัว
      if (role === "customer") {
        router.replace("/onboarding/customer");
        return;
      }

      if (role === "companion") {
        router.replace("/onboarding/companion");
        return;
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
      }

      setSelectedRole(null);
    }
  };

  if (checking) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-3 border-sky-200 border-t-sky-600 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-sky-600 animate-pulse" />
          </div>
        </div>
        <p className="text-slate-500 text-sm font-medium">กำลังตรวจสอบข้อมูลบัญชี...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center py-12 px-4 sm:px-6 relative overflow-hidden bg-gradient-to-b from-slate-50 via-sky-50/20 to-violet-50/20">
      {/* Decorative background orbs */}
      <div className="absolute top-12 -left-20 w-80 h-80 bg-sky-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-12 -right-20 w-80 h-80 bg-violet-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-4xl text-center space-y-4">
        {/* Top welcome pill */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-sky-200/80 bg-white/90 px-4 py-1.5 text-xs font-semibold text-sky-700 shadow-xs backdrop-blur-xs">
          <Sparkles className="w-3.5 h-3.5 text-sky-500" />
          <span>ยินดีต้อนรับสู่ Care Companion</span>
        </div>

        {/* Title & subtitle */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            เลือกประเภทการใช้งานของคุณ
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            กรุณาเลือกรูปแบบที่ตรงกับความต้องการของคุณ เพื่อเริ่มต้นสัมผัสประสบการณ์ที่ดีที่สุด
          </p>
        </div>

        {/* Warning notice banner */}
        <div className="inline-flex items-center gap-2.5 rounded-2xl bg-amber-50/90 border border-amber-200 px-4 py-2.5 text-xs
                        sm:text-sm text-amber-800 shadow-xs max-w-2xl text-left">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>
            <strong>ข้อควรทราบ:</strong> เมื่อเลือกแล้ว ระบบจะบันทึกบทบาทนี้กับบัญชีของคุณและไม่สามารถเปลี่ยนเองได้ในภายหลัง
          </span>
        </div>

        {error && (
          <div className="max-w-xl mx-auto p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-2xl text-left shadow-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Two Role Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 text-left">
          {/* Card 1: Customer */}
          <button
            type="button"
            onClick={() => handleSelectRole("customer")}
            disabled={selectedRole !== null}
            className={`group relative flex flex-col justify-between rounded-3xl border-2 bg-white p-7 sm:p-8 text-left transition-all duration-300 shadow-sm cursor-pointer disabled:cursor-not-allowed ${
              selectedRole === "customer"
                ? "border-sky-600 ring-4 ring-sky-100 bg-sky-50/30 scale-[1.02]"
                : selectedRole === "companion"
                  ? "opacity-50 border-slate-200"
                  : "border-slate-200 hover:border-sky-500 hover:shadow-xl hover:-translate-y-1"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-600 to-sky-400 text-white shadow-md shadow-sky-500/25 transition-transform duration-300 group-hover:scale-105">
                  <User className="w-8 h-8" />
                </div>
                <span className="rounded-full bg-sky-50 border border-sky-200 px-3 py-1 text-xs font-bold text-sky-700">
                  สำหรับผู้รับบริการ
                </span>
              </div>

              <div className="space-y-1.5 mb-3">
                <h2 className="text-2xl font-bold text-slate-900 group-hover:text-sky-600 transition">
                  ผู้ต้องการผู้ช่วย
                </h2>
                <p className="text-sm font-semibold text-sky-600">Customer</p>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                สำหรับผู้ที่ต้องการหาเพื่อนร่วมทางไปพบแพทย์ ไปโรงพยาบาล ทำธุระส่วนตัว หรือต้องการผู้ช่วยดูแลความสะดวกระหว่างเดินทาง
              </p>

              {/* Feature checklist */}
              <div className="space-y-2 border-t border-slate-100 pt-4 text-xs sm:text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>ค้นหาและเลือก Companion ที่ตรงใจ</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>คำนวณเส้นทางและประเมินราคาโปร่งใส</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>มีระบบรีวิวและประวัติการเดินทางครบถ้วน</span>
                </div>
              </div>
            </div>

            {/* Action CTA */}
            <div className="mt-8">
              {selectedRole === "customer" ? (
                <div className="flex items-center justify-center gap-2 rounded-2xl bg-sky-600 py-3.5 text-sm font-semibold text-white shadow-sm">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>กำลังตั้งค่าบัญชี Customer...</span>
                </div>
              ) : (
                <div className="flex items-center justify-between rounded-2xl border border-sky-200 bg-sky-50/70 px-5 py-3.5 text-sm font-semibold text-sky-700 transition duration-300 group-hover:bg-sky-600 group-hover:text-white group-hover:border-sky-600">
                  <span>เลือกเป็น Customer</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              )}
            </div>
          </button>

          {/* Card 2: Companion */}
          <button
            type="button"
            onClick={() => handleSelectRole("companion")}
            disabled={selectedRole !== null}
            className={`group relative flex flex-col justify-between rounded-3xl border-2 bg-white p-7 sm:p-8 text-left transition-all duration-300 shadow-sm cursor-pointer disabled:cursor-not-allowed ${
              selectedRole === "companion"
                ? "border-violet-600 ring-4 ring-violet-100 bg-violet-50/30 scale-[1.02]"
                : selectedRole === "customer"
                  ? "opacity-50 border-slate-200"
                  : "border-slate-200 hover:border-violet-500 hover:shadow-xl hover:-translate-y-1"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-purple-500 text-white shadow-md shadow-violet-500/25 transition-transform duration-300 group-hover:scale-105">
                  <HeartHandshake className="w-8 h-8" />
                </div>
                <span className="rounded-full bg-violet-50 border border-violet-200 px-3 py-1 text-xs font-bold text-violet-700">
                  สำหรับผู้ให้บริการ
                </span>
              </div>

              <div className="space-y-1.5 mb-3">
                <h2 className="text-2xl font-bold text-slate-900 group-hover:text-violet-600 transition">
                  ผู้ร่วมเดินทาง
                </h2>
                <p className="text-sm font-semibold text-violet-600">Companion</p>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                สำหรับผู้ที่ต้องการหารายได้เสริมและช่วยเหลือผู้สูงอายุหรือผู้ที่ต้องการเพื่อนร่วมทางในการทำธุระและเดินทางอย่างปลอดภัย
              </p>

              {/* Feature checklist */}
              <div className="space-y-2 border-t border-slate-100 pt-4 text-xs sm:text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-violet-600 shrink-0" />
                  <span>กำหนดวัน เวลา และพื้นที่ให้บริการได้อิสระ</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>รับงานและสร้างรายได้จากการช่วยเหลือผู้อื่น</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>มีระบบยืนยันตัวตนเพื่อความน่าเชื่อถือ</span>
                </div>
              </div>
            </div>

            {/* Action CTA */}
            <div className="mt-8">
              {selectedRole === "companion" ? (
                <div className="flex items-center justify-center gap-2 rounded-2xl bg-violet-600 py-3.5 text-sm font-semibold text-white shadow-sm">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>กำลังตั้งค่าบัญชี Companion...</span>
                </div>
              ) : (
                <div className="flex items-center justify-between rounded-2xl border border-violet-200 bg-violet-50/70 px-5 py-3.5 text-sm font-semibold text-violet-700 transition duration-300 group-hover:bg-violet-600 group-hover:text-white group-hover:border-violet-600">
                  <span>สมัครเป็น Companion</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              )}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
