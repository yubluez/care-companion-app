"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type AdminActionResult = {
  success: boolean;
  error?: string;
  data?: any;
};

export type AvailableCompanion = {
  id: string;
  fullName: string | null;
  avatarUrl: string | null;
  phone: string | null;
  ratingAvg: number;
  ratingCount: number;
  bio: string | null;
  experience: string | null;
  serviceAreas: { province: string; district: string }[];
  isTimeAvailable: boolean;
  isAreaMatch: boolean;
  hasConflict: boolean;
};

/**
 * Check if the currently logged-in user is an Admin
 */
async function verifyAdmin() {
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

  if (profileError || profile?.role !== "admin") {
    throw new Error("คุณไม่มีสิทธิ์ผู้ดูแลระบบ (Admin access required)");
  }

  return { supabase, adminUser: user };
}

/**
 * 1. Cancel request by Admin (e.g. Companion accepted but is unreachable)
 */
export async function cancelRequestByAdmin({
  requestId,
  reason = "ติดต่อผู้ดูแลไม่ได้ (ยกเลิกโดยแอดมิน)",
}: {
  requestId: string;
  reason?: string;
}): Promise<AdminActionResult> {
  try {
    const { supabase } = await verifyAdmin();

    // Fetch existing request
    const { data: existing, error: fetchError } = await supabase
      .from("service_requests")
      .select("id, status, note")
      .eq("id", requestId)
      .maybeSingle();

    if (fetchError || !existing) {
      return {
        success: false,
        error: "ไม่พบคำขอใช้บริการ",
      };
    }

    if (existing.status === "completed") {
      return {
        success: false,
        error: "ไม่สามารถยกเลิกคำขอที่เสร็จสิ้นไปแล้วได้",
      };
    }

    const cancelLog = `[แอดมินยกเลิกงาน: ${reason.trim() || "ไม่ระบุเหตุผล"}]`;
    const updatedNote = existing.note
      ? `${existing.note}\n${cancelLog}`
      : cancelLog;

    const { error: updateError } = await supabase
      .from("service_requests")
      .update({
        status: "cancelled",
        note: updatedNote,
      })
      .eq("id", requestId);

    if (updateError) {
      console.error("Cancel request by admin error:", updateError);
      return {
        success: false,
        error: "ไม่สามารถยกเลิกคำขอได้: " + updateError.message,
      };
    }

    // Revalidate relevant pages
    revalidatePath("/admin");
    revalidatePath("/admin/requests");
    revalidatePath(`/admin/requests/${requestId}`);
    revalidatePath("/customer");
    revalidatePath("/customer/requests");
    revalidatePath("/companion");
    revalidatePath("/companion/requests");
    revalidatePath("/companion/jobs");

    return { success: true };
  } catch (error: any) {
    console.error("cancelRequestByAdmin unexpected error:", error);
    return {
      success: false,
      error: error.message || "เกิดข้อผิดพลาดในการยกเลิกคำขอ",
    };
  }
}

/**
 * 2. Reassign request by Admin (Express Re-booking / จองด่วนเลือก Companion ใหม่ให้ลูกค้า)
 * Updates the existing request with the new companion.
 * Keeps all customer job details identical, only updates companion_id and status.
 */
