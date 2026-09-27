type Props = {
  status: string;
};

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    className: string;
  }
> = {
  pending: {
    label: "รอการตอบรับ",
    className: "bg-amber-100 text-amber-700",
  },

  accepted: {
    label: "รับงานแล้ว",
    className: "bg-violet-100 text-violet-700",
  },

  in_progress: {
    label: "กำลังให้บริการ",
    className: "bg-purple-100 text-purple-700",
  },

  completed: {
    label: "เสร็จสิ้น",
    className: "bg-emerald-100 text-emerald-700",
  },

  rejected: {
    label: "ปฏิเสธ",
    className: "bg-rose-100 text-rose-700",
  },

  cancelled: {
    label: "ยกเลิก",
    className: "bg-slate-100 text-slate-600",
  },

  expired: {
    label: "หมดอายุ",
    className: "bg-slate-100 text-slate-600",
  },
};

export default function StatusBadge({ status }: Props) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    className: "bg-slate-100 text-slate-600",
  };

  return (
    <span
      className={`inline-flex text-xs font-semibold px-2.5 py-1 rounded-full ${config.className}`}
    >
      {config.label}
    </span>
  );
}
