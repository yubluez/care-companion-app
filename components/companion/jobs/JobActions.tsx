"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { completeJob, startJob } from "@/lib/actions/companionRequests";

import Swal from "sweetalert2";

type Props = {
  requestId: string;
  status: string;
};

export default function JobActions({ requestId, status }: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  async function handleStart() {
    if (loading) return;

    const confirmation = await Swal.fire({
      title: "ยืนยันเริ่มให้บริการ?",
      text: "คุณมาถึงจุดนัดพบและพร้อมเริ่มให้บริการแล้วใช่หรือไม่?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "เริ่มงานเลย",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#0284c7",
      cancelButtonColor: "#64748b",
      reverseButtons: true,
    });

    if (!confirmation.isConfirmed) return;

    try {
      setLoading(true);
      setError(null);

      const result = await startJob(requestId);

      if (!result.success) {
        await Swal.fire({
          title: "ไม่สามารถเริ่มงานได้",
          text: result.error || "กรุณาลองใหม่อีกครั้ง",
          icon: "error",
          confirmButtonColor: "#0284c7",
          confirmButtonText: "ตกลง",
        });
        setError(result.error || "ไม่สามารถเริ่มงานได้");
        return;
      }

      await Swal.fire({
        title: "เริ่มให้บริการแล้ว!",
        text: "ระบบได้บันทึกเวลาเริ่มงานเรียบร้อยแล้ว ขอให้การบริการราบรื่นครับ",
        icon: "success",
        confirmButtonColor: "#0284c7",
        confirmButtonText: "ตกลง",
      });

      router.refresh();
    } catch (error) {
      console.error("Start job error:", error);
      await Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถดำเนินการได้ กรุณาลองใหม่อีกครั้ง",
        icon: "error",
        confirmButtonColor: "#0284c7",
        confirmButtonText: "ตกลง",
      });
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  }

  async function handleComplete() {
    if (loading) return;

    const confirmed = await Swal.fire({
      title: "ยืนยันว่าการให้บริการเสร็จสิ้นแล้ว?",
      text: "ระบบจะบันทึกเวลาสิ้นสุดงานและปิดงานนี้ คุณต้องการดำเนินการต่อใช่หรือไม่?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "ยืนยันเสร็จสิ้นงาน",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#059669",
      cancelButtonColor: "#64748b",
      reverseButtons: true,
    });

    if (!confirmed.isConfirmed) return;

    try {
      setLoading(true);
      setError(null);

      const result = await completeJob(requestId);

      if (!result.success) {
        await Swal.fire({
          title: "ไม่สามารถจบงานได้",
          text: result.error || "กรุณาลองใหม่อีกครั้ง",
          icon: "error",
          confirmButtonColor: "#059669",
          confirmButtonText: "ตกลง",
        });
        setError(result.error || "ไม่สามารถจบงานได้");
        return;
      }

      await Swal.fire({
        title: "การให้บริการเสร็จสิ้นสมบูรณ์!",
        text: "ขอบคุณสำหรับการปฏิบัติหน้าที่อย่างเต็มความสามารถ",
        icon: "success",
        confirmButtonColor: "#059669",
        confirmButtonText: "ตกลง",
      });

      router.refresh();
    } catch (error) {
      console.error("Complete job error:", error);
      await Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถดำเนินการได้ กรุณาลองใหม่อีกครั้ง",
        icon: "error",
        confirmButtonColor: "#059669",
        confirmButtonText: "ตกลง",
      });
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      )}

      {status === "accepted" && (
        <button
          type="button"
          disabled={loading}
          onClick={handleStart}
          className="w-full cursor-pointer rounded-xl bg-sky-600 py-3 font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {loading ? "กำลังเริ่มงาน..." : "เริ่มให้บริการ"}
        </button>
      )}

      {status === "in_progress" && (
        <button
          type="button"
          disabled={loading}
          onClick={handleComplete}
          className="w-full cursor-pointer rounded-xl bg-emerald-600 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {loading ? "กำลังบันทึก..." : "เสร็จสิ้นการให้บริการ"}
        </button>
      )}

      {status === "completed" && (
        <div className="rounded-xl bg-emerald-50 px-4 py-3 text-center text-sm font-medium text-emerald-700">
          ✓ งานนี้เสร็จสิ้นแล้ว
        </div>
      )}

      {status === "cancelled" && (
        <div className="rounded-xl bg-slate-100 px-4 py-3 text-center text-sm font-medium text-slate-600">
          งานนี้ถูกยกเลิกแล้ว
        </div>
      )}

      {status === "expired" && (
        <div className="rounded-xl bg-slate-100 px-4 py-3 text-center text-sm font-medium text-slate-600">
          คำขอนี้หมดอายุแล้ว
        </div>
      )}

      {status === "rejected" && (
        <div className="rounded-xl bg-slate-100 px-4 py-3 text-center text-sm font-medium text-slate-600">
          คุณได้ปฏิเสธคำขอนี้แล้ว
        </div>
      )}
    </div>
  );
}
