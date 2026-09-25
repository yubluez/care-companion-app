"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { setUserRole, type UserRole } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/client";

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
        // ตรวจสอบ Role และสถานะ Onboarding
        if (profile.role === "customer") {
          if (!profile.full_name || !profile.phone) {
            router.replace("/onboarding/customer");
          } else {
            router.replace("/customer");
          }

          return;
        }

        if (profile.role === "companion") {
          router.replace("/onboarding/companion");
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
        setError(result.error || "ไม่สามารถบันทึก Role ได้");
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
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600"></div>
        <p className="text-slate-500 text-sm">กำลังตรวจสอบข้อมูลบัญชี...</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-12 text-center">
      <h1 className="text-3xl font-extrabold text-slate-800 mb-2">
        เลือกประเภทการใช้งาน
      </h1>
      <p className="text-slate-600 mb-8">
        กรุณาเลือกบทบาทของคุณในระบบ <br />
        <span className="text-amber-600 font-semibold">
          (เมื่อเลือกแล้ว ระบบจะจดจำบทบาทนี้และไม่สามารถเปลี่ยนเองได้ในภายหลัง)
        </span>
      </p>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-2xl text-left">
          ⚠️ {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <button
          onClick={() => handleSelectRole("customer")}
          disabled={selectedRole !== null}
          className="p-6 bg-white border-2 border-sky-200 hover:border-sky-600 rounded-3xl text-left transition hover:shadow-lg group disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          <div className="text-3xl mb-3">🚶‍♂️</div>
          <h2 className="text-2xl font-bold text-slate-800 group-hover:text-sky-600 mb-2">
            ผู้ต้องการผู้ช่วย (Customer)
          </h2>
          <p className="text-slate-600 text-sm mb-4">
            สำหรับผู้ที่ต้องการหาเพื่อนร่วมทางไปพบแพทย์ ไปธนาคาร หรือทำธุระต่าง
            ๆ
          </p>
          {selectedRole === "customer" && (
            <div className="flex items-center gap-2 text-sky-600 font-semibold text-sm">
              <div className="animate-spin h-4 w-4 border-2 border-sky-600 border-t-transparent rounded-full"></div>
              กำลังบันทึกข้อมูล...
            </div>
          )}
        </button>

        <button
          onClick={() => handleSelectRole("companion")}
          disabled={selectedRole !== null}
          className="p-6 bg-white border-2 border-sky-200 hover:border-sky-600 rounded-3xl text-left transition hover:shadow-lg group disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          <div className="text-3xl mb-3">🤝</div>
          <h2 className="text-2xl font-bold text-slate-800 group-hover:text-sky-600 mb-2">
            ผู้ร่วมเดินทาง (Companion)
          </h2>
          <p className="text-slate-600 text-sm mb-4">
            สำหรับผู้ให้บริการพาผู้อื่นเดินทางและช่วยอำนวยความสะดวกในการทำธุระ
          </p>
          {selectedRole === "companion" && (
            <div className="flex items-center gap-2 text-sky-600 font-semibold text-sm">
              <div className="animate-spin h-4 w-4 border-2 border-sky-600 border-t-transparent rounded-full"></div>
              กำลังบันทึกข้อมูล...
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
