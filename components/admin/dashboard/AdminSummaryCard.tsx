import Link from "next/link";
import React from "react";

type Props = {
  title: string;
  value: number | string;
  description: string;
  icon?: React.ReactNode;
  href?: string;
  badge?: {
    text: string;
    variant?: "default" | "warning" | "success" | "sky";
  };
};

export default function AdminSummaryCard({
  title,
  value,
  description,
  icon,
  href,
  badge,
}: Props) {
  const badgeStyles = {
    default: "bg-slate-100 text-slate-600",
    warning: "bg-amber-100 text-amber-800 border border-amber-200",
    success: "bg-emerald-100 text-emerald-800",
    sky: "bg-sky-100 text-sky-800",
  };

  const content = (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-200 ${
        href
          ? "cursor-pointer hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md"
          : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-slate-500">{title}</p>
        {icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-600 transition-colors group-hover:bg-sky-50 group-hover:text-sky-600">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <p className="text-3xl font-extrabold tracking-tight text-slate-900">
          {value}
        </p>
        {badge && (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
              badgeStyles[badge.variant || "default"]
            }`}
          >
            {badge.text}
          </span>
        )}
      </div>

      <p className="mt-1 text-xs text-slate-400">{description}</p>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
