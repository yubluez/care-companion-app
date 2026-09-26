import type { Companion } from "@/app/customer/compsearch/page";

type Props = {
  companion: Companion;
  onViewProfile: () => void;
};

export default function CompanionCard({ companion, onViewProfile }: Props) {
  return (
    <article className="flex flex-col justify-between gap-5 rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-sky-300 hover:shadow-md sm:flex-row sm:items-center">
      <div className="flex min-w-0 items-center gap-5">
        {companion.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={companion.avatar}
            alt={companion.name}
            className="h-20 w-20 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-sky-100 text-2xl font-bold text-sky-600">
            {companion.name.charAt(0)}
          </div>
        )}

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-lg font-bold text-slate-900">
              {companion.name}
            </h3>

            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
              ผ่านการอนุมัติ
            </span>
          </div>

          <p className="mt-2 text-sm text-slate-500">
            {companion.reviews > 0 ? (
              <>
                <span className="text-amber-500">
                  ⭐ {companion.rating.toFixed(1)}
                </span>{" "}
                ({companion.reviews} รีวิว)
              </>
            ) : (
              "ยังไม่มีรีวิว"
            )}
          </p>

          {companion.bio && (
            <p className="mt-2 line-clamp-2 text-sm text-slate-600">
              {companion.bio}
            </p>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={onViewProfile}
        className="shrink-0 rounded-xl border border-sky-300 px-5 py-2.5 font-semibold text-sky-600 transition hover:bg-sky-50"
      >
        ดูโปรไฟล์
      </button>
    </article>
  );
}
