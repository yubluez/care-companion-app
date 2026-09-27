import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import AdminSummaryCard from "@/components/admin/dashboard/AdminSummaryCard";

export default async function AdminPage() {
  const supabase = await createClient();

  const [
    { count: customerCount },
    { count: companionCount },
    { count: pendingCount },
    { count: requestCount },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("role", "customer"),

    supabase
      .from("profiles")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("role", "companion"),

    supabase
      .from("companion_profiles")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("verification_status", "pending"),

    supabase.from("service_requests").select("*", {
      count: "exact",
      head: true,
    }),
  ]);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div>
          <p className="text-sm font-semibold text-slate-400">ADMIN</p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">Dashboard</h1>

          <p className="mt-2 text-slate-500">ภาพรวมระบบ Care Companion</p>
        </div>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AdminSummaryCard
            title="Customer"
            value={customerCount ?? 0}
            description="ผู้ใช้บริการทั้งหมด"
          />

          <AdminSummaryCard
            title="Companion"
            value={companionCount ?? 0}
            description="Companion ทั้งหมด"
          />

          <AdminSummaryCard
            title="รอตรวจสอบ"
            value={pendingCount ?? 0}
            description="ใบสมัคร Companion"
          />

          <AdminSummaryCard
            title="Service Requests"
            value={requestCount ?? 0}
            description="คำขอใช้บริการทั้งหมด"
          />
        </section>

        <section className="mt-8">
          <h2 className="mb-4 text-xl font-bold text-slate-900">จัดการระบบ</h2>

          <div className="grid gap-4 md:grid-cols-3">
            <AdminAction
              title="ตรวจสอบ Companion"
              description="ตรวจข้อมูลและเอกสารของผู้สมัคร Companion"
              href="/admin/companions"
              button="ตรวจสอบใบสมัคร"
            />

            <AdminAction
              title="Service Requests"
              description="ตรวจสอบคำขอใช้บริการภายในระบบ"
              href="/admin/requests"
              button="ดูคำขอทั้งหมด"
            />

            <AdminAction
              title="ผู้ใช้งาน"
              description="ดู Customer และ Companion ภายในระบบ"
              href="/admin/users"
              button="ดูผู้ใช้งาน"
            />
          </div>
        </section>

        {(pendingCount ?? 0) > 0 && (
          <section className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="font-bold text-amber-800">
                  มีใบสมัคร Companion รอตรวจสอบ
                </p>

                <p className="mt-1 text-sm text-amber-700">
                  มี {pendingCount} ใบสมัครที่ยังไม่ได้รับการตรวจสอบ
                </p>
              </div>

              <Link
                href="/admin/companions"
                className="rounded-xl bg-amber-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-amber-700"
              >
                ตรวจสอบตอนนี้
              </Link>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function AdminAction({
  title,
  description,
  href,
  button,
}: {
  title: string;
  description: string;
  href: string;
  button: string;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="font-bold text-slate-900">{title}</h3>

      <p className="mt-2 min-h-10 text-sm text-slate-500">{description}</p>

      <Link
        href={href}
        className="mt-5 inline-flex rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 cursor-pointer shadow-sm"
      >
        {button}
      </Link>
    </article>
  );
}
