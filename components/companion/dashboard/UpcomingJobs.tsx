import Link from "next/link";
import StatusBadge from "./StatusBadge";

export type UpcomingJob = {
  id: string;
  service_date: string;
  start_time: string;
  duration_minutes: number | null;
  destination_name: string | null;
  offered_fee: number | null;
  status: string;

  customer: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;

  category: {
    name: string;
  } | null;
};

type Props = {
  jobs: UpcomingJob[];
};

export default function UpcomingJobs({ jobs }: Props) {
  return (
    <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            งานที่กำลังจะมาถึง
          </h2>

          <p className="text-sm text-slate-500 mt-1">งานที่คุณตอบรับแล้ว</p>
        </div>

        <Link
          href="/companion/jobs"
          className="text-sm font-semibold text-sky-600 hover:text-sky-700 whitespace-nowrap cursor-pointer"
        >
          ดูทั้งหมด
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="py-16 px-6 text-center">
          <div className="text-4xl mb-3">🗓️</div>

          <h3 className="font-bold text-slate-700">
            ยังไม่มีงานที่กำลังจะมาถึง
          </h3>

          <p className="text-sm text-slate-400 mt-1">
            เมื่อคุณตอบรับงาน ตารางงานจะแสดงที่นี่
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {jobs.slice(0, 3).map((job) => (
            <Link
              key={job.id}
              href={`/companion/jobs/${job.id}`}
              className="block p-5 hover:bg-slate-50 transition cursor-pointer"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  {job.customer?.avatar_url ? (
                    <img
                      src={job.customer.avatar_url}
                      alt={job.customer.full_name || "ลูกค้า"}
                      className="w-11 h-11 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-11 h-11 shrink-0 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold">
                      {(job.customer?.full_name || "C").charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-slate-800">
                        {job.category?.name || "บริการ Companion"}
                      </h3>

                      <StatusBadge status={job.status} />
                    </div>

                    <p className="text-sm text-slate-500 mt-1">
                      ลูกค้า: {job.customer?.full_name || "ไม่ระบุชื่อ"}
                    </p>

                    {job.destination_name && (
                      <p className="text-sm text-slate-500 mt-1">
                        จุดหมาย: {job.destination_name}
                      </p>
                    )}

                    {job.offered_fee != null && (
                      <p className="text-sm font-semibold text-emerald-600 mt-2">
                        ฿{Number(job.offered_fee).toLocaleString("th-TH")}
                      </p>
                    )}
                  </div>
                </div>

                <div className="sm:text-right shrink-0">
                  <p className="font-semibold text-slate-700">
                    {formatDate(job.service_date)}
                  </p>

                  <p className="text-sm text-slate-500 mt-1">
                    {formatTime(job.start_time)}
                  </p>

                  {job.duration_minutes != null && (
                    <p className="text-xs text-slate-400 mt-1">
                      {formatDuration(job.duration_minutes)}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function formatDate(date: string) {
  if (!date) return "-";

  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function formatTime(time: string) {
  if (!time) return "-";

  return `${time.slice(0, 5)} น.`;
}

function formatDuration(minutes: number) {
  if (minutes < 60) {
    return `${minutes} นาที`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours} ชั่วโมง`;
  }

  return `${hours} ชม. ${remainingMinutes} นาที`;
}
