type ServiceArea = {
  id: string;
  province: string;
  district: string;
};

type Availability = {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

type Props = {
  bio: string | null;
  experience: string | null;
  verificationStatus: string;
  ratingAvg: number;
  ratingCount: number;
  serviceAreas: ServiceArea[];
  availability: Availability[];
  jobStats: {
    total: number;
    completed: number;
    cancelled: number;
  };
};

const DAYS: Record<number, string> = {
  1: "จันทร์",
  2: "อังคาร",
  3: "พุธ",
  4: "พฤหัสบดี",
  5: "ศุกร์",
  6: "เสาร์",
  7: "อาทิตย์",
};

export default function CompanionDetails({
  bio,
  experience,
  verificationStatus,
  ratingAvg,
  ratingCount,
  serviceAreas,
  availability,
  jobStats,
}: Props) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard title="งานทั้งหมด" value={jobStats.total} />
        <SummaryCard title="เสร็จสิ้น" value={jobStats.completed} />
        <SummaryCard title="ยกเลิก" value={jobStats.cancelled} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-bold text-slate-900">ข้อมูล Companion</h2>

            <VerificationStatus status={verificationStatus} />
          </div>

          <Info title="แนะนำตัว" value={bio} />
          <Info title="ประสบการณ์" value={experience} />

          <div className="mt-5">
            <p className="text-sm font-medium text-slate-400">คะแนน</p>

            <p className="mt-1 font-semibold text-slate-700">
              {ratingCount > 0
                ? `${ratingAvg.toFixed(1)} / 5 (${ratingCount} รีวิว)`
                : "ยังไม่มีรีวิว"}
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-bold text-slate-900">พื้นที่ให้บริการ</h2>

          {serviceAreas.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">
              ยังไม่ได้ระบุพื้นที่ให้บริการ
            </p>
          ) : (
            <div className="mt-4 flex flex-wrap gap-2">
              {serviceAreas.map((area) => (
                <span
                  key={area.id}
                  className="rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-600"
                >
                  {area.district}, {area.province}
                </span>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-bold text-slate-900">เวลาที่พร้อมให้บริการ</h2>

        {availability.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">
            ยังไม่ได้ระบุเวลาที่พร้อมให้บริการ
          </p>
        ) : (
          <div className="mt-4 divide-y divide-slate-100">
            {availability.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-3 text-sm"
              >
                <span className="font-medium text-slate-700">
                  {DAYS[item.dayOfWeek] ?? "-"}
                </span>

                <span className="text-slate-500">
                  {formatTime(item.startTime)} - {formatTime(item.endTime)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function SummaryCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function Info({ title, value }: { title: string; value: string | null }) {
  return (
    <div className="mt-5">
      <p className="text-sm font-medium text-slate-400">{title}</p>
      <p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-700">
        {value || "-"}
      </p>
    </div>
  );
}

function VerificationStatus({ status }: { status: string }) {
  const labels: Record<string, string> = {
    pending: "รอตรวจสอบ",
    approved: "อนุมัติแล้ว",
    rejected: "ปฏิเสธ",
  };

  return (
    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
      {labels[status] ?? status}
    </span>
  );
}

function formatTime(time: string) {
  return time.slice(0, 5);
}
