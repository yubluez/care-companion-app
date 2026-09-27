import Link from "next/link";

import type { UserCounts, UserFilterRole } from "./types";

type Props = {
  role: UserFilterRole;
  search: string;
  counts: UserCounts;
};

export default function UserFilters({ role, search, counts }: Props) {
  function buildUrl(newRole: UserFilterRole) {
    const params = new URLSearchParams();

    if (newRole !== "all") {
      params.set("role", newRole);
    }

    if (search) {
      params.set("search", search);
    }

    const query = params.toString();

    return query ? `/admin/users?${query}` : "/admin/users";
  }

  return (
    <>
      {/* Filter */}

      <div className="mt-6 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 flex items-center gap-1.5 overflow-x-auto">
        <FilterButton
          href={buildUrl("all")}
          active={role === "all"}
          label="ทั้งหมด"
          count={counts.total}
        />

        <FilterButton
          href={buildUrl("customer")}
          active={role === "customer"}
          label="Customer"
          count={counts.customer}
        />

        <FilterButton
          href={buildUrl("companion")}
          active={role === "companion"}
          label="Companion"
          count={counts.companion}
        />
      </div>

      {/* Search */}

      <form action="/admin/users" method="GET" className="mt-5">
        {role !== "all" && <input type="hidden" name="role" value={role} />}

        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="search"
            name="search"
            defaultValue={search}
            placeholder="ค้นหาชื่อหรือเบอร์โทร..."
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />

          <button
            type="submit"
            className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 cursor-pointer shadow-sm"
          >
            ค้นหา
          </button>

          {search && (
            <Link
              href={
                role === "all" ? "/admin/users" : `/admin/users?role=${role}`
              }
              className="flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 cursor-pointer"
            >
              ล้าง
            </Link>
          )}
        </div>
      </form>
    </>
  );
}

function FilterButton({
  href,
  active,
  label,
  count,
}: {
  href: string;
  active: boolean;
  label: string;
  count: number;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold whitespace-nowrap transition cursor-pointer ${
        active
          ? "bg-emerald-600 text-white shadow-sm"
          : "text-slate-600 hover:bg-white hover:text-emerald-700"
      }`}
    >
      {label}

      <span
        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
          active ? "bg-white/20 text-white" : "bg-slate-200/80 text-slate-600"
        }`}
      >
        {count}
      </span>
    </Link>
  );
}
