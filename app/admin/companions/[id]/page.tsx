import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import ReviewActions from "@/components/admin/companions/ReviewActions";
import VerificationBadge from "@/components/admin/companions/VerificationBadge";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

const DAYS: Record<number, string> = {
  1: "จันทร์",
  2: "อังคาร",
  3: "พุธ",
  4: "พฤหัสบดี",
  5: "ศุกร์",
  6: "เสาร์",
  7: "อาทิตย์",
};

export default async function AdminCompanionDetailPage({ params }: Props) {
  const { id } = await params;

  const supabase = await createClient();

  /*
   * Layout /admin ตรวจ role Admin
   * ให้อยู่แล้ว
   */

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      `
        id,
        full_name,
        phone,
        avatar_url,
        role
      `,
    )
    .eq("id", id)
    .eq("role", "companion")
    .maybeSingle();

  if (!profile) {
    notFound();
  }

  const { data: companion, error: companionError } = await supabase
    .from("companion_profiles")
    .select(
      `
      bio,
      experience,
      verification_status,
      rejection_reason,
      id_doc_path,
      reviewed_by,
      reviewed_at,
      rating_avg,
      rating_count
    `,
    )
    .eq("user_id", id)
    .maybeSingle();

  if (companionError || !companion) {
    notFound();
  }

  const [{ data: areaRows }, { data: availabilityRows }] = await Promise.all([
    supabase
      .from("companion_service_areas")
      .select(
        `
        area:areas (
          id,
          province,
          district
        )
      `,
      )
      .eq("companion_id", id),

    supabase
      .from("companion_availability")
      .select(
        `
        id,
        day_of_week,
        start_time,
        end_time
      `,
      )
      .eq("companion_id", id)
      .order("day_of_week", {
        ascending: true,
      })
      .order("start_time", {
        ascending: true,
      }),
  ]);

  const areas = (areaRows ?? [])
    .map((row) => getRelation(row.area))
    .filter(
      (
        area,
      ): area is {
        id: string;
        province: string;
        district: string;
      } => Boolean(area),
    );

  const availability = availabilityRows ?? [];

  /*
   * id-documents เป็น private bucket
   * จึงสร้าง Signed URL สำหรับ Admin
   */
  let documentUrl: string | null = null;

  if (companion.id_doc_path) {
    const { data } = await supabase.storage
      .from("id-documents")
      .createSignedUrl(companion.id_doc_path, 60 * 10);

    documentUrl = data?.signedUrl ?? null;
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Link
          href="/admin/companions"
          className="mb-6 inline-flex text-sm font-semibold text-slate-500 hover:text-slate-900"
        >
          ← กลับไปรายชื่อ Companion
        </Link>

        {/* Header */}

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name || "Companion"}
                  className="h-20 w-20 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-2xl font-bold text-slate-500">
                  {(profile.full_name || "C").charAt(0).toUpperCase()}
                </div>
              )}

              <div>
                <p className="text-sm text-slate-400">ผู้สมัคร Companion</p>

                <h1 className="mt-1 text-2xl font-bold text-slate-900">
                  {profile.full_name || "ไม่ระบุชื่อ"}
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  {profile.phone || "ไม่มีเบอร์โทรศัพท์"}
                </p>
              </div>
            </div>

            <VerificationBadge status={companion.verification_status} />
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
          {/* Left */}

          <div className="space-y-6">
            <Section title="ข้อมูลเกี่ยวกับ Companion">
              <Information
                label="เกี่ยวกับตัวเอง"
                value={companion.bio || "ไม่ได้ระบุ"}
              />

              <Information
                label="ประสบการณ์"
                value={companion.experience || "ไม่ได้ระบุ"}
              />
            </Section>

            <Section title="พื้นที่ให้บริการ">
              {areas.length === 0 ? (
                <Empty>ไม่ได้ระบุพื้นที่ให้บริการ</Empty>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {areas.map((area) => (
                    <span
                      key={area.id}
                      className="rounded-full bg-sky-50 px-3 py-2 text-sm font-medium text-sky-700"
                    >
                      {area.district}, {area.province}
                    </span>
                  ))}
                </div>
              )}
            </Section>

            <Section title="วันและเวลาที่สะดวก">
              {availability.length === 0 ? (
                <Empty>ไม่ได้ระบุวันและเวลา</Empty>
              ) : (
                <div className="divide-y divide-slate-100">
                  {availability.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                    >
                      <span className="font-medium text-slate-700">
                        {DAYS[item.day_of_week] || `วันที่ ${item.day_of_week}`}
                      </span>

                      <span className="text-sm text-slate-500">
                        {formatTime(item.start_time)}
                        {" - "}
                        {formatTime(item.end_time)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            <Section title="เอกสารยืนยันตัวตน">
              {!companion.id_doc_path ? (
                <Empty>ไม่มีเอกสารยืนยันตัวตน</Empty>
              ) : documentUrl ? (
                <div>
                  <p className="mb-3 text-sm text-slate-500">
                    กรุณาตรวจสอบเอกสารก่อนอนุมัติใบสมัคร
                  </p>

                  <a
                    href={documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    เปิดเอกสารยืนยันตัวตน
                  </a>

                  <p className="mt-2 text-xs text-slate-400">
                    ลิงก์นี้มีอายุ 10 นาที
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  ไม่สามารถเปิดเอกสารได้
                </div>
              )}
            </Section>
          </div>

          {/* Right */}

          <aside className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-bold text-slate-900">สถานะใบสมัคร</h2>

              <div className="mt-4">
                <VerificationBadge status={companion.verification_status} />
              </div>

              {companion.reviewed_at && (
                <p className="mt-4 text-xs text-slate-400">
                  ตรวจสอบเมื่อ {formatDateTime(companion.reviewed_at)}
                </p>
              )}
            </section>

            {companion.verification_status === "pending" && (
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="mb-2 font-bold text-slate-900">
                  ตรวจสอบใบสมัคร
                </h2>

                <p className="mb-5 text-sm text-slate-500">
                  ตรวจสอบข้อมูลและเอกสารให้เรียบร้อยก่อนตัดสินใจ
                </p>

                <ReviewActions companionId={id} />
              </section>
            )}

            {companion.verification_status === "rejected" &&
              companion.rejection_reason && (
                <section className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
                  <h2 className="font-bold text-rose-700">เหตุผลที่ปฏิเสธ</h2>

                  <p className="mt-2 whitespace-pre-wrap text-sm text-rose-600">
                    {companion.rejection_reason}
                  </p>
                </section>
              )}
          </aside>
        </div>
      </div>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-lg font-bold text-slate-900">{title}</h2>

      {children}
    </section>
  );
}

function Information({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-5 last:mb-0">
      <p className="mb-1 text-xs font-semibold text-slate-400">{label}</p>

      <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
        {value}
      </p>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-slate-50 px-4 py-5 text-center text-sm text-slate-400">
      {children}
    </div>
  );
}

function getRelation<T>(value: T | T[] | null): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function formatTime(time: string | null) {
  if (!time) return "-";

  return time.slice(0, 5);
}

function formatDateTime(date: string) {
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}
