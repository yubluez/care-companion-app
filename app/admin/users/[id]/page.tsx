import Link from "next/link";
import { notFound } from "next/navigation";

import CompanionDetails from "@/components/admin/users/CompanionDetails";
import CustomerDetails from "@/components/admin/users/CustomerDetails";
import UserProfileCard from "@/components/admin/users/UserProfileCard";

import type { UserRole } from "@/components/admin/users/types";

import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminUserDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  // ─────────────────────────────────────────────
  // User
  // ─────────────────────────────────────────────

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(
      `
          id,
          full_name,
          phone,
          avatar_url,
          role,
          created_at
        `,
    )
    .eq("id", id)
    .in("role", ["customer", "companion"])
    .maybeSingle();

  if (profileError) {
    console.error("Load user detail error:", profileError);
  }

  if (!profile) {
    notFound();
  }

  const role = profile.role as UserRole;

  // ─────────────────────────────────────────────
  // Customer
  // ─────────────────────────────────────────────

  if (role === "customer") {
    const { data: requests, error: requestsError } = await supabase
      .from("service_requests")
      .select(
        `
            id,
            service_date,
            destination_name,
            status,
            offered_fee
          `,
      )
      .eq("customer_id", id)
      .order("created_at", {
        ascending: false,
      });

    if (requestsError) {
      console.error("Load customer requests error:", requestsError);
    }

    const customerRequests = (requests ?? []).map((request) => ({
      id: request.id,
      serviceDate: request.service_date,
      destinationName: request.destination_name,
      status: request.status,
      offeredFee: request.offered_fee,
    }));

    return (
      <PageContainer>
        <BackButton />

        <UserProfileCard
          fullName={profile.full_name}
          phone={profile.phone}
          avatarUrl={profile.avatar_url}
          role={role}
          createdAt={profile.created_at}
        />

        <div className="mt-6">
          <CustomerDetails requests={customerRequests} />
        </div>
      </PageContainer>
    );
  }

  // ─────────────────────────────────────────────
  // Companion Profile
  // ─────────────────────────────────────────────

  const { data: companionProfile, error: companionError } = await supabase
    .from("companion_profiles")
    .select(
      `
        bio,
        experience,
        verification_status,
        rating_avg,
        rating_count
      `,
    )
    .eq("user_id", id)
    .maybeSingle();

  if (companionError) {
    console.error("Load companion profile error:", companionError);
  }

  // ─────────────────────────────────────────────
  // Service Areas
  // ─────────────────────────────────────────────

  const { data: companionAreas, error: areaError } = await supabase
    .from("companion_service_areas")
    .select("id, area_id")
    .eq("companion_id", id);

  if (areaError) {
    console.error("Load companion areas error:", areaError);
  }

  const areaIds = companionAreas?.map((item) => item.area_id) ?? [];

  let areas: {
    id: string;
    province: string;
    district: string;
  }[] = [];

  if (areaIds.length > 0) {
    const { data, error } = await supabase
      .from("areas")
      .select("id, province, district")
      .in("id", areaIds);

    if (error) {
      console.error("Load areas error:", error);
    } else {
      areas = data ?? [];
    }
  }

  // ─────────────────────────────────────────────
  // Availability
  // ─────────────────────────────────────────────

  const { data: availability, error: availabilityError } = await supabase
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
    });

  if (availabilityError) {
    console.error("Load availability error:", availabilityError);
  }

  // ─────────────────────────────────────────────
  // Jobs
  // ─────────────────────────────────────────────

  const { data: jobs, error: jobsError } = await supabase
    .from("service_requests")
    .select("id, status")
    .eq("companion_id", id);

  if (jobsError) {
    console.error("Load companion jobs error:", jobsError);
  }

  const allJobs = jobs ?? [];

  const completedJobs = allJobs.filter(
    (job) => job.status === "completed",
  ).length;

  const cancelledJobs = allJobs.filter(
    (job) => job.status === "cancelled",
  ).length;

  return (
    <PageContainer>
      <BackButton />

      <UserProfileCard
        fullName={profile.full_name}
        phone={profile.phone}
        avatarUrl={profile.avatar_url}
        role={role}
        createdAt={profile.created_at}
      />

      <div className="mt-6">
        <CompanionDetails
          bio={companionProfile?.bio ?? null}
          experience={companionProfile?.experience ?? null}
          verificationStatus={
            companionProfile?.verification_status ?? "pending"
          }
          ratingAvg={Number(companionProfile?.rating_avg ?? 0)}
          ratingCount={Number(companionProfile?.rating_count ?? 0)}
          serviceAreas={areas}
          availability={(availability ?? []).map((item) => ({
            id: item.id,
            dayOfWeek: item.day_of_week,
            startTime: item.start_time,
            endTime: item.end_time,
          }))}
          jobStats={{
            total: allJobs.length,
            completed: completedJobs,
            cancelled: cancelledJobs,
          }}
        />
      </div>
    </PageContainer>
  );
}

function PageContainer({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-8">{children}</div>
    </main>
  );
}

function BackButton() {
  return (
    <Link
      href="/admin/users"
      className="mb-5 inline-flex items-center text-sm font-semibold text-slate-500 transition hover:text-slate-900"
    >
      ← กลับไปหน้าผู้ใช้งาน
    </Link>
  );
}
