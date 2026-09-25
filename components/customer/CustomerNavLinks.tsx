"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function CustomerNavLinks() {
  const pathname = usePathname();

  const navItems = [
    {
      name: "หน้าหลัก",
      href: "/customer",
    },
    {
      name: "ค้นหาเพื่อนร่วมทาง",
      href: "/customer/compsearch",
    },
    {
      name: "เพิ่มคำขอ",
      href: "/customer/requests/new",
    },
    {
      name: "คำขอของฉัน",
      href: "/customer/requests",
    },
  ];

  const checkActive = (href: string) => {
    // หน้าหลัก
    if (href === "/customer") {
      return pathname === "/customer";
    }

    // เพิ่มคำขอ
    if (href === "/customer/requests/new") {
      return pathname === "/customer/requests/new";
    }

    // คำขอของฉัน + หน้า detail
    if (href === "/customer/requests") {
      return (
        pathname === "/customer/requests" ||
        (pathname.startsWith("/customer/requests/") &&
          !pathname.startsWith("/customer/requests/new"))
      );
    }

    return pathname.startsWith(href);
  };

  return (
    <nav className="flex items-center gap-5">
      {navItems.map((item) => {
        const isActive = checkActive(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`
              px-4 py-2 rounded-xl border-2 transition
              ${
                isActive
                  ? "border-sky-600 text-sky-600 bg-sky-50 font-semibold"
                  : "border-transparent text-slate-600 hover:bg-sky-600 hover:text-white"
              }
            `}
          >
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
