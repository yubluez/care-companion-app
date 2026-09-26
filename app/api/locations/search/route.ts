import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim();

  if (!query || query.length < 3 || query.length > 150) {
    return NextResponse.json(
      { error: "กรุณาระบุชื่อสถานที่อย่างน้อย 3 ตัวอักษร" },
      { status: 400 },
    );
  }

  try {
    const params = new URLSearchParams({
      q: query,
      format: "jsonv2",
      addressdetails: "1",
      limit: "5",
      countrycodes: "th",
      "accept-language": "th,en",
    });

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?${params}`,
      {
        headers: {
          "User-Agent": "CareCompanionStudentProject/1.0 (student project)",
          "Accept-Language": "th,en",
        },
        next: { revalidate: 86400 },
      },
    );

    if (!response.ok) {
      throw new Error(`Nominatim: ${response.status}`);
    }

    const results = await response.json();

    return NextResponse.json(
      results.map(
        (place: {
          place_id: number;
          display_name: string;
          lat: string;
          lon: string;
        }) => ({
          id: place.place_id,
          name: place.display_name,
          lat: Number(place.lat),
          lng: Number(place.lon),
        }),
      ),
    );
  } catch (error) {
    console.error("Location search error:", error);

    return NextResponse.json(
      { error: "ไม่สามารถค้นหาสถานที่ได้ในขณะนี้" },
      { status: 503 },
    );
  }
}
