"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  userId: string;
  initialBio: string;
  initialExperience: string;
};

export default function ServiceProfileEditor({
  userId,
  initialBio,
  initialExperience,
}: Props) {
  const [bio, setBio] = useState(initialBio);
  const [experience, setExperience] = useState(initialExperience);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSave() {
    if (saving) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const supabase = createClient();

      const { data, error: updateError } = await supabase
        .from("companion_profiles")
        .update({
          bio: bio.trim() || null,
          experience: experience.trim() || null,
        })
        .eq("user_id", userId)
        .select("user_id")
        .single();

      if (updateError || !data) {
        throw new Error(updateError?.message || "ไม่สามารถบันทึกข้อมูลได้");
      }

      setMessage("บันทึกข้อมูลเรียบร้อยแล้ว");
      setEditing(false);
    } catch (err) {
      console.error("Save service profile:", err);
      setError("บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setBio(initialBio);
    setExperience(initialExperience);
    setEditing(false);
    setError("");
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between gap-3">
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
            onClick={() => {
              setError("");
              setMessage("");
              setEditing(true);
            }}
            className="text-sm text-sky-600 hover:text-sky-700 font-medium px-3 py-1.5 rounded-lg hover:bg-sky-50 transition border border-sky-200 cursor-pointer"
          >
            แก้ไขข้อมูล
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="text-sm text-slate-600 hover:bg-slate-100 font-medium px-3 py-1.5 rounded-lg transition border border-slate-200 cursor-pointer disabled:opacity-50"
            >
              ยกเลิก
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="text-sm text-white bg-sky-600 hover:bg-sky-700 font-medium px-4 py-1.5 rounded-lg transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "กำลังบันทึก..." : "บันทึก"}
            </button>
          </div>
        )}
      </div>

      <div className="space-y-5">
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
              className="w-full rounded-xl border border-slate-200 p-4 outline-none focus:border-sky-500"
            />
          ) : (
            <p className="whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-slate-700">
              {bio || "ยังไม่ได้เพิ่มข้อความแนะนำตัว"}
            </p>
          )}
        </div>

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
              className="w-full rounded-xl border border-slate-200 p-4 outline-none focus:border-sky-500"
            />
          ) : (
            <p className="whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-slate-700">
              {experience || "ยังไม่ได้เพิ่มข้อมูลประสบการณ์"}
            </p>
          )}
        </div>

        {error && (
          <p role="alert" className="text-sm text-rose-600">
            {error}
          </p>
        )}

        {message && (
          <p role="status" className="text-sm text-emerald-700">
            {message}
          </p>
        )}
      </div>
    </section>
  );
}
