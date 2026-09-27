"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_ITEMS = [
  {
    label: "หน้าหลัก",
    href: "/companion",
  },
  {
    label: "คำของาน",
    href: "/companion/requests",
  },
  {
    label: "งานของฉัน",
    href: "/companion/jobs",
  },
  {
    label: "โปรไฟล์",
    href: "/companion/profile",
  },
];

export default function CompanionNavbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/companion") {
      return pathname === "/companion";
    }

    return pathname.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        {/* Logo */}
        <Link
          href="/companion"
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setMobileOpen(false)}
        >
          <p className="font-bold text-violet-700 text-2xl">Care Companion</p>
        </Link>

        {/* Desktop */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition cursor-pointer ${
                  active
                    ? "bg-violet-50 text-violet-700"
                    : "text-slate-500 hover:bg-slate-50 hover:text-violet-900"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Button */}
        <button
          type="button"
          onClick={() => setMobileOpen((current) => !current)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-xl text-slate-600 md:hidden cursor-pointer"
          aria-label="เปิดเมนู"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <nav className="border-t border-slate-100 bg-white px-4 py-3 md:hidden">
          <div className="mx-auto max-w-6xl space-y-1">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block rounded-xl px-4 py-3 text-sm font-semibold cursor-pointer ${
                    active
                      ? "bg-violet-50 text-violet-700"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
