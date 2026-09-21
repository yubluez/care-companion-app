'use client';

import { useRouter } from 'next/navigation';

export default function SelectRolePage() {
  const router = useRouter();

  return (
    <div className="max-w-xl mx-auto px-4 py-12 text-center">
      <h1 className="text-3xl font-extrabold text-slate-800 mb-2">เลือกประเภทการใช้งาน</h1>
      <p className="text-slate-600 mb-8">
        กรุณาเลือกบทบาทของคุณในระบบ <br/>
        <span className="text-amber-600 font-semibold">(เมื่อเลือกแล้วจะไม่สามารถเปลี่ยนเองได้ในภายหลัง)</span>
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <button
          onClick={() => router.push('/onboarding/customer')}
          className="p-6 bg-white border-2 border-sky-200 hover:border-sky-600 rounded-3xl text-left transition hover:shadow-lg group"
        >
          <div className="text-3xl mb-3">🚶‍♂️</div>
          <h2 className="text-2xl font-bold text-slate-800 group-hover:text-sky-600 mb-2">ผู้ต้องการผู้ช่วย (Customer)</h2>
          <p className="text-slate-600 text-sm">สำหรับผู้ที่ต้องการหาเพื่อนร่วมทางไปพบแพทย์ ไปธนาคาร หรือทำธุระต่าง ๆ</p>
        </button>

        <button
          onClick={() => router.push('/onboarding/companion')}
          className="p-6 bg-white border-2 border-sky-200 hover:border-sky-600 rounded-3xl text-left transition hover:shadow-lg group"
        >
          <div className="text-3xl mb-3">🤝</div>
          <h2 className="text-2xl font-bold text-slate-800 group-hover:text-sky-600 mb-2">ผู้ร่วมเดินทาง (Companion)</h2>
          <p className="text-slate-600 text-sm">สำหรับผู้ให้บริการพาผู้อื่นเดินทางและช่วยอำนวยความสะดวกในการทำธุระ</p>
        </button>
      </div>
    </div>
  );
}