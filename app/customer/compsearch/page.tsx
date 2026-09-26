"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import CompanionCard from "@/components/customer/compsearch/CompanionCard";
import CompanionFilter from "@/components/customer/compsearch/CompanionFilter";
import CompanionProfileModal from "@/components/customer/compsearch/CompanionProfileModal";

export type Companion = {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  rating: number;
  reviews: number;
};

export default function CompanionSearch() {
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [search, setSearch] = useState("");
  const [minimumRating, setMinimumRating] = useState(0);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedCompanion, setSelectedCompanion] = useState<Companion | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const supabase = createClient();

    async function loadCompanions() {
      setLoading(true);

      const { data: approved, error: approvedError } = await supabase
        .from("companion_profiles")
        .select("user_id,bio,rating_avg,rating_count")
        .eq("verification_status", "approved");

      if (!active) return;

      if (approvedError) {
        console.error("Load approved companions:", approvedError);
        setError(
          "โหลดรายชื่อ Companion ไม่สำเร็จ กรุณาตรวจสอบสิทธิ์การอ่านข้อมูล",
        );
        setLoading(false);
        return;
      }

      if (!approved?.length) {
        setCompanions([]);
        setLoading(false);
        return;
      }

      const ids = approved.map((c) => c.user_id);

      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id,full_name,avatar_url")
        .in("id", ids);

      if (!active) return;

      if (profileError) {
        console.error("Load companion profiles:", profileError);
        setError("โหลดข้อมูลโปรไฟล์ไม่สำเร็จ กรุณาตรวจสอบ RLS ของ profiles");
        setLoading(false);
        return;
      }

      const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

      setCompanions(
        approved.flatMap((c) => {
          const p = profileById.get(c.user_id);
          if (!p) return [];

          return [
            {
              id: c.user_id,
              name: p.full_name?.trim() || "Companion",
              avatar: p.avatar_url ?? "",
              bio: c.bio ?? "",
              rating: Number(c.rating_avg ?? 0),
              reviews: Number(c.rating_count ?? 0),
            },
          ];
        }),
      );

      setLoading(false);
    }

    void loadCompanions();

    return () => {
      active = false;
    };
  }, []);

  const filteredCompanions = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase();

    return companions.filter(
      (c) =>
        (c.name.toLocaleLowerCase().includes(keyword) ||
          c.bio.toLocaleLowerCase().includes(keyword)) &&
        (minimumRating === 0 || (c.reviews > 0 && c.rating >= minimumRating)),
    );
  }, [companions, search, minimumRating]);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <p className="mb-1 font-semibold text-sky-600">ค้นหาผู้ร่วมเดินทาง</p>

          <h1 className="text-3xl font-bold text-slate-900">
            ค้นหา Companion ที่เหมาะกับคุณ
          </h1>

          <p className="mt-2 text-slate-500">
            ค้นหาจากชื่อหรือข้อมูลแนะนำตัว แล้วดูโปรไฟล์ก่อนส่งคำขอ
          </p>
        </div>

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex gap-3">
            <input
              aria-label="ค้นหา Companion"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาชื่อ Companion หรือข้อมูลแนะนำตัว..."
              className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-sky-500"
            />

            <button
              type="button"
              onClick={() => setShowFilter((v) => !v)}
              className="rounded-xl border border-slate-300 px-5 font-semibold text-slate-700"
            >
              ⚙ ตัวกรอง
            </button>
          </div>

          {showFilter && (
            <CompanionFilter
              minimumRating={minimumRating}
              onMinimumRatingChange={setMinimumRating}
            />
          )}
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-bold">Companion</h2>
          <p className="text-sm text-slate-500">
            {loading ? "กำลังโหลด..." : `พบ ${filteredCompanions.length} คน`}
          </p>
        </div>

        {error && (
          <p
            role="alert"
            className="mb-4 rounded-xl bg-rose-50 p-4 text-rose-700"
          >
            {error}
          </p>
        )}

        <div className="space-y-4">
          {filteredCompanions.map((companion) => (
            <CompanionCard
              key={companion.id}
              companion={companion}
              onViewProfile={() => setSelectedCompanion(companion)}
            />
          ))}
        </div>

        {!loading && !error && filteredCompanions.length === 0 && (
          <div className="rounded-2xl border bg-white py-16 text-center text-slate-500">
            ไม่พบ Companion ที่ตรงกับเงื่อนไข
          </div>
        )}
      </div>

      {selectedCompanion && (
        <CompanionProfileModal
          companion={selectedCompanion}
          onClose={() => setSelectedCompanion(null)}
        />
      )}
    </main>
  );
}
