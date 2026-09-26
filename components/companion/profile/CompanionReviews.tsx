import AllReviewsButton from "./AllReviewsButton";

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string | null;
};

type Props = {
  companionId: string;
  reviews: Review[];
  totalReviews: number;
};

export default function CompanionReviews({
  reviews,
  totalReviews,
  companionId,
}: Props) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-slate-900">รีวิวจากลูกค้า</h2>

        <p className="mt-1 text-sm text-slate-500">
          ความคิดเห็นล่าสุดจากผู้ใช้บริการ ทั้งหมด {totalReviews} รีวิว
        </p>
      </div>

      {reviews.length === 0 ? (
        <div className="rounded-xl bg-slate-50 p-8 text-center text-sm text-slate-500">
          ยังไม่มีรีวิวจากลูกค้า
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="rounded-xl border border-slate-100 bg-slate-50 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
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

              <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">
                {review.comment || "ลูกค้าให้คะแนนโดยไม่ได้เขียนความคิดเห็น"}
              </p>
            </article>
          ))}
        </div>
      )}
      {totalReviews > 0 && (
        <div className="mt-5 flex justify-center border-t border-slate-100 pt-5">
          <AllReviewsButton
            companionId={companionId}
            totalReviews={totalReviews}
          />
        </div>
      )}
    </section>
  );
}
