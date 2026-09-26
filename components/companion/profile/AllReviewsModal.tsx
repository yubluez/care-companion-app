"use client";

import { useEffect } from "react";
import CompanionReviewsList from "@/components/shared/CompanionReviewsList";

type Props = {
  companionId: string;
  onClose: () => void;
};

export default function AllReviewsModal({ companionId, onClose }: Props) {
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="all-reviews-title"
        className="flex max-h-[85vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
      >
        <header className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <h2
            id="all-reviews-title"
            className="text-xl font-bold text-slate-900"
          >
            รีวิวจากลูกค้าทั้งหมด
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="ปิด"
            className="flex h-9 w-9 items-center justify-center rounded-full text-4xl hover:bg-red-100 cursor-pointer"
          >
            ×
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          <CompanionReviewsList companionId={companionId} />
        </div>
      </section>
    </div>
  );
}
