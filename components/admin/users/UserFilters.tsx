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

      <div className="mt-6 flex flex-wrap gap-2">
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
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
          />

          <button
            type="submit"
            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            ค้นหา
          </button>

          {search && (
            <Link
              href={
                role === "all" ? "/admin/users" : `/admin/users?role=${role}`
              }
              className="flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
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
      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
        active
          ? "bg-slate-900 text-white"
          : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
      }`}
    >
      {label}

      <span
        className={`rounded-full px-2 py-0.5 text-xs ${
          active ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500"
        }`}
      >
        {count}
      </span>
    </Link>
  );
}
