import RequestList from "@/components/customer/requests/RequestList";

export default function RequestsPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <p className="text-sky-600 font-semibold mb-1">คำขอใช้บริการ</p>

          <h1 className="text-3xl font-bold text-slate-900">คำขอของฉัน</h1>

          <p className="text-slate-500 mt-2">
            ติดตามสถานะและดูประวัติคำขอใช้บริการของคุณ
          </p>
        </div>

        <RequestList />
      </div>
    </main>
  );
}
