"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type AvailabilityInput = {
  day_of_week: number;
  start_time: string;
  end_time: string;
};

type Result = {
  success: boolean;
  error?: string;
};

export async function updateCompanionServiceAreas(
  areaIds: string[],
): Promise<Result> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "กรุณาเข้าสู่ระบบใหม่" };
    }

    if (areaIds.length === 0) {
      return {
        success: false,
        error: "กรุณาเลือกพื้นที่ให้บริการอย่างน้อย 1 พื้นที่",
      };
    }

    // ลบพื้นที่ให้บริการเดิมทั้งหมดของ companion
    const { error: deleteError } = await supabase
      .from("companion_service_areas")
      .delete()
      .eq("companion_id", user.id);

    if (deleteError) {
      console.error("Delete companion service areas error:", deleteError);
      return { success: false, error: "ไม่สามารถลบข้อมูลพื้นที่เดิมได้" };
    }

    // บันทึกพื้นที่ให้บริการใหม่
    const rows = areaIds.map((areaId) => ({
      companion_id: user.id,
      area_id: areaId,
    }));

    const { error: insertError } = await supabase
      .from("companion_service_areas")
      .insert(rows);

    if (insertError) {
      console.error("Insert companion service areas error:", insertError);
      return { success: false, error: "ไม่สามารถบันทึกพื้นที่ให้บริการใหม่ได้" };
    }

    revalidatePath("/companion/profile");
    revalidatePath("/companion");
    revalidatePath("/customer/compsearch");

    return { success: true };
  } catch (err) {
    console.error("Update companion service areas error:", err);
    return {
      success: false,
      error: "เกิดข้อผิดพลาดในการบันทึกพื้นที่ให้บริการ",
    };
  }
}

export async function updateCompanionAvailability(
  items: AvailabilityInput[],
): Promise<Result> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "กรุณาเข้าสู่ระบบใหม่" };
    }

    // ตรวจสอบความถูกต้องของเวลา
    for (const item of items) {
      if (!item.start_time || !item.end_time) {
        return {
          success: false,
          error: "กรุณาระบุเวลาเริ่มต้นและเวลาสิ้นสุดให้ครบถ้วน",
        };
      }
      if (item.start_time >= item.end_time) {
        return {
          success: false,
          error: "เวลาเริ่มต้นต้องน้อยกว่าเวลาสิ้นสุด",
        };
      }
    }

    // ลบวันเวลาเดิมทั้งหมดของ companion
    const { error: deleteError } = await supabase
      .from("companion_availability")
      .delete()
      .eq("companion_id", user.id);

    if (deleteError) {
      console.error("Delete companion availability error:", deleteError);
      return { success: false, error: "ไม่สามารถลบข้อมูลวันเวลาเดิมได้" };
    }

    // บันทึกวันเวลาใหม่
    if (items.length > 0) {
      const rows = items.map((item) => ({
        companion_id: user.id,
        day_of_week: item.day_of_week,
        start_time: item.start_time,
        end_time: item.end_time,
      }));

      const { error: insertError } = await supabase
        .from("companion_availability")
        .insert(rows);

      if (insertError) {
        console.error("Insert companion availability error:", insertError);
        return { success: false, error: "ไม่สามารถบันทึกวันและเวลาใหม่ได้" };
      }
    }

    revalidatePath("/companion/profile");
    revalidatePath("/companion");
    revalidatePath("/customer/compsearch");

    return { success: true };
  } catch (err) {
    console.error("Update companion availability error:", err);
    return {
      success: false,
      error: "เกิดข้อผิดพลาดในการบันทึกวันและเวลา",
    };
  }
}
