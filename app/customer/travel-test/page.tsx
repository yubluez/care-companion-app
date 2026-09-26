"use client";

import { useState } from "react";

import TravelSection from "@/components/customer/requests/travel/TravelSection";
import {
  initialTravelData,
  type TravelData,
} from "@/components/customer/requests/travel/types";

import RouteSummary, {
  type RouteDistances,
} from "@/components/customer/requests/travel/RouteSummary";

import PricingSummary from "@/components/customer/requests/pricing/PricingSummary";

import { calculateServicePrice } from "@/lib/pricing/servicePricing";

export default function TravelTestPage() {
  const [travel, setTravel] = useState<TravelData>(initialTravelData);

  const [distances, setDistances] = useState<RouteDistances | null>(null);

  const [durationMinutes, setDurationMinutes] = useState(180);

  const isValid =
    Boolean(travel.destination?.name.trim()) &&
    (travel.meetingType !== "pickup" || Boolean(travel.origin?.name.trim())) &&
    (!travel.returnRequired || Boolean(travel.returnLocation?.name.trim()));

  // เมื่อเปลี่ยนข้อมูลการเดินทาง ให้ล้างระยะทางเดิมทันที
  const handleTravelChange = (nextTravel: TravelData) => {
    setDistances(null);
    setTravel(nextTravel);
  };

  const price =
    distances && isValid
      ? calculateServicePrice({
          durationMinutes,
          outboundDistanceKm: distances.outboundDistanceKm,
          returnDistanceKm: distances.returnDistanceKm,
        })
      : null;

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6">
      <h1 className="text-2xl font-bold text-slate-900">
        ทดสอบรูปแบบการเดินทางและค่าบริการ
      </h1>

      <div className="rounded-3xl border border-slate-200 bg-white p-6">
        <TravelSection value={travel} onChange={handleTravelChange} />
      </div>

      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-xl font-bold text-slate-900">
          ระยะเวลาการให้บริการ
        </h2>

        <label
          htmlFor="duration"
          className="block text-sm font-medium text-slate-700"
        >
          เลือกระยะเวลา
        </label>

        <select
          id="duration"
          value={durationMinutes}
          onChange={(event) => setDurationMinutes(Number(event.target.value))}
          className="w-full rounded-xl border border-slate-300 p-3"
        >
          <option value={60}>1 ชั่วโมง</option>
          <option value={120}>2 ชั่วโมง</option>
          <option value={180}>3 ชั่วโมง</option>
          <option value={240}>4 ชั่วโมง</option>
          <option value={300}>5 ชั่วโมง</option>
          <option value={360}>6 ชั่วโมง</option>
          <option value={480}>8 ชั่วโมง</option>
        </select>
      </section>

      <RouteSummary travel={travel} onCalculated={setDistances} />

      <PricingSummary
        durationMinutes={durationMinutes}
        distances={isValid ? distances : null}
        calculating={isValid && !distances}
      />

      <button
        type="button"
        disabled={!isValid || !price}
        onClick={() => {
          if (!price) return;

          console.log("Travel data:", travel);
          console.log("Route distances:", distances);
          console.log("Pricing:", price);

          alert(
            `ข้อมูลครบถ้วน\n` +
              `ระยะทางรวม: ${price.totalDistanceKm.toFixed(2)} กม.\n` +
              `ค่าบริการ: ${price.totalFee.toFixed(2)} บาท`,
          );
        }}
        className="rounded-xl bg-sky-600 px-6 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        ทดสอบข้อมูลการเดินทางและราคา
      </button>
    </main>
  );
}
