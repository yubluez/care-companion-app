import { redirect } from "next/navigation";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

import CompanionHeader from "@/components/companion/dashboard/CompanionHeader";
import SummaryCard from "@/components/companion/dashboard/SummaryCard";
import UpcomingJobs, {
  type UpcomingJob,
} from "@/components/companion/dashboard/UpcomingJobs";
import {
  syncExpiredRequests,
  isRequestExpired,
} from "@/lib/requests/expiration";

export default async function CompanionDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // ตรวจสอบ Profile และ Role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, avatar_url, phone")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  if (profile.role !== "companion") {
    if (profile.role === "customer") {
      redirect("/customer");
    }

    redirect("/onboarding/role");
  }

  // ตรวจสอบสถานะการยืนยันตัวตน Companion
  const { data: companion } = await supabase
    .from("companion_profiles")
    .select("verification_status, rating_avg, rating_count, bio")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!companion) {
    redirect("/onboarding/companion");
  }

  if (companion.verification_status !== "approved") {
    redirect("/onboarding/companion/status");
  }

  // ซิงค์คำขอที่หมดอายุในระบบ
  const { data: pendingRows } = await supabase
    .from("service_requests")
    .select("id, status, service_date, start_time")
    .eq("companion_id", user.id)
    .eq("status", "pending");

  if (pendingRows?.length) {
    await syncExpiredRequests(supabase, pendingRows);
  }

  // 1. ดึงคำขอใหม่ (Pending) เพื่อนับจำนวนที่ยังไม่หมดอายุ
  const { data: pendingData, error: pendingError } = await supabase
    .from("service_requests")
    .select("id, service_date, start_time")
    .eq("companion_id", user.id)
    .eq("status", "pending");

  if (pendingError) {
    console.error("Load companion dashboard pending error:", pendingError);
  }

  const pendingCount = (pendingData ?? []).filter(
    (row) => !isRequestExpired(row.service_date, row.start_time),
  ).length;

  // 2. ดึงงานที่กำลังดำเนินการ / กำลังจะมาถึง (Accepted & In Progress)
  const { data: upcomingData, error: upcomingError } = await supabase
    .from("service_requests")
    .select(
      `
      id,
      service_date,
      start_time,
      duration_minutes,
      destination_name,
      offered_fee,
      status,

      customer:profiles!service_requests_customer_id_fkey (
        full_name,
        avatar_url
      ),

      category:service_categories (
        name
      )
    `,
    )
    .eq("companion_id", user.id)
    .in("status", ["accepted", "in_progress"])
    .order("service_date", { ascending: true })
    .order("start_time", { ascending: true })
    .limit(5);

  if (upcomingError) {
    console.error("Load companion dashboard upcoming error:", upcomingError);
  }

  const upcomingJobs: UpcomingJob[] = (upcomingData ?? []).map((row) => {
    const customer = Array.isArray(row.customer)
      ? (row.customer[0] ?? null)
      : (row.customer ?? null);

    const category = Array.isArray(row.category)
      ? (row.category[0] ?? null)
      : (row.category ?? null);

    return {
      id: row.id,
      service_date: row.service_date ?? "",
      start_time: row.start_time ?? "",
      duration_minutes: row.duration_minutes ?? null,
      destination_name: row.destination_name ?? null,
      offered_fee: row.offered_fee ?? null,
      status: row.status,
      customer: customer
        ? {
            full_name: customer.full_name ?? null,
            avatar_url: customer.avatar_url ?? null,
          }
        : null,
      category: category
        ? {
            name: category.name,
          }
        : null,
    };
  });

  // 3. ดึงงานที่เสร็จสิ้น (Completed) เพื่อคำนวณสถิติและรายได้รวม
  const { data: completedData, error: completedError } = await supabase
    .from("service_requests")
    .select("id, offered_fee")
    .eq("companion_id", user.id)
    .eq("status", "completed");

  if (completedError) {
    console.error("Load companion dashboard completed error:", completedError);
  }

  const completedCount = completedData?.length ?? 0;
  const totalEarnings = (completedData ?? []).reduce(
    (sum, row) => sum + (Number(row.offered_fee) || 0),
    0,
  );

  const upcomingCount = upcomingJobs.length;

  const displayName =
    profile.full_name ||
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "Companion";

  const avatarUrl =
    profile.avatar_url ||
    user.user_metadata?.avatar_url ||
    user.user_metadata?.picture ||
    null;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8 space-y-8">
        {/* Companion Welcome Header */}
        <CompanionHeader
          fullName={displayName}
          avatarUrl={avatarUrl}
          ratingAvg={companion.rating_avg ? Number(companion.rating_avg) : 5.0}
          ratingCount={companion.rating_count ? Number(companion.rating_count) : 0}
        />

        {/* Pending Requests Alert Banner (แสดงเฉพาะเมื่อมีคำขอใหม่ที่รอยืนยัน) */}
        {pendingCount > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-sky-200 bg-sky-50 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔔</span>
              <div>
                <p className="font-bold text-sky-900">
                  คุณมีคำขอใหม่ {pendingCount} รายการ ที่กำลังรอการตอบรับ
                </p>
                <p className="text-sm text-sky-700">
                  กรุณาตรวจสอบและตัดสินใจตอบรับหรือปฏิเสธคำขอ
                </p>
              </div>
            </div>

            <Link
              href="/companion/requests"
              className="inline-flex items-center justify-center rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700 whitespace-nowrap"
            >
              ดูคำของาน ({pendingCount}) →
            </Link>
          </div>
        )}

        {/* 4 Summary Stats Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            title="คำขอใหม่"
            value={pendingCount}
            icon="📋"
            href="/companion/requests"
            description="รอคุณตรวจสอบและตอบรับ"
            badge={pendingCount > 0 ? `${pendingCount} รอตอบรับ` : null}
          />

          <SummaryCard
            title="งานที่รับแล้ว"
            value={upcomingCount}
            icon="🗓️"
            href="/companion/jobs"
            description="งานที่กำลังจะมาถึง / กำลังทำ"
          />

          <SummaryCard
            title="งานที่เสร็จสิ้น"
            value={completedCount}
            icon="✅"
            href="/companion/jobs"
            description="ให้บริการสำเร็จแล้ว"
          />

          <SummaryCard
            title="รายได้สะสม"
            value={`฿${totalEarnings.toLocaleString("th-TH")}`}
            icon="💰"
            description="ยอดรวมจากงานที่เสร็จสิ้น"
          />
        </section>

        {/* Upcoming Jobs Schedule */}
        <section>
          <UpcomingJobs jobs={upcomingJobs} />
        </section>
      </div>
    </main>
  );
}
