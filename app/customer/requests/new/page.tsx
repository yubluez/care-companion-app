import { Suspense } from "react";
import NewRequestForm from "@/components/customer/requests/NewRequestForm";

export default function NewRequestPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <p className="text-sky-600 font-semibold mb-1">คำขอใช้บริการ</p>

          <h1 className="text-3xl font-bold text-slate-900">เพิ่มคำขอ</h1>

          <p className="text-slate-500 mt-2">
            ระบุรายละเอียดธุระและช่วงเวลาที่คุณต้องการใช้บริการ
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-600 border-t-transparent" />
            </div>
          }
        >
          <NewRequestForm />
        </Suspense>
      </div>
    </main>
  );
}
