import React from "react";
import Link from "next/link";
import { getUser, signOut } from "@/lib/actions/auth";

export default async function NavBarCus() {
  const user = await getUser();
  const displayName = user?.email?.split("@")[0] || "คุณลูกค้า";

  return (
    <header className="sticky top-0 z-80 bg-white backdrop-blur-md border-b border-white shadow-md">
      <section className="flex items-center justify-between h-16 max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/customer">
          <span className="text-2xl text-blue-700 font-bold">
            😍 Care Companion
          </span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-5 text-lg">
          <Link
            href="/customer"
            className="text-slate-600 font-semibold px-4 py-2 rounded-xl hover:bg-sky-600 hover:text-white transition"
          >
            หน้าหลัก
          </Link>

          <Link
            href="/customer/compsearch"
            className="text-slate-600 font-semibold px-4 py-2 rounded-xl hover:bg-sky-600 hover:text-white transition"
          >
            ค้นหาเพื่อนร่วมทาง
          </Link>

          <Link
            href="/customer/requests/new"
            className="text-slate-600 font-semibold px-4 py-2 rounded-xl hover:bg-sky-600 hover:text-white transition"
          >
            คำขอของฉัน
          </Link>

          <Link
            href="/customer/manual"
            className="text-slate-600 font-semibold px-4 py-2 rounded-xl hover:bg-sky-600 hover:text-white transition"
          >
            วิธีใช้งาน
          </Link>
        </div>

        {/* Profile */}
        <div className="flex items-center">
          <Link
            href="/profile"
            className="text-slate-600 font-semibold px-4 py-2 rounded-xl hover:bg-sky-600 hover:text-white transition"
          >
            ความช่วยเหลือ
          </Link>
          <Link href="/profile">
            {user?.user_metadata?.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                alt="avatar"
                className="w-10 h-10 rounded-full border border-sky-200 object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-base">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </Link>
        </div>
      </section>
    </header>
  );
}
