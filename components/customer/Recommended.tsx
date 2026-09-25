import React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Recommended() {
  const supabase = await createClient();

  const { data: companions, error } = await supabase
    .from("profiles")
    .select(
      `
    id,
    full_name,
    avatar_url,
    role
  `,
    )
    .eq("role", "companion")
    .limit(3);

  if (error) {
    console.error("Error fetching companions:", error);
  }
  return (
    <div>
      {/* Recommended Companion */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Companion แนะนำ
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              ผู้ร่วมเดินทางที่พร้อมให้ความช่วยเหลือคุณ
            </p>
          </div>

          <Link
            href="/customer/compsearch"
            className="text-sm text-sky-600 font-semibold hover:text-sky-700"
          >
            ดูทั้งหมด →
          </Link>
        </div>

        {/* ไม่มี Companion */}
        {!companions || companions.length === 0 ? (
          <div className="max-w-[400px] bg-white border border-slate-200 rounded-2xl p-8 text-center">
            <p className="text-slate-500">
              ยังไม่มี Companion ที่พร้อมให้บริการ
            </p>
          </div>
        ) : (
          /* มี Companion */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {companions.map((companion) => (
              <div
                key={companion.id}
                className="
                    bg-white
                    border border-slate-200
                    rounded-2xl
                    p-5
                    hover:border-sky-300
                    hover:shadow-md
                    transition
                  "
              >
                {/* Profile */}
                <div className="flex items-center gap-4 mb-5">
                  {companion.avatar_url ? (
                    <img
                      src={companion.avatar_url}
                      alt={companion.full_name || "Companion"}
                      className="
                          w-14 h-14
                          rounded-full
                          object-cover
                          border border-slate-200
                        "
                    />
                  ) : (
                    <div
                      className="
                          w-14 h-14
                          rounded-full
                          bg-sky-100
                          text-sky-600
                          flex items-center
                          justify-center
                          text-xl
                          font-bold
                        "
                    >
                      {companion.full_name?.charAt(0) || "C"}
                    </div>
                  )}

                  <div>
                    <h3 className="font-bold text-slate-800">
                      {companion.full_name || "Companion"}
                    </h3>

                    <p className="text-sm text-emerald-600 mt-1">
                      ● พร้อมให้บริการ
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-slate-500 mb-5">
                  ผู้ร่วมเดินทางสำหรับช่วยเหลือและอำนวยความสะดวกในการทำธุระ
                </p>

                {/* Button */}
                <Link
                  href={`/customer/compsearch/${companion.id}`}
                  className="
                      block
                      w-full
                      text-center
                      border border-sky-200
                      text-sky-600
                      font-semibold
                      py-2.5
                      rounded-xl
                      hover:bg-sky-600
                      hover:text-white
                      transition
                    "
                >
                  ดูโปรไฟล์
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
