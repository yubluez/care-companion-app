import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import CompanionJobList from "@/components/companion/jobs/CompanionJobList";
import type { CompanionJob } from "@/components/companion/jobs/JobCard";
import { syncExpiredRequests, isRequestExpired } from "@/lib/requests/expiration";

export default async function CompanionJobsPage() {
  const supabase = await createClient();

  // Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
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

  // Companion KYC
  const { data: companion } = await supabase
    .from("companion_profiles")
    .select("verification_status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!companion) {
    redirect("/onboarding/companion");
  }

  if (companion.verification_status !== "approved") {
    redirect("/onboarding/companion/status");
  }

  // Sync any overdue pending requests to expired
  const { data: pendingRows } = await supabase
    .from("service_requests")
    .select("id, status, service_date, start_time")
    .eq("companion_id", user.id)
    .eq("status", "pending");

  if (pendingRows?.length) {
    await syncExpiredRequests(supabase, pendingRows);
  }

  // Jobs
  const { data, error } = await supabase
    .from("service_requests")
    .select(
      `
      id,
      service_date,
      start_time,
      duration_minutes,
      origin_name,
      destination_name,
      note,
      meeting_detail,
      offered_fee,
      status,

      customer:profiles!service_requests_customer_id_fkey (
        full_name,
        avatar_url
      ),

      category:service_categories (
        name
      ),

      origin_area:areas!service_requests_origin_area_id_fkey (
        province,
        district
      ),

      destination_area:areas!service_requests_destination_area_id_fkey (
        province,
        district
      )
    `,
    )
    .eq("companion_id", user.id)
    .in("status", [
      "pending",
      "accepted",
      "in_progress",
      "completed",
      "cancelled",
      "rejected",
      "expired",
    ])
    .order("service_date", {
      ascending: false,
    })
    .order("start_time", {
      ascending: false,
    });

  if (error) {
    console.error("Load companion jobs error:", error);
  }

  const jobs: CompanionJob[] = [];

  for (const row of data ?? []) {
    let status = row.status;

    if (status === "pending") {
      // If it's pending, only include if it's expired
      if (isRequestExpired(row.service_date, row.start_time)) {
        status = "expired";
      } else {
        // Active pending request belongs in /companion/requests
        continue;
      }
    }

    const customer = Array.isArray(row.customer)
      ? (row.customer[0] ?? null)
      : (row.customer ?? null);

    const category = Array.isArray(row.category)
      ? (row.category[0] ?? null)
      : (row.category ?? null);

    const originArea = Array.isArray(row.origin_area)
      ? (row.origin_area[0] ?? null)
      : (row.origin_area ?? null);

    const destinationArea = Array.isArray(row.destination_area)
      ? (row.destination_area[0] ?? null)
      : (row.destination_area ?? null);

    const originName =
      row.origin_name ||
      (originArea ? `${originArea.district}, ${originArea.province}` : null);

    const destinationName =
      row.destination_name ||
      (destinationArea
        ? `${destinationArea.district}, ${destinationArea.province}`
        : null);

    jobs.push({
      id: row.id,

      serviceDate: row.service_date ?? "",

      startTime: row.start_time ?? "",

      durationMinutes: row.duration_minutes ?? null,

      originName: originName,

      destinationName: destinationName,

      note: row.note ?? null,

      meetingDetail: row.meeting_detail ?? null,

      offeredFee: row.offered_fee ?? null,

      status: status,

      customer: customer
        ? {
            fullName: customer.full_name ?? null,

            avatarUrl: customer.avatar_url ?? null,
          }
        : null,

      category: category
        ? {
            name: category.name,
          }
        : null,
    });
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <p className="mb-1 font-semibold text-violet-600">งานที่ตอบรับ</p>

          <h1 className="text-3xl font-bold text-slate-900">งานของฉัน</h1>

          <p className="mt-2 text-slate-500">
            ติดตามสถานะและจัดการงานที่คุณตอบรับ
          </p>
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-600">
            ไม่สามารถโหลดข้อมูลงานได้
          </div>
        ) : (
          <CompanionJobList jobs={jobs} />
        )}
      </div>
    </main>
  );
}
