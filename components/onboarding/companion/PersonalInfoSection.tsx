"use client";

import { RefObject } from "react";

type Props = {
  fullName: string;
  setFullName: (value: string) => void;
  email: string;
  phone: string;
  setPhone: (value: string) => void;

  avatarPreview: string;
  avatarInputRef: RefObject<HTMLInputElement | null>;
  onAvatarChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function PersonalInfoSection({
  fullName,
  setFullName,
  email,
  phone,
  setPhone,
  avatarPreview,
  avatarInputRef,
  onAvatarChange,
}: Props) {
  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
      <h2 className="text-xl font-bold text-slate-900 mb-6">ข้อมูลส่วนตัว</h2>

      {/* Avatar */}
      <div className="flex items-center gap-5 mb-7">
        {avatarPreview ? (
          <img
            src={avatarPreview}
            alt="Profile"
            className="w-20 h-20 rounded-full object-cover border border-slate-200"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-2xl font-bold">
            {(fullName || "C").charAt(0).toUpperCase()}
          </div>
        )}

        <div>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            onChange={onAvatarChange}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            className="text-sm font-semibold text-sky-600 border border-sky-200 rounded-xl px-4 py-2 hover:bg-sky-50 cursor-pointer"
          >
            เปลี่ยนรูปโปรไฟล์
          </button>

          <p className="text-xs text-slate-400 mt-2">
            JPG หรือ PNG ขนาดไม่เกิน 5 MB
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Name */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            ชื่อ-นามสกุล *
          </label>

          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            maxLength={100}
            className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            อีเมล
          </label>

          <input
            value={email}
            disabled
            className="w-full border border-slate-200 bg-slate-50 text-slate-500 rounded-xl px-4 py-3"
          />

          <p className="text-xs text-slate-400 mt-1.5">
            ✓ เข้าสู่ระบบผ่าน Google
          </p>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            เบอร์โทรศัพท์ *
          </label>

          <input
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
            }
            placeholder="0812345678"
            className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          />
        </div>
      </div>
    </section>
  );
}
