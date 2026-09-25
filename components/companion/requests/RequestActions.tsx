"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { acceptRequest, rejectRequest } from "@/lib/actions/companionRequests";

type Props = {
  requestId: string;
};

export default function RequestActions({ requestId }: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState<"accept" | "reject" | null>(null);

  const [error, setError] = useState<string | null>(null);

  async function handleAccept() {
    if (loading) return;

    try {
      setLoading("accept");
      setError(null);

      const result = await acceptRequest(requestId);

      if (!result.success) {
        setError(result.error || "ไม่สามารถรับงานได้");

        return;
      }

      router.replace(`/companion/jobs/${requestId}`);

      router.refresh();
    } catch (error) {
      console.error("Accept request error:", error);

      setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(null);
    }
  }

  async function handleReject() {
    if (loading) return;

    const confirmed = window.confirm("ยืนยันว่าต้องการปฏิเสธคำขอนี้?");

    if (!confirmed) return;

    try {
      setLoading("reject");
      setError(null);

      const result = await rejectRequest(requestId);

      if (!result.success) {
        setError(result.error || "ไม่สามารถปฏิเสธคำขอได้");

        return;
      }

      router.replace("/companion/requests");

      router.refresh();
    } catch (error) {
      console.error("Reject request error:", error);

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
