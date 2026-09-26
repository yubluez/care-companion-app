"use client";

import { useState } from "react";

import LocationSearchPicker, {
  type SelectedPlace,
} from "@/components/customer/requests/map/LocationSearchPicker";

export default function MapTestPage() {
  const [place, setPlace] = useState<SelectedPlace | null>(null);

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6">
      <h1 className="text-2xl font-bold text-slate-900">
        ทดสอบค้นหาและปักหมุด
      </h1>

      <LocationSearchPicker
        title="เลือกสถานที่"
        value={place}
        onChange={setPlace}
      />

      <button
        type="button"
        disabled={!place || !place.name.trim()}
        onClick={() => console.log("Selected place:", place)}
        className="rounded-xl bg-sky-600 px-6 py-3 font-semibold text-white disabled:bg-slate-300"
      >
        ทดสอบข้อมูลสถานที่
      </button>
    </main>
  );
}
