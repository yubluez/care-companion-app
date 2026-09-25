import Link from "next/link";

import type { RequestCounts, RequestFilterStatus } from "./types";

type Props = {
  status: RequestFilterStatus;
  search: string;
  counts: RequestCounts;
};

export default function RequestFilters({ status, search, counts }: Props) {
  function buildUrl(newStatus: RequestFilterStatus) {
    const params = new URLSearchParams();

    if (newStatus !== "all") {
      params.set("status", newStatus);
    }

    if (search) {
      params.set("search", search);
    }

    const query = params.toString();

    return query ? `/admin/requests?${query}` : "/admin/requests";
  }

  return (
    <>
      <div className="mt-6 flex flex-wrap gap-2">
        <FilterButton
          href={buildUrl("all")}
          active={status === "all"}
          label="ทั้งหมด"
          count={counts.total}
        />

        <FilterButton
          href={buildUrl("pending")}
          active={status === "pending"}
          label="รอรับงาน"
          count={counts.pending}
        />

        <FilterButton
          href={buildUrl("accepted")}
          active={status === "accepted"}
          label="รับงานแล้ว"
          count={counts.accepted}
        />

        <FilterButton
          href={buildUrl("in_progress")}
          active={status === "in_progress"}
          label="กำลังให้บริการ"
          count={counts.inProgress}
        />

        <FilterButton
          href={buildUrl("completed")}
          active={status === "completed"}
          label="เสร็จสิ้น"
          count={counts.completed}
        />

        <FilterButton
          href={buildUrl("cancelled")}
          active={status === "cancelled"}
          label="ยกเลิก"
          count={counts.cancelled}
        />

        <FilterButton
          href={buildUrl("rejected")}
          active={status === "rejected"}
          label="ปฏิเสธ"
          count={counts.rejected}
        />

        <FilterButton
          href={buildUrl("expired")}
          active={status === "expired"}
          label="หมดอายุ"
          count={counts.expired}
        />
      </div>

      <form action="/admin/requests" method="GET" className="mt-5">
        {status !== "all" && (
          <input type="hidden" name="status" value={status} />
        )}

        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="search"
            name="search"
            defaultValue={search}
            placeholder="ค้นหา Customer, Companion หรือปลายทาง..."
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
                status === "all"
                  ? "/admin/requests"
                  : `/admin/requests?status=${status}`
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
