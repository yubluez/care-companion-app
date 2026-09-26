type Props = {
  pending: number;
  rejected: number;
  expired: number;
};

export default function RequestSummary({ pending, rejected, expired }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <SummaryCard label="รอตอบรับ" value={pending} />

      <SummaryCard label="ปฏิเสธ" value={rejected} />

      <SummaryCard label="หมดอายุ" value={expired} />
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>

      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
