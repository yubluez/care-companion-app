import UserFilters from "@/components/admin/users/UserFilters";
import UserSummary from "@/components/admin/users/UserSummary";
import UsersTable from "@/components/admin/users/UsersTable";

import type {
  AdminUser,
  UserFilterRole,
  UserRole,
} from "@/components/admin/users/types";

import { createClient } from "@/lib/supabase/server";

type SearchParams = Promise<{
  role?: string;
  search?: string;
  page?: string;
}>;

const ITEMS_PER_PAGE = 10;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = await createClient();
  const params = await searchParams;

  // ─────────────────────────────────────────────
  // Search Params
  // ─────────────────────────────────────────────

  const allowedRoles: UserFilterRole[] = ["all", "customer", "companion"];

  const requestedRole = params.role ?? "all";

  const role: UserFilterRole = allowedRoles.includes(
    requestedRole as UserFilterRole,
  )
    ? (requestedRole as UserFilterRole)
    : "all";

  const search = params.search?.trim() ?? "";

  const requestedPage = Number(params.page ?? "1");

  const page =
    Number.isFinite(requestedPage) && requestedPage > 0
      ? Math.floor(requestedPage)
      : 1;

  // ─────────────────────────────────────────────
  // Load Users
  // ─────────────────────────────────────────────

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select(
      `
        id,
        full_name,
        phone,
        avatar_url,
        role,
        created_at
      `,
    )
    .in("role", ["customer", "companion"])
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error("Load admin users error:", error);

    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto w-full max-w-7xl px-4 py-8">
          <h1 className="text-2xl font-bold text-slate-900">ผู้ใช้งาน</h1>

          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
            ไม่สามารถโหลดข้อมูลผู้ใช้งานได้
          </div>
        </div>
      </main>
    );
  }

  // ─────────────────────────────────────────────
  // Map
  // ─────────────────────────────────────────────

  const users: AdminUser[] = (profiles ?? []).map((profile) => ({
    id: profile.id,

    fullName: profile.full_name ?? null,

    phone: profile.phone ?? null,

    avatarUrl: profile.avatar_url ?? null,

    role: profile.role as UserRole,

    createdAt: profile.created_at,
  }));

  // ─────────────────────────────────────────────
  // Counts
  // ─────────────────────────────────────────────

  const customerCount = users.filter((user) => user.role === "customer").length;

  const companionCount = users.filter(
    (user) => user.role === "companion",
  ).length;

  const counts = {
    total: users.length,
    customer: customerCount,
    companion: companionCount,
  };

  // ─────────────────────────────────────────────
  // Role Filter
  // ─────────────────────────────────────────────

  let filteredUsers = users;

  if (role !== "all") {
    filteredUsers = filteredUsers.filter((user) => user.role === role);
  }

  // ─────────────────────────────────────────────
  // Search
  // ─────────────────────────────────────────────

  if (search) {
    const keyword = search.toLowerCase();

    filteredUsers = filteredUsers.filter((user) => {
      const name = user.fullName?.toLowerCase() ?? "";

      const phone = user.phone?.toLowerCase() ?? "";

      return name.includes(keyword) || phone.includes(keyword);
    });
  }

  // ─────────────────────────────────────────────
  // Pagination
  // ─────────────────────────────────────────────

  const totalItems = filteredUsers.length;

  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));

  const currentPage = Math.min(page, totalPages);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  const endIndex = startIndex + ITEMS_PER_PAGE;

  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

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

          <h1 className="mt-1 text-2xl font-bold text-slate-900">ผู้ใช้งาน</h1>

          <p className="mt-2 text-sm text-slate-500">
            ดูและจัดการข้อมูล Customer และ Companion ภายในระบบ
          </p>
        </div>

        {/* Summary */}

        <UserSummary
          total={users.length}
          customers={customerCount}
          companions={companionCount}
        />

        {/* User List */}

        <section className="mt-10">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              รายชื่อผู้ใช้งาน
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              ค้นหาและตรวจสอบข้อมูลผู้ใช้งานในระบบ
            </p>
          </div>

          <UserFilters role={role} search={search} counts={counts} />

          <UsersTable
            users={paginatedUsers}
            pagination={pagination}
            role={role}
            search={search}
          />
        </section>
      </div>
    </main>
  );
}
