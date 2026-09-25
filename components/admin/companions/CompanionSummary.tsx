type Props = {
  total: number;
  pending: number;
  reviewed: number;
};

export default function CompanionSummary({ total, pending, reviewed }: Props) {
  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-3">
      <SummaryCard title="ทั้งหมด" value={total} />

      <SummaryCard title="รอตรวจสอบ" value={pending} />

      <SummaryCard title="ตรวจสอบแล้ว" value={reviewed} />
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
