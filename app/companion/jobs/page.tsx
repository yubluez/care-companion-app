'use client';

import { useState } from 'react';

export default function CompanionJobsPage() {
  const [requests, setRequests] = useState([
    {
      id: 'req-001',
      customerName: 'คุณสมศรี',
      serviceType: 'ไปพบแพทย์ (รพ.รามาธิบดี)',
      date: '2026-09-25',
      time: '09:00 - 12:00 น.',
      area: 'พญาไท',
      fee: '500 บาท',
    },
  ]);

  const handleAccept = (id: string) => {
    alert(`รับงานรหัส ${id} สำเร็จ! คุณจะสามารถเห็นเบอร์โทรและจุดนัดพบของลูกค้าได้ทันที`);
  };

  const handleReject = (id: string) => {
    alert(`ปฏิเสธคำขอ ${id} เรียบร้อยแล้ว`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">คำขอใหม่ที่รอการตอบรับ</h1>

      <div className="space-y-4">
        {requests.map((req) => (
          <div key={req.id} className="bg-white p-6 rounded-3xl border border-sky-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <span className="bg-sky-100 text-sky-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {req.serviceType}
              </span>
              <h3 className="text-lg font-bold text-slate-800">{req.customerName} ({req.area})</h3>
              <p className="text-slate-600 text-sm">📅 วันที่: {req.date} เวลา: {req.time}</p>
              <p className="text-slate-500 text-xs text-amber-700">
                🔒 เบอร์โทรและจุดนัดพบละเอียดจะเปิดเผยหลังจากท่านกด "รับงาน"
              </p>
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <button
                onClick={() => handleReject(req.id)}
                className="flex-1 md:flex-none px-4 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold rounded-xl text-sm transition"
              >
                ปฏิเสธ
              </button>
              <button
                onClick={() => handleAccept(req.id)}
                className="flex-1 md:flex-none px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-sm transition shadow"
              >
                รับงาน
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}