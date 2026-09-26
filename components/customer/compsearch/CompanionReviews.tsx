"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string | null;
};

type Props = {
  companionId: string;
};

export default function CompanionReviews({ companionId }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadReviews() {
      setLoading(true);
      setError("");
      setReviews([]);

      const supabase = createClient();

      const { data, error } = await supabase
        .from("reviews")
        .select("id,rating,comment,created_at")
        .eq("companion_id", companionId)
        .order("created_at", {
          ascending: false,
        })
        .limit(10);

      if (!active) return;

      if (error) {
        console.error("Load reviews:", error);
        setError("ไม่สามารถโหลดรีวิวได้");
      } else {
        setReviews(data ?? []);
      }

      setLoading(false);
    }

    void loadReviews();

    return () => {
      active = false;
    };
  }, [companionId]);

  return (
    <section className="space-y-4">
      <h3 className="font-bold text-slate-900">รีวิวจากลูกค้า</h3>

      {loading ? (
        <p className="text-sm text-slate-500">กำลังโหลดรีวิว...</p>
      ) : error ? (
        <p role="alert" className="text-sm text-rose-600">
          {error}
        </p>
      ) : reviews.length === 0 ? (
        <div
          className="rounded-xl bg-slate-50 p-5
                        text-center text-sm text-slate-500"
        >
          ยังไม่มีรีวิวจากลูกค้า
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="rounded-xl border
                         border-slate-100 bg-slate-50 p-4"
            >
              <div
                className="flex items-center
                              justify-between gap-3"
              >
                <span
                  className="text-xl text-amber-400"
                  aria-label={`${review.rating} จาก 5 ดาว`}
                >
                  {"★".repeat(review.rating)}
                  <span className="text-slate-300">
                    {"☆".repeat(5 - review.rating)}
                  </span>
                </span>

                {review.created_at && (
                  <span className="text-xs text-slate-400">
                    {new Date(review.created_at).toLocaleDateString("th-TH", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                )}
              </div>

              <p
                className="mt-2 whitespace-pre-wrap
                            text-sm text-slate-700"
              >
                {review.comment || "ลูกค้าให้คะแนนโดยไม่ได้เขียนความคิดเห็น"}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
