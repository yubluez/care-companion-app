import Link from 'next/link';

export default function CustomerDashboard() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-sky-600 to-sky-700 text-white rounded-3xl p-6 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-md">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">สวัสดีครับ 👋</h1>
          <p className="text-sky-100 text-base mt-1">ต้องการเพื่อนร่วมทางไปทำธุระที่ไหนวันนี้ไหมครับ?</p>
        </div>
        <Link
          href="/customer/companions"
          className="bg-white text-sky-700 hover:bg-sky-50 font-bold px-6 py-3 rounded-2xl shadow transition"
        >
          + ค้นหา Companion
        </Link>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-slate-800">คำขอและการเดินทางของฉัน</h2>
        <Link href="/customer/requests" className="text-sky-600 hover:underline text-sm font-semibold">
          ดูทั้งหมด →
        </Link>
      </div>

      {/* กล่องสถานะคำขอล่าสุด */}
      <div className="bg-white p-6 rounded-2xl border border-sky-100 shadow-sm">
        <div className="flex justify-between items-start mb-3">
          <div>
            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full">
              รอการตอบรับ (PENDING)
            </span>
            <h3 className="text-lg font-bold text-slate-800 mt-2">ไปพบแพทย์ตามนัด (โรงพยาบาลศิริราช)</h3>
          </div>
          <span className="text-slate-500 text-sm">25 ก.ย. 2026 • 09:00 น.</span>
        </div>
        <p className="text-slate-600 text-base mb-4">ผู้ช่วย: สมชาย ใจดี (คะแนน 4.9 ⭐)</p>
        <div className="flex gap-2">
          <Link
            href="/customer/requests/req-123"
            className="text-center w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl transition text-base"
          >
            ดูรายละเอียดคำขอ
          </Link>
        </div>
      </div>
    </div>
  );
}