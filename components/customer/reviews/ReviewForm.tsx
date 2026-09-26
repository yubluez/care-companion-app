"use client";

import { useState } from "react";

type Props = {
  onSubmit: (rating: number, comment: string) => Promise<void>;
  onCancel: () => void;
};

export default function ReviewForm({ onSubmit, onCancel }: Props) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (rating < 1 || rating > 5 || submitting) {
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      await onSubmit(rating, comment.trim());
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "ไม่สามารถส่งรีวิวได้ กรุณาลองใหม่",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-slate-900">รีวิวการให้บริการ</h3>

        <p className="mt-2 text-sm text-slate-500">
          ประสบการณ์ของคุณกับ Companion เป็นอย่างไรบ้าง?
        </p>
      </div>

      <div className="flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={submitting}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onFocus={() => setHoverRating(star)}
            onBlur={() => setHoverRating(0)}
            onClick={() => setRating(star)}
            aria-label={`ให้ ${star} ดาว`}
            aria-pressed={rating === star}
            className="text-4xl transition hover:scale-110
                       disabled:cursor-not-allowed"
          >
            <span
              className={
                star <= (hoverRating || rating)
                  ? "text-amber-400"
                  : "text-slate-200"
              }
            >
              ★
            </span>
          </button>
        ))}
      </div>

      <p className="text-center text-sm text-slate-500">
        {rating === 0 ? "กรุณาเลือกคะแนน" : `คุณให้คะแนน ${rating} จาก 5 ดาว`}
      </p>

      <div>
        <label
          htmlFor="review-comment"
          className="mb-2 block text-sm font-semibold
                     text-slate-700"
        >
          ความคิดเห็นเพิ่มเติม (ไม่บังคับ)
        </label>

        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={500}
          rows={4}
          disabled={submitting}
          placeholder="เล่าประสบการณ์การใช้บริการ..."
          className="w-full resize-none rounded-xl
                     border border-slate-200 p-4
                     outline-none focus:border-sky-500"
        />

        <p className="mt-1 text-right text-xs text-slate-400">
          {comment.length}/500
        </p>
      </div>

      {error && (
        <p role="alert" className="text-sm text-rose-600">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="flex-1 rounded-xl border
                     border-slate-200 py-3 font-semibold"
        >
          ยกเลิก
        </button>

        <button
          type="submit"
          disabled={rating === 0 || submitting}
          className="flex-1 rounded-xl bg-sky-600
                     py-3 font-semibold text-white
                     hover:bg-sky-700
                     disabled:cursor-not-allowed
                     disabled:opacity-50"
        >
          {submitting ? "กำลังส่ง..." : "ส่งรีวิว"}
        </button>
      </div>
    </form>
  );
}
