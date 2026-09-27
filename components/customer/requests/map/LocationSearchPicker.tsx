"use client";

import { KeyboardEvent, useState } from "react";
import MapPicker from "./MapPicker";
import type { MapLocation } from "./LocationMap";

export type SelectedPlace = {
  name: string;
  lat: number;
  lng: number;
};

type SearchResult = SelectedPlace & {
  id: number;
};

type Props = {
  title: string;
  value: SelectedPlace | null;
  onChange: (place: SelectedPlace) => void;
};

export default function LocationSearchPicker({
  title,
  value,
  onChange,
}: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  async function handleSearch() {
    if (query.trim().length < 3 || loading) return;

    setLoading(true);
    setError("");
    setResults([]);
    setHasSearched(false);

    try {
      const response = await fetch(
        `/api/locations/search?q=${encodeURIComponent(query.trim())}`,
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "ค้นหาสถานที่ไม่สำเร็จ");
      }

      setResults(data);
      setHasSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการค้นหา");
    } finally {
      setLoading(false);
    }
  }

  function handleMapChange(location: MapLocation) {
    onChange({
      name: "",
      lat: location.lat,
      lng: location.lng,
    });

    setResults([]);
    setHasSearched(false);
  }

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 p-5">
      <div>
        <h3 className="font-bold text-slate-800">{title}</h3>

        <p className="mt-1 text-sm text-slate-500">
          ค้นหาสถานที่หรือคลิกปักหมุดบนแผนที่
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="search"
          value={query}
          onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void handleSearch();
            }
          }}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="เช่น โรงพยาบาลศิริราช"
          className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-sky-500"
        />

        <button
          type="button"
          onClick={() => void handleSearch()}
          disabled={loading || query.trim().length < 3}
          className="cursor-pointer rounded-xl bg-sky-600 px-5 py-3 font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300 shadow-sm"
        >
          {loading ? "กำลังค้นหา..." : "ค้นหา"}
        </button>
      </div>

      {error && (
        <p role="alert" className="text-sm text-rose-600">
          {error}
        </p>
      )}

      {results.length > 0 && (
        <div className="max-h-56 space-y-1 overflow-y-auto rounded-xl border border-slate-200 p-2">
          {results.map((place) => (
            <button
              key={place.id}
              type="button"
              onClick={() => {
                onChange({
                  name: place.name,
                  lat: place.lat,
                  lng: place.lng,
                });

                setQuery(place.name);
                setResults([]);
                setHasSearched(false);
              }}
              className="w-full cursor-pointer rounded-lg p-3 text-left text-sm text-slate-700 transition hover:bg-sky-50"
            >
              📍 {place.name}
            </button>
          ))}
        </div>
      )}

      {hasSearched && results.length === 0 && (
        <p className="text-sm text-slate-500">
          ไม่พบสถานที่ ลองใช้ชื่ออื่นหรือปักหมุดเอง
        </p>
      )}

      <MapPicker
        title="ตำแหน่งบนแผนที่"
        value={value ? { lat: value.lat, lng: value.lng } : null}
        onChange={handleMapChange}
      />

      {value && (
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">
            ชื่อสถานที่ / รายละเอียดที่อยู่
          </label>

          <input
            type="text"
            required
            value={value.name}
            onChange={(event) =>
              onChange({
                ...value,
                name: event.target.value,
              })
            }
            placeholder="ระบุชื่อสถานที่ อาคาร หรือที่อยู่"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-sky-500"
          />

          <p className="text-xs text-slate-500">
            หากปักหมุดเอง กรุณากรอกชื่อสถานที่ด้วย
          </p>
        </div>
      )}
    </div>
  );
}
