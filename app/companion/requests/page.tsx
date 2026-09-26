import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import RequestCard from "@/components/companion/requests/RequestCard";
import RequestFilters from "@/components/companion/requests/RequestFilters";
import RequestSummary from "@/components/companion/requests/RequestSummary";

import type {
  CompanionRequest,
  CompanionRequestStatus,
  RequestFilter,
} from "@/components/companion/requests/types";

type Props = {
  searchParams: Promise<{
    status?: string;
  }>;
};

const requestStatuses: CompanionRequestStatus[] = [
  "pending",
  "rejected",
  "expired",
];

export default async function CompanionRequestsPage({ searchParams }: Props) {
  const supabase = await createClient();
  const params = await searchParams;

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
  // Filter
  // ─────────────────────────────

  const requestedStatus = params.status ?? "all";

  const currentFilter: RequestFilter =
    requestedStatus === "all" ||
    requestStatuses.includes(requestedStatus as CompanionRequestStatus)
      ? (requestedStatus as RequestFilter)
      : "all";

  // ─────────────────────────────
  // Requests
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
    .in("status", requestStatuses)
    .order("service_date", {
      ascending: true,
    })
    .order("start_time", {
      ascending: true,
    });

  if (error) {
    console.error("Load companion requests error:", error);
  }

  // ─────────────────────────────
  // Map data
  // ─────────────────────────────

  const requests: CompanionRequest[] = (rows ?? []).map((row) => {
    const customer = getRelation(row.customer);

    const category = getRelation(row.category);

    return {
      id: row.id,

      serviceDate: row.service_date,

      startTime: row.start_time,

      durationMinutes: row.duration_minutes,

      destinationName: row.destination_name,

      offeredFee: row.offered_fee,

      status: row.status as CompanionRequestStatus,

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
  // Counts
  // ─────────────────────────────

  const counts = {
    total: requests.length,

    pending: requests.filter((request) => request.status === "pending").length,

    rejected: requests.filter((request) => request.status === "rejected")
      .length,

    expired: requests.filter((request) => request.status === "expired").length,
  };

  // ─────────────────────────────
  // Apply filter
  // ─────────────────────────────

  const filteredRequests =
    currentFilter === "all"
      ? requests
      : requests.filter((request) => request.status === currentFilter);

  // ─────────────────────────────
  // UI
  // ─────────────────────────────

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-8">
        {/* Header */}

        <div>
          <p className="text-sm font-semibold text-sky-600">COMPANION</p>

          <h1 className="mt-1 text-2xl font-bold text-slate-900">คำของาน</h1>

          <p className="mt-2 text-sm text-slate-500">
            ตรวจสอบคำขอจากลูกค้าและเลือกตอบรับหรือปฏิเสธงาน
          </p>
        </div>

        {/* Summary */}

        <section className="mt-8">
          <RequestSummary
            pending={counts.pending}
            rejected={counts.rejected}
            expired={counts.expired}
          />
        </section>

        {/* Requests */}

        <section className="mt-10">
          <div>
            <h2 className="text-lg font-bold text-slate-900">รายการคำขอ</h2>

            <p className="mt-1 text-sm text-slate-500">คำขอที่ส่งมายังคุณ</p>
          </div>

          <div className="mt-5">
            <RequestFilters current={currentFilter} counts={counts} />
          </div>

          <div className="mt-5 space-y-4">
            {filteredRequests.length > 0 ? (
              filteredRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))
            ) : (
              <EmptyState filter={currentFilter} />
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function EmptyState({ filter }: { filter: RequestFilter }) {
  const messages: Record<RequestFilter, string> = {
    all: "ยังไม่มีคำของาน",
    pending: "ไม่มีคำขอที่รอตอบรับ",
    rejected: "ยังไม่มีคำขอที่ปฏิเสธ",
    expired: "ยังไม่มีคำขอที่หมดอายุ",
  };

  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <p className="font-semibold text-slate-700">{messages[filter]}</p>

      <p className="mt-1 text-sm text-slate-400">
        เมื่อมีรายการ ระบบจะแสดงที่นี่
      </p>
    </div>
  );
}

function getRelation<T>(value: T | T[] | null): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}
