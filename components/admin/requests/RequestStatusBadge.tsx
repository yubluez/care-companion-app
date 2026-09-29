import type { RequestStatus } from "./types";

type Props = {
  status: RequestStatus;
};

const statusConfig: Record<
  RequestStatus,
  {
    label: string;
    className: string;
  }
> = {
  pending: {
    label: "รอรับงาน",
    className: "bg-amber-100 text-amber-700",
  },

  accepted: {
    label: "รับงานแล้ว",
    className: "bg-blue-100 text-blue-700",
  },

  in_progress: {
    label: "กำลังให้บริการ",
    className: "bg-sky-100 text-sky-700",
  },

  completed: {
    label: "เสร็จสิ้น",
    className: "bg-emerald-100 text-emerald-700",
  },

  cancelled: {
    label: "ยกเลิก",
    className: "bg-slate-100 text-slate-600",
  },

  rejected: {
    label: "ปฏิเสธ",
    className: "bg-rose-100 text-rose-700",
  },

  expired: {
    label: "หมดอายุ",
    className: "bg-orange-100 text-orange-700",
  },
};

export default function RequestStatusBadge({ status }: Props) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  );
}
