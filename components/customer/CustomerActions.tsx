import React from "react";

export default function CustomerActions() {
  return (
    <div>
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* Find Companion */}
        <div
          className="bg-gradient-to-br from-sky-500 to-blue-600
                          text-white rounded-3xl p-8 shadow-sm"
        >
          <div className="text-4xl mb-5">🤝</div>

          <h2 className="text-2xl font-bold mb-2">ต้องการเพื่อนร่วมทาง?</h2>

          <p className="text-sky-100 mb-7">
            ค้นหาผู้ร่วมเดินทางที่เหมาะสม เพื่อช่วยคุณไปโรงพยาบาล ธนาคาร
            หรือทำธุระต่าง ๆ
          </p>

          <a
            href="/customer/compsearch"
            className="inline-block bg-white text-sky-700
                         font-semibold px-5 py-3 rounded-xl
                         hover:bg-sky-50 transition"
          >
            ค้นหาเพื่อนร่วมทาง →
          </a>
        </div>

        {/* My Requests */}
        <div
          className="bg-white border border-slate-200
                          rounded-3xl p-8 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-slate-500 text-sm">คำขอของฉัน</p>

              <h2 className="text-2xl font-bold text-slate-800 mt-1">
                ติดตามคำขอของคุณ
              </h2>
            </div>

            <div
              className="w-12 h-12 rounded-2xl
                              bg-sky-100 flex items-center
                              justify-center text-2xl"
            >
              📋
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-amber-50 rounded-2xl p-4">
              <p className="text-2xl font-bold text-amber-600">2</p>
              <p className="text-sm text-slate-500">กำลังรอ</p>
            </div>

            <div className="bg-sky-50 rounded-2xl p-4">
              <p className="text-2xl font-bold text-sky-600">1</p>
              <p className="text-sm text-slate-500">กำลังดำเนินการ</p>
            </div>
          </div>

          <a
            href="/customer/requests"
            className="text-sky-600 font-semibold hover:text-sky-700"
          >
            ดูคำขอทั้งหมด →
          </a>
        </div>
      </section>
    </div>
  );
}
