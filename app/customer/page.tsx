import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

import CustomerActions from "@/components/customer/CustomerActions";
import RecentRequest from "@/components/customer/RecentRequest";
import Recommended from "@/components/customer/home/Recommended";

export default async function CustomerPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let pendingCount = 0;
  let activeCount = 0;

  if (user) {
    const [pendingResult, activeResult] = await Promise.all([
      supabase
        .from("service_requests")
        .select("id", { count: "exact", head: true })
        .eq("customer_id", user.id)
        .eq("status", "pending"),

      supabase
        .from("service_requests")
        .select("id", { count: "exact", head: true })
        .eq("customer_id", user.id)
        .in("status", ["accepted", "in_progress"]),
    ]);

    if (pendingResult.error) {
      console.error("Pending count error:", pendingResult.error);
    }

    if (activeResult.error) {
      console.error("Active count error:", activeResult.error);
    }

    pendingCount = pendingResult.count ?? 0;
    activeCount = activeResult.count ?? 0;
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl space-y-10 px-4 py-8 sm:px-6 lg:py-12">
        {/* Welcome */}
        <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-sm font-semibold text-sky-600">
              CARE COMPANION
            </p>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              วันนี้ต้องการให้เราช่วยอะไร?
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              ค้นหาเพื่อนร่วมทาง สร้างคำขอ และติดตามการใช้บริการของคุณ
            </p>
          </div>

          <Link
            href="/customer/requests/new"
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
          >
            + เพิ่มคำขอใหม่
          </Link>
        </section>

        {/* Main Actions */}
        <CustomerActions
          pendingCount={pendingCount}
          activeCount={activeCount}
        />

        {/* Recent Request */}
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900">คำขอล่าสุด</h2>

              <p className="mt-1 text-sm text-slate-500">
                ติดตามคำขอใช้บริการล่าสุดของคุณ
              </p>
            </div>

            <Link
              href="/customer/requests"
              className="shrink-0 text-sm font-semibold text-sky-600 hover:text-sky-700"
            >
              ดูทั้งหมด
            </Link>
          </div>

          <RecentRequest />
        </section>

        {/* Recommended */}
        <section className="space-3">
          <Recommended />
        </section>
      </div>
    </main>
  );
}
