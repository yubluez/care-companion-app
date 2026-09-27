import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getRequestContact } from "@/lib/contact";

import StatusBadge from "@/components/companion/dashboard/StatusBadge";
import JobActions from "@/components/companion/jobs/JobActions";
import { isRequestExpired } from "@/lib/requests/expiration";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CompanionJobDetailPage({ params }: Props) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

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

  const { data: job, error } = await supabase
    .from("service_requests")
    .select(
      `
        id,
        service_date,
        start_time,
        duration_minutes,
        destination_name,
        note,
        meeting_detail,
        offered_fee,
        status,
        started_at,
        completed_at,

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
    console.error("Load job detail error:", error);
  }

  if (!job) {
    notFound();
  }

  // pending ที่หมดอายุแล้วให้แสดงสถานะ expired ในหน้านี้
  if (
    job.status === "pending" &&
    isRequestExpired(job.service_date, job.start_time)
  ) {
    job.status = "expired";
  } else if (job.status === "pending") {
    redirect(`/companion/requests/${job.id}`);
  }

  const contactPhone =
    job.status === "accepted" || job.status === "in_progress"
      ? await getRequestContact(supabase, job.id)
      : null;

  const customer = getRelation(job.customer);

  const category = getRelation(job.category);

  const origin = getRelation(job.origin);

  const destinationArea = getRelation(job.destination_area);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Link
          href="/companion/jobs"
          className="mb-6 inline-flex text-md font-semibold text-slate-500 hover:text-violet-600"
        >
          ← กลับไปงานของฉัน
        </Link>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {/* Header */}
          <div className="border-b border-slate-100 p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="mb-1 text-sm text-slate-400">รายละเอียดงาน</p>

                <h1 className="text-2xl font-bold text-slate-900">
                  {category?.name || "บริการ Companion"}
                </h1>
              </div>

              <StatusBadge status={job.status} />
            </div>
          </div>

          <div className="space-y-8 p-6 sm:p-8">
            {/* Customer */}
            <section>
              <h2 className="mb-4 font-bold text-slate-900">ลูกค้า</h2>

              <div className="flex items-center gap-4">
                {customer?.avatar_url ? (
                  <img
                    src={customer.avatar_url}
                    alt={customer.full_name || "ลูกค้า"}
                    className="h-14 w-14 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-500">
                    {(customer?.full_name || "C").charAt(0).toUpperCase()}
                  </div>
                )}

                <div>
                  <p className="font-bold text-slate-800">
                    {customer?.full_name || "ไม่ระบุชื่อ"}
                  </p>
                  {contactPhone && (
                    <p className="mt-1 text-sm text-violet-700">
                      เบอร์โทรศัพท์: {contactPhone}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Date */}
            <section>
              <h2 className="mb-4 font-bold text-slate-900">วันและเวลา</h2>

              <div className="grid gap-4 sm:grid-cols-3">
                <Detail label="วันที่" value={formatDate(job.service_date)} />

                <Detail label="เวลาเริ่ม" value={formatTime(job.start_time)} />

                <Detail
                  label="ระยะเวลา"
                  value={formatDuration(job.duration_minutes)}
                />
              </div>
            </section>

            {/* Location */}
            <section>
              <h2 className="mb-4 font-bold text-slate-900">สถานที่</h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <Detail
                  label="พื้นที่ต้นทาง"
                  value={
                    origin ? `${origin.district}, ${origin.province}` : "-"
                  }
                />

                <Detail
                  label="จุดหมาย"
                  value={
                    job.destination_name ||
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
                  {job.note || "ไม่มีรายละเอียดเพิ่มเติม"}
                </p>
              </div>

              {job.meeting_detail && (
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="mb-2 text-sm text-slate-500">
                    รายละเอียดจุดนัดพบ
                  </p>
                  <p className="whitespace-pre-wrap text-slate-700">
                    {job.meeting_detail}
                  </p>
                </div>
              )}
            </section>

            {/* Fee */}
            <section className="flex items-center justify-between rounded-2xl bg-emerald-50 p-5">
              <p className="text-sm text-emerald-700">ค่าบริการ</p>

              <p className="text-2xl font-bold text-emerald-700">
                {job.offered_fee != null
                  ? `฿${Number(job.offered_fee).toLocaleString("th-TH")}`
                  : "-"}
              </p>
            </section>

            {/* Actions */}
            <JobActions requestId={job.id} status={job.status} />
          </div>
        </div>
      </div>
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs text-slate-400">{label}</p>

      <p className="mt-1 font-semibold text-slate-700">{value}</p>
    </div>
  );
}

function getRelation<T>(value: T | T[] | null): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
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
