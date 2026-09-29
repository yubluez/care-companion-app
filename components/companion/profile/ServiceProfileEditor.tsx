"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  type AvailabilityInput,
  updateCompanionAvailability,
  updateCompanionServiceAreas,
} from "@/lib/actions/companionProfile";

type Area = {
  id: string;
  province: string;
  district: string;
};

type AvailabilityItem = {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
};

type Props = {
  userId: string;
  initialBio: string;
  initialExperience: string;
  initialAreas: Area[];
  allAreas: Area[];
  initialAvailability: AvailabilityItem[];
};

type DaySchedule = {
  enabled: boolean;
  startTime: string;
  endTime: string;
};

const DAYS = [
  { value: 1, label: "วันจันทร์" },
  { value: 2, label: "วันอังคาร" },
  { value: 3, label: "วันพุธ" },
  { value: 4, label: "วันพฤหัสบดี" },
  { value: 5, label: "วันศุกร์" },
  { value: 6, label: "วันเสาร์" },
  { value: 7, label: "วันอาทิตย์" },
];

function formatTime(time: string) {
  if (!time) return "";
  return time.slice(0, 5);
}

function buildScheduleState(items: AvailabilityItem[]) {
  const state: Record<number, DaySchedule> = {};

  for (const day of DAYS) {
    const match = items.find((item) => item.day_of_week === day.value);

    state[day.value] = {
      enabled: Boolean(match),
      startTime: match ? formatTime(match.start_time) : "08:00",
      endTime: match ? formatTime(match.end_time) : "17:00",
    };
  }

  return state;
}

