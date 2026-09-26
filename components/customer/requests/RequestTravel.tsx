"use client";

import TravelSection from "./travel/TravelSection";
import type { TravelData } from "./travel/types";

type Props = {
  travel: TravelData;
  onTravelChange: (value: TravelData) => void;
  supportedTransport: boolean;
};

export default function RequestTravel({
  travel,
  onTravelChange,
  supportedTransport,
}: Props) {
  return (
    <section className="space-y-5 border-b border-slate-100 p-6 sm:p-8">
      <TravelSection value={travel} onChange={onTravelChange} />

      {!supportedTransport && (
        <p
          role="alert"
          className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800"
        >
          ยังไม่มีระบบคำนวณเส้นทางขนส่งสาธารณะ
          กรุณาเลือกวิธีเดินทางอื่นสำหรับการทดลองส่งคำขอ
        </p>
      )}
    </section>
  );
}
