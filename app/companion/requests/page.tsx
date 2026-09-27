import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import RequestCard from "@/components/companion/requests/RequestCard";
import JobCard, {
  type CompanionJob,
} from "@/components/companion/jobs/JobCard";
import { syncExpiredRequests } from "@/lib/requests/expiration";

import type { CompanionRequest } from "@/components/companion/requests/types";

export default async function CompanionRequestsPage() {
  const supabase = await createClient();

  // ─────────────────────────────
  // Auth
  // ─────────────────────────────

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // ─────────────────────────────
  // Profile / Role
  // ─────────────────────────────

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

    if (profile.role === "admin") {
      redirect("/admin");
    }

    redirect("/onboarding/role");
  }

  // ─────────────────────────────
  // Verification
  // ─────────────────────────────

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

  // ─────────────────────────────
  // Pending Requests (คำขอที่รอตอบรับ)
  // ─────────────────────────────

  const { data: rows, error } = await supabase
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
    .eq("status", "pending")
    .order("service_date", {
      ascending: true,
    })
    .order("start_time", {
      ascending: true,
    });

  if (error) {
    console.error("Load companion requests error:", error);
  }

  // Sync any overdue pending requests to expired
  await syncExpiredRequests(supabase, rows ?? []);
  const pendingRows = (rows ?? []).filter((r) => r.status === "pending");

  // ─────────────────────────────
  // Active Jobs (งานที่กำลังดำเนินการ)
  // ─────────────────────────────

  const { data: activeRows } = await supabase
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
    .order("service_date", {
      ascending: true,
    })
    .order("start_time", {
      ascending: true,
    });

  const activeJobs: CompanionJob[] = (activeRows ?? []).map((row) => {
    const customer = getRelation(row.customer);
    const category = getRelation(row.category);

    return {
      id: row.id,
      serviceDate: row.service_date ?? "",
      startTime: row.start_time ?? "",
      durationMinutes: row.duration_minutes ?? null,
      destinationName: row.destination_name ?? null,
      offeredFee: row.offered_fee ?? null,
      status: row.status,
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
    };
  });

  // ─────────────────────────────
  // Map data
  // ─────────────────────────────

  const requests: CompanionRequest[] = pendingRows.map((row) => {
    const customer = getRelation(row.customer);

    const category = getRelation(row.category);

    return {
      id: row.id,

      serviceDate: row.service_date,

      startTime: row.start_time,

      durationMinutes: row.duration_minutes,

      destinationName: row.destination_name,

      offeredFee: row.offered_fee,

      status: "pending",

      customer: customer
        ? {
            fullName: customer.full_name,

            avatarUrl: customer.avatar_url,
          }
        : null,

      category: category
        ? {
            name: category.name,
          }
        : null,
    };
  });

  // ─────────────────────────────
  // UI
  // ─────────────────────────────

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        {/* Header */}

        <div>
          <p className="text-sm font-semibold text-violet-600">COMPANION</p>

          <h1 className="mt-1 text-2xl font-bold text-slate-900">คำของาน</h1>

          <p className="mt-2 text-sm text-slate-500">
            ตรวจสอบคำขอจากลูกค้าและเลือกตอบรับหรือปฏิเสธงาน
          </p>
        </div>

        {/* งานที่กำลังดำเนินการ (แทนการ์ดคำของานสามการ์ด) */}

        <section className="mt-8">
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">
                งานที่กำลังดำเนินการ
              </h2>

              <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-bold text-slate-600">
                {activeJobs.length}
              </span>
            </div>

            <p className="mt-1 text-sm text-slate-400">
              งานที่เริ่มแล้วหรือกำลังให้บริการ
            </p>
          </div>

          {activeJobs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-10 text-center text-sm text-slate-400">
              ยังไม่มีงานที่กำลังดำเนินการ
            </div>
          ) : (
            <div className="space-y-4">
              {activeJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </section>

        {/* Pending Requests */}

        <section className="mt-10">
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">
                รายการคำขอที่รอตอบรับ
              </h2>

              <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-bold text-slate-600">
                {requests.length}
              </span>
            </div>

            <p className="mt-1 text-sm text-slate-400">
              คำขอใหม่จากลูกค้าที่รอการตอบรับจากคุณ
            </p>
          </div>

          {requests.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-10 text-center text-sm text-slate-400">
              ไม่มีคำขอที่รอตอบรับ
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function getRelation<T>(value: T | T[] | null): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}
