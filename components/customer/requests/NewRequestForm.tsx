"use client";

import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function NewRequestForm() {
  const searchParams = useSearchParams();

  const [selectedCompanionId, setSelectedCompanionId] = useState<string | null>(
    searchParams.get("companion"),
  );

  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [duration, setDuration] = useState("");
  const [note, setNote] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log({
      companionId: selectedCompanionId,
      category,
      date,
      time,
      origin,
      destination,
      duration,
      note,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden"
    >
      {/* Companion */}
      <section className="p-6 sm:p-8 border-b border-slate-100">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Companion</h2>

            <p className="text-sm text-slate-500 mt-1">
              เลือกผู้ร่วมเดินทางที่คุณต้องการส่งคำขอ
            </p>
          </div>

          <span className="text-xs font-semibold text-slate-400">
            ขั้นตอนที่ 1
          </span>
        </div>

        {selectedCompanionId ? (
          <div className="flex items-center justify-between border border-sky-200 bg-sky-50 rounded-2xl p-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white text-sky-600 flex items-center justify-center font-bold text-xl border border-sky-100">
                C
              </div>

              <div>
                <p className="font-bold text-slate-800">Companion ที่เลือก</p>

                <p className="text-sm text-slate-500 mt-1">
                  เลือกมาจากหน้าค้นหา Companion
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedCompanionId(null)}
              aria-label="ยกเลิกการเลือก Companion"
              title="ยกเลิกการเลือก Companion"
              className="flex items-center justify-center w-8 h-8 rounded-full text-slate-400 hover:bg-rose-100 hover:text-rose-600
                          transition cursor-pointer text-3xl"
            >
              ×
            </button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center">
            <p className="font-semibold text-slate-700">
              ยังไม่ได้เลือก Companion
            </p>

            <p className="text-sm text-slate-500 mt-1">
              กรุณาเลือก Companion ก่อนส่งคำขอ
            </p>

            <a
              href="/customer/compsearch"
              className="inline-block mt-4 bg-sky-600 hover:bg-sky-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition"
            >
              ค้นหา Companion
            </a>
          </div>
        )}
      </section>

      {/* Service Information */}
      <section className="p-6 sm:p-8 border-b border-slate-100">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-900">รายละเอียดธุระ</h2>

          <p className="text-sm text-slate-500 mt-1">
            บอก Companion ว่าคุณต้องการให้ช่วยเรื่องอะไร
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Category */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              ประเภทของธุระ
              <span className="text-rose-500"> *</span>
            </label>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-white outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            >
              <option value="">เลือกประเภทของธุระ</option>

              <option value="hospital">ไปโรงพยาบาล / พบแพทย์</option>

              <option value="bank">ไปธนาคาร</option>

              <option value="government">ติดต่อหน่วยงานราชการ</option>

              <option value="shopping">ซื้อของ / ทำธุระ</option>

              <option value="other">อื่น ๆ</option>
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              วันที่
              <span className="text-rose-500"> *</span>
            </label>

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </div>

          {/* Time */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              เวลาเริ่ม
              <span className="text-rose-500"> *</span>
            </label>

            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </div>

          {/* Duration */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              ระยะเวลาที่ต้องการใช้บริการ
              <span className="text-rose-500"> *</span>
            </label>

            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              required
              className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-white outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            >
              <option value="">เลือกระยะเวลา</option>

              <option value="60">ประมาณ 1 ชั่วโมง</option>

              <option value="120">ประมาณ 2 ชั่วโมง</option>

              <option value="180">ประมาณ 3 ชั่วโมง</option>

              <option value="240">ประมาณ 4 ชั่วโมง</option>

              <option value="300">มากกว่า 4 ชั่วโมง</option>
            </select>
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="p-6 sm:p-8 border-b border-slate-100">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-900">สถานที่</h2>

          <p className="text-sm text-slate-500 mt-1">
            ระบุสถานที่นัดพบและจุดหมายปลายทาง
          </p>
        </div>

        <div className="space-y-5">
          {/* Origin */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              สถานที่ต้นทาง / จุดนัดพบ
              <span className="text-rose-500"> *</span>
            </label>

            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              required
              placeholder="เช่น บ้านเลขที่ 99 เขตบางแค กรุงเทพมหานคร"
              className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </div>

          {/* Destination */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              จุดหมายปลายทาง
              <span className="text-rose-500"> *</span>
            </label>

            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              required
              placeholder="เช่น โรงพยาบาลศิริราช"
              className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </div>
        </div>
      </section>

      {/* Additional Detail */}
      <section className="p-6 sm:p-8">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-slate-900">
            รายละเอียดเพิ่มเติม
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            ระบุข้อมูลที่ Companion ควรทราบก่อนรับงาน
          </p>
        </div>

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={5}
          maxLength={500}
          placeholder="เช่น ต้องการให้ช่วยพาไปพบแพทย์และช่วยติดต่อเจ้าหน้าที่..."
          className="w-full resize-none border border-slate-300 rounded-xl px-4 py-3 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
        />

        <div className="text-right text-xs text-slate-400 mt-1">
          {note.length}/500
        </div>
      </section>

      {/* Actions */}
      <div className="bg-slate-50 border-t border-slate-100 p-6 flex justify-end gap-3">
        <a
          href="/customer"
          className="px-6 py-3 border border-slate-300 text-slate-600 rounded-xl font-semibold hover:bg-white transition"
        >
          ยกเลิก
        </a>

        <button
          type="submit"
          disabled={!selectedCompanionId}
          className="px-8 py-3 bg-sky-600 text-white rounded-xl font-semibold hover:bg-sky-700 transition cursor-pointer disabled:bg-slate-300 disabled:cursor-not-allowed"
        >
          ส่งคำขอใช้บริการ
        </button>
      </div>
    </form>
  );
}
