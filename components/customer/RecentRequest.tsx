import React from "react";

export default function RecentRequest() {
  return (
    <div>
      {/* Recent Request */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-800">คำขอล่าสุด</h2>

          <a
            href="/customer/requests"
            className="text-sm text-sky-600 font-semibold"
          >
            ดูทั้งหมด →
          </a>
        </div>

        <div
          className="bg-white border border-slate-200
                          rounded-2xl p-6 shadow-sm
                          hover:shadow-md transition"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 bg-sky-50
                                rounded-xl flex items-center
                                justify-center text-2xl"
              >
                🏥
              </div>

              <div>
                <h3 className="font-bold text-slate-800">ไปโรงพยาบาลศิริราช</h3>

                <p className="text-sm text-slate-500 mt-1">
                  26 กันยายน 2569 • 09:00 น.
                </p>
              </div>
            </div>

            <span
              className="bg-amber-50 text-amber-600
                               text-sm font-semibold
                               px-4 py-2 rounded-full"
            >
              กำลังค้นหาผู้ช่วย
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
