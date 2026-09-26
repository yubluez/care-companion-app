"use client";

export type ServiceCategory = {
  id: string;
  name: string;
};

type Props = {
  categories: ServiceCategory[];
  loadingOptions: boolean;
  categoryId: string;
  onCategoryChange: (value: string) => void;
  serviceDate: string;
  onDateChange: (value: string) => void;
  startTime: string;
  onTimeChange: (value: string) => void;
  durationMinutes: number;
  onDurationChange: (value: number) => void;
};

const fieldClass =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-sky-500";

export default function RequestDetails({
  categories,
  loadingOptions,
  categoryId,
  onCategoryChange,
  serviceDate,
  onDateChange,
  startTime,
  onTimeChange,
  durationMinutes,
  onDurationChange,
}: Props) {
  // ใช้วันที่ในเครื่องของผู้ใช้
  const today = [
    new Date().getFullYear(),
    String(new Date().getMonth() + 1).padStart(2, "0"),
    String(new Date().getDate()).padStart(2, "0"),
  ].join("-");

  return (
    <section className="space-y-5 border-b border-slate-100 p-6 sm:p-8">
      <h2 className="text-xl font-bold">รายละเอียดธุระ</h2>

      <label className="block space-y-2">
        <span className="font-semibold">ประเภทบริการ *</span>
        <select
          className={fieldClass}
          required
          value={categoryId}
          onChange={(e) => onCategoryChange(e.target.value)}
          disabled={loadingOptions}
        >
          <option value="">เลือกประเภทบริการ</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-2">
          <span className="font-semibold">วันที่ *</span>
          <input
            className={fieldClass}
            type="date"
            required
            min={today}
            value={serviceDate}
            onChange={(e) => onDateChange(e.target.value)}
          />
        </label>

        <label className="block space-y-2">
          <span className="font-semibold">เวลาเริ่ม *</span>
          <input
            type="time"
            lang="en-GB"
            value={startTime}
            onChange={(e) => onTimeChange(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
          />
        </label>
      </div>

      <label className="block space-y-2">
        <span className="font-semibold">ระยะเวลาบริการ *</span>
        <select
          className={fieldClass}
          value={durationMinutes}
          onChange={(e) => onDurationChange(Number(e.target.value))}
        >
          {[60, 120, 180, 240, 300, 360, 480].map((minutes) => (
            <option key={minutes} value={minutes}>
              {minutes / 60} ชั่วโมง
            </option>
          ))}
        </select>
      </label>
    </section>
  );
}
