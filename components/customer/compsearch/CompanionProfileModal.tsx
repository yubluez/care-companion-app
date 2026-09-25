import Link from "next/link";
import type { Companion } from "@/app/customer/compsearch/page";

type Props = {
  companion: Companion;
  onClose: () => void;
};

export default function CompanionProfileModal({ companion, onClose }: Props) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-xl rounded-3xl shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100">
          <h2 className="text-xl font-bold">โปรไฟล์ Companion</h2>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-slate-100 cursor-pointer text-xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center gap-5">
            {companion.avatar ? (
              <img
                src={companion.avatar}
                alt={companion.name}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center text-3xl font-bold">
                {companion.name.charAt(0)}
              </div>
            )}

            <div>
              <h3 className="text-xl font-bold">{companion.name}</h3>

              <p className="text-amber-500 mt-1">
                ⭐ {companion.rating}
                <span className="text-slate-400 ml-2">
                  ({companion.reviews} รีวิว)
                </span>
              </p>

              <span className="inline-block mt-2 bg-emerald-50 text-emerald-600 text-xs font-semibold px-3 py-1 rounded-full">
                พร้อมให้บริการ
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="mt-7 space-y-5">
            <div>
              <p className="text-sm text-slate-400">พื้นที่ให้บริการ</p>

              <p className="font-medium mt-1">📍 {companion.location}</p>
            </div>

            <div>
              <p className="text-sm text-slate-400 mb-2">ประเภทงานที่รับ</p>

              <div className="flex gap-2 flex-wrap">
                {companion.types.map((type) => (
                  <span
                    key={type}
                    className="bg-sky-50 text-sky-700 text-sm px-3 py-1.5 rounded-lg"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm text-slate-400">ประสบการณ์</p>

              <p className="font-medium mt-1">
                ให้บริการสำเร็จแล้ว {companion.jobs} งาน
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 p-5 bg-slate-50">
          <Link
            href={`/customer/requests/new?companion=${companion.id}`}
            className="block w-full bg-sky-600 hover:bg-sky-700 text-white text-center font-semibold py-3 rounded-xl transition"
          >
            ส่งคำขอใช้บริการ
          </Link>
        </div>
      </div>
    </div>
  );
}
