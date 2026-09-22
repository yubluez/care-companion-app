'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { signOut } from '@/lib/actions/auth';

export default function CompanionDashboard() {
  const [user, setUser] = useState<{ name: string; avatarUrl?: string; email?: string } | null>(null);
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

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser({
          name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'ผู้ร่วมเดินทาง',
          avatarUrl: user.user_metadata?.avatar_url,
          email: user.email,
        });
      }
    }
    loadUser();
  }, []);

  const handleApprove = (id: string) => {
    alert(`อนุมัติ Companion รหัส ${id} สำเร็จ! บัญชีนี้จะปรากฏในระบบค้นหาทันที`);
  };

  const handleReject = (id: string) => {
    const reason = prompt('กรุณาระบุเหตุผลการไม่อนุมัติ:');
    if (reason) alert(`บันทึกการไม่อนุมัติ: ${reason}`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header bar with user profile & sign out */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt="avatar"
              className="w-10 h-10 rounded-full border border-sky-200 object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-base">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'C'}
            </div>
          )}
          <div>
            <p className="text-sm font-bold text-slate-800">{user?.name || 'ผู้ร่วมเดินทาง'}</p>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full">
              ผู้ร่วมเดินทาง (Companion)
            </span>
          </div>
        </div>

        <button
          onClick={() => signOut()}
          className="text-xs text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-300 hover:border-rose-200 px-3.5 py-2 rounded-xl transition cursor-pointer font-medium"
        >
          ออกจากระบบ
        </button>
      </div>

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