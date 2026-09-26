import { redirect } from "next/navigation";
import RequestList from "@/components/customer/requests/RequestList";
import { getCustomerRequests } from "@/lib/queries/customerRequests";
import { createClient } from "@/lib/supabase/server";

export default async function RequestsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const requests = await getCustomerRequests();

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <p className="mb-1 font-semibold text-sky-600">คำขอใช้บริการ</p>

          <h1 className="text-3xl font-bold text-slate-900">คำขอของฉัน</h1>

          <p className="mt-2 text-slate-500">
            ติดตามสถานะและดูประวัติคำขอใช้บริการของคุณ
          </p>
        </div>

        <RequestList requests={requests} />
      </div>
    </main>
  );
}
