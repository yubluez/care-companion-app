'use client';

import { useState } from 'react';
import Swal from 'sweetalert2';

export default function RequestDetailPage({ params }: { params: { id: string } }) {
  // จำลองสถานะคำขอ: 'pending' | 'accepted' | 'in_progress' | 'completed'
  const [status, setStatus] = useState<'pending' | 'accepted' | 'completed'>('pending');

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white p-6 rounded-3xl border border-sky-100 shadow-sm space-y-6">
        <div className="flex justify-between items-center border-b pb-4">
          <h1 className="text-xl font-bold text-slate-800">คำขอ #{params.id}</h1>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-sky-800'
          }`}>
            สถานะ: {status === 'pending' ? 'รอตอบรับ' : 'รับงานแล้ว'}
          </span>
        </div>

        <div className="space-y-3">
          <p className="text-slate-600"><strong>ธุระ:</strong> พบแพทย์ตามนัด</p>
          <p className="text-slate-600"><strong>สถานที่ปลายทาง:</strong> โรงพยาบาลศิริราช</p>
          <p className="text-slate-600"><strong>Companion:</strong> สมชาย ใจดี</p>
          
          {/* เงื่อนไข Privacy Matrix: เบอร์โทร Companion จะแสดงหลังรับงานแล้วเท่านั้น */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-sm text-slate-500 block">เบอร์ติดต่อ Companion:</span>
            {status === 'pending' ? (
              <span className="font-semibold text-slate-400">•••••••••• (จะแสดงเมื่อ Companion รับงานแล้ว)</span>
            ) : (
              <span className="font-bold text-sky-700 text-lg">081-234-5678</span>
            )}
          </div>
        </div>

        {status === 'pending' && (
          <button
            onClick={async () => {
              const res = await Swal.fire({
                title: 'ยืนยันการยกเลิกคำขอ?',
                text: 'คุณต้องการยกเลิกคำขอนี้ใช่หรือไม่?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'ยืนยันยกเลิก',
                cancelButtonText: 'กลับ',
                confirmButtonColor: '#e11d48',
                cancelButtonColor: '#64748b',
                reverseButtons: true,
              });

              if (res.isConfirmed) {
                await Swal.fire({
                  title: 'ยกเลิกคำขอเรียบร้อยแล้ว',
                  icon: 'success',
                  confirmButtonColor: '#0284c7',
                  confirmButtonText: 'ตกลง',
                });
              }
            }}
            className="w-full cursor-pointer bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold py-3 rounded-2xl border border-rose-200 transition"
          >
            ยกเลิกคำขอ
          </button>
        )}
      </div>
    </div>
  );
}