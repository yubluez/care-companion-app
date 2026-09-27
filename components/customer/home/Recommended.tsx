"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import CompanionProfileModal from "@/components/customer/compsearch/CompanionProfileModal";
import type { Companion } from "@/app/customer/compsearch/page";

export default function Recommended() {
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [selected, setSelected] = useState<Companion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadCompanions() {
      const supabase = createClient();

      const { data: approved, error: approvedError } = await supabase
        .from("companion_profiles")
        .select("user_id,bio,rating_avg,rating_count")
        .eq("verification_status", "approved");

      if (!active) return;

      if (approvedError) {
        console.error(approvedError);
        setError("ไม่สามารถโหลดข้อมูล Companion ได้");
        setLoading(false);
        return;
      }

      if (!approved?.length) {
        setLoading(false);
        return;
      }

      const ids = approved.map((item) => item.user_id);

      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id,full_name,avatar_url")
        .in("id", ids);

      if (!active) return;

      if (profileError) {
        console.error(profileError);
        setError("ไม่สามารถโหลดข้อมูลโปรไฟล์ได้");
        setLoading(false);
        return;
      }

      const profileMap = new Map(
        (profiles ?? []).map((profile) => [profile.id, profile]),
      );

      const result: Companion[] = approved.flatMap((item) => {
        const profile = profileMap.get(item.user_id);

        if (!profile) return [];

        return [
          {
            id: item.user_id,
            name: profile.full_name?.trim() || "Companion",
            avatar: profile.avatar_url ?? "",
            bio: item.bio ?? "",
            rating: Number(item.rating_avg ?? 0),
            reviews: Number(item.rating_count ?? 0),
          },
        ];
      });

      // แสดงผู้ที่มีคะแนนรีวิวก่อน และจำกัดไว้ 3 คน
      result.sort((a, b) => {
        if (a.reviews === 0 && b.reviews > 0) return 1;
        if (b.reviews === 0 && a.reviews > 0) return -1;
        return b.rating - a.rating || b.reviews - a.reviews;
      });

      setCompanions(result.slice(0, 3));
      setLoading(false);
    }

    void loadCompanions();

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="mt-10">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Companion แนะนำ</h2>
          <p className="mt-1 text-sm text-slate-500">
            ผู้ร่วมเดินทางที่พร้อมให้ความช่วยเหลือคุณ
          </p>
        </div>

        <Link
          href="/customer/compsearch"
          className="shrink-0 text-sm font-semibold text-sky-600 hover:underline"
        >
          ดูทั้งหมด →
        </Link>
      </div>

      {loading && (
        <p className="py-8 text-center text-slate-500">
          กำลังโหลด Companion...
        </p>
      )}

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-600">
          {error}
        </p>
      )}

      {!loading && !error && companions.length === 0 && (
        <div className="rounded-2xl border bg-white p-8 text-center text-slate-500">
          ยังไม่มี Companion ที่ผ่านการอนุมัติ
        </div>
      )}

      {!loading && !error && companions.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          {companions.map((companion) => (
            <article
              key={companion.id}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center gap-3">
                {companion.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={companion.avatar}
                    alt={companion.name}
                    className="h-14 w-14 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xl font-bold text-sky-600">
                    {companion.name.charAt(0)}
                  </div>
                )}

                <div className="min-w-0">
                  <h3 className="truncate font-bold text-slate-900">
                    {companion.name}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {companion.reviews > 0
                      ? `⭐ ${companion.rating.toFixed(1)} (${companion.reviews} รีวิว)`
                      : "ยังไม่มีรีวิว"}
                  </p>
                </div>
              </div>

              <p className="mt-4 line-clamp-2 min-h-10 text-sm text-slate-600">
                {companion.bio || "ผู้ร่วมเดินทางที่พร้อมให้ความช่วยเหลือคุณ"}
              </p>

              <button
                type="button"
                onClick={() => setSelected(companion)}
                className="mt-5 w-full cursor-pointer rounded-xl border border-sky-300 px-4 py-2.5 font-semibold text-sky-600 transition hover:bg-sky-50 shadow-sm"
              >
                ดูโปรไฟล์
              </button>
            </article>
          ))}
        </div>
      )}

      {selected && (
        <CompanionProfileModal
          companion={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </section>
  );
}
