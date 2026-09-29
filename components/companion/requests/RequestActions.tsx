"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { acceptRequest, rejectRequest } from "@/lib/actions/companionRequests";

import Swal from "sweetalert2";

type Props = {
  requestId: string;
};

export default function RequestActions({ requestId }: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState<"accept" | "reject" | null>(null);

  const [error, setError] = useState<string | null>(null);

  async function handleAccept() {
    if (loading) return;

    const confirmation = await Swal.fire({
      title: "ยืนยันการรับงานนี้?",
      text: "คุณต้องการรับงานและให้บริการตามวันเวลาที่ระบุใช่หรือไม่?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "ยืนยันรับงาน",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#0284c7",
      cancelButtonColor: "#64748b",
      reverseButtons: true,
    });

    if (!confirmation.isConfirmed) return;

    try {
      setLoading("accept");
      setError(null);

      const result = await acceptRequest(requestId);

      if (!result.success) {
        await Swal.fire({
          title: "ไม่สามารถรับงานได้",
          text: result.error || "กรุณาลองใหม่อีกครั้ง",
          icon: "error",
          confirmButtonColor: "#0284c7",
          confirmButtonText: "ตกลง",
        });
        setError(result.error || "ไม่สามารถรับงานได้");
        return;
      }

      await Swal.fire({
        title: "รับงานเรียบร้อยแล้ว!",
        text: "ระบบได้บันทึกการรับงานแล้ว คุณสามารถเริ่มให้บริการได้เมื่อถึงเวลานัดหมาย",
        icon: "success",
        confirmButtonColor: "#0284c7",
        confirmButtonText: "ไปยังหน้ารายละเอียดงาน",
      });

      router.replace(`/companion/jobs/${requestId}`);
      router.refresh();
    } catch (error) {
      console.error("Accept request error:", error);
      await Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถดำเนินการได้ กรุณาลองใหม่อีกครั้ง",
        icon: "error",
        confirmButtonColor: "#0284c7",
        confirmButtonText: "ตกลง",
      });
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(null);
    }
  }

  async function handleReject() {
    if (loading) return;

    const confirmed = await Swal.fire({
      title: "ยืนยันว่าต้องการปฏิเสธคำขอนี้?",
      text: "หากปฏิเสธแล้ว คำขอนี้จะถูกส่งกลับและไม่สามารถเรียกคืนได้",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ยืนยันปฏิเสธคำขอ",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#64748b",
      reverseButtons: true,
    });

    if (!confirmed.isConfirmed) return;

    try {
      setLoading("reject");
      setError(null);

      const result = await rejectRequest(requestId);

      if (!result.success) {
        await Swal.fire({
          title: "ไม่สามารถปฏิเสธได้",
          text: result.error || "กรุณาลองใหม่อีกครั้ง",
          icon: "error",
          confirmButtonColor: "#0284c7",
          confirmButtonText: "ตกลง",
        });
        setError(result.error || "ไม่สามารถปฏิเสธคำขอได้");
        return;
      }

      await Swal.fire({
        title: "ปฏิเสธคำขอเรียบร้อยแล้ว",
        icon: "success",
        confirmButtonColor: "#0284c7",
        confirmButtonText: "ตกลง",
      });

      router.replace("/companion/requests");
      router.refresh();
    } catch (error) {
      console.error("Reject request error:", error);
      await Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถดำเนินการได้ กรุณาลองใหม่อีกครั้ง",
        icon: "error",
        confirmButtonColor: "#0284c7",
        confirmButtonText: "ตกลง",
      });
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={handleReject}
          disabled={loading !== null}
          className="cursor-pointer rounded-xl border border-rose-200 bg-white py-3 font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading === "reject" ? "กำลังปฏิเสธ..." : "ปฏิเสธคำขอ"}
        </button>

        <button
          type="button"
          onClick={handleAccept}
          disabled={loading !== null}
          className="cursor-pointer rounded-xl bg-sky-600 py-3 font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {loading === "accept" ? "กำลังรับงาน..." : "รับงาน"}
        </button>
      </div>
    </div>
  );
}
