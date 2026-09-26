type Props = {
  minimumRating: number;
  onMinimumRatingChange: (rating: number) => void;
};

export default function CompanionFilter({
  minimumRating,
  onMinimumRatingChange,
}: Props) {
  return (
    <div className="mt-5 border-t border-slate-100 pt-5">
      <label
        htmlFor="minimum-rating"
        className="mb-2 block text-sm font-semibold"
      >
        คะแนนรีวิวขั้นต่ำ
      </label>

      <select
        id="minimum-rating"
        value={minimumRating}
        onChange={(e) => onMinimumRatingChange(Number(e.target.value))}
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 sm:max-w-xs"
      >
        <option value={0}>ทั้งหมด</option>
        <option value={3}>3 ดาวขึ้นไป</option>
        <option value={4}>4 ดาวขึ้นไป</option>
        <option value={4.5}>4.5 ดาวขึ้นไป</option>
      </select>

      <p className="mt-2 text-xs text-slate-500">
        Companion ที่ยังไม่มีรีวิวจะแสดงเฉพาะเมื่อเลือกทั้งหมด
      </p>
    </div>
  );
}
