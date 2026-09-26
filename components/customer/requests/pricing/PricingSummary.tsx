"use client";

import { calculateServicePrice } from "@/lib/pricing/servicePricing";
import type { RouteDistances } from "../travel/RouteSummary";

type Props = {
  durationMinutes: number;
  distances: RouteDistances | null;
  calculating?: boolean;
};

const formatMoney = (amount: number) =>
  amount.toLocaleString("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function PricingSummary({
  durationMinutes,
  distances,
  calculating = false,
}: Props) {
  const price =
    distances && durationMinutes > 0
      ? calculateServicePrice({
          durationMinutes,
          outboundDistanceKm: distances.outboundDistanceKm,
          returnDistanceKm: distances.returnDistanceKm,
        })
      : null;

  return (
    <section className="space-y-4 rounded-2xl shadow-sm bg-white p-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900">สรุปค่าบริการ</h2>
        <p className="mt-2 text-sm text-slate-500">
          ค่าบริการ Companion ตามระยะเวลาและระยะทาง
        </p>
      </div>

      {calculating ? (
        <p className="text-sm text-sky-700">กำลังคำนวณค่าบริการ...</p>
      ) : !price ? (
        <p className="text-sm text-slate-500">
          กรุณาเลือกสถานที่ให้ครบและรอผลการคำนวณระยะทาง
        </p>
      ) : (
        <div className="space-y-3">
          <div className="flex justify-between gap-4 text-sm">
            <span>ค่าบริการเริ่มต้น</span>
            <span>{formatMoney(price.baseFee)} บาท</span>
          </div>

          <div className="flex justify-between gap-4 text-sm">
            <span>ค่าบริการตามเวลา ({durationMinutes / 60} ชม.)</span>
            <span>{formatMoney(price.durationFee)} บาท</span>
          </div>

          <div className="flex justify-between gap-4 text-sm">
            <span>ค่าเดินทาง ({price.totalDistanceKm.toFixed(2)} กม.)</span>
            <span>{formatMoney(price.distanceFee)} บาท</span>
          </div>

          <div className="flex items-center justify-between gap-4 border-t pt-4">
            <span className="font-bold text-slate-900">รวมค่าบริการ</span>
            <span className="text-2xl font-bold text-green-800">
              {formatMoney(price.totalFee)} บาท
            </span>
          </div>

          <div className="rounded-xl bg-green-50 p-4 text-sm text-green-900">
            ชำระเงินสดให้ Companion หลังเสร็จสิ้นการให้บริการ
          </div>
        </div>
      )}
    </section>
  );
}
