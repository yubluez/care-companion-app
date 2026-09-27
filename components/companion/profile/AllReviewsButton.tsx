"use client";

import { useState } from "react";
import AllReviewsModal from "./AllReviewsModal";

type Props = {
  companionId: string;
  totalReviews: number;
};

export default function AllReviewsButton({ companionId, totalReviews }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  if (totalReviews === 0) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="text-sm font-semibold text-violet-600 transition hover:bg-violet-50 cursor-pointer"
      >
        ดูรีวิวทั้งหมด ({totalReviews})
      </button>

      {isOpen && (
        <AllReviewsModal
          companionId={companionId}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
