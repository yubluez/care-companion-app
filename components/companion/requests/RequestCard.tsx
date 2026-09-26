import Link from "next/link";
import StatusBadge from "@/components/companion/dashboard/StatusBadge";

import type { CompanionRequest } from "./types";

type Props = {
  request: CompanionRequest;
};

export default function RequestCard({ request }: Props) {
  return (
    <article className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
        <div className="flex gap-4">
          {request.customer?.avatarUrl ? (
            <img
              src={request.customer.avatarUrl}
              alt={request.customer.fullName || "ลูกค้า"}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 shrink-0 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
              {(request.customer?.fullName || "C").charAt(0).toUpperCase()}
            </div>
          )}

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-bold text-lg text-slate-900">
                {request.category?.name || "บริการ Companion"}
              </h2>

              <StatusBadge status={request.status} />
            </div>

            <p className="text-sm text-slate-500 mt-1">
              ลูกค้า: {request.customer?.fullName || "ไม่ระบุชื่อ"}
            </p>

            <div className="mt-4 space-y-1.5 text-sm text-slate-600">
              <p>
                <span className="font-medium">วันที่:</span>{" "}
                {formatDate(request.serviceDate)}
              </p>

              <p>
                <span className="font-medium">เวลา:</span>{" "}
                {formatTime(request.startTime)}
              </p>

              {request.durationMinutes != null && (
                <p>
                  <span className="font-medium">ระยะเวลา:</span>{" "}
                  {formatDuration(request.durationMinutes)}
                </p>
              )}

              {request.destinationName && (
                <p>
                  <span className="font-medium">จุดหมาย:</span>{" "}
                  {request.destinationName}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="sm:text-right">
          {request.offeredFee != null && (
            <div>
              <p className="text-xs text-slate-400">ค่าบริการที่เสนอ</p>

              <p className="text-xl font-bold text-emerald-600">
                ฿{request.offeredFee.toLocaleString("th-TH")}
              </p>
            </div>
          )}

          <Link
            href={`/companion/requests/${request.id}`}
            className="inline-flex mt-4 items-center justify-center bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition"
          >
            ดูรายละเอียด
          </Link>
        </div>
      </div>
    </article>
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function formatTime(time: string) {
  return `${time.slice(0, 5)} น.`;
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;

  if (hours === 0) {
    return `${remaining} นาที`;
  }

  if (remaining === 0) {
    return `${hours} ชั่วโมง`;
  }

  return `${hours} ชม. ${remaining} นาที`;
}
