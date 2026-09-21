import React from "react";
import Link from "next/link";

export default function NavBar() {
  return (
    <header className="sticky top-0 z-80 bg-white backdrop-blur-md border-b border-white shadow-md">
      <section className="flex items-center justify-between h-16 max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
        <div>
          <span className="text-2xl text-blue-700 font-bold">
            😍 Care Companion
          </span>
        </div>
        <div>
            <Link href="/customer"
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold shadow-sm hover:bg-blue-700 active:scale-95 transition-all">
                go to Customer
            </Link>
        </div>
      </section>
    </header>
  );
}
