"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { MapPin, Map, ChevronDown, ChevronUp, Check } from "lucide-react";
import type { MapLocation } from "./LocationMap";

const LocationMap = dynamic(() => import("./LocationMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[350px] items-center justify-center rounded-xl bg-slate-100 text-slate-500">
      <div className="flex items-center gap-2 text-sm">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-sky-600 border-t-transparent" />
        <span>กำลังโหลดแผนที่...</span>
      </div>
    </div>
  ),
});

type Props = {
  title: string;
  value: MapLocation | null;
  onChange: (location: MapLocation) => void;
  defaultExpanded?: boolean;
};

export default function MapPicker({
  title,
  value,
  onChange,
  defaultExpanded = false,
}: Props) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs transition-all">
      {/* Header bar (สามารถกดเพื่อย่อ/ขยายได้) */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsExpanded((prev) => !prev)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsExpanded((prev) => !prev);
          }
        }}
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 cursor-pointer transition select-none ${
          isExpanded
            ? "bg-slate-50/80 border-b border-slate-200"
            : "hover:bg-slate-50/60"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`rounded-lg p-2.5 transition ${
              value
                ? "bg-sky-100 text-sky-700"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            <MapPin className="h-5 w-5" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-slate-800 text-sm sm:text-base">
                {title}
              </h4>
              {value ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  เลือกตำแหน่งแล้ว
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 border border-slate-200">
                  ยังไม่ได้เลือกตำแหน่ง
                </span>
              )}
            </div>

            <p className="mt-0.5 text-xs text-slate-500">
              {isExpanded
                ? "คลิกบนแผนที่เพื่อเลือกตำแหน่งหรือเลื่อนหมุด"
                : value
                  ? `พิกัด: ${value.lat.toFixed(5)}, ${value.lng.toFixed(5)}`
                  : "คลิกเพื่อเปิดแผนที่และปักหมุดตำแหน่ง"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded((prev) => !prev);
            }}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold transition shadow-xs cursor-pointer ${
              isExpanded
                ? "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                : value
                  ? "text-sky-700"
                  : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4" />
                <span>ย่อแผนที่</span>
              </>
            ) : value ? (
              <>
                <Map className="h-4 w-4 text-sky-600" />
                <span>ขยายดูแผนที่</span>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4 text-sky-600" />
                <span>ขยายแผนที่เพื่อปักหมุด</span>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* แผนที่เมื่อขยาย */}
      {isExpanded && (
        <div className="p-4 space-y-3 bg-white">
          <LocationMap value={value} onChange={onChange} />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-slate-100">
            <div>
              {value ? (
                <div className="text-xs text-slate-600">
                  <span className="font-semibold text-emerald-700">
                    ✓ พิกัดปัจจุบัน:
                  </span>{" "}
                  {value.lat.toFixed(6)}, {value.lng.toFixed(6)}
                </div>
              ) : (
                <p className="text-xs text-amber-700">
                  คลิกที่จุดใดก็ได้บนแผนที่เพื่อเลือกตำแหน่ง
                </p>
              )}
            </div>

            {/* <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="inline-flex items-center justify-center gap-1.5 self-end sm:self-auto rounded-lg bg-sky-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-sky-700 cursor-pointer active:scale-95"
            >
              <Check className="h-3.5 w-3.5" />
              <span>{value ? "เสร็จสิ้น / ย่อแผนที่" : "ย่อแผนที่"}</span>
            </button> */}
          </div>
        </div>
      )}
    </div>
  );
}
