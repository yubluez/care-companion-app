import Link from "next/link";

type Props = {
  fullName: string;
  avatarUrl: string | null;
  ratingAvg: number;
  ratingCount: number;
};

export default function CompanionHeader({
  fullName,
  avatarUrl,
  ratingAvg,
  ratingCount,
}: Props) {
  return (
    <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
      <div className="flex items-center gap-4">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={fullName}
            className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-sm"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-xl font-bold">
            {(fullName || "C").charAt(0).toUpperCase()}
          </div>
        )}

        <div>
          <p className="text-sm text-slate-500">ยินดีต้อนรับกลับ</p>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            {fullName || "Companion"}
          </h1>

          <div className="flex flex-wrap items-center gap-2 mt-2">
            {ratingCount > 0 ? (
              <span className="text-sm text-slate-500">
                <span className="text-amber-500">★</span>{" "}
                <span className="font-semibold text-slate-700">
                  {ratingAvg.toFixed(1)}
                </span>{" "}
                ({ratingCount} รีวิว)
              </span>
            ) : (
              <span className="text-sm text-slate-400">ยังไม่มีรีวิว</span>
            )}
          </div>
        </div>
      </div>

    </section>
  );
}
