type Props = {
  fullName: string;
  avatarUrl: string | null;
  verificationStatus: string;
  ratingAvg: number;
  ratingCount: number;
};

export default function ProfileHeader({
  fullName,
  avatarUrl,
  verificationStatus,
  ratingAvg,
  ratingCount,
}: Props) {
  const status = {
    approved: {
      text: "ยืนยันตัวตนแล้ว",
      className: "bg-emerald-100 text-emerald-700",
    },

    pending: {
      text: "กำลังตรวจสอบ",
      className: "bg-amber-100 text-amber-700",
    },

    rejected: {
      text: "ไม่ผ่านการตรวจสอบ",
      className: "bg-rose-100 text-rose-700",
    },
  }[verificationStatus] ?? {
    text: verificationStatus,
    className: "bg-slate-100 text-slate-600",
  };

  return (
    <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row items-center gap-5">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={fullName}
            className="w-24 h-24 rounded-full object-cover border-4 border-sky-100"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-3xl font-bold">
            {fullName.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="text-center sm:text-left flex-1">
          <h2 className="text-2xl font-bold text-slate-900">{fullName}</h2>

          <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
            <span className="bg-sky-100 text-sky-700 text-sm font-semibold px-3 py-1 rounded-full">
              Companion
            </span>

            <span
              className={`text-sm font-semibold px-3 py-1 rounded-full ${status.className}`}
            >
              {status.text}
            </span>
          </div>

          <div className="mt-3 text-sm text-slate-600">
            {ratingCount > 0 ? (
              <>
                <span className="text-amber-500">★</span>{" "}
                <span className="font-bold text-slate-800">
                  {ratingAvg.toFixed(1)}
                </span>{" "}
                <span className="text-slate-400">({ratingCount} รีวิว)</span>
              </>
            ) : (
              <span className="text-slate-400">ยังไม่มีรีวิว</span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
