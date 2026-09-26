"use client";

import { useEffect, useState } from "react";
import type { TravelData } from "./types";

type RouteResult = {
  distanceKm: number;
  durationMinutes: number;
};

export type RouteDistances = {
  outboundDistanceKm: number;
  returnDistanceKm: number;
};

type Props = {
  travel: TravelData;
  onCalculated?: (result: RouteDistances | null) => void;
};

async function calculateRoute(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  signal: AbortSignal,
): Promise<RouteResult> {
  const response = await fetch("/api/routes/calculate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ origin, destination }),
    signal,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "ไม่สามารถคำนวณเส้นทางได้");
  }

  return result;
}

export default function RouteSummary({ travel, onCalculated }: Props) {
  const [outbound, setOutbound] = useState<RouteResult | null>(null);

  const [returnRoute, setReturnRoute] = useState<RouteResult | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const needsPickup = travel.meetingType === "pickup";

  const ready =
    Boolean(travel.destination) &&
    (!needsPickup || Boolean(travel.origin)) &&
    (!travel.returnRequired || Boolean(travel.returnLocation));

  const originLat = travel.origin?.lat;
  const originLng = travel.origin?.lng;
  const destinationLat = travel.destination?.lat;
  const destinationLng = travel.destination?.lng;
  const returnLat = travel.returnLocation?.lat;
  const returnLng = travel.returnLocation?.lng;

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function run() {
      setOutbound(null);
      setReturnRoute(null);
      setError("");
      onCalculated?.(null);

      if (!ready || !travel.destination) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const outboundResult =
          needsPickup && travel.origin
            ? await calculateRoute(
                travel.origin,
                travel.destination,
                controller.signal,
              )
            : null;

        const returnResult =
          travel.returnRequired && travel.returnLocation
            ? await calculateRoute(
                travel.destination,
                travel.returnLocation,
                controller.signal,
              )
            : null;

        if (!active) return;

        setOutbound(outboundResult);
        setReturnRoute(returnResult);

        onCalculated?.({
          outboundDistanceKm: outboundResult?.distanceKm ?? 0,
          returnDistanceKm: returnResult?.distanceKm ?? 0,
        });
      } catch (err) {
        if (!active) return;

        setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
      } finally {
        if (active) setLoading(false);
      }
    }

    run();

    return () => {
      active = false;
      controller.abort();
    };

    // คำนวณใหม่เฉพาะเมื่อพิกัดหรือรูปแบบเปลี่ยน
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    needsPickup,
    travel.returnRequired,
    originLat,
    originLng,
    destinationLat,
    destinationLng,
    returnLat,
    returnLng,
  ]);

  return (
    <section className="space-y-4 rounded-2xl shadow-sm bg-white p-5">
      <h2 className="text-xl font-bold text-slate-900">สรุประยะทาง</h2>

      {!ready && (
        <p className="text-sm text-slate-500">
          กรุณาเลือกสถานที่ให้ครบก่อนคำนวณ
        </p>
      )}

      {loading && <p className="text-sm text-sky-700">กำลังคำนวณระยะทาง...</p>}

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      {!loading && !error && ready && (
        <div className="space-y-3">
          {needsPickup && outbound && (
            <div className="flex justify-between gap-4">
              <span>จุดรับ → สถานที่ทำธุระ</span>
              <strong>{outbound.distanceKm.toFixed(2)} กม.</strong>
            </div>
          )}

          {!needsPickup && (
            <p className="text-sm text-slate-600">
              พบกันที่จุดหมาย ไม่มีระยะทางขาไป
            </p>
          )}

          {travel.returnRequired && returnRoute && (
            <div className="flex justify-between gap-4">
              <span>สถานที่ทำธุระ → จุดส่งกลับ</span>
              <strong>{returnRoute.distanceKm.toFixed(2)} กม.</strong>
            </div>
          )}

          {(outbound || returnRoute || !needsPickup) && (
            <div className="flex justify-between border-t pt-3">
              <span className="font-semibold">ระยะทางรวม</span>
              <strong className="text-sky-700">
                {(
                  (outbound?.distanceKm ?? 0) + (returnRoute?.distanceKm ?? 0)
                ).toFixed(2)}{" "}
                กม.
              </strong>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
