"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const PAGE_SIZE = 5;

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string | null;
};

type Props = {
  companionId: string;
};

export default function CompanionReviewsList({ companionId }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const totalPages = Math.ceil(total / PAGE_SIZE);

  useEffect(() => {
    let active = true;

    async function loadReviews() {
      setLoading(true);
      setError("");

      const supabase = createClient();
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const {
        data,
        count,
        error: queryError,
      } = await supabase
        .from("reviews")
        .select("id,rating,comment,created_at", {
          count: "exact",
        })
        .eq("companion_id", companionId)
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .range(from, to);

      if (!active) return;

      if (queryError) {
        console.error("Load reviews:", queryError);
        setError("ไม่สามารถโหลดรีวิวได้");
        setReviews([]);
      } else {
        setReviews(data ?? []);
        setTotal(count ?? 0);
      }

      setLoading(false);
    }

    void loadReviews();

    return () => {
      active = false;
    };
  }, [companionId, page]);

  useEffect(() => {
    setPage(1);
  }, [companionId]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">{total} รีวิว</p>

      {loading ? (
        <div className="py-10 text-center text-sm text-slate-500">
          กำลังโหลดรีวิว...
        </div>
      ) : error ? (
        <p role="alert" className="text-sm text-rose-600">
          {error}
        </p>
      ) : reviews.length === 0 ? (
        <div className="rounded-xl bg-slate-50 p-8 text-center text-sm text-slate-500">
          ยังไม่มีรีวิวจากลูกค้า
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="rounded-xl border border-slate-100 bg-slate-50 p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className="text-lg text-amber-500"
                  aria-label={`${review.rating} จาก 5 ดาว`}
                >
                  {"★".repeat(review.rating)}
                  <span className="text-slate-300">
                    {"☆".repeat(5 - review.rating)}
                  </span>
                </span>

                {review.created_at && (
                  <time className="text-xs text-slate-400">
                    {new Date(review.created_at).toLocaleDateString("th-TH", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </time>
                )}
              </div>

              <p className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-700">
                {review.comment || "ลูกค้าให้คะแนนโดยไม่ได้เขียนความคิดเห็น"}
              </p>
            </article>
          ))}
        </div>
      )}

      {!loading && !error && totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
          >
            ก่อนหน้า
          </button>

          <span className="text-sm text-slate-500">
            หน้า {page} / {totalPages}
          </span>

          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
          >
            ถัดไป
          </button>
        </div>
      )}
    </div>
  );
}
