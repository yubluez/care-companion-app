"use client";

export type SearchFilters = {
  area: string;
  dayOfWeek: number;
  minimumRating: number;
  sortBy: "default" | "rating_desc" | "reviews_desc" | "name_asc";
};

export const emptyFilters: SearchFilters = {
  area: "",
  dayOfWeek: 0,
  minimumRating: 0,
  sortBy: "default",
};

export type AreaOption = {
  id: string;
  province: string;
  district: string;
};

const DAYS = [
  { value: 0, label: "ทุกวัน" },
  { value: 1, label: "วันจันทร์" },
  { value: 2, label: "วันอังคาร" },
  { value: 3, label: "วันพุธ" },
  { value: 4, label: "วันพฤหัสบดี" },
  { value: 5, label: "วันศุกร์" },
  { value: 6, label: "วันเสาร์" },
  { value: 7, label: "วันอาทิตย์" },
];

type Props = {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  areas: AreaOption[];
  onClear: () => void;
};

const fieldClass =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 cursor-pointer";

export default function CompanionFilter({
  filters,
  onChange,
  areas,
  onClear,
}: Props) {
  function update<K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K],
  ) {
    onChange({ ...filters, [key]: value });
  }

  const hasActiveFilters =
    Boolean(filters.area) ||
    filters.dayOfWeek > 0 ||
    filters.minimumRating > 0 ||
    filters.sortBy !== "default";

  return (
    <div className="mt-5 space-y-5 border-t border-slate-100 pt-5">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-900">ตัวกรองการค้นหา</h3>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer transition"
          >
            ล้างตัวกรองทั้งหมด
          </button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* พื้นที่ให้บริการ */}
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-700">
            พื้นที่ให้บริการ
          </span>
          <select
            className={fieldClass}
            value={filters.area}
            onChange={(e) => update("area", e.target.value)}
          >
            <option value="">ทุกพื้นที่</option>
            {areas.map((area) => (
              <option key={area.id} value={area.district}>
                {area.district} ({area.province})
              </option>
            ))}
          </select>
        </label>

        {/* วันที่สะดวก */}
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-700">
            วันที่สะดวกรับงาน
          </span>
          <select
            className={fieldClass}
            value={filters.dayOfWeek}
            onChange={(e) => update("dayOfWeek", Number(e.target.value))}
          >
            {DAYS.map((day) => (
              <option key={day.value} value={day.value}>
                {day.label}
              </option>
            ))}
          </select>
        </label>

        {/* คะแนนรีวิวขั้นต่ำ */}
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-700">
            คะแนนรีวิวขั้นต่ำ
          </span>
          <select
            className={fieldClass}
            value={filters.minimumRating}
            onChange={(e) => update("minimumRating", Number(e.target.value))}
          >
            <option value={0}>ทั้งหมด</option>
            <option value={4.5}>⭐ 4.5 ดาวขึ้นไป</option>
            <option value={4}>⭐ 4.0 ดาวขึ้นไป</option>
            <option value={3}>⭐ 3.0 ดาวขึ้นไป</option>
          </select>
        </label>

        {/* จัดเรียงตาม */}
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-700">
            จัดเรียงตาม
          </span>
          <select
            className={fieldClass}
            value={filters.sortBy}
            onChange={(e) =>
              update(
                "sortBy",
                e.target.value as SearchFilters["sortBy"],
              )
            }
          >
            <option value="default">ค่าเริ่มต้น</option>
            <option value="rating_desc">คะแนนรีวิวสูงสุด</option>
            <option value="reviews_desc">จำนวนรีวิวมากที่สุด</option>
            <option value="name_asc">ชื่อ (ก-ฮ / A-Z)</option>
          </select>
        </label>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={onClear}
          className="cursor-pointer rounded-xl border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 shadow-sm"
        >
          ล้างตัวกรอง
        </button>
      </div>
    </div>
  );
}
