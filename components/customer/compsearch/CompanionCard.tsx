import type { Companion } from "@/app/customer/compsearch/page";

type Props = {
  companion: Companion;
  onViewProfile: () => void;
};

export default function CompanionCard({
  companion,
  onViewProfile,
}: Props) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center justify-between hover:border-sky-300 hover:shadow-md transition">

      <div className="flex items-center gap-5">

        {companion.avatar ? (
          <img
            src={companion.avatar}
            alt={companion.name}
            className="w-20 h-20 rounded-full object-cover"
          />
        ) : (
          <div className="w-20 h-20 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center text-2xl font-bold">
            {companion.name.charAt(0)}
          </div>
        )}

        <div>

          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-slate-900">
              {companion.name}
            </h3>

            <span className="text-xs bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full font-semibold">
              พร้อมให้บริการ
            </span>
          </div>

          <p className="text-sm mt-2">
            <span className="text-amber-500">
              ⭐ {companion.rating}
            </span>

            <span className="text-slate-400 ml-1">
              ({companion.reviews} รีวิว)
            </span>

            <span className="text-slate-300 mx-2">
              •
            </span>

            <span className="text-slate-500">
              {companion.jobs} งาน
            </span>
          </p>

          <p className="text-sm text-slate-500 mt-2">
            📍 {companion.location}
          </p>

          <div className="flex gap-2 mt-3">
            {companion.types.map((type) => (
              <span
                key={type}
                className="bg-slate-100 text-slate-600 text-xs px-3 py-1 rounded-full"
              >
                {type}
              </span>
            ))}
          </div>

        </div>
      </div>

      <button
        onClick={onViewProfile}
        className="border border-sky-300 text-sky-600 font-semibold py-2.5 px-5 rounded-xl hover:bg-sky-50 transition cursor-pointer"
      >
        ดูโปรไฟล์
      </button>

    </div>
  );
}