import Link from "next/link";
import {
  Users,
  HeartHandshake,
  Clock,
  ClipboardList,
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  FileCheck2,
  CalendarDays,
  Sparkles,
  MapPin,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import AdminSummaryCard from "@/components/admin/dashboard/AdminSummaryCard";
import RequestStatusBadge from "@/components/admin/requests/RequestStatusBadge";
import type { RequestStatus } from "@/components/admin/requests/types";

export default async function AdminPage() {
  const supabase = await createClient();

  // ─────────────────────────────────────────────
  // 1. Parallel Fetch Stats & Recent Activity
  // ─────────────────────────────────────────────
  const [
    { count: customerCount },
    { count: companionCount },
    { count: pendingCount },
    { count: requestCount },
    { count: pendingReqCount },
    { count: activeReqCount },
    { count: completedReqCount },
    { data: recentRequestRows },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "customer"),

    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "companion"),

    supabase
      .from("companion_profiles")
      .select("*", { count: "exact", head: true })
      .eq("verification_status", "pending"),

    supabase
      .from("service_requests")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("service_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),

    supabase
      .from("service_requests")
      .select("*", { count: "exact", head: true })
      .in("status", ["accepted", "in_progress"]),

    supabase
      .from("service_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed"),

    supabase
      .from("service_requests")
      .select(
        `
        id,
        customer_id,
        companion_id,
        category_id,
        service_date,
        start_time,
        destination_name,
        offered_fee,
        status,
        created_at
      `,
      )
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  // ─────────────────────────────────────────────
  // 2. Fetch Profiles & Categories for Recent Requests
  // ─────────────────────────────────────────────
  const userIds = Array.from(
    new Set(
      (recentRequestRows ?? [])
        .map((r) => r.customer_id)
        .filter((id): id is string => Boolean(id)),
    ),
  );

  const categoryIds = Array.from(
    new Set(
      (recentRequestRows ?? [])
        .map((r) => r.category_id)
        .filter((id): id is string => Boolean(id)),
    ),
  );

  const [profilesRes, categoriesRes] = await Promise.all([
    userIds.length > 0
      ? supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", userIds)
      : Promise.resolve({ data: [] }),
    categoryIds.length > 0
      ? supabase
          .from("service_categories")
          .select("id, name")
          .in("id", categoryIds)
      : Promise.resolve({ data: [] }),
  ]);

  const profilesMap = new Map(
    (profilesRes.data ?? []).map((p) => [p.id, p]),
  );
  const categoriesMap = new Map(
    (categoriesRes.data ?? []).map((c) => [c.id, c]),
  );

  const recentRequests = (recentRequestRows ?? []).map((req) => {
    const customer = req.customer_id ? profilesMap.get(req.customer_id) : null;
    const category = req.category_id ? categoriesMap.get(req.category_id) : null;

    return {
      ...req,
      customerName: customer?.full_name || "ไม่ระบุชื่อ",
      customerAvatar: customer?.avatar_url || null,
      categoryName: category?.name || "บริการ Companion",
    };
  });

  return (
    <main className="min-h-screen bg-slate-50/60 pb-16">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* ─── Header ───────────────────────────────────────────── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {/* <div className="flex items-center gap-2">
              <span className="rounded-md bg-sky-100 px-2 py-0.5 text-xs font-bold text-sky-700">
                ADMIN
              </span>
              <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                ระบบทำงานปกติ
              </span>
            </div> */}

            <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Dashboard
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              ภาพรวมระบบและการดำเนินงาน Care Companion
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/requests"
              className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-sky-700 cursor-pointer"
            >
              <span>ดูคำขอทั้งหมด</span>
              {/* <ArrowRight className="h-4 w-4" /> */}
            </Link>
          </div>
        </div>

        {/* ─── Alert: Pending Companions ───────────────────────── */}
        {(pendingCount ?? 0) > 0 && (
          <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50/90 p-4 sm:flex-row sm:items-center sm:justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-900">
                  มีใบสมัคร Companion รอการตรวจสอบ {pendingCount} รายการ
                </p>
                <p className="text-xs text-amber-700">
                  โปรดตรวจสอบข้อมูลและเอกสารประจำตัวเพื่ออนุมัติหรือปฏิเสธผู้ให้บริการ
                </p>
              </div>
            </div>

            <Link
              href="/admin/companions?status=pending"
              className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-amber-700 cursor-pointer"
            >
              <span>ตรวจสอบใบสมัคร</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}

        {/* ─── Key Metrics / Summary Cards ─────────────────────── */}
        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AdminSummaryCard
            title="Customer"
            value={customerCount ?? 0}
            description="ผู้ใช้บริการทั้งหมดในระบบ"
            icon={<Users className="h-5 w-5 text-sky-600" />}
            href="/admin/users?role=customer"
          />

          <AdminSummaryCard
            title="Companion"
            value={companionCount ?? 0}
            description="ผู้ให้บริการทั้งหมดในระบบ"
            icon={<HeartHandshake className="h-5 w-5 text-indigo-600" />}
            href="/admin/companions"
          />

          <AdminSummaryCard
            title="รอตรวจสอบ"
            value={pendingCount ?? 0}
            description="ใบสมัคร Companion ที่ค้างตรวจ"
            icon={<Clock className="h-5 w-5 text-amber-600" />}
            href="/admin/companions?status=pending"
            badge={
              (pendingCount ?? 0) > 0
                ? { text: "ต้องดำเนินการ", variant: "warning" }
                : { text: "เรียบร้อย", variant: "success" }
            }
          />

          <AdminSummaryCard
            title="Service Requests"
            value={requestCount ?? 0}
            description="คำขอใช้บริการทั้งหมดในระบบ"
            icon={<ClipboardList className="h-5 w-5 text-blue-600" />}
            href="/admin/requests"
          />
        </section>

        {/* ─── Main Content Grid: Recent Activity & Status Overview ── */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column: Recent Requests (8 cols) */}
          <section className="lg:col-span-8">
            <div className="rounded-3xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    คำขอใช้บริการล่าสุด
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    รายการคำขอล่าสุดที่ส่งเข้ามาในระบบ
                  </p>
                </div>

                <Link
                  href="/admin/requests"
                  className="text-xs font-semibold text-sky-600 transition hover:text-sky-700 cursor-pointer"
                >
                  ดูทั้งหมด ({requestCount ?? 0})
                </Link>
              </div>

              {recentRequests.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                    <ClipboardList className="h-6 w-6" />
                  </div>
                  <p className="mt-3 font-semibold text-slate-700">
                    ยังไม่มีคำขอใช้บริการ
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    เมื่อมีลูกค้าส่งคำขอ รายการจะแสดงขึ้นที่นี่
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentRequests.map((req) => (
                    <div
                      key={req.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 transition hover:bg-slate-50/70"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        {req.customerAvatar ? (
                          <img
                            src={req.customerAvatar}
                            alt={req.customerName}
                            className="h-10 w-10 shrink-0 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-100 font-bold text-sky-700 text-sm">
                            {req.customerName.charAt(0).toUpperCase()}
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-sm text-slate-900 truncate">
                              {req.customerName}
                            </span>
                            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                              {req.categoryName}
                            </span>
                            <RequestStatusBadge
                              status={req.status as RequestStatus}
                            />
                          </div>

                          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                              {formatDate(req.service_date)}{" "}
                              {formatTime(req.start_time)}
                            </span>
                            {req.destination_name && (
                              <span className="flex items-center gap-1 truncate max-w-xs">
                                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                                {req.destination_name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <div className="text-left sm:text-right">
                          <p className="text-xs text-slate-400">ค่าบริการ</p>
                          <p className="text-sm font-bold text-emerald-600">
                            {req.offered_fee != null
                              ? `฿${Number(req.offered_fee).toLocaleString("th-TH")}`
                              : "-"}
                          </p>
                        </div>

                        <Link
                          href={`/admin/requests/${req.id}`}
                          className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700 cursor-pointer"
                        >
                          รายละเอียด
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Right Column: Status Breakdown & Quick Access (4 cols) */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Status Breakdown Box */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-4">
                สถานะคำขอในระบบ
              </h3>

              <div className="space-y-2.5">
                <Link
                  href="/admin/requests?status=pending"
                  className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 transition hover:border-amber-200 hover:bg-amber-50/40 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                    <span className="text-xs font-semibold text-slate-700 group-hover:text-amber-900">
                      รอรับงาน (Pending)
                    </span>
                  </div>
                  <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-bold text-slate-700 shadow-2xs">
                    {pendingReqCount ?? 0}
                  </span>
                </Link>

                <Link
                  href="/admin/requests?status=in_progress"
                  className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 transition hover:border-sky-200 hover:bg-sky-50/40 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
                    <span className="text-xs font-semibold text-slate-700 group-hover:text-sky-900">
                      กำลังดำเนินการ / รับแล้ว
                    </span>
                  </div>
                  <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-bold text-slate-700 shadow-2xs">
                    {activeReqCount ?? 0}
                  </span>
                </Link>

                <Link
                  href="/admin/requests?status=completed"
                  className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 transition hover:border-emerald-200 hover:bg-emerald-50/40 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    <span className="text-xs font-semibold text-slate-700 group-hover:text-emerald-900">
                      เสร็จสิ้น (Completed)
                    </span>
                  </div>
                  <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-bold text-slate-700 shadow-2xs">
                    {completedReqCount ?? 0}
                  </span>
                </Link>
              </div>
            </div>

            {/* Quick Management Shortcuts */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-3">
                จัดการระบบ
              </h3>

              <div className="space-y-2">
                <Link
                  href="/admin/companions"
                  className="group flex items-center justify-between rounded-2xl border border-slate-100 p-3 transition hover:border-sky-200 hover:bg-sky-50/30 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600 transition group-hover:bg-sky-600 group-hover:text-white">
                      <FileCheck2 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        ตรวจสอบ Companion
                      </p>
                      <p className="text-[11px] text-slate-400">
                        ตรวจเอกสารและอนุมัติผู้สมัคร
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {(pendingCount ?? 0) > 0 && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                        {pendingCount} รอตรวจ
                      </span>
                    )}
                    <ChevronRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-sky-600" />
                  </div>
                </Link>

                <Link
                  href="/admin/requests"
                  className="group flex items-center justify-between rounded-2xl border border-slate-100 p-3 transition hover:border-sky-200 hover:bg-sky-50/30 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                      <ClipboardList className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        คำขอใช้บริการ
                      </p>
                      <p className="text-[11px] text-slate-400">
                        ตรวจสอบสถานะและจัดสรรงาน
                      </p>
                    </div>
                  </div>

                  <ChevronRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-sky-600" />
                </Link>

                <Link
                  href="/admin/users"
                  className="group flex items-center justify-between rounded-2xl border border-slate-100 p-3 transition hover:border-sky-200 hover:bg-sky-50/30 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">
                      <Users className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        ผู้ใช้งานทั้งหมด
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Customer และ Companion
                      </p>
                    </div>
                  </div>

                  <ChevronRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-sky-600" />
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function formatDate(date: string) {
  if (!date) return "-";
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function formatTime(time: string) {
  if (!time) return "-";
  return `${time.slice(0, 5)} น.`;
}
