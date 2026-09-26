"use client";

import Link from "next/link";

export type SelectedCompanionInfo = {
  full_name: string | null;
  avatar_url: string | null;
};

export type SelectedCompanionStats = {
  rating_avg: number | null;
  rating_count: number | null;
};

type Props = {
  companionId: string | null;
  companion: SelectedCompanionInfo | null;
  stats: SelectedCompanionStats | null;
  loading?: boolean;
  onRemove: () => void;
};

export default function SelectedCompanion({
  companionId,
  companion,
  stats,
  loading = false,
  onRemove,
}: Props) {
  const selected = Boolean(companionId && companion && stats);

  return (
    <section className="space-y-4 border-b border-slate-100 p-6 sm:p-8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Companion</h2>
          <p className="mt-1 text-sm text-slate-500">
            เลือกผู้ร่วมเดินทางที่คุณต้องการส่งคำขอ
          </p>
        </div>

        <span className="shrink-0 text-xs font-semibold text-slate-400">
          ขั้นตอนที่ 1
        </span>
      </div>

      {loading && companionId ? (
        <div className="rounded-2xl border border-slate-200 p-6 text-center text-sm text-slate-500">
          กำลังโหลดข้อมูล Companion...
        </div>
      ) : selected && companion ? (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-sky-200 bg-sky-50 p-4">
          <div className="flex min-w-0 items-center gap-3">
            {companion.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={companion.avatar_url}
                alt={companion.full_name || "Companion"}
                className="h-14 w-14 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-xl font-bold text-sky-700">
                {(companion.full_name || "C").charAt(0)}
              </div>
            )}

            <div className="min-w-0">
              <p className="truncate font-semibold text-slate-900">
                {companion.full_name || "Companion"}
              </p>

              <p className="mt-1 text-sm text-slate-600">
                {(stats?.rating_count ?? 0) > 0
                  ? `★ ${Number(stats?.rating_avg ?? 0).toFixed(1)} (${stats?.rating_count} รีวิว)`
                  : "ยังไม่มีคะแนนรีวิว"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onRemove}
            aria-label="ยกเลิกการเลือก Companion"
            title="ยกเลิกการเลือก Companion"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-3xl text-slate-500 transition
                        hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
          >
            ×
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 px-5 py-7 text-center">
          <p className="font-semibold text-slate-800">
            ยังไม่ได้เลือก Companion
          </p>

          <p className="mt-1 text-sm text-slate-500">
            กรุณาเลือก Companion ก่อนส่งคำขอ
          </p>

          <Link
            href="/customer/compsearch"
            className="mt-4 inline-flex items-center justify-center rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700"
          >
            ค้นหา Companion
          </Link>
        </div>
      )}
    </section>
  );
}
