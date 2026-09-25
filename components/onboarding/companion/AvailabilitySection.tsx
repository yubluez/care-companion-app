"use client";

export type Availability = {
  enabled: boolean;
  startTime: string;
  endTime: string;
};

export const DAYS = [
  { value: 1, label: "จันทร์" },
  { value: 2, label: "อังคาร" },
  { value: 3, label: "พุธ" },
  { value: 4, label: "พฤหัสบดี" },
  { value: 5, label: "ศุกร์" },
  { value: 6, label: "เสาร์" },
  { value: 7, label: "อาทิตย์" },
];

type Props = {
  availability: Record<number, Availability>;

  onUpdateAvailability: (day: number, changes: Partial<Availability>) => void;
};

export default function AvailabilitySection({
  availability,
  onUpdateAvailability,
}: Props) {
  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
      <h2 className="text-xl font-bold text-slate-900">
        วันและเวลาให้บริการ *
      </h2>

      <p className="text-sm text-slate-500 mt-1 mb-5">
        เลือกวันที่คุณสะดวกรับงานและระบุช่วงเวลา
      </p>

      <div className="space-y-3">
        {DAYS.map((day) => {
          const current = availability[day.value];

          return (
            <div
              key={day.value}
              className={`border rounded-xl p-4 transition ${
                current.enabled
                  ? "border-sky-300 bg-sky-50/50"
                  : "border-slate-200"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <label className="flex items-center gap-3 sm:w-36 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={current.enabled}
                    onChange={(e) =>
                      onUpdateAvailability(day.value, {
                        enabled: e.target.checked,
                      })
                    }
                    className="w-4 h-4 accent-sky-600"
                  />

                  <span className="font-medium text-slate-700">
                    {day.label}
                  </span>
                </label>

                {current.enabled && (
                  <div className="flex items-center gap-3">
                    <input
                      type="time"
                      value={current.startTime}
                      onChange={(e) =>
                        onUpdateAvailability(day.value, {
                          startTime: e.target.value,
                        })
                      }
                      className="border border-slate-300 bg-white rounded-lg px-3 py-2 outline-none focus:border-sky-400"
                    />

                    <span className="text-slate-400">ถึง</span>

                    <input
                      type="time"
                      value={current.endTime}
                      onChange={(e) =>
                        onUpdateAvailability(day.value, {
                          endTime: e.target.value,
                        })
                      }
                      className="border border-slate-300 bg-white rounded-lg px-3 py-2 outline-none focus:border-sky-400"
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
