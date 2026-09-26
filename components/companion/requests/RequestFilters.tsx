import Link from "next/link";

import type { RequestCounts, RequestFilter } from "./types";

type Props = {
  current: RequestFilter;
  counts: RequestCounts;
};

const filters: {
  value: RequestFilter;
  label: string;
  countKey: keyof RequestCounts;
}[] = [
  {
    value: "all",
    label: "ทั้งหมด",
    countKey: "total",
  },
  {
    value: "pending",
    label: "รอตอบรับ",
    countKey: "pending",
  },
  {
    value: "rejected",
    label: "ปฏิเสธแล้ว",
    countKey: "rejected",
  },
  {
    value: "expired",
    label: "หมดอายุ",
    countKey: "expired",
  },
];

export default function RequestFilters({ current, counts }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => {
        const active = current === filter.value;

        const href =
          filter.value === "all"
            ? "/companion/requests"
            : `/companion/requests?status=${filter.value}`;

        return (
          <Link
            key={filter.value}
            href={href}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              active
                ? "bg-slate-900 text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {filter.label}

            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                active
                  ? "bg-white/15 text-white"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {counts[filter.countKey]}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
