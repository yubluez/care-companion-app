export const SERVICE_PRICING = {
  baseFee: 100,
  hourlyRate: 80,
  distanceRate: 8,
} as const;

export type PricingInput = {
  durationMinutes: number;
  outboundDistanceKm: number;
  returnDistanceKm: number;
};

export type PricingBreakdown = {
  baseFee: number;
  durationFee: number;
  distanceFee: number;
  totalDistanceKm: number;
  totalFee: number;
};

export function calculateServicePrice(input: PricingInput): PricingBreakdown {
  const { durationMinutes, outboundDistanceKm, returnDistanceKm } = input;

  if (
    !Number.isFinite(durationMinutes) ||
    !Number.isFinite(outboundDistanceKm) ||
    !Number.isFinite(returnDistanceKm) ||
    durationMinutes <= 0 ||
    outboundDistanceKm < 0 ||
    returnDistanceKm < 0
  ) {
    throw new Error("ข้อมูลสำหรับคำนวณราคาไม่ถูกต้อง");
  }

  const totalDistanceKm = outboundDistanceKm + returnDistanceKm;

  const baseFee = SERVICE_PRICING.baseFee;

  const durationFee = (durationMinutes / 60) * SERVICE_PRICING.hourlyRate;

  const distanceFee = totalDistanceKm * SERVICE_PRICING.distanceRate;

  const totalFee = baseFee + durationFee + distanceFee;

  return {
    baseFee,
    durationFee: Math.round(durationFee * 100) / 100,
    distanceFee: Math.round(distanceFee * 100) / 100,
    totalDistanceKm,
    totalFee: Math.round(totalFee * 100) / 100,
  };
}
