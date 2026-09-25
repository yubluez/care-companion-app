"use client";

export type Area = {
  id: string;
  province: string;
  district: string;
};

type Props = {
  areas: Area[];
  selectedAreas: string[];
  onToggleArea: (areaId: string) => void;
};

export default function ServiceAreaSection({
  areas,
  selectedAreas,
  onToggleArea,
}: Props) {
  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
      <h2 className="text-xl font-bold text-slate-900">พื้นที่ให้บริการ *</h2>

      <p className="text-sm text-slate-500 mt-1 mb-5">
        เลือกพื้นที่ที่คุณสะดวกให้บริการ สามารถเลือกได้มากกว่า 1 พื้นที่
      </p>

      {areas.length === 0 ? (
        <p className="text-sm text-slate-400">ไม่พบข้อมูลพื้นที่</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {areas.map((area) => {
            const selected = selectedAreas.includes(area.id);

            return (
              <label
                key={area.id}
                className={`flex items-center gap-3 border rounded-xl px-4 py-3 cursor-pointer transition ${
                  selected
                    ? "border-sky-400 bg-sky-50"
                    : "border-slate-200 hover:border-sky-200"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => onToggleArea(area.id)}
                  className="w-4 h-4 accent-sky-600"
                />

                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {area.district}
                  </p>

                  <p className="text-xs text-slate-400">{area.province}</p>
                </div>
              </label>
            );
          })}
        </div>
      )}
    </section>
  );
}
