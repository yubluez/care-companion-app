"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getRequestContact } from "@/lib/contact";
import { cancelCustomerRequest } from "@/lib/actions/customerRequests";
import ReviewForm from "@/components/customer/reviews/ReviewForm";
import Swal from "sweetalert2";
import {
  getMyReview,
  submitReview,
  type CustomerReview,
} from "@/lib/actions/reviews";

import type { ServiceRequest, RequestStatus } from "./types";

type Props = {
  request: ServiceRequest | null;
  onClose: () => void;
  onCancelled?: () => void | Promise<void>;
};

const statusConfig: Record<RequestStatus, { label: string; style: string }> = {
  pending: {
    label: "รอตอบรับ",
    style: "bg-amber-50 text-amber-700 border-amber-200",
  },
  accepted: {
    label: "ตอบรับแล้ว",
    style: "bg-sky-50 text-sky-700 border-sky-200",
  },
  in_progress: {
    label: "กำลังดำเนินการ",
    style: "bg-blue-50 text-blue-700 border-blue-200",
  },
  completed: {
    label: "เสร็จสิ้น",
    style: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  cancelled: {
    label: "ยกเลิก",
    style: "bg-slate-100 text-slate-600 border-slate-200",
  },

  rejected: {
    label: "ถูกปฏิเสธ",
    style: "bg-rose-50 text-rose-700 border-rose-200",
  },

  expired: {
    label: "หมดอายุ",
    style: "bg-slate-100 text-slate-600 border-slate-200",
  },
};

export default function RequestDetailModal({
  request,
  onClose,
  onCancelled,
}: Props) {
  const router = useRouter();

  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");

  const [review, setReview] = useState<CustomerReview | null>(null);

  const [loadingReview, setLoadingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);

  const requestId = request?.id;
  const isCompleted = request?.status === "completed";
  const canViewContact =
    request?.status === "accepted" || request?.status === "in_progress";
  const [contactPhone, setContactPhone] = useState<string | null>(null);
  const [contactError, setContactError] = useState("");
  const [loadingContact, setLoadingContact] = useState(false);

  useEffect(() => {
    let active = true;
    setContactPhone(null);
    setContactError("");
    setLoadingContact(Boolean(requestId && canViewContact));

    if (!requestId || !canViewContact) return;

    const supabase = createClient();
    getRequestContact(supabase, requestId)
      .then((phone) => {
        if (active) setContactPhone(phone);
      })
      .catch((error) => {
        if (active) {
          setContactError(
            error instanceof Error
              ? error.message
              : "ไม่สามารถโหลดเบอร์โทรศัพท์ได้",
          );
        }
      })
      .finally(() => {
        if (active) setLoadingContact(false);
      });

    return () => {
      active = false;
    };
  }, [requestId, canViewContact]);

  useEffect(() => {
    let active = true;

    setReview(null);
    setReviewError("");
    setShowReviewForm(false);
    setLoadingReview(Boolean(requestId && isCompleted));

    if (!requestId || !isCompleted) {
      return;
    }

    getMyReview(requestId)
      .then((data) => {
        if (active) setReview(data);
      })
      .catch((error) => {
        if (active) {
          setReviewError(
            error instanceof Error ? error.message : "ไม่สามารถโหลดรีวิวได้",
          );
        }
      })
      .finally(() => {
        if (active) setLoadingReview(false);
      });

    return () => {
      active = false;
    };
  }, [requestId, isCompleted]);

  async function handleSubmitReview(rating: number, comment: string) {
    if (!requestId) {
      throw new Error("ไม่พบคำขอ");
    }

    const savedReview = await submitReview(requestId, rating, comment);

    setReview(savedReview);
    setShowReviewForm(false);

    await Swal.fire({
      icon: "success",
      title: "ส่งรีวิวสำเร็จ",
      text: "ขอบคุณสำหรับความคิดเห็นของคุณ",
      confirmButtonColor: "#0284c7",
      confirmButtonText: "ตกลง",
    });
  }

  async function handleCancel() {
    if (!requestId || cancelling || !request) return;

    // อนุญาตเฉพาะคำขอที่ยังไม่เริ่มงาน
    if (request.status !== "pending" && request.status !== "accepted") {
      await Swal.fire({
        title: "ไม่สามารถยกเลิกได้",
        text: "คำขอนี้ไม่อยู่ในสถานะที่สามารถยกเลิกได้",
        icon: "info",
        confirmButtonColor: "#0284c7",
      });
      return;
    }

    const isAccepted = request.status === "accepted";

    const confirmation = await Swal.fire({
      title: isAccepted
        ? "ยืนยันการยกเลิกงานที่ตอบรับแล้ว?"
        : "ยืนยันการยกเลิกคำขอ?",

      text: isAccepted
        ? "Companion ตอบรับงานนี้แล้ว การยกเลิกอาจส่งผลต่อการเตรียมตัวของ Companion คุณต้องการดำเนินการต่อหรือไม่?"
        : "คุณต้องการยกเลิกคำขอนี้ใช่หรือไม่?",

      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ยืนยันการยกเลิก",
      cancelButtonText: "กลับ",
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#64748b",
      reverseButtons: true,
    });

    if (!confirmation.isConfirmed) return;

    setCancelling(true);

    try {
      const result = await cancelCustomerRequest(requestId);

      if (!result.success) {
        await Swal.fire({
          title: "ยกเลิกไม่สำเร็จ",
          text: result.error ?? "กรุณาลองใหม่อีกครั้ง",
          icon: "error",
          confirmButtonColor: "#0284c7",
        });

        router.refresh();
        return;
      }

      await Swal.fire({
        title: "ยกเลิกคำขอสำเร็จ",
        text: "ระบบได้เปลี่ยนสถานะคำขอเรียบร้อยแล้ว",
        icon: "success",
        confirmButtonColor: "#0284c7",
        confirmButtonText: "ตกลง",
      });

      onClose();
      router.refresh();
      await onCancelled?.();
    } catch {
      await Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถดำเนินการได้ กรุณาลองใหม่",
        icon: "error",
        confirmButtonColor: "#0284c7",
      });
    } finally {
      setCancelling(false);
    }
  }

  if (!request) return null;

  const status = statusConfig[request.status];
  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white flex items-start justify-between p-6 border-b border-slate-100">
          <div>
            <p className="text-sm text-slate-400">#{request.id}</p>

            <h2 className="text-2xl font-bold text-slate-900 mt-1">
              {request.category}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full text-slate-400
                        hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Status */}
        <div className="px-6 pt-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-500">สถานะคำขอ</p>

            <span
              className={`
                px-3 py-1.5
                border rounded-full
                text-sm font-semibold
                ${status.style}
              `}
            >
              {status.label}
            </span>
          </div>
        </div>

        {/* Detail */}
        <div className="p-6">
          <h3 className="font-bold text-slate-900 mb-4">
            รายละเอียดการใช้บริการ
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <p className="text-sm text-slate-400 mb-1">วันที่</p>

              <p className="font-semibold text-slate-700">📅 {request.date}</p>
            </div>

            <div>
              <p className="text-sm text-slate-400 mb-1">เวลาเริ่ม</p>

              <p className="font-semibold text-slate-700">
                🕘 {request.time} น.
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-400 mb-1">ระยะเวลา</p>

              <p className="font-semibold text-slate-700">
                ⏱ {request.duration}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-400 mb-1">Companion</p>

              <p className="font-semibold text-slate-700">
                👤 {request.companionName}
              </p>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="px-6 pb-6">
          <div className="border-t border-slate-100 pt-6">
            <h3 className="font-bold text-slate-900 mb-4">สถานที่</h3>

            <div className="relative pl-7">
              {/* line */}
              <div className="absolute left-[7px] top-3 bottom-3 w-[2px] bg-slate-200" />

              {/* Origin */}
              <div className="relative mb-6">
                <div className="absolute -left-7 top-1 w-4 h-4 bg-sky-500 border-4 border-sky-100 rounded-full" />

                <p className="text-xs text-slate-400">จุดนัดพบ / ต้นทาง</p>

                <p className="font-semibold text-slate-700 mt-1">
                  {request.origin}
                </p>
              </div>

              {/* Destination */}
              <div className="relative">
                <div className="absolute -left-7 top-1 w-4 h-4 bg-rose-500 border-4 border-rose-100 rounded-full" />

                <p className="text-xs text-slate-400">จุดหมายปลายทาง</p>

                <p className="font-semibold text-slate-700 mt-1">
                  {request.destination}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional details */}
        <div className="px-6 pb-6">
          <div className="border-t border-slate-100 pt-6">
            <h3 className="mb-4 font-bold text-slate-900">
              รายละเอียดเพิ่มเติม
            </h3>

            <div className="whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-slate-700">
              {request.note || "ไม่มีรายละเอียดเพิ่มเติม"}
            </div>

            {/* Meeting detail */}
            {request.meetingDetail && (
              <div className="mt-4 rounded-xl bg-slate-50 p-4">
                <p className="mb-2 text-sm text-slate-500">
                  รายละเอียดจุดนัดพบ
                </p>
                <p className="whitespace-pre-wrap text-slate-700">
                  {request.meetingDetail}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Companion contact */}
        {canViewContact && (
          <div className="px-6 pb-6">
            <div className="bg-sky-50 border border-sky-100 rounded-2xl p-5">
              <p className="text-sm text-slate-500">Companion ที่รับงาน</p>

              <p className="font-bold text-slate-900 mt-1">
                {request.companionName}
              </p>

              {loadingContact ? (
                <p className="mt-2 text-sm text-slate-500">
                  กำลังโหลดเบอร์โทรศัพท์...
                </p>
              ) : contactError ? (
                <p className="mt-2 text-sm text-rose-600">{contactError}</p>
              ) : contactPhone ? (
                <p className="mt-2 font-semibold text-sky-700">
                  เบอร์โทรศัพท์: {contactPhone}
                </p>
              ) : (
                <p className="mt-2 text-sm text-slate-500">ไม่มีเบอร์ติดต่อ</p>
              )}
            </div>
          </div>
        )}

        {/* Customer review */}
        {request.status === "completed" && (
          <div className="px-6 pb-6">
            <div className="border-t border-slate-100 pt-6">
              <h3 className="mb-4 font-bold text-slate-900">
                รีวิวการให้บริการ
              </h3>

              {loadingReview ? (
                <p className="text-sm text-slate-500">กำลังโหลดรีวิว...</p>
              ) : reviewError ? (
                <div className="space-y-3">
                  <p className="text-sm text-rose-600">{reviewError}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setReviewError("");
                      setLoadingReview(true);

                      getMyReview(request.id)
                        .then(setReview)
                        .catch((error) =>
                          setReviewError(
                            error instanceof Error
                              ? error.message
                              : "ไม่สามารถโหลดรีวิวได้",
                          ),
                        )
                        .finally(() => setLoadingReview(false));
                    }}
                    className="cursor-pointer text-sm font-semibold text-sky-600 hover:underline"
                  >
                    ลองอีกครั้ง
                  </button>
                </div>
              ) : review ? (
                <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
                  <p className="mb-2 font-semibold text-slate-800">
                    รีวิวของคุณ
                  </p>

                  <p
                    className="text-3xl tracking-wide text-amber-400"
                    aria-label={`${review.rating} จาก 5 ดาว`}
                  >
                    {"★".repeat(review.rating)}
                    <span className="text-slate-300">
                      {"☆".repeat(5 - review.rating)}
                    </span>
                  </p>

                  <p className="mt-3 whitespace-pre-wrap text-slate-700">
                    {review.comment || "ไม่ได้เขียนความคิดเห็น"}
                  </p>

                  <p className="mt-3 text-xs text-emerald-700">
                    ส่งรีวิวเรียบร้อยแล้ว
                  </p>
                </div>
              ) : showReviewForm ? (
                <ReviewForm
                  onSubmit={handleSubmitReview}
                  onCancel={() => setShowReviewForm(false)}
                />
              ) : (
                <div className="rounded-2xl bg-sky-50 p-5">
                  <p className="mb-4 text-sm text-slate-600">
                    งานนี้เสร็จสิ้นแล้ว คุณสามารถให้คะแนน Companion ได้
                  </p>

                  <button
                    type="button"
                    onClick={() => setShowReviewForm(true)}
                    className="w-full cursor-pointer rounded-xl bg-sky-600 px-5 py-3 font-semibold text-white transition hover:bg-sky-700 shadow-sm"
                  >
                    ★ เขียนรีวิว
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Customer cancellation */}
        {(request.status === "pending" || request.status === "accepted") && (
          <div className="px-6 pb-6">
            <div className="flex justify-end border-t border-slate-100 pt-5">
              <button
                type="button"
                disabled={cancelling}
                onClick={handleCancel}
                className="rounded-xl border border-rose-300 bg-white px-5 py-2.5 font-semibold text-rose-600 transition
                            hover:bg-rose-200 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              >
                {cancelling ? "กำลังยกเลิก..." : "ยกเลิกคำขอ"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
