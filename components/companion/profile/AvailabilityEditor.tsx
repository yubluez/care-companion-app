"use client";

import { useState } from "react";
import {
  type AvailabilityInput,
  updateCompanionAvailability,
} from "@/lib/actions/companionProfile";

export type AvailabilityItem = {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
};

type Props = {
  initialAvailability: AvailabilityItem[];
};

const DAYS = [
  { value: 1, label: "วันจันทร์", short: "จันทร์" },
  { value: 2, label: "วันอังคาร", short: "อังคาร" },
  { value: 3, label: "วันพุธ", short: "พุธ" },
  { value: 4, label: "วันพฤหัสบดี", short: "พฤหัสฯ" },
  { value: 5, label: "วันศุกร์", short: "ศุกร์" },
  { value: 6, label: "วันเสาร์", short: "เสาร์" },
  { value: 7, label: "วันอาทิตย์", short: "อาทิตย์" },
];

function formatTime(time: string) {
  if (!time) return "";
  return time.slice(0, 5);
}

type DaySchedule = {
  enabled: boolean;
  startTime: string;
  endTime: string;
};

export default function AvailabilityEditor({ initialAvailability }: Props) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedItems, setSavedItems] =
    useState<AvailabilityItem[]>(initialAvailability);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // แปลง initialAvailability เป็น Record<number, DaySchedule>
  function buildScheduleState(items: AvailabilityItem[]) {
    const state: Record<number, DaySchedule> = {};
    for (const d of DAYS) {
      const match = items.find((i) => i.day_of_week === d.value);
      state[d.value] = {
        enabled: Boolean(match),
        startTime: match ? formatTime(match.start_time) : "08:00",
        endTime: match ? formatTime(match.end_time) : "17:00",
      };
    }
    return state;
  }

  const [schedule, setSchedule] = useState<Record<number, DaySchedule>>(() =>
    buildScheduleState(initialAvailability),
  );

  function updateDay(day: number, changes: Partial<DaySchedule>) {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        ...changes,
      },
    }));
  }

  function handleApplyTimeToAll(fromDay: number) {
    const source = schedule[fromDay];
    if (!source) return;
    setSchedule((prev) => {
      const next = { ...prev };
      for (const d of DAYS) {
        if (next[d.value]?.enabled) {
          next[d.value] = {
            ...next[d.value],
            startTime: source.startTime,
            endTime: source.endTime,
          };
        }
      }
      return next;
    });
  }

  async function handleSave() {
    if (saving) return;

    setError("");
    setMessage("");

    const itemsToSave: AvailabilityInput[] = [];

    for (const d of DAYS) {
      const current = schedule[d.value];
      if (current?.enabled) {
        if (!current.startTime || !current.endTime) {
          setError(`กรุณาระบุเวลาของ${d.label}ให้ครบถ้วน`);
          return;
        }
        if (current.startTime >= current.endTime) {
          setError(`เวลาเริ่มของ${d.label} ต้องน้อยกว่าเวลาสิ้นสุด`);
          return;
        }
        itemsToSave.push({
          day_of_week: d.value,
          start_time: current.startTime,
          end_time: current.endTime,
        });
      }
    }

    setSaving(true);

    try {
      const res = await updateCompanionAvailability(itemsToSave);

      if (!res.success) {
        throw new Error(res.error || "บันทึกวันเวลาไม่สำเร็จ");
      }

      setSavedItems(
        itemsToSave.map((item, index) => ({
          id: `saved-${index}`,
          ...item,
        })),
      );
      setMessage("บันทึกวันและเวลาที่สะดวกเรียบร้อยแล้ว");
      setEditing(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการบันทึก",
      );
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setSchedule(buildScheduleState(savedItems));
    setError("");
    setMessage("");
    setEditing(false);
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            วันและเวลาที่สะดวก
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            ระบุวันและช่วงเวลาที่คุณสะดวกรับงานเพื่อให้ลูกค้าทราบ
          </p>
        </div>

        {!editing ? (
          <button
            type="button"
            onClick={() => {
              setError("");
              setMessage("");
              setEditing(true);
            }}
            className="self-start sm:self-auto text-sm text-violet-600 hover:text-violet-700 font-medium px-3.5 py-1.5 rounded-lg hover:bg-violet-50 transition border border-violet-200 cursor-pointer"
          >
            แก้ไขข้อมูล
          </button>
        ) : (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="text-sm text-slate-600 hover:bg-slate-100 font-medium px-3.5 py-1.5 rounded-lg transition border border-slate-200 cursor-pointer disabled:opacity-50"
            >
              ยกเลิก
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="text-sm text-white bg-violet-600 hover:bg-violet-700 font-medium px-4 py-1.5 rounded-lg transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
            >
              {saving ? "กำลังบันทึก..." : "บันทึก"}
            </button>
          </div>
        )}
      </div>

      {message && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      )}

      {!editing ? (
        <div className="space-y-3">
          {savedItems.length === 0 ? (
            <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-400">
              ยังไม่ได้ระบุวันและเวลาที่สะดวก
            </p>
          ) : (
            <div className="space-y-2">
              {savedItems.map((item) => {
                const dayMeta = DAYS.find((d) => d.value === item.day_of_week);
                return (
                  <div
                    key={`${item.day_of_week}-${item.start_time}`}
                    className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm"
                  >
                    <span className="font-semibold text-slate-800">
                      {dayMeta?.label ?? `วันที่ ${item.day_of_week}`}
                    </span>
                    <span className="rounded-lg bg-violet-100/70 px-3 py-1 font-medium text-violet-700">
                      {formatTime(item.start_time)} –{" "}
                      {formatTime(item.end_time)} น.
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <p className="text-xs text-slate-400 pt-1">
            * ตารางเวลาประจำ ไม่ใช่การยืนยันว่าว่างในวันที่ลูกค้าเลือก
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="space-y-2.5">
            {DAYS.map((day) => {
              const current = schedule[day.value] ?? {
                enabled: false,
                startTime: "08:00",
                endTime: "17:00",
              };

              return (
                <div
                  key={day.value}
                  className={`rounded-xl border p-3.5 transition ${
                    current.enabled
                      ? "border-violet-300 bg-violet-50/40"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={current.enabled}
                        onChange={(e) =>
                          updateDay(day.value, { enabled: e.target.checked })
                        }
                        className="h-4 w-4 rounded accent-violet-600 cursor-pointer"
                      />
                      <span
                        className={`text-sm font-semibold ${
                          current.enabled
                            ? "text-violet-900"
                            : "text-slate-600"
                        }`}
                      >
                        {day.label}
                      </span>
                    </label>

                    {current.enabled ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <input
                          type="time"
                          value={current.startTime}
                          onChange={(e) =>
                            updateDay(day.value, {
                              startTime: e.target.value,
                            })
                          }
                          className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-violet-500"
                        />
                        <span className="text-xs text-slate-400">ถึง</span>
                        <input
                          type="time"
                          value={current.endTime}
                          onChange={(e) =>
                            updateDay(day.value, {
                              endTime: e.target.value,
                            })
                          }
                          className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-violet-500"
                        />

                        <button
                          type="button"
                          onClick={() => handleApplyTimeToAll(day.value)}
                          title="นำช่วงเวลานี้ไปใช้กับทุกวันที่เลือก"
                          className="text-xs text-violet-600 hover:text-violet-700 hover:underline cursor-pointer ml-1"
                        >
                          ใช้กับทุกวัน
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">
                        ไม่ได้เปิดรับงานในวันนี้
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
