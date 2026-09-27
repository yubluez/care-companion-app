"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function CustomerNavLinks() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // รอให้ Component ทำงานบน Browser ก่อน
  useEffect(() => {
    setMounted(true);
  }, []);

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
    // ยังไม่ตรวจสอบ Active ระหว่าง Hydration
    if (!mounted) return false;

    // หน้าหลัก
    if (href === "/customer") {
      return pathname === "/customer";
    }

    // เพิ่มคำขอ
    if (href === "/customer/requests/new") {
      return pathname === "/customer/requests/new";
    }

    // คำขอของฉัน + หน้า Detail
    if (href === "/customer/requests") {
      return (
        pathname === "/customer/requests" ||
        (pathname.startsWith("/customer/requests/") &&
          !pathname.startsWith("/customer/requests/new"))
      );
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <nav className="flex items-center gap-3">
      {navItems.map((item) => {
        const isActive = checkActive(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`
              px-4 py-2 rounded-xl transition cursor-pointer
              ${
                isActive
                  ? "text-sky-600 bg-sky-100 font-semibold"
                  : "text-slate-600 hover:bg-blue-50 hover:text-sky-600"
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
