"use client";

import RouteSummary, { type RouteDistances } from "./travel/RouteSummary";

import PricingSummary from "./pricing/PricingSummary";
import type { TravelData } from "./travel/types";

type Props = {
  travel: TravelData;
  durationMinutes: number;
  distances: RouteDistances | null;
  travelValid: boolean;
  supportedTransport: boolean;
  onCalculated: (distances: RouteDistances | null) => void;
};

export default function RequestPricing({
  travel,
  durationMinutes,
  distances,
  travelValid,
  supportedTransport,
  onCalculated,
}: Props) {
  return (
    <section className="space-y-5 border-b border-slate-100 bg-slate-50 p-6 sm:p-8">
      <RouteSummary travel={travel} onCalculated={onCalculated} />

      <PricingSummary
        durationMinutes={durationMinutes}
        distances={supportedTransport && travelValid ? distances : null}
        calculating={supportedTransport && travelValid && !distances}
      />
    </section>
  );
}
