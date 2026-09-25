import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

import ProfileHeader from "@/components/companion/profile/ProfileHeader";
import PersonalInfo from "@/components/companion/profile/PersonalInfo";
import CompanionInfo from "@/components/companion/profile/CompanionInfo";
import ServiceAreas from "@/components/companion/profile/ServiceAreas";
import Availability from "@/components/companion/profile/Availability";

export default async function CompanionProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, full_name, phone, avatar_url")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    throw new Error("ไม่สามารถโหลดข้อมูล Profile ได้");
  }

  if (profile.role !== "companion") {
    if (profile.role === "customer") {
      redirect("/customer");
    }

    redirect("/onboarding/role");
  }

  const { data: companion, error: companionError } = await supabase
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
    .eq("user_id", user.id)
    .maybeSingle();

  if (companionError) {
    throw new Error("ไม่สามารถโหลดข้อมูล Companion ได้");
  }

  if (!companion) {
    redirect("/onboarding/companion");
  }

  const { data: serviceAreaRows, error: areaError } = await supabase
    .from("companion_service_areas")
    .select(
      `
      area_id,
      areas (
        id,
        province,
        district
      )
    `,
    )
    .eq("companion_id", user.id);

  if (areaError) {
    console.error("Load service areas error:", areaError);
  }

  const { data: availabilityRows, error: availabilityError } = await supabase
    .from("companion_availability")
    .select("id, day_of_week, start_time, end_time")
    .eq("companion_id", user.id)
    .order("day_of_week");

  if (availabilityError) {
    console.error("Load availability error:", availabilityError);
  }

  const serviceAreas = (serviceAreaRows ?? [])
    .map((row) => {
      const area = Array.isArray(row.areas) ? row.areas[0] : row.areas;

      if (!area) return null;

      return {
        id: area.id,
        province: area.province,
        district: area.district,
      };
    })
    .filter(
      (
        area,
      ): area is {
        id: string;
        province: string;
        district: string;
      } => area !== null,
    );

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">โปรไฟล์ของฉัน</h1>

          <p className="text-slate-500 mt-1">
            จัดการข้อมูลสำหรับการให้บริการ Companion
          </p>
        </div>

        <ProfileHeader
          fullName={profile.full_name || "Companion"}
          avatarUrl={profile.avatar_url}
          verificationStatus={companion.verification_status}
          ratingAvg={Number(companion.rating_avg ?? 0)}
          ratingCount={Number(companion.rating_count ?? 0)}
        />

        <PersonalInfo
          fullName={profile.full_name || ""}
          email={user.email || ""}
          phone={profile.phone || ""}
        />

        <CompanionInfo
          bio={companion.bio || ""}
          experience={companion.experience || ""}
        />

        <ServiceAreas areas={serviceAreas} />

        <Availability availability={availabilityRows ?? []} />
      </div>
    </main>
  );
}
