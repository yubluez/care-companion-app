"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { calculateServicePrice } from "@/lib/pricing/servicePricing";

type Place = { name: string; lat: number; lng: number };
type Input = {
  companionId: string;
  categoryId: string;
  serviceDate: string;
  startTime: string;
  durationMinutes: number;
  meetingType: "pickup" | "destination";
  transportType: "taxi" | "private_car" | "public_transport" | "other";
  returnRequired: boolean;
  originAreaId: string | null;
  destinationAreaId: string | null;
  origin: Place | null;
  destination: Place;
  returnLocation: Place | null;
  meetingDetail: string;
  note: string;
};

function validPlace(place: Place | null): place is Place {
  return (
    !!place &&
    typeof place.name === "string" &&
    place.name.trim().length > 0 &&
    place.name.length <= 500 &&
    Number.isFinite(place.lat) &&
    Number.isFinite(place.lng) &&
    place.lat >= -90 &&
    place.lat <= 90 &&
    place.lng >= -180 &&
    place.lng <= 180
  );
}

async function roadDistance(
  origin: Place,
  destination: Place,
): Promise<number> {
  // Public OSRM demo: suitable only for a low-volume student prototype.
  const coords = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
  const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=false`;
  const response = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) throw new Error("Routing unavailable");
  const result: { code?: string; routes?: Array<{ distance: number }> } =
    await response.json();
  const metres = result.routes?.[0]?.distance;
  if (
    result.code !== "Ok" ||
    typeof metres !== "number" ||
    !Number.isFinite(metres) ||
    metres < 0
  ) {
    throw new Error("No route");
  }
  return Math.round((metres / 1000) * 100) / 100;
}

export async function createServiceRequest(input: Input) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user)
      return { success: false, error: "กรุณาเข้าสู่ระบบ" };

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile?.role !== "customer")
      return {
        success: false,
        error: "เฉพาะ Customer เท่านั้นที่สร้างคำขอได้",
      };

    if (
      !input.companionId ||
      !input.categoryId ||
      !/^\d{4}-\d{2}-\d{2}$/.test(input.serviceDate) ||
      !/^\d{2}:\d{2}$/.test(input.startTime) ||
      ![60, 120, 180, 240, 300, 360, 480].includes(input.durationMinutes) ||
      !["pickup", "destination"].includes(input.meetingType) ||
      !["taxi", "private_car", "public_transport", "other"].includes(
        input.transportType,
      ) ||
      !validPlace(input.destination) ||
      (input.meetingType === "pickup" &&
        (!validPlace(input.origin) || !input.originAreaId)) ||
      (input.returnRequired && !validPlace(input.returnLocation)) ||
      input.note.length > 500 ||
      input.meetingDetail.length > 500
    ) {
      return {
        success: false,
        error: "กรุณาตรวจสอบข้อมูลคำขอและสถานที่ให้ครบถ้วน",
      };
    }
    // This prototype uses driving routes only. Do not quote a road-based fee for public transit.
    if (
      (input.meetingType === "pickup" || input.returnRequired) &&
      input.transportType === "public_transport"
    ) {
      return {
        success: false,
        error:
          "ยังไม่รองรับการคำนวณราคาสำหรับขนส่งสาธารณะ กรุณาเลือกวิธีอื่นก่อน",
      };
    }
    if (input.meetingType === "destination" && !input.destinationAreaId) {
      return { success: false, error: "กรุณาเลือกพื้นที่ของสถานที่ทำธุระ" };
    }
    const { data: companion } = await supabase
      .from("companion_profiles")
      .select("user_id,verification_status")
      .eq("user_id", input.companionId)
      .maybeSingle();
    if (!companion || companion.verification_status !== "approved") {
      return { success: false, error: "Companion นี้ยังไม่พร้อมรับคำขอ" };
    }
    const { data: category } = await supabase
      .from("service_categories")
      .select("id")
      .eq("id", input.categoryId)
      .eq("is_active", true)
      .maybeSingle();
    if (!category) return { success: false, error: "ประเภทบริการไม่ถูกต้อง" };

    const outbound =
      input.meetingType === "pickup"
        ? await roadDistance(input.origin!, input.destination)
        : 0;
    const back = input.returnRequired
      ? await roadDistance(input.destination, input.returnLocation!)
      : 0;
    const price = calculateServicePrice({
      durationMinutes: input.durationMinutes,
      outboundDistanceKm: outbound,
      returnDistanceKm: back,
    });
    const { data, error } = await supabase
      .from("service_requests")
      .insert({
        customer_id: user.id,
        companion_id: input.companionId,
        category_id: input.categoryId,
        service_date: input.serviceDate,
        start_time: input.startTime,
        duration_minutes: input.durationMinutes,
        meeting_type: input.meetingType,
        transport_type: input.transportType,
        return_required: input.returnRequired,
        origin_area_id:
          input.meetingType === "pickup" ? input.originAreaId : null,
        origin_name:
          input.meetingType === "pickup" ? input.origin!.name.trim() : null,
        origin_lat: input.meetingType === "pickup" ? input.origin!.lat : null,
        origin_lng: input.meetingType === "pickup" ? input.origin!.lng : null,
        destination_area_id: input.destinationAreaId,
        destination_name: input.destination.name.trim(),
        destination_lat: input.destination.lat,
        destination_lng: input.destination.lng,
        return_name: input.returnRequired
          ? input.returnLocation!.name.trim()
          : null,
        return_lat: input.returnRequired ? input.returnLocation!.lat : null,
        return_lng: input.returnRequired ? input.returnLocation!.lng : null,
        meeting_detail: input.meetingDetail.trim() || null,
        outbound_distance_km: outbound,
        return_distance_km: back,
        base_fee: price.baseFee,
        duration_fee: price.durationFee,
        distance_fee: price.distanceFee,
        offered_fee: price.totalFee,
        note: input.note.trim() || null,
        status: "pending",
      })
      .select("id")
      .single();
    if (error) {
      console.error("Create service request error:", error);
      return {
        success: false,
        error: "บันทึกคำขอไม่สำเร็จ กรุณาตรวจสอบสิทธิ์หรือฐานข้อมูล",
      };
    }
    for (const path of [
      "/customer",
      "/customer/requests",
      "/companion",
      "/companion/requests",
      "/admin",
      "/admin/requests",
    ]) {
      revalidatePath(path);
    }
    return { success: true, requestId: data.id, totalFee: price.totalFee };
  } catch (error) {
    console.error("Create service request unexpected error:", error);
    return {
      success: false,
      error: "คำนวณเส้นทางหรือบันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่",
    };
  }
}
