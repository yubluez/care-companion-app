import CustomerActions from "@/components/customer/CustomerActions";
import NavBarCus from "@/components/customer/NavBarCus";
import RecentRequest from "@/components/customer/RecentRequest";
import Recommended from "@/components/customer/Recommended";

export default function CustomerPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Welcome */}
        <section className="flex items-center justify-between mb-8">
          <div>
            <p className="text-sky-600 font-semibold mb-1">
              ยินดีต้อนรับกลับมา
            </p>

            <h1 className="text-3xl font-bold text-slate-800">
              วันนี้ต้องการให้เราช่วยอะไร?
            </h1>

            <p className="text-slate-500 mt-2">
              ค้นหาเพื่อนร่วมทาง หรือสร้างคำขอเพื่อรับความช่วยเหลือ
            </p>
          </div>

          <a
            href="/customer/requests/new"
            className="bg-sky-600 hover:bg-sky-700 text-white
                       font-semibold px-6 py-3 rounded-xl
                       shadow-sm transition"
          >
            + เพิ่มคำขอใหม่
          </a>
        </section>

        {/* Main Cards */}
        <CustomerActions />

        {/* Recent Request */}
        <RecentRequest />

        {/* Quick Actions */}
        <Recommended />

        {/* Companion 1 */}
        <div className="max-w-[400px] bg-white border border-slate-200 rounded-2xl p-5 hover:border-sky-300 hover:shadow-md transition">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 rounded-full bg-sky-100 flex items-center justify-center text-2xl">
              👤
            </div>

            <div>
              <h3 className="font-bold text-slate-800">สมชาย ใจดี</h3>

              <p className="text-sm text-amber-500 mt-1">
                ⭐ 4.9
                <span className="text-slate-400"> (32 รีวิว)</span>
              </p>
            </div>
          </div>

          <div className="space-y-2 text-sm text-slate-500 mb-5">
            <p>📍 กรุงเทพมหานคร</p>
            <p>🤝 ให้บริการมาแล้ว 24 ครั้ง</p>
          </div>

          <a
            href="/customer/compsearch"
            className="block w-full text-center border border-sky-200 text-sky-600 font-semibold py-2.5 rounded-xl hover:bg-sky-600 hover:text-white transition"
          >
            ดูโปรไฟล์
          </a>
        </div>
      </main>
    </div>
  );
}
