"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type CustomerReview = {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string | null;
};

export async function getMyReview(
  requestId: string,
): Promise<CustomerReview | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("กรุณาเข้าสู่ระบบ");
  }

  const { data, error } = await supabase
    .from("reviews")
    .select("id,rating,comment,created_at")
    .eq("request_id", requestId)
    .eq("customer_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Get review error:", error);
    throw new Error("ไม่สามารถโหลดรีวิวได้");
  }

  return data;
}

export async function submitReview(
  requestId: string,
  rating: number,
  comment: string,
): Promise<CustomerReview> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("กรุณาเข้าสู่ระบบ");
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error("กรุณาเลือกคะแนน 1–5 ดาว");
  }

  const trimmedComment = comment.trim();

  if (trimmedComment.length > 500) {
    throw new Error("ความคิดเห็นต้องไม่เกิน 500 ตัวอักษร");
  }

  // ตรวจสอบว่าเป็นคำขอของ Customer คนนี้
  // และงานต้องเสร็จสิ้นแล้วเท่านั้น
  const { data: request, error: requestError } = await supabase
    .from("service_requests")
    .select("id,customer_id,companion_id,status")
    .eq("id", requestId)
    .eq("customer_id", user.id)
    .single();

  if (requestError || !request) {
    throw new Error("ไม่พบคำขอหรือคุณไม่มีสิทธิ์รีวิว");
  }

  if (request.status !== "completed") {
    throw new Error("สามารถรีวิวได้เฉพาะงานที่เสร็จสิ้นแล้ว");
  }

  if (!request.companion_id) {
    throw new Error("ไม่พบข้อมูล Companion");
  }

  // ตรวจสอบรีวิวเดิมเพื่อแสดงข้อความที่เข้าใจง่าย
  const existing = await getMyReview(requestId);

  if (existing) {
    throw new Error("คุณรีวิวคำขอนี้ไปแล้ว");
  }

  const { data, error } = await supabase
    .from("reviews")
    .insert({
      request_id: request.id,
      customer_id: user.id,
      companion_id: request.companion_id,
      rating,
      comment: trimmedComment || null,
    })
    .select("id,rating,comment,created_at")
    .single();

  if (error) {
    console.error("Submit review error:", error);

    if (error.code === "23505") {
      throw new Error("คำขอนี้ได้รับการรีวิวแล้ว");
    }

    throw new Error("ไม่สามารถบันทึกรีวิวได้ กรุณาลองใหม่");
  }

  revalidatePath("/customer/requests");
  revalidatePath("/customer/compsearch");

  return data;
}
