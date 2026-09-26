import "server-only";

import { createClient } from "@/lib/supabase/server";
import type {
  ServiceRequest,
  RequestStatus,
} from "@/components/customer/requests/types";

const allowedStatuses: RequestStatus[] = [
  "pending",
  "accepted",
  "in_progress",
  "completed",
  "cancelled",
  "rejected",
  "expired",
];

function formatDate(date: string): string {
  if (!date) return "-";

  const [year, month, day] = date.split("-").map(Number);

  if (!year || !month || !day) return date;

  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;

  if (remaining === 0) {
    return `${hours} ชั่วโมง`;
  }

  if (hours === 0) {
    return `${remaining} นาที`;
  }

  return `${hours} ชั่วโมง ${remaining} นาที`;
}

export async function getCustomerRequests(): Promise<ServiceRequest[]> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("กรุณาเข้าสู่ระบบ");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || profile?.role !== "customer") {
    throw new Error("ไม่มีสิทธิ์ดูข้อมูลคำขอ");
  }

  const { data: requests, error } = await supabase
    .from("service_requests")
    .select(
      `
      id,
      companion_id,
      category_id,
      service_date,
      start_time,
      duration_minutes,
      origin_name,
      destination_name,
      return_name,
      meeting_type,
      transport_type,
      outbound_distance_km,
      return_distance_km,
      offered_fee,
      note,
      meeting_detail,
      status,
      created_at
    `,
    )
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Load customer requests:", error);
    throw new Error("ไม่สามารถโหลดรายการคำขอได้");
  }

  if (!requests?.length) return [];

  const companionIds = [...new Set(requests.map((r) => r.companion_id))].filter(
    (id): id is string => Boolean(id),
  );

  const categoryIds = [...new Set(requests.map((r) => r.category_id))].filter(
    (id): id is string => Boolean(id),
  );

  const [profilesResult, categoriesResult] = await Promise.all([
    companionIds.length
      ? supabase.from("profiles").select("id,full_name").in("id", companionIds)
      : Promise.resolve({ data: [], error: null }),

    categoryIds.length
      ? supabase
          .from("service_categories")
          .select("id,name")
          .in("id", categoryIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (profilesResult.error || categoriesResult.error) {
    console.error(
      "Load request related data:",
      profilesResult.error,
      categoriesResult.error,
    );
    throw new Error("ไม่สามารถโหลดข้อมูลประกอบคำขอได้");
  }

  const companionNames = new Map(
    (profilesResult.data ?? []).map((p) => [p.id, p.full_name]),
  );

  const categoryNames = new Map(
    (categoriesResult.data ?? []).map((c) => [c.id, c.name]),
  );

  return requests.map((request) => {
    const status = allowedStatuses.includes(request.status as RequestStatus)
      ? (request.status as RequestStatus)
      : "expired";

    return {
      id: request.id,
      category: categoryNames.get(request.category_id) ?? "ไม่พบประเภทบริการ",

      date: formatDate(request.service_date),
      time: request.start_time?.slice(0, 5) ?? "-",
      duration: formatDuration(request.duration_minutes ?? 0),

      origin:
        request.meeting_type === "destination"
          ? request.destination_name
          : (request.origin_name ?? "ไม่ระบุจุดรับ"),

      destination: request.destination_name,
      companionName:
        companionNames.get(request.companion_id) ?? "ไม่พบข้อมูล Companion",

      status,
      returnLocation: request.return_name,
      meetingType: request.meeting_type,
      transportType: request.transport_type,
      outboundDistanceKm: Number(request.outbound_distance_km) || 0,
      returnDistanceKm: Number(request.return_distance_km) || 0,
      offeredFee:
        request.offered_fee == null ? null : Number(request.offered_fee),
      note: request.note,
      meetingDetail: request.meeting_detail,
    };
  });
}
