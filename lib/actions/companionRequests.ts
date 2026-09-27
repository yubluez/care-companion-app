"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isRequestExpired } from "@/lib/requests/expiration";

type CompanionAction = "accept" | "reject" | "start" | "complete";

type ActionResult = {
  success: boolean;
  error?: string;
};

async function updateRequestStatus(
  requestId: string,
  action: CompanionAction,
): Promise<ActionResult> {
  try {
    const supabase = await createClient();

    // ตรวจ Authentication ฝั่ง Server
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "กรุณาเข้าสู่ระบบใหม่อีกครั้ง",
      };
    }

    if (action === "accept") {
      const { data: req } = await supabase
        .from("service_requests")
        .select("service_date, start_time, status")
        .eq("id", requestId)
        .maybeSingle();

      if (req && isRequestExpired(req.service_date, req.start_time)) {
        await supabase
          .from("service_requests")
          .update({ status: "expired" })
          .eq("id", requestId);

        revalidatePath("/companion");
        revalidatePath("/companion/requests");
        revalidatePath("/customer/requests");

        return {
          success: false,
          error: "คำขอนี้หมดอายุแล้ว เนื่องจากเลยเวลาเริ่มงานแล้ว",
        };
      }
    }

    // เรียก PostgreSQL Function
    const { error } = await supabase.rpc("companion_update_request_status", {
      p_request_id: requestId,
      p_action: action,
    });

    if (error) {
      console.error(`Companion ${action} request error:`, error);

      return {
        success: false,
        error: getErrorMessage(error.message),
      };
    }

    // Refresh หน้าที่เกี่ยวข้อง
    revalidatePath("/companion");
    revalidatePath("/companion/requests");
    revalidatePath(`/companion/requests/${requestId}`);
    revalidatePath("/companion/jobs");
    revalidatePath(`/companion/jobs/${requestId}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Companion request action error:", error);

    return {
      success: false,
      error: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
    };
  }
}

export async function acceptRequest(requestId: string) {
  return updateRequestStatus(requestId, "accept");
}

export async function rejectRequest(requestId: string) {
  return updateRequestStatus(requestId, "reject");
}

export async function startJob(requestId: string) {
  return updateRequestStatus(requestId, "start");
}

export async function completeJob(requestId: string) {
  return updateRequestStatus(requestId, "complete");
}

function getErrorMessage(message: string) {
  if (message.includes("Request is no longer pending")) {
    return "คำขอนี้ถูกเปลี่ยนสถานะไปแล้ว";
  }

  if (message.includes("Only accepted requests can be started")) {
    return "งานนี้ไม่อยู่ในสถานะที่สามารถเริ่มได้";
  }

  if (message.includes("Only in-progress requests can be completed")) {
    return "งานนี้ไม่อยู่ในสถานะที่สามารถจบงานได้";
  }

  if (message.includes("Companion is not approved")) {
    return "บัญชี Companion ยังไม่ได้รับการอนุมัติ";
  }

  if (message.includes("Request not found")) {
    return "ไม่พบคำขอนี้ หรือคำขอนี้ไม่ได้ถูกมอบหมายให้คุณ";
  }

  return "ไม่สามารถดำเนินการได้ กรุณาลองใหม่อีกครั้ง";
}
