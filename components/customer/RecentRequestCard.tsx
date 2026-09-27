"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Clock3, MapPin, ChevronRight } from "lucide-react";

import RequestDetailModal from "@/components/customer/requests/RequestDetailModal";
import type {
  RequestStatus,
  ServiceRequest,
} from "@/components/customer/requests/types";

type Props = {
  request: ServiceRequest;
};

const statusConfig: Record<
  RequestStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "รอตอบรับ",
    className: "bg-amber-50 text-amber-700",
  },
  accepted: {
    label: "ตอบรับแล้ว",
    className: "bg-sky-50 text-sky-700",
  },
  in_progress: {
    label: "กำลังดำเนินการ",
    className: "bg-blue-50 text-blue-700",
  },
  completed: {
    label: "เสร็จสิ้น",
    className: "bg-emerald-50 text-emerald-700",
  },
  rejected: {
    label: "ถูกปฏิเสธ",
    className: "bg-rose-50 text-rose-700",
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

export default function RecentRequestCard({ request }: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const status = statusConfig[request.status];

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={`ดูรายละเอียดคำขอ ${request.category}`}
        className="flex w-full cursor-pointer flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-sky-300 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
            <MapPin size={23} />
          </div>

          <div className="min-w-0">
            <h3 className="font-bold text-slate-900">
              {request.destination || request.category}
            </h3>

            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays size={15} />
                {request.date}
              </span>

              <span className="inline-flex items-center gap-1.5">
                <Clock3 size={15} />
                {request.time} น.
              </span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
          <span
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${status.className}`}
          >
            {status.label}
          </span>

          <ChevronRight size={18} className="text-sky-600" />
        </div>
      </button>

      {isOpen && (
        <RequestDetailModal
          request={request}
          onClose={() => setIsOpen(false)}
          onCancelled={() => {
            setIsOpen(false);
            router.refresh();
          }}
        />
      )}
    </>
  );
}