export default function ServiceProfileEditor({
  userId,
  initialBio,
  initialExperience,
  initialAreas,
  allAreas,
  initialAvailability,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // -----------------------------
  // Service profile
  // -----------------------------

  const [bio, setBio] = useState(initialBio);
  const [experience, setExperience] = useState(initialExperience);

  const [savedBio, setSavedBio] = useState(initialBio);
  const [savedExperience, setSavedExperience] = useState(initialExperience);

  // -----------------------------
  // Service areas
  // -----------------------------

  const [selectedIds, setSelectedIds] = useState<string[]>(
    initialAreas.map((area) => area.id),
  );

  const [savedAreas, setSavedAreas] = useState<Area[]>(initialAreas);

  const [search, setSearch] = useState("");

  // -----------------------------
  // Availability
  // -----------------------------

  const [schedule, setSchedule] = useState<Record<number, DaySchedule>>(() =>
    buildScheduleState(initialAvailability),
  );

  const [savedAvailability, setSavedAvailability] =
    useState<AvailabilityItem[]>(initialAvailability);

  // -----------------------------
  // Status
  // -----------------------------

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // -----------------------------
  // Areas
  // -----------------------------

  const filteredAreas = useMemo(() => {
    if (!search.trim()) return allAreas;

    const query = search.trim().toLowerCase();

    return allAreas.filter(
      (area) =>
        area.district.toLowerCase().includes(query) ||
        area.province.toLowerCase().includes(query),
    );
  }, [allAreas, search]);

  function handleToggleArea(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  function handleSelectAllAreas() {
    setSelectedIds((prev) => {
      const next = new Set(prev);

      filteredAreas.forEach((area) => {
        next.add(area.id);
      });

      return Array.from(next);
    });
  }

  function handleClearAreas() {
    setSelectedIds([]);
  }

  // -----------------------------
  // Availability
  // -----------------------------

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

      for (const day of DAYS) {
        if (next[day.value]?.enabled) {
          next[day.value] = {
            ...next[day.value],
            startTime: source.startTime,
            endTime: source.endTime,
          };
        }
      }

      return next;
    });
  }

  // -----------------------------
  // Edit
  // -----------------------------

  function handleEdit() {
    setError("");
    setMessage("");
    setEditing(true);
  }

  // -----------------------------
  // Cancel
  // -----------------------------

  function handleCancel() {
    setBio(savedBio);
    setExperience(savedExperience);

    setSelectedIds(savedAreas.map((area) => area.id));

    setSchedule(buildScheduleState(savedAvailability));

    setSearch("");
    setError("");
    setMessage("");
    setEditing(false);
  }

  // -----------------------------
  // Save
  // -----------------------------

  async function handleSave() {
    if (saving) return;

    setError("");
    setMessage("");

    if (selectedIds.length === 0) {
      setError("กรุณาเลือกพื้นที่ให้บริการอย่างน้อย 1 พื้นที่");
      return;
    }

    const availabilityToSave: AvailabilityInput[] = [];

    for (const day of DAYS) {
      const current = schedule[day.value];

      if (!current?.enabled) continue;

      if (!current.startTime || !current.endTime) {
        setError(`กรุณาระบุเวลาของ${day.label}ให้ครบถ้วน`);
        return;
      }

      if (current.startTime >= current.endTime) {
        setError(`เวลาเริ่มของ${day.label} ต้องน้อยกว่าเวลาสิ้นสุด`);
        return;
      }

      availabilityToSave.push({
        day_of_week: day.value,
        start_time: current.startTime,
        end_time: current.endTime,
      });
    }

    setSaving(true);

    try {
      // 1. บันทึกข้อความแนะนำตัวและประสบการณ์

      const supabase = createClient();

      const { data, error: profileError } = await supabase
        .from("companion_profiles")
        .update({
          bio: bio.trim() || null,
          experience: experience.trim() || null,
        })
        .eq("user_id", userId)
        .select("user_id")
        .single();

      if (profileError || !data) {
        throw new Error(
          profileError?.message || "ไม่สามารถบันทึกข้อมูลการให้บริการได้",
        );
      }

      // 2. บันทึกพื้นที่ให้บริการ

      const areaResult = await updateCompanionServiceAreas(selectedIds);

      if (!areaResult.success) {
        throw new Error(areaResult.error || "บันทึกพื้นที่ให้บริการไม่สำเร็จ");
      }

      // 3. บันทึกวันและเวลา

      const availabilityResult =
        await updateCompanionAvailability(availabilityToSave);

      if (!availabilityResult.success) {
        throw new Error(
          availabilityResult.error || "บันทึกวันและเวลาไม่สำเร็จ",
        );
      }

      // -----------------------------
      // Update saved state
      // -----------------------------

      setSavedBio(bio);
      setSavedExperience(experience);

      const nextAreas = allAreas.filter((area) =>
        selectedIds.includes(area.id),
      );

      setSavedAreas(nextAreas);

      setSavedAvailability(
        availabilityToSave.map((item, index) => ({
          id: `saved-${index}`,
          ...item,
        })),
      );

      setSearch("");

      setMessage("บันทึกข้อมูลการให้บริการเรียบร้อยแล้ว");

      setEditing(false);
    } catch (err) {
      console.error("Save service information:", err);

      setError(
        err instanceof Error
          ? err.message
          : "บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* ================= HEADER ================= */}

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            ข้อมูลการให้บริการ
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            ข้อมูลส่วนนี้จะแสดงให้ลูกค้าเห็น
          </p>
        </div>

        {!editing ? (
          <button
            type="button"
            onClick={handleEdit}
            className="self-start rounded-lg border border-sky-200 px-3.5 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-sky-50 hover:text-sky-700 sm:self-auto cursor-pointer"
          >
            แก้ไขข้อมูล
          </button>
        ) : (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-50 cursor-pointer"
            >
              ยกเลิก
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-sky-600 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            >
              {saving ? "กำลังบันทึก..." : "บันทึก"}
            </button>
          </div>
        )}
      </div>

      {/* ================= MESSAGE ================= */}

      {message && (
        <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600"
        >
          {error}
        </div>
      )}

      <div className="space-y-7">
        {/* ================= BIO ================= */}

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            ข้อความแนะนำตัว
          </label>

          {editing ? (
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={1000}
              rows={4}
              placeholder="แนะนำตัวและบอกเหตุผลที่อยากเป็น Companion..."
              className="w-full rounded-xl border border-slate-200 p-4 outline-none transition focus:border-sky-500"
            />
          ) : (
            <p className="whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-slate-700">
              {savedBio || "ยังไม่ได้เพิ่มข้อความแนะนำตัว"}
            </p>
          )}
        </div>

        {/* ================= EXPERIENCE ================= */}

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            ประสบการณ์และทักษะ
          </label>

          {editing ? (
            <textarea
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              maxLength={2000}
              rows={5}
              placeholder="ระบุประสบการณ์ ทักษะ หรือความสามารถที่เกี่ยวข้อง..."
              className="w-full rounded-xl border border-slate-200 p-4 outline-none transition focus:border-sky-500"
            />
          ) : (
            <p className="whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-slate-700">
              {savedExperience || "ยังไม่ได้เพิ่มข้อมูลประสบการณ์"}
            </p>
          )}
        </div>

        <div className="border-t border-slate-200" />

        {/* ================= SERVICE AREAS ================= */}

        <div>
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-slate-800">
              พื้นที่ให้บริการ
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              ระบุเขตพื้นที่ที่คุณสะดวกรับงาน สามารถเลือกได้หลายพื้นที่
            </p>
          </div>

          {!editing ? (
            savedAreas.length === 0 ? (
              <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-400">
                ยังไม่ได้ระบุพื้นที่ให้บริการ
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {savedAreas.map((area) => (
                  <span
                    key={area.id}
                    className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-1.5 text-sm font-medium text-sky-700"
                  >
                    {area.district}, {area.province}
                  </span>
                ))}
              </div>
            )
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <input
                  type="text"
                  placeholder="ค้นหาเขต / อำเภอ..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-200 sm:max-w-xs"
                />

                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <span className="font-medium text-slate-500">
                    เลือกแล้ว:{" "}
                    <span className="font-bold text-sky-700">
                      {selectedIds.length}
                    </span>{" "}
                    พื้นที่
                  </span>

                  <button
                    type="button"
                    onClick={handleSelectAllAreas}
                    className="font-medium text-sky-600 hover:underline cursor-pointer"
                  >
                    เลือกทั้งหมด
                  </button>

                  <span className="text-slate-300">|</span>

                  <button
                    type="button"
                    onClick={handleClearAreas}
                    className="text-slate-500 hover:underline cursor-pointer"
                  >
                    ล้างทั้งหมด
                  </button>
                </div>
              </div>

              <div className="max-h-72 overflow-y-auto rounded-xl border border-slate-200 p-3">
                {filteredAreas.length === 0 ? (
                  <p className="p-4 text-center text-sm text-slate-400">
                    ไม่พบเขตพื้นที่ที่ค้นหา
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                    {filteredAreas.map((area) => {
                      const checked = selectedIds.includes(area.id);

                      return (
                        <label
                          key={area.id}
                          className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm transition ${
                            checked
                              ? "border-sky-400 bg-sky-50/70 font-medium text-sky-900"
                              : "border-slate-200 text-slate-700 hover:border-sky-200 hover:bg-slate-50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => handleToggleArea(area.id)}
                            className="h-4 w-4 cursor-pointer rounded accent-sky-600"
                          />

                          <div className="min-w-0 flex-1">
                            <span className="block truncate text-sm">
                              {area.district}
                            </span>

                            <span className="block truncate text-[11px] text-slate-400">
                              {area.province}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-slate-200" />

        {/* ================= AVAILABILITY ================= */}

        <div>
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-slate-800">
              วันและเวลาที่สะดวก
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              ระบุวันและช่วงเวลาที่คุณสะดวกรับงาน
            </p>
          </div>

          {!editing ? (
            <div className="space-y-3">
              {savedAvailability.length === 0 ? (
                <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-400">
                  ยังไม่ได้ระบุวันและเวลาที่สะดวก
                </p>
              ) : (
                <div className="space-y-2">
                  {savedAvailability.map((item) => {
                    const day = DAYS.find((d) => d.value === item.day_of_week);

                    return (
                      <div
                        key={`${item.day_of_week}-${item.start_time}`}
                        className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm"
                      >
                        <span className="font-semibold text-slate-800">
                          {day?.label}
                        </span>

                        <span className="rounded-lg bg-sky-100/70 px-3 py-1 font-medium text-sky-700">
                          {formatTime(item.start_time)} –{" "}
                          {formatTime(item.end_time)} น.
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              <p className="pt-1 text-xs text-slate-400">
                * ตารางเวลาประจำ ไม่ใช่การยืนยันว่าว่างในวันที่ลูกค้าเลือก
              </p>
            </div>
          ) : (
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
                        ? "border-sky-300 bg-sky-50/40"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <label className="flex cursor-pointer select-none items-center gap-3">
                        <input
                          type="checkbox"
                          checked={current.enabled}
                          onChange={(e) =>
                            updateDay(day.value, {
                              enabled: e.target.checked,
                            })
                          }
                          className="h-4 w-4 cursor-pointer rounded accent-sky-600"
                        />

                        <span
                          className={`text-sm font-semibold ${
                            current.enabled
                              ? "text-sky-900"
                              : "text-slate-600"
                          }`}
                        >
                          {day.label}
                        </span>
                      </label>

                      {current.enabled ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            type="time"
                            value={current.startTime}
                            onChange={(e) =>
                              updateDay(day.value, {
                                startTime: e.target.value,
                              })
                            }
                            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-sky-500"
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
                            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-sky-500"
                          />

                          <button
                            type="button"
                            onClick={() => handleApplyTimeToAll(day.value)}
                            className="ml-1 cursor-pointer text-xs text-sky-600 hover:text-sky-700 hover:underline"
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
          )}
        </div>
      </div>
    </section>
  );
}
