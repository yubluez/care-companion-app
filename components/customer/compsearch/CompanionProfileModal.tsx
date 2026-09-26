"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CompanionReviewsList from "@/components/shared/CompanionReviewsList";
import type { Companion } from "@/app/customer/compsearch/page";

type Props = {
  companion: Companion;
  onClose: () => void;
};

export default function CompanionProfileModal({ companion, onClose }: Props) {
  const [view, setView] = useState<"profile" | "reviews">("profile");

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (view === "reviews") {
          setView("profile");
        } else {
          onClose();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, view]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="companion-modal-title"
        className="flex max-h-[85vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl bg-white shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          {view === "profile" ? (
            <h2 id="companion-modal-title" className="text-xl font-bold">
              โปรไฟล์ Companion
            </h2>
          ) : (
            <button
              type="button"
              onClick={() => setView("profile")}
              className="font-semibold text-sky-600 hover:text-sky-700"
            >
              ← กลับไปหน้าโปรไฟล์
            </button>
          )}

          <button
            type="button"
            aria-label="ปิดโปรไฟล์"
            onClick={onClose}
            className="h-9 w-9 rounded-full text-xl hover:bg-slate-100"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          {view === "profile" ? (
            <div className="space-y-6">
              <div className="flex items-center gap-5">
                {companion.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={companion.avatar}
                    alt={companion.name}
                    className="h-20 w-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-sky-100 text-3xl font-bold text-sky-600">
                    {companion.name.charAt(0)}
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-bold">{companion.name}</h3>

                  <p className="mt-1 text-sm text-slate-600">
                    {companion.reviews > 0
                      ? `⭐ ${companion.rating.toFixed(1)} (${companion.reviews} รีวิว)`
                      : "ยังไม่มีรีวิว"}
                  </p>

                  <span className="mt-2 inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                    ผ่านการอนุมัติ
                  </span>
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm text-slate-400">แนะนำตัว</p>

                <p className="whitespace-pre-wrap text-slate-800">
                  {companion.bio || "Companion ยังไม่ได้เพิ่มข้อมูลแนะนำตัว"}
                </p>
              </div>

              <div className="border-t border-slate-100 pt-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900">รีวิวจากลูกค้า</h3>

                  {companion.reviews > 0 && (
                    <button
                      type="button"
                      onClick={() => setView("reviews")}
                      className="text-sm font-semibold text-sky-600 hover:text-sky-700"
                    >
                      ดูทั้งหมด ({companion.reviews}) →
                    </button>
                  )}
                </div>

                <p className="mt-3 text-sm text-slate-500">
                  {companion.reviews > 0
                    ? `คะแนนเฉลี่ย ${companion.rating.toFixed(1)} จาก 5 ดาว`
                    : "ยังไม่มีรีวิวจากลูกค้า"}
                </p>
              </div>
            </div>
          ) : (
            <CompanionReviewsList companionId={companion.id} />
          )}
        </div>

        {/* Footer */}
        {view === "profile" && (
          <div className="border-t border-slate-100 bg-slate-50 p-5">
            <Link
              href={`/customer/requests/new?companion=${encodeURIComponent(
                companion.id,
              )}`}
              className="block w-full rounded-xl bg-sky-600 py-3 text-center font-semibold text-white transition hover:bg-sky-700"
            >
              ส่งคำขอใช้บริการ
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
