type Props = {
  bio: string;
  experience: string;
};

export default function CompanionInfo({ bio, experience }: Props) {
  return (
    <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-800 mb-5">เกี่ยวกับฉัน</h2>

      <div className="space-y-5">
        <div>
          <p className="text-sm text-slate-400 mb-1">แนะนำตัว</p>

          <p className="text-slate-700 whitespace-pre-wrap">{bio || "-"}</p>
        </div>

        <div>
          <p className="text-sm text-slate-400 mb-1">ประสบการณ์</p>

          <p className="text-slate-700 whitespace-pre-wrap">
            {experience || "ไม่ได้ระบุ"}
          </p>
        </div>
      </div>
    </section>
  );
}
