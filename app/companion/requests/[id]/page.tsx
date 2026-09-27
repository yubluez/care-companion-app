import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import RequestActions from "@/components/companion/requests/RequestActions";
import StatusBadge from "@/components/companion/dashboard/StatusBadge";
import { isRequestExpired } from "@/lib/requests/expiration";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CompanionRequestDetailPage({ params }: Props) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // ตรวจ Role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  if (profile.role !== "companion") {
    if (profile.role === "customer") {
      redirect("/customer");
    }

    redirect("/onboarding/role");
  }

  // ตรวจ KYC
  const { data: companion } = await supabase
    .from("companion_profiles")
    .select("verification_status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!companion) {
    redirect("/onboarding/companion");
  }

  if (companion.verification_status !== "approved") {
    redirect("/onboarding/companion/status");
  }

  // โหลด Request
  const { data: request, error } = await supabase
    .from("service_requests")
    .select(
      `
      id,
      service_date,
      start_time,
      duration_minutes,
      origin_name,
      destination_name,
      note,
      meeting_detail,
      offered_fee,
      status,

      customer:profiles!service_requests_customer_id_fkey (
        full_name,
        avatar_url
      ),

      category:service_categories (
        name,
        description
      ),

      origin:areas!service_requests_origin_area_id_fkey (
        province,
        district
      ),

      destination_area:areas!service_requests_destination_area_id_fkey (
        province,
        district
      )
    `,
    )
    .eq("id", id)
    .eq("companion_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Load request detail error:", error);
  }

  if (!request) {
    notFound();
  }

  if (
    request.status === "pending" &&
    isRequestExpired(request.service_date, request.start_time)
  ) {
    request.status = "expired";
    await supabase
      .from("service_requests")
      .update({ status: "expired" })
      .eq("id", request.id)
      .eq("status", "pending");
  }

  // ถ้ารับงานไปแล้ว ให้ไปหน้า Job
  if (
    request.status === "accepted" ||
    request.status === "in_progress" ||
    request.status === "completed"
  ) {
    redirect(`/companion/jobs/${request.id}`);
  }

  const customer = getRelation(request.customer);
  const category = getRelation(request.category);
  const origin = getRelation(request.origin);
  const destinationArea = getRelation(request.destination_area);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link
          href="/companion/requests"
          className="inline-flex text-sm font-semibold text-slate-500 hover:text-violet-600 mb-6"
        >
          ← กลับไปคำของาน
        </Link>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="p-6 sm:p-8 border-b border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <p className="text-sm text-slate-400 mb-1">คำขอใช้บริการ</p>

                <h1 className="text-2xl font-bold text-slate-900">
                  {category?.name || "บริการ Companion"}
                </h1>

                {category?.description && (
                  <p className="text-sm text-slate-500 mt-2">
                    {category.description}
                  </p>
                )}
              </div>

              <StatusBadge status={request.status} />
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            {/* Customer */}
            <section>
              <h2 className="font-bold text-slate-900 mb-4">ข้อมูลลูกค้า</h2>

              <div className="flex items-center gap-4">
                {customer?.avatar_url ? (
                  <img
                    src={customer.avatar_url}
                    alt={customer.full_name || "ลูกค้า"}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-lg font-bold text-slate-500">
                    {(customer?.full_name || "C").charAt(0).toUpperCase()}
                  </div>
                )}

                <div>
                  <p className="font-bold text-slate-800">
                    {customer?.full_name || "ไม่ระบุชื่อ"}
                  </p>
                </div>
              </div>
            </section>

            {/* Date / Time */}
            <section>
              <h2 className="font-bold text-slate-900 mb-4">วันและเวลา</h2>

              <div className="grid sm:grid-cols-3 gap-4">
                <DetailItem
                  label="วันที่"
                  value={formatDate(request.service_date)}
                />

                <DetailItem
                  label="เวลาเริ่ม"
                  value={formatTime(request.start_time)}
                />

                <DetailItem
                  label="ระยะเวลา"
                  value={formatDuration(request.duration_minutes)}
                />
              </div>
            </section>

            {/* Location */}
            <section>
              <h2 className="font-bold text-slate-900 mb-4">สถานที่</h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <DetailItem
                  label="พื้นที่ต้นทาง"
                  value={
                    request.origin_name ||
                    (origin ? `${origin.district}, ${origin.province}` : "-")
                  }
                />

                <DetailItem
                  label="จุดหมาย"
                  value={
                    request.destination_name ||
                    (destinationArea
                      ? `${destinationArea.district}, ${destinationArea.province}`
                      : "-")
                  }
                />
              </div>
            </section>

            {/* Note */}
            <section className="space-y-4">
              <h2 className="font-bold text-slate-900">รายละเอียดเพิ่มเติม</h2>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="mb-2 text-sm text-slate-500">
                  ข้อมูลเพิ่มเติมจากลูกค้า
                </p>
                <p className="whitespace-pre-wrap text-slate-700">
                  {request.note || "ไม่มีรายละเอียดเพิ่มเติม"}
                </p>
              </div>

              {request.meeting_detail && (
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="mb-2 text-sm text-slate-500">
                    รายละเอียดจุดนัดพบ
                  </p>
                  <p className="whitespace-pre-wrap text-slate-700">
                    {request.meeting_detail}
                  </p>
                </div>
              )}
            </section>

            {/* Fee */}
            <section className="bg-emerald-50 rounded-2xl p-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-emerald-700">
                  ค่าบริการที่ลูกค้าเสนอ
                </p>

                <p className="text-xs text-emerald-600/70 mt-1">
                  สำหรับการให้บริการครั้งนี้
                </p>
              </div>

              <p className="text-2xl font-bold text-emerald-700">
                {request.offered_fee != null
                  ? `฿${Number(request.offered_fee).toLocaleString("th-TH")}`
                  : "-"}
              </p>
            </section>

            {/* Accept / Reject */}
            {request.status === "pending" && (
              <RequestActions requestId={request.id} />
            )}

            {request.status === "rejected" && (
              <div className="bg-slate-50 text-slate-500 rounded-xl px-4 py-3 text-center text-sm">
                คุณได้ปฏิเสธคำขอนี้แล้ว
              </div>
            )}

            {request.status === "expired" && (
              <div className="bg-slate-50 text-slate-500 rounded-xl px-4 py-3 text-center text-sm">
                คำขอนี้หมดอายุแล้ว
              </div>
            )}

            {request.status === "cancelled" && (
              <div className="bg-slate-50 text-slate-500 rounded-xl px-4 py-3 text-center text-sm">
                คำขอนี้ถูกยกเลิกแล้ว
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-50 rounded-xl p-4">
      <p className="text-xs text-slate-400">{label}</p>

      <p className="font-semibold text-slate-700 mt-1">{value}</p>
    </div>
  );
}

function getRelation<T>(relation: T | T[] | null): T | null {
  if (Array.isArray(relation)) {
    return relation[0] ?? null;
  }

  return relation ?? null;
}

function formatDate(date: string | null) {
  if (!date) return "-";

  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function formatTime(time: string | null) {
  if (!time) return "-";

  return `${time.slice(0, 5)} น.`;
}

function formatDuration(minutes: number | null) {
  if (!minutes) return "-";

  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;

  if (hours === 0) {
    return `${remaining} นาที`;
  }

  if (remaining === 0) {
    return `${hours} ชั่วโมง`;
  }

  return `${hours} ชม. ${remaining} นาที`;
}
