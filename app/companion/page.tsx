'use client';

import { useState } from 'react';

export default function AdminVerificationQueue() {
  const [items, setItems] = useState([
    {
      id: 'cmp-01',
      name: 'นายสมศักดิ์ ขยันยิ่ง',
      phone: '089-111-2222',
      status: 'pending',
      bio: 'มีประสบการณ์เข็นรถเข็นผู้สูงอายุ 3 ปี',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  ]);

  const handleApprove = (id: string) => {
    alert(`อนุมัติ Companion รหัส ${id} สำเร็จ! บัญชีนี้จะปรากฏในระบบค้นหาทันที`);
  };

  const handleReject = (id: string) => {
    const reason = prompt('กรุณาระบุเหตุผลการไม่อนุมัติ:');
    if (reason) alert(`บันทึกการไม่อนุมัติ: ${reason}`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">คิวตรวจสอบและอนุมัติเอกสาร Companion (KYC)</h1>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img src={item.avatarUrl} alt={item.name} className="w-16 h-16 rounded-2xl object-cover border" />
              <div>
                <h3 className="font-bold text-lg text-slate-800">{item.name}</h3>
                <p className="text-slate-600 text-sm">{item.bio}</p>
                <span className="text-xs text-slate-400">เบอร์โทร: {item.phone}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleReject(item.id)}
                className="px-4 py-2 border border-rose-300 text-rose-600 hover:bg-rose-50 font-semibold rounded-xl text-sm"
              >
                ไม่อนุมัติ
              </button>
              <button
                onClick={() => handleApprove(item.id)}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm"
              >
                อนุมัติผ่าน
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}