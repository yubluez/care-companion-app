"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { completeJob, startJob } from "@/lib/actions/companionRequests";

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

    try {
      setLoading(true);
      setError(null);

      const result = await startJob(requestId);

      if (!result.success) {
        setError(result.error || "ไม่สามารถเริ่มงานได้");

        return;
      }

      router.refresh();
    } catch (error) {
      console.error("Start job error:", error);

      setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  }

  async function handleComplete() {
    if (loading) return;

    const confirmed = window.confirm("ยืนยันว่าการให้บริการเสร็จสิ้นแล้ว?");

    if (!confirmed) return;

    try {
      setLoading(true);
      setError(null);

      const result = await completeJob(requestId);

      if (!result.success) {
        setError(result.error || "ไม่สามารถจบงานได้");

        return;
      }

      router.refresh();
    } catch (error) {
      console.error("Complete job error:", error);

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
    </div>
  );
}
