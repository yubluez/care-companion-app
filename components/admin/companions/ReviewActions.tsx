"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  approveCompanion,
  rejectCompanion,
} from "@/lib/actions/adminCompanions";

type Props = {
  companionId: string;
};

export default function ReviewActions({ companionId }: Props) {
  const router = useRouter();

  const [mode, setMode] = useState<"normal" | "reject">("normal");

  const [reason, setReason] = useState("");

  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  const [error, setError] = useState<string | null>(null);

  async function handleApprove() {
    if (loading) return;

    const confirmed = window.confirm(
      "ยืนยันว่าต้องการอนุมัติ Companion คนนี้?",
    );

    if (!confirmed) return;

    try {
      setLoading("approve");
      setError(null);

      const result = await approveCompanion(companionId);

      if (!result.success) {
        setError(result.error || "ไม่สามารถอนุมัติได้");
        return;
      }

      router.replace("/admin/companions");
      router.refresh();
    } catch (error) {
      console.error(error);

      setError("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setLoading(null);
    }
  }

  async function handleReject() {
    if (!reason.trim()) {
      setError("กรุณาระบุเหตุผลที่ปฏิเสธ");
      return;
    }

    if (loading) return;

    try {
      setLoading("reject");
      setError(null);

      const result = await rejectCompanion(companionId, reason);

      if (!result.success) {
        setError(result.error || "ไม่สามารถปฏิเสธได้");
        return;
      }

      router.replace("/admin/companions");
      router.refresh();
    } catch (error) {
      console.error(error);

      setError("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setLoading(null);
    }
  }

  if (mode === "reject") {
    return (
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            เหตุผลที่ปฏิเสธ *
          </label>

          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            maxLength={500}
            rows={4}
            placeholder="เช่น เอกสารยืนยันตัวตนไม่ชัดเจน กรุณาส่งใหม่..."
            className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
          />

          <p className="mt-1 text-right text-xs text-slate-400">
            {reason.length}/500
          </p>
        </div>

        {error && <ErrorMessage message={error} />}

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            disabled={loading !== null}
            onClick={() => {
              setMode("normal");
              setError(null);
            }}
            className="rounded-xl border border-slate-300 py-3 font-semibold text-slate-600 hover:bg-slate-50"
          >
            ยกเลิก
          </button>

          <button
            type="button"
            disabled={loading !== null}
            onClick={handleReject}
            className="rounded-xl bg-rose-600 py-3 font-semibold text-white hover:bg-rose-700 disabled:bg-slate-300"
          >
            {loading === "reject" ? "กำลังบันทึก..." : "ยืนยันการปฏิเสธ"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} />
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          disabled={loading !== null}
          onClick={() => setMode("reject")}
          className="rounded-xl border border-rose-200 bg-white py-3 font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50"
        >
          ปฏิเสธใบสมัคร
        </button>

        <button
          type="button"
          disabled={loading !== null}
          onClick={handleApprove}
          className="rounded-xl bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700 disabled:bg-slate-300"
        >
          {loading === "approve" ? "กำลังอนุมัติ..." : "อนุมัติ Companion"}
        </button>
      </div>
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
      {message}
    </div>
  );
}
