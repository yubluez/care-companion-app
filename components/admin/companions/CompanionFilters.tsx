import Link from "next/link";

import type { CompanionCounts, CompanionFilterStatus } from "./types";

type Props = {
  status: CompanionFilterStatus;
  search: string;
  counts: CompanionCounts;
};

export default function CompanionFilters({ status, search, counts }: Props) {
  function buildUrl(newStatus: CompanionFilterStatus) {
    const params = new URLSearchParams();

    if (newStatus !== "all") {
      params.set("status", newStatus);
    }

    if (search) {
      params.set("search", search);
    }

    const query = params.toString();

    return query ? `/admin/companions?${query}` : "/admin/companions";
  }

  return (
    <>
      {/* Filter Tabs */}

      <div className="mt-6 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 flex items-center gap-1.5 overflow-x-auto">
        <FilterTab
          href={buildUrl("all")}
          active={status === "all"}
          label="ทั้งหมด"
          count={counts.total}
        />

        <FilterTab
          href={buildUrl("pending")}
          active={status === "pending"}
          label="รอตรวจสอบ"
          count={counts.pending}
        />

        <FilterTab
          href={buildUrl("approved")}
          active={status === "approved"}
          label="อนุมัติแล้ว"
          count={counts.approved}
        />

        <FilterTab
          href={buildUrl("rejected")}
          active={status === "rejected"}
          label="ปฏิเสธ"
          count={counts.rejected}
        />
      </div>

      {/* Search */}

      <form action="/admin/companions" method="GET" className="mt-5">
        {status !== "all" && (
          <input type="hidden" name="status" value={status} />
        )}

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
                status === "all"
                  ? "/admin/companions"
                  : `/admin/companions?status=${status}`
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

function FilterTab({
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