export async function reassignRequestByAdmin({
  requestId,
  newCompanionId,
  targetStatus = "pending",
}: {
  requestId: string;
  newCompanionId: string;
  targetStatus?: "pending" | "accepted";
}): Promise<AdminActionResult> {
  try {
    const { supabase } = await verifyAdmin();

    // Check target companion is approved
    const { data: companionProfile, error: compError } = await supabase
      .from("companion_profiles")
      .select("user_id, verification_status")
      .eq("user_id", newCompanionId)
      .maybeSingle();

    if (compError || !companionProfile) {
      return {
        success: false,
        error: "ไม่พบข้อมูล Companion ที่เลือก",
      };
    }

    if (companionProfile.verification_status !== "approved") {
      return {
        success: false,
        error: "Companion ท่านนี้ยังไม่ได้รับการอนุมัติให้รับงาน",
      };
    }

    // Fetch existing request
    const { data: request, error: reqError } = await supabase
      .from("service_requests")
      .select("id, companion_id, note")
      .eq("id", requestId)
      .maybeSingle();

    if (reqError || !request) {
      return {
        success: false,
        error: "ไม่พบคำขอใช้บริการ",
      };
    }

    const reassignLog = `[แอดมินจองด่วนเปลี่ยนผู้ดูแลเป็นคนใหม่]`;
    const updatedNote = request.note
      ? `${request.note}\n${reassignLog}`
      : reassignLog;

    const { error: updateError } = await supabase
      .from("service_requests")
      .update({
        companion_id: newCompanionId,
        status: targetStatus,
        started_at: null,
        completed_at: null,
        note: updatedNote,
      })
      .eq("id", requestId);

    if (updateError) {
      console.error("Reassign request error:", updateError);
      return {
        success: false,
        error: "ไม่สามารถมอบหมายงานให้ Companion คนใหม่ได้: " + updateError.message,
      };
    }

    // Revalidate all pages
    revalidatePath("/admin");
    revalidatePath("/admin/requests");
    revalidatePath(`/admin/requests/${requestId}`);
    revalidatePath("/customer");
    revalidatePath("/customer/requests");
    revalidatePath("/companion");
    revalidatePath("/companion/requests");
    revalidatePath("/companion/jobs");

    return { success: true };
  } catch (error: any) {
    console.error("reassignRequestByAdmin unexpected error:", error);
    return {
      success: false,
      error: error.message || "เกิดข้อผิดพลาดในการมอบหมายงาน",
    };
  }
}

/**
 * 3. Query available companions matching the request's date, time, and areas
 */
