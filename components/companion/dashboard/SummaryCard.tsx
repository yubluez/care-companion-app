type Props = {
  title: string;
  value: number | string;
  description: string;
};

export default function SummaryCard({ title, value, description }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{title}</p>

      <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>

      <p className="text-xs text-slate-400 mt-1">{description}</p>
    </div>
  );
}
