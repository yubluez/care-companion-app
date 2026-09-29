"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Phone, Siren, X } from "lucide-react";

const ADMIN_PHONE_DISPLAY = "02-XXX-XXXX";
const ADMIN_PHONE_TEL = "02XXXXXXX";

export default function EmergencyContactButton() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-10 flex items-center gap-2 rounded-full bg-slate-600 p-3 text-xs font-bold text-white
                    shadow-lg shadow-slate-600/20 transition-all hover:-translate-y-0.5 hover:bg-red-600 hover:shadow-xl hover:shadow-red-600/20"
      >
        <Phone className="h-4 w-4" />
        ติดต่อฉุกเฉิน
      </button>

      {mounted &&
        open &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setOpen(false);
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="emergency-title"
              className="relative w-full max-w-sm max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6 animate-in fade-in zoom-in-95 duration-150"
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="absolute right-3.5 top-3.5 rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                aria-label="ปิดหน้าต่าง"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                <Phone className="h-6 w-6" />
              </div>

              <div className="text-center">
                <p className="mb-0.5 text-xs font-bold uppercase tracking-wider text-rose-600">
                  Emergency Contact
                </p>
                <h2
                  id="emergency-title"
                  className="text-xl font-bold text-slate-900"
                >
                  ติดต่อผู้ดูแลระบบ
                </h2>
                <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-slate-500">
                  หากเกิดปัญหาเร่งด่วนระหว่างการใช้บริการ Care Companion
                  สามารถโทรติดต่อผู้ดูแลระบบได้โดยตรง
                </p>
              </div>

              <div className="my-4 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-center">
                <p className="text-[11px] font-medium text-slate-500">
                  เบอร์โทรศัพท์ Admin
                </p>
                <p className="mt-0.5 text-xl font-extrabold tracking-wide text-slate-900">
                  {ADMIN_PHONE_DISPLAY}
                </p>
              </div>

              <a
                href={`tel:${ADMIN_PHONE_TEL}`}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:ring-offset-2"
              >
                <Phone className="h-4 w-4" />
                โทรหา Admin
              </a>

              <div className="mt-5 flex items-start gap-3 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                <p className="leading-5">
                  หากเป็นเหตุฉุกเฉินทางการแพทย์หรือมีอันตรายต่อชีวิต
                  กรุณาติดต่อสายด่วนฉุกเฉิน <strong>1669</strong>
                </p>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
