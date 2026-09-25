export default function CompanionFilter() {
  return (
    <div className="border-t border-slate-100 mt-5 pt-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-2">
            ประเภทของธุระ
          </label>

          <select className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-white">
            <option value="">ทั้งหมด</option>
            <option>ไปโรงพยาบาล</option>
            <option>ไปธนาคาร</option>
            <option>ซื้อของ</option>
            <option>ติดต่อราชการ</option>
            <option>ธุระทั่วไป</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">วันที่</label>

          <input
            type="date"
            className="w-full border border-slate-300 rounded-xl px-4 py-3"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">เวลา</label>

          <input
            type="time"
            className="w-full border border-slate-300 rounded-xl px-4 py-3"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">
            สถานที่ต้นทาง
          </label>

          <input
            placeholder="เช่น บางแค"
            className="w-full border border-slate-300 rounded-xl px-4 py-3"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">จุดหมาย</label>

          <input
            placeholder="เช่น โรงพยาบาลศิริราช"
            className="w-full border border-slate-300 rounded-xl px-4 py-3"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">
            ระยะเวลาใช้บริการ
          </label>

          <select className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-white">
            <option value="">ไม่ระบุ</option>
            <option>ไม่เกิน 1 ชั่วโมง</option>
            <option>1 - 2 ชั่วโมง</option>
            <option>2 - 4 ชั่วโมง</option>
            <option>มากกว่า 4 ชั่วโมง</option>
          </select>
        </div>
      </div>
    </div>
  );
}
