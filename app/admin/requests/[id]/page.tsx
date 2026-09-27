import Link from "next/link";
import { notFound } from "next/navigation";

import AdminRequestActions from "@/components/admin/requests/AdminRequestActions";
import RequestStatusBadge from "@/components/admin/requests/RequestStatusBadge";
import type { RequestStatus } from "@/components/admin/requests/types";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminRequestDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  // ─────────────────────────────────────────────
  // 1. Fetch Service Request
  // ─────────────────────────────────────────────
  const { data: request, error: requestError } = await supabase
    .from("service_requests")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (requestError) {
    console.error("Load admin request detail error:", requestError);
  }

  if (!request) {
    notFound();
  }

  // ─────────────────────────────────────────────
  // 2. Fetch Related Profiles & Metadata in Parallel
  // ─────────────────────────────────────────────
  const [
    customerRes,
    companionRes,
    categoryRes,
    originAreaRes,
    destAreaRes,
    reviewRes,
  ] = await Promise.all([
    request.customer_id
      ? supabase
          .from("profiles")
          .select("id, full_name, phone, avatar_url, role, created_at")
          .eq("id", request.customer_id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),

    request.companion_id
      ? supabase
          .from("profiles")
          .select("id, full_name, phone, avatar_url, role, created_at")
          .eq("id", request.companion_id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),

    request.category_id
      ? supabase
          .from("service_categories")
          .select("id, name, description")
          .eq("id", request.category_id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),

    request.origin_area_id
      ? supabase
          .from("areas")
          .select("id, province, district")
          .eq("id", request.origin_area_id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),

    request.destination_area_id
      ? supabase
          .from("areas")
          .select("id, province, district")
          .eq("id", request.destination_area_id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),

    supabase
      .from("reviews")
      .select("id, rating, comment, created_at")
      .eq("request_id", id)
      .maybeSingle(),
  ]);

  const customer = customerRes.data;
  const companion = companionRes.data;
  const category = categoryRes.data;
  const originArea = originAreaRes.data;
  const destinationArea = destAreaRes.data;
  const review = reviewRes.data;

  const status = request.status as RequestStatus;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Back Link */}
        <Link
          href="/admin/requests"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-emerald-700 cursor-pointer"
        >
          <span>←</span>
          <span>กลับไปรายการคำขอ</span>
        </Link>

        {/* Header Card */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  คำขอใช้บริการ
                </span>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs font-medium text-slate-600">
                  #{request.id}
                </span>
                {category?.name && (
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-100">
                    {category.name}
                  </span>
                )}
              </div>

              <h1 className="mt-2 text-2xl font-bold text-slate-900">
                {request.destination_name || "คำขอรับบริการช่วยเหลือ"}
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                ส่งคำขอเมื่อ {formatDateTime(request.created_at)}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <RequestStatusBadge status={status} />
              <AdminRequestActions
                requestId={request.id}
                currentStatus={status}
                currentCompanionName={companion?.full_name ?? null}
                serviceDate={request.service_date}
                startTime={request.start_time}
                destinationName={request.destination_name}
                offeredFee={request.offered_fee}
                customerName={customer?.full_name ?? null}
              />
            </div>
          </div>
        </section>

        {/* Content Grid */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Service Schedule Details */}
            <Section title="ข้อมูลวันและเวลารับบริการ">
              <div className="grid gap-5 sm:grid-cols-2">
                <InfoItem
                  label="วันที่รับบริการ"
                  value={formatDate(request.service_date)}
                />

                <InfoItem
                  label="เวลาเริ่มต้น"
                  value={
                    request.start_time
                      ? `${request.start_time.slice(0, 5)} น.`
                      : "-"
                  }
                />

                <InfoItem
                  label="ระยะเวลาที่ขอรับบริการ"
                  value={formatDuration(request.duration_minutes)}
                />

                <InfoItem
                  label="หมวดหมู่บริการ"
                  value={category?.name || "บริการทั่วไป"}
                  subValue={category?.description ?? undefined}
                />
              </div>
            </Section>

            {/* Travel and Location Details */}
            <Section title="สถานที่และการเดินทาง">
              <div className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <InfoItem
                    label="รูปแบบการนัดพบ"
                    value={formatMeetingType(request.meeting_type)}
                  />

                  <InfoItem
                    label="วิธีเดินทางที่เลือก"
                    value={formatTransportType(request.transport_type)}
                  />
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-400">
                      จุดรับ / จุดเริ่มต้น
                    </p>
                    <p className="mt-1 font-medium text-slate-800">
                      {request.origin_name || "-"}
                    </p>
                    {originArea && (
                      <p className="mt-0.5 text-xs text-slate-500">
                        {originArea.district}, {originArea.province}
                      </p>
                    )}
                  </div>

                  <div className="border-t border-slate-200/60 pt-3">
                    <p className="text-xs font-semibold text-slate-400">
                      สถานที่ปลายทาง
                    </p>
                    <p className="mt-1 font-medium text-slate-800">
                      {request.destination_name || "-"}
                    </p>
                    {destinationArea && (
                      <p className="mt-0.5 text-xs text-slate-500">
                        {destinationArea.district},{" "}
                        {destinationArea.province}
                      </p>
                    )}
                  </div>

                  {request.return_name && (
                    <div className="border-t border-slate-200/60 pt-3">
                      <p className="text-xs font-semibold text-slate-400">
                        สถานที่ส่งกลับหลังเสร็จธุระ
                      </p>
                      <p className="mt-1 font-medium text-slate-800">
                        {request.return_name}
                      </p>
                    </div>
                  )}

                  {(request.outbound_distance_km ||
                    request.return_distance_km) && (
                    <div className="flex flex-wrap gap-4 border-t border-slate-200/60 pt-3 text-xs text-slate-600">
                      {request.outbound_distance_km != null && (
                        <span>
                          ระยะทางขาไป:{" "}
                          <strong>
                            {Number(request.outbound_distance_km).toFixed(1)} กม.
                          </strong>
                        </span>
                      )}
                      {request.return_distance_km != null && (
                        <span>
                          ระยะทางขากลับ:{" "}
                          <strong>
                            {Number(request.return_distance_km).toFixed(1)} กม.
                          </strong>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Section>

            {/* Note & Meeting Details */}
            <Section title="จุดสังเกตและหมายเหตุเพิ่มเติม">
              <div className="space-y-4">
                <InfoItem
                  label="จุดสังเกตหรือรายละเอียดการนัดหมาย"
                  value={request.meeting_detail || "ไม่ได้ระบุจุดสังเกต"}
                />

                <InfoItem
                  label="หมายเหตุเพิ่มเติมจากผู้ว่าจ้าง"
                  value={request.note || "ไม่มีหมายเหตุเพิ่มเติม"}
                />
              </div>
            </Section>

            {/* Review Section (if exists) */}
            {review && (
              <Section title="รีวิวและความพึงพอใจ">
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5">
                  <div className="flex items-center gap-2">
                    <div className="flex text-amber-400 text-lg">
                      {"★".repeat(Math.max(1, Math.min(5, review.rating || 5)))}
                      {"☆".repeat(
                        Math.max(0, 5 - Math.max(1, Math.min(5, review.rating || 5))),
                      )}
                    </div>
                    <span className="font-bold text-slate-800">
                      {review.rating} / 5
                    </span>
                  </div>

                  {review.comment ? (
                    <p className="mt-3 text-sm text-slate-700 leading-relaxed">
                      &quot;{review.comment}&quot;
                    </p>
                  ) : (
                    <p className="mt-2 text-sm italic text-slate-400">
                      ไม่มีข้อความรีวิว
                    </p>
                  )}

                  {review.created_at && (
                    <p className="mt-3 text-xs text-slate-400">
                      รีวิวเมื่อ {formatDateTime(review.created_at)}
                    </p>
                  )}
                </div>
              </Section>
            )}
          </div>

          {/* Right Column */}
          <aside className="space-y-6">
            {/* Offered Fee & Timeline Card */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-900">
                ค่าบริการและไทม์ไลน์
              </h2>

              <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-center">
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                  ค่าบริการที่เสนอ
                </p>
                <p className="mt-1 text-2xl font-bold text-emerald-800">
                  {request.offered_fee != null
                    ? `${Number(request.offered_fee).toLocaleString()} บาท`
                    : "ไม่ได้ระบุ"}
                </p>
              </div>

              <div className="mt-5 space-y-3 divide-y divide-slate-100 text-sm">
                <div className="pt-2 first:pt-0">
                  <span className="text-xs text-slate-400">ส่งคำขอเมื่อ</span>
                  <p className="font-medium text-slate-700">
                    {formatDateTime(request.created_at)}
                  </p>
                </div>

                <div className="pt-3">
                  <span className="text-xs text-slate-400">
                    เริ่มให้บริการเมื่อ
                  </span>
                  <p className="font-medium text-slate-700">
                    {request.started_at
                      ? formatDateTime(request.started_at)
                      : "-"}
                  </p>
                </div>

                <div className="pt-3">
                  <span className="text-xs text-slate-400">
                    เสร็จสิ้นบริการเมื่อ
                  </span>
                  <p className="font-medium text-slate-700">
                    {request.completed_at
                      ? formatDateTime(request.completed_at)
                      : "-"}
                  </p>
                </div>
              </div>
            </section>

            {/* Customer Profile Card */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900">
                  ผู้ว่าจ้าง (Customer)
                </h2>
                {customer && (
                  <Link
                    href={`/admin/users/${customer.id}`}
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
                  >
                    ดูโปรไฟล์
                  </Link>
                )}
              </div>

              {customer ? (
                <div className="mt-4 flex items-center gap-4">
                  {customer.avatar_url ? (
                    <img
                      src={customer.avatar_url}
                      alt={customer.full_name || ""}
                      className="h-12 w-12 rounded-full object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-base font-bold text-slate-500">
                      {getInitial(customer.full_name)}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-slate-900">
                      {customer.full_name || "ไม่ระบุชื่อ"}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      เบอร์โทร: {customer.phone || "-"}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-400">
                  ไม่พบข้อมูลผู้ว่าจ้าง
                </p>
              )}
            </section>

            {/* Companion Profile Card */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900">
                  ผู้ดูแล (Companion)
                </h2>
                {companion && (
                  <Link
                    href={`/admin/companions/${companion.id}`}
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
                  >
                    ดูโปรไฟล์
                  </Link>
                )}
              </div>

              {companion ? (
                <div>
                  <div className="mt-4 flex items-center gap-4">
                    {companion.avatar_url ? (
                      <img
                        src={companion.avatar_url}
                        alt={companion.full_name || ""}
                        className="h-12 w-12 rounded-full object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-base font-bold text-slate-500">
                        {getInitial(companion.full_name)}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold text-slate-900">
                        {companion.full_name || "ไม่ระบุชื่อ"}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        เบอร์โทร: {companion.phone || "-"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-slate-100 pt-3">
                    <AdminRequestActions
                      requestId={request.id}
                      currentStatus={status}
                      currentCompanionName={companion.full_name}
                      serviceDate={request.service_date}
                      startTime={request.start_time}
                      destinationName={request.destination_name}
                      offeredFee={request.offered_fee}
                      customerName={customer?.full_name ?? null}
                      compact={true}
                    />
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
                  <p className="text-sm font-semibold text-slate-600">
                    ยังไม่มีผู้รับงาน
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    คำขอนี้ยังไม่ได้รับการตอบรับจาก Companion
                  </p>
                  <div className="mt-3 flex justify-center">
                    <AdminRequestActions
                      requestId={request.id}
                      currentStatus={status}
                      currentCompanionName={null}
                      serviceDate={request.service_date}
                      startTime={request.start_time}
                      destinationName={request.destination_name}
                      offeredFee={request.offered_fee}
                      customerName={customer?.full_name ?? null}
                      compact={true}
                    />
                  </div>
                </div>
              )}
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────
// Components & Helpers
// ─────────────────────────────────────────────

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-bold text-slate-900">{title}</h2>
      {children}
    </section>
  );
}

function InfoItem({
  label,
  value,
  subValue,
}: {
  label: string;
  value: string;
  subValue?: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-400">{label}</p>
      <p className="mt-1 whitespace-pre-wrap text-sm font-medium text-slate-800 leading-relaxed">
        {value}
      </p>
      {subValue && (
        <p className="mt-0.5 text-xs text-slate-500 leading-normal">
          {subValue}
        </p>
      )}
    </div>
  );
}

function getInitial(name: string | null) {
  if (!name) return "?";
  return name.trim().charAt(0).toUpperCase();
}

function formatDate(date: string | null) {
  if (!date) return "-";
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

function formatDateTime(date: string | null) {
  if (!date) return "-";
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

function formatDuration(minutes: number | null) {
  if (!minutes || minutes <= 0) return "-";
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0 && remainingMinutes > 0) {
    return `${hours} ชั่วโมง ${remainingMinutes} นาที`;
  }
  if (hours > 0) {
    return `${hours} ชั่วโมง`;
  }
  return `${minutes} นาที`;
}

function formatMeetingType(type: string | null) {
  if (!type) return "-";
  if (type === "pickup") return "นัดรับที่จุดเริ่มต้น (ไปรับที่บ้าน/จุดนัด)";
  if (type === "destination") return "พบที่สถานที่ปลายทาง";
  return type;
}

function formatTransportType(type: string | null) {
  if (!type) return "-";
  if (type === "taxi") return "แท็กซี่ / รถโดยสารผ่านแอป";
  if (type === "private_car") return "รถยนต์ส่วนตัวของผู้ว่าจ้าง";
  if (type === "public_transport") return "ขนส่งสาธารณะ";
  if (type === "companion_car") return "รถยนต์ของผู้ดูแล";
  if (type === "walk") return "เดินเท้า";
  if (type === "other") return "อื่น ๆ";
  return type;
}