export async function getAvailableCompanionsForRequest(
  requestId: string,
): Promise<{ success: boolean; data?: AvailableCompanion[]; error?: string }> {
  try {
    const { supabase } = await verifyAdmin();

    // 1. Fetch Request Details
    const { data: request, error: reqError } = await supabase
      .from("service_requests")
      .select(`
        id,
        service_date,
        start_time,
        duration_minutes,
        origin_area_id,
        destination_area_id,
        companion_id
      `)
      .eq("id", requestId)
      .maybeSingle();

    if (reqError || !request) {
      return { success: false, error: "ไม่พบข้อมูลคำขอใช้บริการ" };
    }

    // Calculate day of week (1: Monday - 7: Sunday)
    const requestDate = new Date(request.service_date);
    const jsDay = requestDate.getDay(); // 0 is Sunday, 1 is Monday ...
    const dayOfWeek = jsDay === 0 ? 7 : jsDay;

    const requestStartTime = request.start_time ? request.start_time.slice(0, 5) : "00:00";

    // 2. Fetch approved companions
    const { data: approvedCompanions, error: compError } = await supabase
      .from("companion_profiles")
      .select("user_id, bio, experience, rating_avg, rating_count")
      .eq("verification_status", "approved");

    if (compError) {
      return { success: false, error: compError.message };
    }

    if (!approvedCompanions || approvedCompanions.length === 0) {
      return { success: true, data: [] };
    }

    const companionUserIds = approvedCompanions.map((c) => c.user_id);

    // 3. Fetch related profiles, availability, areas, and existing jobs in parallel
    const [profilesRes, areasRes, availRes, existingJobsRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, avatar_url, phone")
        .in("id", companionUserIds),

      supabase
        .from("companion_service_areas")
        .select("companion_id, area_id, area:areas(province, district)")
        .in("companion_id", companionUserIds),

      supabase
        .from("companion_availability")
        .select("companion_id, day_of_week, start_time, end_time")
        .in("companion_id", companionUserIds)
        .eq("day_of_week", dayOfWeek),

      supabase
        .from("service_requests")
        .select("id, companion_id, service_date, start_time, duration_minutes, status")
        .in("companion_id", companionUserIds)
        .eq("service_date", request.service_date)
        .in("status", ["accepted", "in_progress"]),
    ]);

    const profilesMap = new Map((profilesRes.data || []).map((p) => [p.id, p]));

    // Map areas
    const areasMap = new Map<string, { areaId: string; province: string; district: string }[]>();
    for (const row of areasRes.data || []) {
      const areaObj = Array.isArray(row.area) ? row.area[0] : row.area;
      const list = areasMap.get(row.companion_id) || [];
      if (areaObj) {
        list.push({
          areaId: row.area_id,
          province: areaObj.province,
          district: areaObj.district,
        });
      }
      areasMap.set(row.companion_id, list);
    }

    // Map availability
    const availMap = new Map<string, { startTime: string; endTime: string }[]>();
    for (const row of availRes.data || []) {
      const list = availMap.get(row.companion_id) || [];
      list.push({
        startTime: row.start_time.slice(0, 5),
        endTime: row.end_time.slice(0, 5),
      });
      availMap.set(row.companion_id, list);
    }

    // Map conflicts
    const conflictsMap = new Map<string, boolean>();
    for (const job of existingJobsRes.data || []) {
      if (job.companion_id && job.id !== requestId) {
        conflictsMap.set(job.companion_id, true);
      }
    }

    // 4. Construct list & compute match scores
    const targetAreaIds = [request.origin_area_id, request.destination_area_id].filter(Boolean);

    const availableCompanions: AvailableCompanion[] = approvedCompanions
      // Exclude current companion if already assigned
      .filter((comp) => comp.user_id !== request.companion_id)
      .map((comp) => {
        const profile = profilesMap.get(comp.user_id);
        const compAreas = areasMap.get(comp.user_id) || [];
        const compAvail = availMap.get(comp.user_id) || [];
        const hasConflict = conflictsMap.get(comp.user_id) || false;

        // Check time availability
        let isTimeAvailable = false;
        if (compAvail.length > 0) {
          isTimeAvailable = compAvail.some((slot) => {
            return slot.startTime <= requestStartTime;
          });
        }

        // Check area match
        let isAreaMatch = false;
        if (targetAreaIds.length > 0) {
          isAreaMatch = compAreas.some((a) => targetAreaIds.includes(a.areaId));
        }

        return {
          id: comp.user_id,
          fullName: profile?.full_name || null,
          avatarUrl: profile?.avatar_url || null,
          phone: profile?.phone || null,
          ratingAvg: Number(comp.rating_avg) || 0,
          ratingCount: Number(comp.rating_count) || 0,
          bio: comp.bio,
          experience: comp.experience,
          serviceAreas: compAreas.map((a) => ({ province: a.province, district: a.district })),
          isTimeAvailable,
          isAreaMatch,
          hasConflict,
        };
      });

    // Sort companions:
    // 1. Available time & area match & no conflict first
    // 2. Higher rating next
    availableCompanions.sort((a, b) => {
      const aScore = (a.isTimeAvailable ? 2 : 0) + (a.isAreaMatch ? 2 : 0) - (a.hasConflict ? 3 : 0);
      const bScore = (b.isTimeAvailable ? 2 : 0) + (b.isAreaMatch ? 2 : 0) - (b.hasConflict ? 3 : 0);

      if (aScore !== bScore) {
        return bScore - aScore;
      }
      return b.ratingAvg - a.ratingAvg;
    });

    return {
      success: true,
      data: availableCompanions,
    };
  } catch (error: any) {
    console.error("getAvailableCompanionsForRequest unexpected error:", error);
    return {
      success: false,
      error: error.message || "ไม่สามารถโหลดรายชื่อ Companion ที่พร้อมให้บริการได้",
    };
  }
}
