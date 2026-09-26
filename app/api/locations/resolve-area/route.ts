import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Area = {
  id: string;
  province: string;
  district: string;
};

type Address = Record<string, string | undefined>;

function normalize(value: string) {
  return value
    .toLocaleLowerCase()
    .replace(/จังหวัด|จ\.|เขต|อำเภอ|อ\.|แขวง|ตำบล|เทศบาล|มหานคร/g, "")
    .replace(/[\s.,\-_/()]/g, "")
    .trim();
}

function provinceMatches(a: string, b: string) {
  const aliases = [
    ["กรุงเทพ", "กรุงเทพมหานคร", "bangkok", "krungthepmahanakhon"],
  ];

  const x = normalize(a);
  const y = normalize(b);

  if (x === y) return true;

  return aliases.some(
    (group) =>
      group.some((v) => normalize(v) === x) &&
      group.some((v) => normalize(v) === y),
  );
}

function matchesAny(value: string, candidates: string[]) {
  return candidates.some(
    (candidate) => normalize(value) === normalize(candidate),
  );
}

export async function GET(request: NextRequest) {
  const lat = Number(request.nextUrl.searchParams.get("lat"));
  const lng = Number(request.nextUrl.searchParams.get("lng"));

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    return NextResponse.json({ error: "พิกัดไม่ถูกต้อง" }, { status: 400 });
  }

  try {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");

    url.searchParams.set("lat", String(lat));
    url.searchParams.set("lon", String(lng));
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("zoom", "16");
    url.searchParams.set("accept-language", "th");

    const response = await fetch(url, {
      headers: {
        "User-Agent": "CareCompanionStudentProject/1.0",
        "Accept-Language": "th",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error("Reverse geocoding unavailable");
    }

    const result: { address?: Address } = await response.json();
    const address = result.address ?? {};

    const provinceCandidates = [
      address.province,
      address.state,
      address.city,
    ].filter((v): v is string => Boolean(v));

    const districtCandidates = [
      address.city_district,
      address.district,
      address.borough,
      address.county,
      address.municipality,
      address.town,
      address.suburb,
    ].filter((v): v is string => Boolean(v));

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("areas")
      .select("id,province,district");

    if (error) {
      console.error("Resolve area database error:", error);

      return NextResponse.json(
        { error: "ไม่สามารถอ่านข้อมูลพื้นที่ได้" },
        { status: 500 },
      );
    }

    const areas = (data ?? []) as Area[];

    const matchingArea = areas.find(
      (area) =>
        provinceCandidates.some((province) =>
          provinceMatches(area.province, province),
        ) && matchesAny(area.district, districtCandidates),
    );

    return NextResponse.json({
      areaId: matchingArea?.id ?? null,
      province: provinceCandidates[0] ?? "",
      district: districtCandidates[0] ?? "",
      matched: Boolean(matchingArea),
    });
  } catch (error) {
    console.error("Resolve area error:", error);

    return NextResponse.json(
      { error: "ไม่สามารถระบุพื้นที่จากพิกัดได้" },
      { status: 502 },
    );
  }
}
