import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white border-b border-sky-100 py-4 px-6 max-w-6xl w-full mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-sky-600 text-white rounded-xl flex items-center justify-center font-bold text-xl">
            CC
          </div>
          <span className="text-2xl font-bold text-sky-950">Care Companion</span>
        </div>
        <Link 
          href="/login"
          className="bg-sky-600 hover:bg-sky-700 text-white font-semibold px-5 py-2.5 rounded-xl transition"
        >
          เข้าสู่ระบบ
        </Link>
      </header>

      <main className="flex-1 max-w-5xl mx-auto px-6 py-12 flex flex-col items-center text-center mt-12">
        <span className="bg-sky-100 text-sky-800 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
          เพื่อนร่วมทางที่คุณไว้วางใจได้
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight mb-4">
          อุ่นใจทุกการเดินทาง <br className="hidden sm:inline"/>มีเพื่อนคู่คิดช่วยทำธุระข้างกาย
        </h1>
        <p className="text-slate-600 max-w-3xl text-lg mb-8">
          บริการพาไปโรงพยาบาล พบแพทย์ ธนาคาร หรือติดต่อหน่วยงานราชการ สำหรับผู้สูงอายุและบุคคลทั่วไป
        </p>

        {/* 3 ขั้นตอนการใช้งาน */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left mt-12">
          <div className="bg-white p-6 rounded-2xl border border-sky-100 shadow-sm">
            <div className="w-10 h-10 bg-sky-100 text-sky-600 font-bold rounded-lg flex items-center justify-center mb-4">1</div>
            <h3 className="font-bold text-xl text-slate-800 mb-2">ระบุวันและธุระ</h3>
            <p className="text-slate-600 text-base">เลือกสถานที่ วัน เวลา และประเภทธุระที่คุณต้องการความช่วยเหลือ</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-sky-100 shadow-sm">
            <div className="w-10 h-10 bg-sky-100 text-sky-600 font-bold rounded-lg flex items-center justify-center mb-4">2</div>
            <h3 className="font-bold text-xl text-slate-800 mb-2">เลือก Companion</h3>
            <p className="text-slate-600 text-base">เลือกผู้ช่วยที่ผ่านการตรวจสอบบัตรประชาชน และมีความถนัดตรงกับความต้องการ</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-sky-100 shadow-sm">
            <div className="w-10 h-10 bg-sky-100 text-sky-600 font-bold rounded-lg flex items-center justify-center mb-4">3</div>
            <h3 className="font-bold text-xl text-slate-800 mb-2">เดินทางปลอดภัย</h3>
            <p className="text-slate-600 text-base">พบกันตามจุดนัดหมาย ให้บริการด้วยความเอาใจใส่ และประเมินรีวิวหลังเสร็จสิ้น</p>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 py-6 text-center text-sm text-slate-500">
        <Link href="/terms" className="hover:underline text-sky-700">ข้อกำหนดและความเป็นส่วนตัว</Link> • Care Companion © 2026
      </footer>
    </div>
  );
}