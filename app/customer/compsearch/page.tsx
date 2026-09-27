"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import CompanionCard from "@/components/customer/compsearch/CompanionCard";
import CompanionFilter, {
  emptyFilters,
  type SearchFilters,
  type AreaOption,
} from "@/components/customer/compsearch/CompanionFilter";
import CompanionProfileModal from "@/components/customer/compsearch/CompanionProfileModal";

export type Companion = {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  experience?: string;
  serviceAreas?: { province: string; district: string }[];
  availability?: { dayOfWeek: number; startTime: string; endTime: string }[];
  rating: number;
  reviews: number;
};

export default function CompanionSearch() {
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [areas, setAreas] = useState<AreaOption[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({ ...emptyFilters });
  const [showFilter, setShowFilter] = useState(false);

  const [selectedCompanion, setSelectedCompanion] = useState<Companion | null>(
    null,
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const supabase = createClient();

    async function loadData() {
      setLoading(true);
      setError("");

      const [approvedResult, areasResult, categoriesResult] = await Promise.all(
        [
          supabase
            .from("companion_profiles")
            .select("user_id,bio,experience,rating_avg,rating_count")
            .eq("verification_status", "approved"),

          supabase
            .from("areas")
            .select("id,province,district")
            .order("district"),
          supabase
            .from("service_categories")
            .select("id,name")
            .eq("is_active", true),
        ],
      );

      if (!active) return;

      if (categoriesResult.error) {
        console.error("Load categories:", categoriesResult.error);
      } else {
        setCategories(categoriesResult.data ?? []);
      }

      if (areasResult.error) {
        console.error("Load areas:", areasResult.error);
      } else {
        setAreas(areasResult.data ?? []);
      }

      if (approvedResult.error) {
        console.error("Load companions:", approvedResult.error);
        setError("ไม่สามารถโหลดรายชื่อ Companion ได้");
        setLoading(false);
        return;
      }

      const approved = approvedResult.data ?? [];

      if (approved.length === 0) {
        setCompanions([]);
        setLoading(false);
        return;
      }

      const ids = approved.map((item) => item.user_id);

      const [profilesResult, serviceAreasResult, availabilityResult] =
        await Promise.all([
          supabase
            .from("profiles")
            .select("id,full_name,avatar_url")
            .in("id", ids),
          supabase
            .from("companion_service_areas")
            .select("companion_id,area:areas(province,district)")
            .in("companion_id", ids),
          supabase
            .from("companion_availability")
            .select("companion_id,day_of_week,start_time,end_time")
            .in("companion_id", ids)
            .order("day_of_week"),
        ]);
      const { data: profiles, error: profileError } = profilesResult;
      if (serviceAreasResult.error || availabilityResult.error) {
        console.error(
          "Load service areas / availability:",
          serviceAreasResult.error,
          availabilityResult.error,
        );
      }
      const areaMap = new Map<
        string,
        { province: string; district: string }[]
      >();
      for (const row of serviceAreasResult.data ?? []) {
        const area = Array.isArray(row.area) ? row.area[0] : row.area;
        if (area)
          areaMap.set(row.companion_id, [
            ...(areaMap.get(row.companion_id) ?? []),
            area,
          ]);
      }
      const availabilityMap = new Map<
        string,
        { dayOfWeek: number; startTime: string; endTime: string }[]
      >();
      for (const row of availabilityResult.data ?? []) {
        availabilityMap.set(row.companion_id, [
          ...(availabilityMap.get(row.companion_id) ?? []),
          {
            dayOfWeek: row.day_of_week,
            startTime: row.start_time,
            endTime: row.end_time,
          },
        ]);
      }

      if (!active) return;

      if (profileError) {
        console.error("Load profiles:", profileError);
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
            experience: item.experience ?? "",
            serviceAreas: areaMap.get(item.user_id) ?? [],
            availability: availabilityMap.get(item.user_id) ?? [],
            rating: Number(item.rating_avg ?? 0),
            reviews: Number(item.rating_count ?? 0),
          },
        ];
      });

      setCompanions(result);
      setLoading(false);
    }

    void loadData();

    return () => {
      active = false;
    };
  }, []);

  const filteredCompanions = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase();

    return companions.filter((companion) => {
      const matchesKeyword =
        keyword.length === 0 ||
        companion.name.toLocaleLowerCase().includes(keyword) ||
        companion.bio.toLocaleLowerCase().includes(keyword) ||
        (companion.experience ?? "").toLocaleLowerCase().includes(keyword) ||
        (companion.serviceAreas ?? []).some((area) =>
          `${area.district} ${area.province}`
            .toLocaleLowerCase()
            .includes(keyword),
        );

      const matchesRating =
        filters.minimumRating === 0 ||
        (companion.reviews > 0 && companion.rating >= filters.minimumRating);

      return matchesKeyword && matchesRating;
    });
  }, [companions, search, filters.minimumRating]);

  const hasJobDetails = false;

  function clearFilters() {
    setSearch("");
    setFilters({ ...emptyFilters });
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <p className="mb-1 font-semibold text-sky-600">ค้นหาผู้ร่วมเดินทาง</p>

          <h1 className="text-3xl font-bold text-slate-900">
            ค้นหา Companion ที่เหมาะกับคุณ
          </h1>

          <p className="mt-2 text-slate-500">
            ค้นหาจากชื่อหรือข้อมูลแนะนำตัว และระบุรายละเอียดงานที่ต้องการ
          </p>
        </div>

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              aria-label="ค้นหา Companion"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="ค้นหาชื่อ Companion หรือสถานที่ในข้อมูลแนะนำตัว..."
              className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-sky-500"
            />

            <button
              type="button"
              aria-expanded={showFilter}
              onClick={() => setShowFilter((previous) => !previous)}
              className="cursor-pointer rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 shadow-sm"
            >
              ⚙ ตัวกรอง
            </button>
          </div>

          {showFilter && (
            <CompanionFilter
              filters={filters}
              areas={areas}
              onChange={(nextFilters) => {
                setFilters(nextFilters);
              }}
              onClear={clearFilters}
            />
          )}
        </div>

        {hasJobDetails && (
          <div className="mb-6 rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm leading-6 text-sky-900">
            คุณระบุรายละเอียดงานแล้ว แต่ระบบยังไม่มีข้อมูลยืนยันตารางเวลาว่าง
            ประเภทงานที่รับ และพื้นที่ให้บริการของ Companion แต่ละคน
            ดังนั้นรายละเอียดเหล่านี้ยังไม่ถูกนำมาใช้ตัดรายชื่อออก
          </div>
        )}

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
