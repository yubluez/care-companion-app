"use client";

type Props = {
  bio: string;
  setBio: (value: string) => void;
  experience: string;
  setExperience: (value: string) => void;
};

export default function CompanionInfoSection({
  bio,
  setBio,
  experience,
  setExperience,
}: Props) {
  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
      <h2 className="text-xl font-bold text-slate-900 mb-6">
        ข้อมูลเกี่ยวกับคุณ
      </h2>

      <div className="space-y-5">
        {/* Bio */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            แนะนำตัว *
          </label>

          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            maxLength={500}
            placeholder="แนะนำตัวเองสั้น ๆ เพื่อให้ลูกค้ารู้จักคุณมากขึ้น"
            className="w-full resize-none border border-slate-300 rounded-xl px-4 py-3 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          />

          <p className="text-xs text-slate-400 text-right mt-1">
            {bio.length}/500
          </p>
        </div>

        {/* Experience */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            ประสบการณ์
          </label>

          <textarea
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            rows={4}
            maxLength={1000}
            placeholder="เช่น เคยดูแลผู้สูงอายุ มีประสบการณ์พาไปโรงพยาบาล หรือช่วยทำธุระ"
            className="w-full resize-none border border-slate-300 rounded-xl px-4 py-3 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          />

          <p className="text-xs text-slate-400 text-right mt-1">
            {experience.length}/1000
          </p>
        </div>
      </div>
    </section>
  );
}
