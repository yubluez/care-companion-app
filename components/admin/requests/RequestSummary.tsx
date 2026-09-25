type Props = {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
};

export default function RequestSummary({
  total,
  pending,
  inProgress,
  completed,
}: Props) {
  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <SummaryCard title="คำขอทั้งหมด" value={total} />

      <SummaryCard title="รอรับงาน" value={pending} />

      <SummaryCard title="กำลังให้บริการ" value={inProgress} />

      <SummaryCard title="เสร็จสิ้น" value={completed} />
    </div>
  );
}

function SummaryCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{title}</p>

      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
