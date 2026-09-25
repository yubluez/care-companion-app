"use client";

import type { ServiceRequest, RequestStatus } from "./RequestList";

type Props = {
  request: ServiceRequest | null;
  onClose: () => void;
};

const statusConfig: Record<RequestStatus, { label: string; style: string }> = {
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
};

export default function RequestDetailModal({ request, onClose }: Props) {
  if (!request) return null;

  const status = statusConfig[request.status];

  return (
    <div
      className="
        fixed inset-0 z-50
        bg-black/40
        flex items-center justify-center
        px-4
      "
      onClick={onClose}
    >
      <div
        className="
          bg-white
          w-full max-w-2xl
          max-h-[90vh]
          overflow-y-auto
          rounded-3xl
          shadow-xl
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-100">
          <div>
            <p className="text-sm text-slate-400">#{request.id}</p>

            <h2 className="text-2xl font-bold text-slate-900 mt-1">
              {request.category}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="
              w-9 h-9
              flex items-center justify-center
              rounded-full
              text-slate-400
              hover:bg-slate-100
              hover:text-slate-700
              transition
              cursor-pointer
            "
          >
            ✕
          </button>
        </div>

        {/* Status */}
        <div className="px-6 pt-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-500">สถานะคำขอ</p>

            <span
              className={`
                px-3 py-1.5
                border rounded-full
                text-sm font-semibold
                ${status.style}
              `}
            >
              {status.label}
            </span>
          </div>
        </div>

        {/* Detail */}
        <div className="p-6">
          <h3 className="font-bold text-slate-900 mb-4">
            รายละเอียดการใช้บริการ
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <p className="text-sm text-slate-400 mb-1">วันที่</p>

              <p className="font-semibold text-slate-700">📅 {request.date}</p>
            </div>

            <div>
              <p className="text-sm text-slate-400 mb-1">เวลาเริ่ม</p>

              <p className="font-semibold text-slate-700">
                🕘 {request.time} น.
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-400 mb-1">ระยะเวลา</p>

              <p className="font-semibold text-slate-700">
                ⏱ {request.duration}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-400 mb-1">Companion</p>

              <p className="font-semibold text-slate-700">
                👤 {request.companionName}
              </p>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="px-6 pb-6">
          <div className="border-t border-slate-100 pt-6">
            <h3 className="font-bold text-slate-900 mb-4">สถานที่</h3>

            <div className="relative pl-7">
              {/* line */}
              <div className="absolute left-[7px] top-3 bottom-3 w-[2px] bg-slate-200" />

              {/* Origin */}
              <div className="relative mb-6">
                <div className="absolute -left-7 top-1 w-4 h-4 bg-sky-500 border-4 border-sky-100 rounded-full" />

                <p className="text-xs text-slate-400">จุดนัดพบ / ต้นทาง</p>

                <p className="font-semibold text-slate-700 mt-1">
                  {request.origin}
                </p>
              </div>

              {/* Destination */}
              <div className="relative">
                <div className="absolute -left-7 top-1 w-4 h-4 bg-rose-500 border-4 border-rose-100 rounded-full" />

                <p className="text-xs text-slate-400">จุดหมายปลายทาง</p>

                <p className="font-semibold text-slate-700 mt-1">
                  {request.destination}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Companion contact */}
        {request.status !== "pending" && request.status !== "cancelled" && (
          <div className="px-6 pb-6">
            <div className="bg-sky-50 border border-sky-100 rounded-2xl p-5">
              <p className="text-sm text-slate-500">Companion ที่รับงาน</p>

              <p className="font-bold text-slate-900 mt-1">
                {request.companionName}
              </p>

              <p className="text-sm text-slate-500 mt-2">
                สามารถแสดงเบอร์ติดต่อของ Companion
                ตรงส่วนนี้ได้หลังจากตอบรับคำขอ
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="
              px-6 py-2.5
              bg-sky-600
              hover:bg-sky-700
              text-white
              rounded-xl
              font-semibold
              transition
              cursor-pointer
            "
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}
