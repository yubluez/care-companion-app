import { NextRequest, NextResponse } from "next/server";

type Coordinates = {
  lat: number;
  lng: number;
};

function isValidLocation(value: unknown): value is Coordinates {
  if (!value || typeof value !== "object") {
    return false;
  }

  const location = value as Record<string, unknown>;

  return (
    typeof location.lat === "number" &&
    typeof location.lng === "number" &&
    Number.isFinite(location.lat) &&
    Number.isFinite(location.lng) &&
    location.lat >= -90 &&
    location.lat <= 90 &&
    location.lng >= -180 &&
    location.lng <= 180
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { origin, destination } = body;

    if (!isValidLocation(origin) || !isValidLocation(destination)) {
      return NextResponse.json(
        { error: "ข้อมูลพิกัดไม่ถูกต้อง" },
        { status: 400 },
      );
    }

    // OSRM ใช้ลำดับ Longitude, Latitude
    const coordinates = [
      `${origin.lng},${origin.lat}`,
      `${destination.lng},${destination.lat}`,
    ].join(";");

    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${coordinates}?overview=false`;

    const response = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`Routing service returned ${response.status}`);
    }

    const data = await response.json();

    if (
      data.code !== "Ok" ||
      !Array.isArray(data.routes) ||
      data.routes.length === 0
    ) {
      return NextResponse.json(
        { error: "ไม่พบเส้นทางระหว่างสถานที่" },
        { status: 422 },
      );
    }

    const route = data.routes[0];

    return NextResponse.json({
      distanceKm: Math.round((route.distance / 1000) * 100) / 100,
      durationMinutes: Math.ceil(route.duration / 60),
    });
  } catch (error) {
    console.error("Route calculation error:", error);

    return NextResponse.json(
      { error: "ไม่สามารถคำนวณเส้นทางได้ในขณะนี้" },
      { status: 503 },
    );
  }
}
