import Link from "next/link";

type Props = {
  title: string;
  value: number | string;
  description: string;
  icon?: string;
  href?: string;
  badge?: string | number | null;
};

export default function SummaryCard({
  title,
  value,
  description,
  icon,
  href,
  badge,
}: Props) {
  const content = (
    <div
      className={`relative bg-white rounded-2xl border border-slate-200 p-5 shadow-sm transition ${
        href ? "hover:border-sky-300 hover:shadow-md cursor-pointer" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <p className="text-3xl font-bold text-slate-900">{value}</p>
        {badge ? (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-sky-700">
            {badge}
          </span>
        ) : null}
      </div>

      <p className="text-xs text-slate-400 mt-1">{description}</p>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
