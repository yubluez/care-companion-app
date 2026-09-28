"use client";

import { useMemo, useState } from "react";
import { updateCompanionServiceAreas } from "@/lib/actions/companionProfile";

export type Area = {
  id: string;
  province: string;
  district: string;
};

type Props = {
  initialAreas: Area[];
  allAreas: Area[];
};

export default function ServiceAreasEditor({
  initialAreas,
  allAreas,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>(
    initialAreas.map((a) => a.id),
  );
  const [savedAreas, setSavedAreas] = useState<Area[]>(initialAreas);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const filteredAreas = useMemo(() => {
    if (!search.trim()) return allAreas;
    const q = search.trim().toLowerCase();
    return allAreas.filter(
      (a) =>
        a.district.toLowerCase().includes(q) ||
        a.province.toLowerCase().includes(q),
    );
  }, [allAreas, search]);

  function handleToggle(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  function handleSelectAll() {
    setSelectedIds(filteredAreas.map((a) => a.id));
  }

  function handleClearAll() {
    setSelectedIds([]);
  }

  async function handleSave() {
    if (saving) return;

    if (selectedIds.length === 0) {
      setError("กรุณาเลือกพื้นที่ให้บริการอย่างน้อย 1 พื้นที่");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const res = await updateCompanionServiceAreas(selectedIds);

      if (!res.success) {
        throw new Error(res.error || "บันทึกพื้นที่ให้บริการไม่สำเร็จ");
      }

      const nextSaved = allAreas.filter((a) => selectedIds.includes(a.id));
      setSavedAreas(nextSaved);
      setMessage("บันทึกพื้นที่ให้บริการเรียบร้อยแล้ว");
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
    setSelectedIds(savedAreas.map((a) => a.id));
    setSearch("");
    setError("");
    setMessage("");
    setEditing(false);
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">พื้นที่ให้บริการ</h2>
          <p className="mt-1 text-sm text-slate-500">
            ระบุเขตพื้นที่ที่คุณสะดวกรับงาน สามารถเลือกได้หลายพื้นที่
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
        <div>
          {savedAreas.length === 0 ? (
            <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-400">
              ยังไม่ได้ระบุพื้นที่ให้บริการ
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {savedAreas.map((area) => (
                <span
                  key={area.id}
                  className="bg-violet-50 border border-violet-200 text-violet-700 px-3 py-1.5 rounded-xl text-sm font-medium"
                >
                  {area.district}, {area.province}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <input
              type="text"
              placeholder="ค้นหาเขต / อำเภอ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:max-w-xs rounded-xl border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-200"
            />

            <div className="flex items-center gap-3 text-xs">
              <span className="text-slate-500 font-medium">
                เลือกแล้ว:{" "}
                <span className="text-violet-700 font-bold">
                  {selectedIds.length}
                </span>{" "}
                พื้นที่
              </span>
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-violet-600 hover:underline cursor-pointer font-medium"
              >
                เลือกทั้งหมด
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={handleClearAll}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {filteredAreas.map((area) => {
                  const isChecked = selectedIds.includes(area.id);
                  return (
                    <label
                      key={area.id}
                      className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 cursor-pointer text-sm transition ${
                        isChecked
                          ? "border-violet-400 bg-violet-50/70 font-medium text-violet-900"
                          : "border-slate-200 text-slate-700 hover:border-violet-200 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggle(area.id)}
                        className="h-4 w-4 rounded accent-violet-600 cursor-pointer"
                      />
                      <div className="min-w-0 flex-1 truncate">
                        <span className="block truncate text-xs sm:text-sm">
                          {area.district}
                        </span>
                        <span className="block text-[11px] text-slate-400 truncate">
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
    </section>
  );
}
