import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import JobCard, {
  type CompanionJob,
} from "@/components/companion/jobs/JobCard";

export default async function CompanionJobsPage() {
  const supabase = await createClient();

  // Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Profile
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

  // Companion KYC
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

  // Jobs
  const { data, error } = await supabase
    .from("service_requests")
    .select(
      `
      id,
      service_date,
      start_time,
      duration_minutes,
      destination_name,
      offered_fee,
      status,

      customer:profiles!service_requests_customer_id_fkey (
        full_name,
        avatar_url
      ),

      category:service_categories (
        name
      )
    `,
    )
    .eq("companion_id", user.id)
    .in("status", ["accepted", "in_progress", "completed", "cancelled"])
    .order("service_date", {
      ascending: false,
    })
    .order("start_time", {
      ascending: false,
    });

  if (error) {
    console.error("Load companion jobs error:", error);
  }

  const jobs: CompanionJob[] = (data ?? []).map((row) => {
    const customer = Array.isArray(row.customer)
      ? (row.customer[0] ?? null)
      : (row.customer ?? null);

    const category = Array.isArray(row.category)
      ? (row.category[0] ?? null)
      : (row.category ?? null);

    return {
      id: row.id,

      serviceDate: row.service_date ?? "",

      startTime: row.start_time ?? "",

      durationMinutes: row.duration_minutes ?? null,

      destinationName: row.destination_name ?? null,

      offeredFee: row.offered_fee ?? null,

      status: row.status,

      customer: customer
        ? {
            fullName: customer.full_name ?? null,

            avatarUrl: customer.avatar_url ?? null,
          }
        : null,

      category: category
        ? {
            name: category.name,
          }
        : null,
    };
  });

  const activeJobs = jobs.filter(
    (job) => job.status === "accepted" || job.status === "in_progress",
  );

  const completedJobs = jobs.filter((job) => job.status === "completed");

  const cancelledJobs = jobs.filter((job) => job.status === "cancelled");

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">งานของฉัน</h1>

          <p className="mt-1 text-slate-500">ติดตามและจัดการงานที่คุณตอบรับ</p>
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-600">
            ไม่สามารถโหลดข้อมูลงานได้
          </div>
        ) : (
          <div className="space-y-10">
            {/* Active */}
            <JobSection
              title="งานที่กำลังดำเนินการ"
              description="งานที่รับแล้วหรือกำลังให้บริการ"
              jobs={activeJobs}
              emptyText="ยังไม่มีงานที่กำลังดำเนินการ"
            />

            {/* Completed */}
            <JobSection
              title="งานที่เสร็จสิ้น"
              description="ประวัติงานที่ให้บริการสำเร็จ"
              jobs={completedJobs}
              emptyText="ยังไม่มีงานที่เสร็จสิ้น"
            />

            {/* Cancelled */}
            {cancelledJobs.length > 0 && (
              <JobSection
                title="งานที่ถูกยกเลิก"
                description="รายการงานที่ถูกยกเลิก"
                jobs={cancelledJobs}
                emptyText=""
              />
            )}
          </div>
        )}
      </div>
    </main>
  );
}

function JobSection({
  title,
  description,
  jobs,
  emptyText,
}: {
  title: string;
  description: string;
  jobs: CompanionJob[];
  emptyText: string;
}) {
  return (
    <section>
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>

          <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-bold text-slate-600">
            {jobs.length}
          </span>
        </div>

        <p className="mt-1 text-sm text-slate-400">{description}</p>
      </div>

      {jobs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-10 text-center text-sm text-slate-400">
          {emptyText}
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </section>
  );
}
