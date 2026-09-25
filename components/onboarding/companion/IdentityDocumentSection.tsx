"use client";

import { RefObject } from "react";

type Props = {
  documentFile: File | null;
  documentInputRef: RefObject<HTMLInputElement | null>;

  onDocumentChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function IdentityDocumentSection({
  documentFile,
  documentInputRef,
  onDocumentChange,
}: Props) {
  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
      <h2 className="text-xl font-bold text-slate-900">ยืนยันตัวตน</h2>

      <p className="text-sm text-slate-500 mt-1 mb-5">
        เอกสารจะใช้สำหรับการตรวจสอบโดยผู้ดูแลระบบ
      </p>

      <input
        ref={documentInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.pdf"
        onChange={onDocumentChange}
        className="hidden"
      />

      <button
        type="button"
        onClick={() => documentInputRef.current?.click()}
        className="w-full border-2 border-dashed border-slate-300 rounded-2xl p-8 hover:border-sky-400 hover:bg-sky-50/50 transition cursor-pointer"
      >
        {documentFile ? (
          <>
            <p className="font-semibold text-slate-700">{documentFile.name}</p>

            <p className="text-sm text-sky-600 mt-1">คลิกเพื่อเปลี่ยนไฟล์</p>
          </>
        ) : (
          <>
            <p className="font-semibold text-slate-700">
              เลือกเอกสารยืนยันตัวตน *
            </p>

            <p className="text-sm text-slate-400 mt-1">
              รองรับ JPG, PNG และ PDF ขนาดไม่เกิน 10 MB
            </p>
          </>
        )}
      </button>
    </section>
  );
}
