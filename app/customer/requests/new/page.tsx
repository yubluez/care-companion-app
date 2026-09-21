'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function NewRequestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const companionId = searchParams.get('companion') || 'cmp-01';

  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [formData, setFormData] = useState({
    category: 'medical',
    date: '',
    time: '',
    duration: '180',
    originArea: 'บางแค',
    pickupDetail: '',
    destination: '',
    phone: '',
    offeredFee: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disclaimerAccepted) {
      alert('กรุณาทำเครื่องหมายยอมรับเงื่อนไขข้อจำกัดทางการแพทย์ก่อนส่งคำขอ');
      return;
    }
    // ตัวอย่างการส่งและ Redirect
    router.push('/customer/requests/req-123');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">สร้างคำขอเดินทางใหม่</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-sky-100 shadow-sm space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">รหัส Companion ที่เลือก</label>
          <input
            type="text"
            value={companionId}
            disabled
            className="w-full bg-slate-100 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-600 font-medium"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">ประเภทของธุระ</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:border-sky-600 outline-none"
          >
            <option value="medical">ไปพบแพทย์ / โรงพยาบาล</option>
            <option value="bank">ติดต่อธนาคาร / การเงิน</option>
            <option value="gov">ติดต่อหน่วยงานราชการ</option>
            <option value="shopping">ซื้อของ / ตลาด</option>
            <option value="other">อื่น ๆ</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">วันที่ต้องการเดินทาง</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:border-sky-600 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">เวลาเริ่มนัดหมาย</label>
            <input
              type="time"
              required
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:border-sky-600 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            จุดนัดพบต้นทางแบบละเอียด <span className="text-amber-600">(ข้อมูลนี้จะถูกซ่อนจนกว่า Companion จะรับงาน)</span>
          </label>
          <textarea
            required
            rows={2}
            placeholder="เช่น ป้ายรถเมล์หน้าคอนโด... ซอย..."
            value={formData.pickupDetail}
            onChange={(e) => setFormData({ ...formData, pickupDetail: e.target.value })}
            className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:border-sky-600 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">สถานที่ปลายทาง</label>
          <input
            type="text"
            required
            placeholder="เช่น อาคารผู้ป่วยนอก โรงพยาบาลศิริราช"
            value={formData.destination}
            onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
            className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:border-sky-600 outline-none"
          />
        </div>

        {/* จุดที่ 3: Checkbox Disclaimer ตามหัวข้อ 5.4 */}
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              required
              checked={disclaimerAccepted}
              onChange={(e) => setDisclaimerAccepted(e.target.checked)}
              className="mt-1 w-5 h-5 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
            />
            <span className="text-sm text-slate-800 leading-snug">
              ข้าพเจ้ารับทราบและยอมรับว่า **Companion มีหน้าที่ช่วยเหลือในการร่วมเดินทางและทำธุระเท่านั้น ไม่ใช่บริการทางการแพทย์หรือบุคลากรทางการพยาบาล**
            </span>
          </label>
        </div>

        <button
          type="submit"
          className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3.5 rounded-2xl shadow transition"
        >
          ส่งคำขอเดินทาง
        </button>
      </form>
    </div>
  );
}