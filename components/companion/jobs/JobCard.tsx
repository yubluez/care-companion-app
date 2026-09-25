import Link from "next/link";

import StatusBadge from "@/components/companion/dashboard/StatusBadge";

export type CompanionJob = {
  id: string;

  serviceDate: string;
  startTime: string;

  durationMinutes: number | null;

  destinationName: string | null;

  offeredFee: number | null;

  status: string;

  customer: {
    fullName: string | null;
    avatarUrl: string | null;
  } | null;

  category: {
    name: string;
  } | null;
};

type Props = {
  job: CompanionJob;
};

export default function JobCard({ job }: Props) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex flex-col justify-between gap-5 sm:flex-row">
        <div className="flex gap-4">
          {/* Customer Avatar */}

          {job.customer?.avatarUrl ? (
            <img
              src={job.customer.avatarUrl}
              alt={job.customer.fullName || "ลูกค้า"}
              className="h-12 w-12 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-500">
              {(job.customer?.fullName || "C").charAt(0).toUpperCase()}
            </div>
          )}

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-bold text-slate-900">
                {job.category?.name || "บริการ Companion"}
              </h2>

              <StatusBadge status={job.status} />
            </div>

            <p className="mt-1 text-sm text-slate-500">
              ลูกค้า: {job.customer?.fullName || "ไม่ระบุชื่อ"}
            </p>

            <div className="mt-4 space-y-1 text-sm text-slate-600">
              <p>{formatDate(job.serviceDate)}</p>

              <p>
                {formatTime(job.startTime)}

                {job.durationMinutes != null && (
                  <> · {formatDuration(job.durationMinutes)}</>
                )}
              </p>

              {job.destinationName && <p>จุดหมาย: {job.destinationName}</p>}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start sm:items-end">
          {job.offeredFee != null && (
            <>
              <p className="text-xs text-slate-400">ค่าบริการ</p>

              <p className="text-xl font-bold text-emerald-600">
                ฿{job.offeredFee.toLocaleString("th-TH")}
              </p>
            </>
          )}

          <Link
            href={`/companion/jobs/${job.id}`}
            className="mt-4 inline-flex rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700"
          >
            ดูรายละเอียด
          </Link>
        </div>
      </div>
    </article>
  );
}

function formatDate(date: string) {
  if (!date) return "-";

  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function formatTime(time: string) {
  if (!time) return "-";

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
