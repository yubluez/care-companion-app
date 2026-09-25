import { createClient } from "@/lib/supabase/server";

import CompanionApplicationCard, {
  type CompanionApplication,
} from "@/components/admin/companions/CompanionApplicationCard";

export default async function AdminCompanionsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("companion_profiles")
    .select(
      `
      user_id,
      bio,
      experience,
      verification_status,

      profile:profiles!companion_profiles_user_id_fkey (
        full_name,
        phone,
        avatar_url
      )
    `,
    )
    .order("verification_status", {
      ascending: false,
    });

  if (error) {
    console.error("Load companions error:", error);
  }

  const applications: CompanionApplication[] = (data ?? []).map((row) => {
    const profile = Array.isArray(row.profile)
      ? (row.profile[0] ?? null)
      : (row.profile ?? null);

    return {
      userId: row.user_id,

      fullName: profile?.full_name ?? null,

      phone: profile?.phone ?? null,

      avatarUrl: profile?.avatar_url ?? null,

      bio: row.bio ?? null,

      experience: row.experience ?? null,

      verificationStatus: row.verification_status,
    };
  });

  const pending = applications.filter(
    (item) => item.verificationStatus === "pending",
  );

  const reviewed = applications.filter(
    (item) => item.verificationStatus !== "pending",
  );

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            ตรวจสอบ Companion
          </h1>

          <p className="mt-1 text-slate-500">
            ตรวจสอบข้อมูลและเอกสารของผู้สมัคร
          </p>
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-600">
            ไม่สามารถโหลดใบสมัครได้
          </div>
        ) : (
          <div className="space-y-10">
            <ApplicationSection
              title="รอตรวจสอบ"
              applications={pending}
              empty="ไม่มีใบสมัครที่รอตรวจสอบ"
            />

            <ApplicationSection
              title="ตรวจสอบแล้ว"
              applications={reviewed}
              empty="ยังไม่มีประวัติการตรวจสอบ"
            />
          </div>
        )}
      </div>
    </main>
  );
}

function ApplicationSection({
  title,
  applications,
  empty,
}: {
  title: string;
  applications: CompanionApplication[];
  empty: string;
}) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>

        <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-bold text-slate-600">
          {applications.length}
        </span>
      </div>

      {applications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-10 text-center text-sm text-slate-400">
          {empty}
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <CompanionApplicationCard
              key={application.userId}
              application={application}
            />
          ))}
        </div>
      )}
    </section>
  );
}
