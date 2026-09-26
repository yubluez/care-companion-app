"use client";

import dynamic from "next/dynamic";
import type { MapLocation } from "./LocationMap";

const LocationMap = dynamic(() => import("./LocationMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[350px] items-center justify-center rounded-xl bg-slate-100 text-slate-500">
      กำลังโหลดแผนที่...
    </div>
  ),
});

type Props = {
  title: string;
  value: MapLocation | null;
  onChange: (location: MapLocation) => void;
};

export default function MapPicker({ title, value, onChange }: Props) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="font-semibold text-slate-800">{title}</h3>

        <p className="mt-1 text-sm text-slate-500">
          คลิกบนแผนที่เพื่อเลือกตำแหน่ง
        </p>
      </div>

      <LocationMap value={value} onChange={onChange} />

      {value ? (
        <div className="rounded-xl bg-blue-50 p-3 text-sm text-blue-800">
          <p className="font-semibold">เลือกตำแหน่งแล้ว</p>

          <p className="mt-1">Latitude: {value.lat.toFixed(6)}</p>

          <p>Longitude: {value.lng.toFixed(6)}</p>
        </div>
      ) : (
        <p className="text-sm text-amber-700">ยังไม่ได้เลือกตำแหน่ง</p>
      )}
    </div>
  );
}
