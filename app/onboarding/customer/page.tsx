"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CustomerOnboardingPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      // ยังไม่ได้ Login
      if (error || !user) {
        router.replace("/login");
        return;
      }

      // ตรวจสอบ Profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, full_name, phone, avatar_url")
        .eq("id", user.id)
        .single();

      if (profileError || !profile) {
        console.error("Profile error:", profileError);
        setErrorMessage("ไม่พบข้อมูลผู้ใช้");
        setLoading(false);
        return;
      }

      // ต้องเป็น Customer เท่านั้น
      if (profile.role !== "customer") {
        if (profile.role === "companion") {
          router.replace("/onboarding/companion");
        } else {
          router.replace("/onboarding/role");
        }

        return;
      }

      // ถ้ามีข้อมูลครบแล้ว ไม่ต้อง Onboarding ซ้ำ
      if (profile.full_name && profile.phone) {
        router.replace("/customer");
        return;
      }

      // ชื่อจาก Profile ก่อน ถ้าไม่มีใช้ข้อมูล Google
      setFullName(
        profile.full_name ||
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          "",
      );

      setEmail(user.email || "");

      setAvatarUrl(
        profile.avatar_url ||
          user.user_metadata?.avatar_url ||
          user.user_metadata?.picture ||
          "",
      );

      setPhone(profile.phone || "");

      setLoading(false);
    }

    loadUser();
  }, [router]);

  function handlePhoneChange(value: string) {
    // รับเฉพาะตัวเลข และไม่เกิน 10 หลัก
    const numbersOnly = value.replace(/\D/g, "").slice(0, 10);
    setPhone(numbersOnly);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");

    const trimmedName = fullName.trim();

    if (!trimmedName) {
      setErrorMessage("กรุณากรอกชื่อ-นามสกุล");
      return;
    }

    // Validation เบอร์มือถือไทยแบบพื้นฐาน
    if (!/^0\d{9}$/.test(phone)) {
      setErrorMessage("กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง 10 หลัก");
      return;
    }

    setSubmitting(true);

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace("/login");
        return;
      }

      // ตรวจ Role ซ้ำก่อน Update
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError || !profile) {
        setErrorMessage("ไม่สามารถตรวจสอบข้อมูลผู้ใช้ได้");
        return;
      }

      if (profile.role !== "customer") {
        setErrorMessage("บัญชีนี้ไม่ใช่ Customer");
        return;
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: trimmedName,
          phone,
          avatar_url: avatarUrl || null,
        })
        .eq("id", user.id);

      if (updateError) {
        console.error("Update profile error:", updateError);
        setErrorMessage("ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่");
        return;
      }

      router.replace("/customer");
      router.refresh();
    } catch (error) {
      console.error(error);
      setErrorMessage("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-500">กำลังโหลดข้อมูล...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-xl">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-slate-900">ข้อมูลส่วนตัว</h1>

            <p className="mt-2 text-sm text-slate-500">
              กรุณาตรวจสอบข้อมูลและเพิ่มเบอร์โทรศัพท์ก่อนเริ่มใช้งาน
            </p>
          </div>

          {/* Avatar */}
          <div className="mb-8 flex justify-center">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile"
                referrerPolicy="no-referrer"
                className="h-24 w-24 rounded-full border border-slate-200 object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 text-3xl font-semibold text-slate-500">
                {fullName.charAt(0) || "U"}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label
                htmlFor="fullName"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                ชื่อ-นามสกุล
                <span className="text-red-500"> *</span>
              </label>

              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="ชื่อ-นามสกุล"
                autoComplete="name"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                อีเมล
              </label>

              <input
                id="email"
                type="email"
                value={email}
                disabled
                className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500"
              />

              <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                <span>✓</span>
                <span>เข้าสู่ระบบผ่าน Google</span>
              </div>
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="phone"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                เบอร์โทรศัพท์
                <span className="text-red-500"> *</span>
              </label>

              <input
                id="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="0812345678"
                maxLength={10}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <p className="mt-2 text-xs text-slate-500">
                ใช้สำหรับการติดต่อเกี่ยวกับการให้บริการ
              </p>
            </div>

            {/* Error */}
            {errorMessage && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {submitting ? "กำลังบันทึก..." : "บันทึกและเริ่มใช้งาน"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
