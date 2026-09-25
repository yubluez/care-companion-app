import CompanionApplicationsTable from "@/components/admin/companions/CompanionApplicationsTable";
import CompanionFilters from "@/components/admin/companions/CompanionFilters";
import CompanionSummary from "@/components/admin/companions/CompanionSummary";

import type {
  CompanionApplication,
  CompanionFilterStatus,
} from "@/components/admin/companions/types";

import { createClient } from "@/lib/supabase/server";

type SearchParams = Promise<{
  status?: string;
  search?: string;
  page?: string;
}>;

const ITEMS_PER_PAGE = 10;

export default async function AdminCompanionsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = await createClient();
  const params = await searchParams;

  // ─────────────────────────────────────────────
  // Search Params
  // ─────────────────────────────────────────────

  const allowedStatuses: CompanionFilterStatus[] = [
    "all",
    "pending",
    "approved",
    "rejected",
  ];

  const requestedStatus = params.status ?? "all";

  const status: CompanionFilterStatus = allowedStatuses.includes(
    requestedStatus as CompanionFilterStatus,
  )
    ? (requestedStatus as CompanionFilterStatus)
    : "all";

  const search = params.search?.trim() ?? "";

  const requestedPage = Number(params.page ?? "1");

  const page =
    Number.isFinite(requestedPage) && requestedPage > 0
      ? Math.floor(requestedPage)
      : 1;

  // ─────────────────────────────────────────────
  // Companion Profiles
  // ─────────────────────────────────────────────

  const { data: companionProfiles, error: companionError } = await supabase
    .from("companion_profiles")
    .select(
      `
        user_id,
        verification_status,
        created_at
      `,
    )
    .order("created_at", {
      ascending: false,
    });

  if (companionError) {
    console.error("Load companion profiles error:", companionError);

    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto w-full max-w-7xl px-4 py-8">
          <h1 className="text-2xl font-bold text-slate-900">
            ตรวจสอบ Companion
          </h1>

          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
            ไม่สามารถโหลดใบสมัคร Companion ได้
          </div>
        </div>
      </main>
    );
  }

  // ─────────────────────────────────────────────
  // Profiles
  // ─────────────────────────────────────────────

  const userIds =
    companionProfiles?.map((companion) => companion.user_id) ?? [];

  let profiles: {
    id: string;
    full_name: string | null;
    phone: string | null;
    avatar_url: string | null;
  }[] = [];

  if (userIds.length > 0) {
    const { data, error: profileError } = await supabase
      .from("profiles")
      .select(
        `
          id,
          full_name,
          phone,
          avatar_url
        `,
      )
      .in("id", userIds);

    if (profileError) {
      console.error("Load profiles error:", profileError);
    } else {
      profiles = data ?? [];
    }
  }

  // ─────────────────────────────────────────────
  // Combine Data
  // ─────────────────────────────────────────────

  const applications: CompanionApplication[] = (companionProfiles ?? []).map(
    (companion) => {
      const profile = profiles.find(
        (profile) => profile.id === companion.user_id,
      );

      return {
        userId: companion.user_id,

        fullName: profile?.full_name ?? null,

        phone: profile?.phone ?? null,

        avatarUrl: profile?.avatar_url ?? null,

        verificationStatus: companion.verification_status,

        createdAt: companion.created_at,
      };
    },
  );

  // ─────────────────────────────────────────────
  // Counts
  // ─────────────────────────────────────────────

  const pendingCount = applications.filter(
    (application) => application.verificationStatus === "pending",
  ).length;

  const approvedCount = applications.filter(
    (application) => application.verificationStatus === "approved",
  ).length;

  const rejectedCount = applications.filter(
    (application) => application.verificationStatus === "rejected",
  ).length;

  const reviewedCount = approvedCount + rejectedCount;

  const counts = {
    total: applications.length,
    pending: pendingCount,
    approved: approvedCount,
    rejected: rejectedCount,
  };

  // ─────────────────────────────────────────────
  // Filter Status
  // ─────────────────────────────────────────────

  let filteredApplications = applications;

  if (status !== "all") {
    filteredApplications = filteredApplications.filter(
      (application) => application.verificationStatus === status,
    );
  }

  // ─────────────────────────────────────────────
  // Search
  // ─────────────────────────────────────────────

  if (search) {
    const keyword = search.toLowerCase();

    filteredApplications = filteredApplications.filter((application) => {
      const name = application.fullName?.toLowerCase() ?? "";

      const phone = application.phone?.toLowerCase() ?? "";

      return name.includes(keyword) || phone.includes(keyword);
    });
  }

  // ─────────────────────────────────────────────
  // Pagination
  // ─────────────────────────────────────────────

  const totalItems = filteredApplications.length;

  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));

  const currentPage = Math.min(page, totalPages);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  const endIndex = startIndex + ITEMS_PER_PAGE;

  const paginatedApplications = filteredApplications.slice(
    startIndex,
    endIndex,
  );

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
            ตรวจสอบ Companion
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            ตรวจสอบข้อมูลและเอกสารของผู้สมัคร Companion ก่อนอนุมัติให้ใช้งานระบบ
          </p>
        </div>

        {/* Summary */}

        <CompanionSummary
          total={applications.length}
          pending={pendingCount}
          reviewed={reviewedCount}
        />

        {/* Applications */}

        <section className="mt-10">
          <div>
            <h2 className="text-lg font-bold text-slate-900">รายการใบสมัคร</h2>

            <p className="mt-1 text-sm text-slate-500">
              ค้นหาและตรวจสอบสถานะใบสมัคร Companion
            </p>
          </div>

          <CompanionFilters status={status} search={search} counts={counts} />

          <CompanionApplicationsTable
            applications={paginatedApplications}
            pagination={pagination}
            status={status}
            search={search}
          />
        </section>
      </div>
    </main>
  );
}
