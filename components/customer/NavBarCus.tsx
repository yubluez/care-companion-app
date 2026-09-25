import React from "react";
import Link from "next/link";
import { getUser } from "@/lib/actions/auth";
import CustomerNavLinks from "./CustomerNavLinks";

export default async function NavBarCus() {
  const user = await getUser();

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "คุณลูกค้า";

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <section className="flex items-center justify-between h-16 max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/customer">
          <span className="text-2xl text-blue-700 font-bold">
            Care Companion
          </span>
        </Link>

        <CustomerNavLinks />

        <div className="flex items-center gap-2">
          <Link
            href="/customer/manual"
            className="text-slate-600 font-semibold px-4 py-2 rounded-xl hover:bg-sky-600 hover:text-white transition"
          >
            การใช้งาน
          </Link>

          <Link href="/customer/profile">
            {user?.user_metadata?.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                alt="avatar"
                className="w-10 h-10 rounded-full border border-sky-200 object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </Link>
        </div>
      </section>
    </header>
  );
}
