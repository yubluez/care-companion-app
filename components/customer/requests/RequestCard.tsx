import Link from "next/link";
import type { ServiceRequest, RequestStatus } from "./types";

type Props = {
  request: ServiceRequest;
  onViewDetail: (request: ServiceRequest) => void;
};

const statusConfig: Record<
  RequestStatus,
  {
    label: string;
    style: string;
  }
> = {
  pending: {
    label: "รอตอบรับ",
    style: "bg-amber-50 text-amber-700 border-amber-200",
  },

  accepted: {
    label: "ตอบรับแล้ว",
    style: "bg-sky-50 text-sky-700 border-sky-200",
  },

  in_progress: {
    label: "กำลังดำเนินการ",
    style: "bg-blue-50 text-blue-700 border-blue-200",
  },

  completed: {
    label: "เสร็จสิ้น",
    style: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },

  cancelled: {
    label: "ยกเลิก",
    style: "bg-slate-100 text-slate-600 border-slate-200",
  },

  rejected: {
    label: "ถูกปฏิเสธ",
    style: "bg-rose-50 text-rose-700 border-rose-200",
  },

  expired: {
    label: "หมดอายุ",
    style: "bg-slate-100 text-slate-600 border-slate-200",
  },
};

export default function RequestCard({ request, onViewDetail }: Props) {
  const status = statusConfig[request.status];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-sky-200 hover:shadow-sm transition">
      {/* Header */}
      <div className="flex justify-between gap-4">
        <div>
          <p className="text-xs text-slate-400 mb-1">#{request.id}</p>

          <h2 className="text-lg font-bold text-slate-900">
            {request.category}
          </h2>
        </div>

        <span
          className={`
            h-fit
            px-3 py-1.5
            rounded-full
            border
            text-xs
            font-semibold
            ${status.style}
          `}
        >
          {status.label}
        </span>
      </div>

      {/* Information */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5 text-sm">
        <div>
          <p className="text-slate-400 mb-1">วันที่และเวลา</p>

          <p className="font-medium text-slate-700">
            📅 {request.date} เวลา {request.time} น.
          </p>
        </div>

        <div>
          <p className="text-slate-400 mb-1">ระยะเวลา</p>

          <p className="font-medium text-slate-700">⏱ {request.duration}</p>
        </div>

        <div>
          <p className="text-slate-400 mb-1">Companion</p>

          <p className="font-medium text-slate-700">
            👤 {request.companionName}
          </p>
        </div>

        {/* ค่าบริการรวม */}
        <div>
          <p className="text-slate-400 mb-1">ค่าบริการรวม</p>

          <p className="font-bold text-lg text-emerald-600">
            {request.offeredFee != null
              ? `฿${request.offeredFee.toLocaleString("th-TH", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`
              : "ยังไม่มีข้อมูลราคา"}
          </p>
        </div>
      </div>

      {/* Route */}
      <div className="mt-5 pt-5 border-t border-slate-100 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs text-slate-400 mb-1">เส้นทาง</p>

          <p className="text-sm font-medium text-slate-700">
            📍 {request.origin}
            <span className="mx-2 text-slate-300">→</span>
            {request.destination}
          </p>
        </div>

        <button
          onClick={() => onViewDetail(request)}
          className="border border-sky-300 text-sky-600 hover:bg-sky-600 hover:text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition whitespace-nowrap cursor-pointer"
        >
          ดูรายละเอียด
        </button>
      </div>
    </div>
  );
}
