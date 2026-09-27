import Link from "next/link";
import { ClipboardList, Search, ArrowRight } from "lucide-react";

type Props = {
  pendingCount: number;
  activeCount: number;
};

export default function CustomerActions({ pendingCount, activeCount }: Props) {
  return (
    <section className="grid gap-5 md:grid-cols-2">
      {/* ค้นหา Companion */}
      <div className="flex flex-col justify-between rounded-3xl bg-gradient-to-br from-sky-500 to-blue-700 p-7 text-white shadow-sm">
        <div>
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
            <Search size={25} />
          </div>

          <h2 className="text-2xl font-bold">ต้องการเพื่อนร่วมทาง?</h2>

          <p className="mt-3 max-w-md text-sm leading-6 text-sky-50">
            ค้นหา Companion เพื่อช่วยเหลือและอำนวยความสะดวก
            ในการเดินทางไปทำธุระต่าง ๆ
          </p>
        </div>

        <Link
          href="/customer/compsearch"
          className="mt-7 inline-flex w-fit cursor-pointer items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-blue-700 transition hover:bg-sky-50 shadow-sm"
        >
          ค้นหา Companion
          <ArrowRight size={17} />
        </Link>
      </div>

      {/* สรุปคำขอ */}
      <div className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
        <div>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">ภาพรวมการใช้บริการ</p>

              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                คำขอของฉัน
              </h2>
            </div>

            <div className="rounded-2xl bg-sky-50 p-3 text-sky-600">
              <ClipboardList size={25} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-amber-50 p-5">
              <p className="text-3xl font-bold text-amber-600">
                {pendingCount}
              </p>
              <p className="mt-2 text-sm text-slate-600">รอตอบรับ</p>
            </div>

            <div className="rounded-2xl bg-sky-50 p-5">
              <p className="text-3xl font-bold text-sky-600">{activeCount}</p>
              <p className="mt-2 text-sm text-slate-600">กำลังดำเนินการ</p>
            </div>
          </div>
        </div>

        <Link
          href="/customer/requests"
          className="mt-7 inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-700"
        >
          ดูคำขอทั้งหมด
          <ArrowRight size={17} />
        </Link>
      </div>
    </section>
  );
}
