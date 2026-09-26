import RequestFilters from "@/components/admin/requests/RequestFilters";
import RequestSummary from "@/components/admin/requests/RequestSummary";
import RequestsTable from "@/components/admin/requests/RequestsTable";

import type {
  AdminServiceRequest,
  RequestFilterStatus,
  RequestStatus,
} from "@/components/admin/requests/types";

import { createClient } from "@/lib/supabase/server";

type SearchParams = Promise<{
  status?: string;
  search?: string;
  page?: string;
}>;

const ITEMS_PER_PAGE = 10;

export default async function AdminRequestsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = await createClient();
  const params = await searchParams;

  // ─────────────────────────────────────────────
  // Search Params
  // ─────────────────────────────────────────────

  const allowedStatuses: RequestFilterStatus[] = [
    "all",
    "pending",
    "accepted",
    "in_progress",
    "completed",
    "cancelled",
    "rejected",
    "expired",
  ];

  const requestedStatus = params.status ?? "all";

  const status: RequestFilterStatus = allowedStatuses.includes(
    requestedStatus as RequestFilterStatus,
  )
    ? (requestedStatus as RequestFilterStatus)
    : "all";

  const search = params.search?.trim() ?? "";

  const requestedPage = Number(params.page ?? "1");

  const page =
    Number.isFinite(requestedPage) && requestedPage > 0
      ? Math.floor(requestedPage)
      : 1;

  // ─────────────────────────────────────────────
  // Requests
  // ─────────────────────────────────────────────

  const { data: requestRows, error: requestError } = await supabase
    .from("service_requests")
    .select(
      `
        id,
        customer_id,
        companion_id,
        service_date,
        start_time,
        destination_name,
        offered_fee,
        status,
        created_at
      `,
    )
    .order("created_at", {
      ascending: false,
    });

  if (requestError) {
    console.error("Load admin requests error:", requestError);

    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto w-full max-w-7xl px-4 py-8">
          <h1 className="text-2xl font-bold text-slate-900">คำขอใช้บริการ</h1>

          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
            ไม่สามารถโหลดคำขอใช้บริการได้
          </div>
        </div>
      </main>
    );
  }

  // ─────────────────────────────────────────────
  // Load involved users
  // ─────────────────────────────────────────────

  const userIds = Array.from(
    new Set(
      (requestRows ?? []).flatMap((request) => {
        const ids: string[] = [request.customer_id];

        if (request.companion_id) {
          ids.push(request.companion_id);
        }

        return ids;
      }),
    ),
  );

  let profiles: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  }[] = [];

  if (userIds.length > 0) {
    const { data, error: profileError } = await supabase
      .from("profiles")
      .select(
        `
          id,
          full_name,
          avatar_url
        `,
      )
      .in("id", userIds);

    if (profileError) {
      console.error("Load request users error:", profileError);
    } else {
      profiles = data ?? [];
    }
  }

  // ─────────────────────────────────────────────
  // Combine
  // ─────────────────────────────────────────────

  const requests: AdminServiceRequest[] = (requestRows ?? []).map((request) => {
    const customer =
      profiles.find((profile) => profile.id === request.customer_id) ?? null;

    const companion = request.companion_id
      ? (profiles.find((profile) => profile.id === request.companion_id) ??
        null)
      : null;

    return {
      id: request.id,

      customer: {
        id: request.customer_id,

        fullName: customer?.full_name ?? null,

        avatarUrl: customer?.avatar_url ?? null,
      },

      companion: request.companion_id
        ? {
            id: request.companion_id,

            fullName: companion?.full_name ?? null,

            avatarUrl: companion?.avatar_url ?? null,
          }
        : null,

      serviceDate: request.service_date,

      startTime: request.start_time,

      destinationName: request.destination_name,

      offeredFee: request.offered_fee,

      status: request.status as RequestStatus,

      createdAt: request.created_at,
    };
  });

  // ─────────────────────────────────────────────
  // Counts
  // ─────────────────────────────────────────────

  const countStatus = (target: RequestStatus) =>
    requests.filter((request) => request.status === target).length;

  const counts = {
    total: requests.length,

    pending: countStatus("pending"),

    accepted: countStatus("accepted"),

    inProgress: countStatus("in_progress"),

    completed: countStatus("completed"),

    cancelled: countStatus("cancelled"),

    rejected: countStatus("rejected"),

    expired: countStatus("expired"),
  };

  // ─────────────────────────────────────────────
  // Status Filter
  // ─────────────────────────────────────────────

  let filteredRequests = requests;

  if (status !== "all") {
    filteredRequests = filteredRequests.filter(
      (request) => request.status === status,
    );
  }

  // ─────────────────────────────────────────────
  // Search
  // ─────────────────────────────────────────────

  if (search) {
    const keyword = search.toLowerCase();

    filteredRequests = filteredRequests.filter((request) => {
      const customer = request.customer.fullName?.toLowerCase() ?? "";

      const companion = request.companion?.fullName?.toLowerCase() ?? "";

      const destination = request.destinationName?.toLowerCase() ?? "";

      return (
        customer.includes(keyword) ||
        companion.includes(keyword) ||
        destination.includes(keyword)
      );
    });
  }

  // ─────────────────────────────────────────────
  // Pagination
  // ─────────────────────────────────────────────

  const totalItems = filteredRequests.length;

  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));

  const currentPage = Math.min(page, totalPages);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  const endIndex = startIndex + ITEMS_PER_PAGE;

  const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

  const pagination = {
    currentPage,
    totalPages,
    totalItems,
    startIndex,
    endIndex,
  };

  // ─────────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-8">
        {/* Header */}

        <div>
          <p className="text-sm font-semibold text-slate-400">ADMIN</p>

          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            คำขอใช้บริการ
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            ตรวจสอบและติดตามคำขอใช้บริการทั้งหมดภายในระบบ
          </p>
        </div>

        {/* Summary */}

        <RequestSummary
          total={counts.total}
          pending={counts.pending}
          inProgress={counts.inProgress}
          completed={counts.completed}
        />

        {/* Requests */}

        <section className="mt-10">
          <div>
            <h2 className="text-lg font-bold text-slate-900">รายการคำขอ</h2>

            <p className="mt-1 text-sm text-slate-500">
              ค้นหาและตรวจสอบสถานะคำขอใช้บริการ
            </p>
          </div>

          <RequestFilters status={status} search={search} counts={counts} />

          <RequestsTable
            requests={paginatedRequests}
            pagination={pagination}
            status={status}
            search={search}
          />
        </section>
      </div>
    </main>
  );
}
