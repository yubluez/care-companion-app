"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type Result = {
  success: boolean;
  error?: string;
};

async function reviewCompanion(
  companionId: string,
  action: "approve" | "reject",
  rejectionReason?: string,
): Promise<Result> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "กรุณาเข้าสู่ระบบใหม่",
      };
    }

    const { error } = await supabase.rpc("admin_review_companion", {
      p_companion_id: companionId,
      p_action: action,
      p_rejection_reason:
        action === "reject" ? rejectionReason?.trim() || null : null,
    });

    if (error) {
      console.error("Review companion error:", error);

      return {
        success: false,
        error: translateError(error.message),
      };
    }

    revalidatePath("/admin");
    revalidatePath("/admin/companions");
    revalidatePath(`/admin/companions/${companionId}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Review companion unexpected error:", error);

    return {
      success: false,
      error: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
    };
  }
}

export async function approveCompanion(companionId: string) {
  return reviewCompanion(companionId, "approve");
}

export async function rejectCompanion(companionId: string, reason: string) {
  if (!reason.trim()) {
    return {
      success: false,
      error: "กรุณาระบุเหตุผลที่ปฏิเสธ",
    };
  }

  return reviewCompanion(companionId, "reject", reason);
}

function translateError(message: string) {
  if (message.includes("Admin access required")) {
    return "คุณไม่มีสิทธิ์ดำเนินการนี้";
  }

  if (message.includes("Companion application not found")) {
    return "ไม่พบใบสมัคร Companion";
  }

  if (message.includes("Application has already been reviewed")) {
    return "ใบสมัครนี้ได้รับการตรวจสอบไปแล้ว";
  }

  if (message.includes("Rejection reason is required")) {
    return "กรุณาระบุเหตุผลที่ปฏิเสธ";
  }

  return "ไม่สามารถตรวจสอบใบสมัครได้";
}
