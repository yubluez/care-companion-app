"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/admin",
  },
  {
    label: "ตรวจสอบ Companion",
    href: "/admin/companions",
  },
  {
    label: "คำขอใช้บริการ",
    href: "/admin/requests",
  },
  {
    label: "ผู้ใช้งาน",
    href: "/admin/users",
  },
];

type Props = {
  adminName: string;
};

export default function AdminNavbar({ adminName }: Props) {
  const pathname = usePathname();

  const [open, setOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/admin") {
      return pathname === "/admin";
    }

    return pathname.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/admin" className="cursor-pointer flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-600 font-bold text-white shadow-sm">
            A
          </div>

          <div>
            <p className="font-bold leading-tight text-slate-900">
              Care Companion
            </p>

            <p className="text-[11px] text-slate-400">Admin</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`cursor-pointer rounded-xl px-4 py-2 text-sm font-semibold transition ${
                isActive(item.href)
                  ? "bg-sky-600 text-white shadow-sm"
                  : "text-slate-500 hover:bg-sky-50 hover:text-sky-700"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden text-right md:block">
          <p className="text-xs text-slate-400">ผู้ดูแลระบบ</p>

          <p className="max-w-36 truncate text-sm font-semibold text-slate-700">
            {adminName}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="cursor-pointer flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 md:hidden hover:bg-slate-50 transition"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {open && (
        <nav className="border-t border-slate-100 bg-white p-4 md:hidden">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`cursor-pointer block rounded-xl px-4 py-3 text-sm font-semibold transition ${
                isActive(item.href)
                  ? "bg-sky-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-sky-50 hover:text-sky-700"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
