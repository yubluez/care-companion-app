import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser, signOut } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/server";

import ProfileEditor from "@/components/shared/ProfileEditor";
import ServiceProfileEditor from "@/components/companion/profile/ServiceProfileEditor";
import CompanionReviews from "@/components/companion/profile/CompanionReviews";
import { getMyPhone } from "@/lib/contact";

export default async function CompanionProfilePage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const supabase = await createClient();

  // ข้อมูลส่วนตัว
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role,full_name,phone,avatar_url")
    .eq("id", user.id)
    .single();

  if (profileError || profile?.role !== "companion") {
    redirect("/");
  }

  // ข้อมูลการให้บริการและคะแนน
  const { data: companionProfile, error: companionError } = await supabase
    .from("companion_profiles")
    .select(
      "bio,experience,verification_status,rejection_reason,rating_avg,rating_count",
    )
    .eq("user_id", user.id)
    .maybeSingle();

  if (companionError) {
    console.error("Load companion profile:", companionError);
  }

  // พื้นที่ให้บริการของ Companion
  const { data: serviceAreaRows, error: serviceAreaError } = await supabase
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

  if (serviceAreaError) {
    console.error("Load companion service areas:", serviceAreaError);
  }

  // วันและเวลาที่สะดวกของ Companion
  const { data: availabilityRows, error: availabilityError } = await supabase
    .from("companion_availability")
    .select("id, day_of_week, start_time, end_time")
    .eq("companion_id", user.id)
    .order("day_of_week");

  if (availabilityError) {
    console.error("Load companion availability:", availabilityError);
  }

  // รายชื่อพื้นที่ทั้งหมดในระบบ
  const { data: allAreas, error: allAreasError } = await supabase
    .from("areas")
    .select("id, province, district")
    .order("province")
    .order("district");

  if (allAreasError) {
    console.error("Load all areas:", allAreasError);
  }

  const companionAreas = (serviceAreaRows ?? [])
    .map((row) => {
      const area = Array.isArray(row.areas) ? row.areas[0] : row.areas;
      if (!area) return null;
      return {
        id: area.id,
        province: area.province,
        district: area.district,
      };
    })
    .filter((a): a is { id: string; province: string; district: string } =>
      Boolean(a),
    );

  const companionAvailability = (availabilityRows ?? []).map((row) => ({
    id: row.id,
    day_of_week: Number(row.day_of_week),
    start_time: String(row.start_time),
    end_time: String(row.end_time),
  }));

  // จำนวนงานที่เสร็จสิ้น
  const { count: completedJobs, error: jobsError } = await supabase
    .from("service_requests")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("companion_id", user.id)
    .eq("status", "completed");

  if (jobsError) {
    console.error("Load completed jobs:", jobsError);
  }

  // รีวิวล่าสุด
  const { data: recentReviews, error: reviewsError } = await supabase
    .from("reviews")
    .select("id,rating,comment,created_at")
    .eq("companion_id", user.id)
    .order("created_at", {
      ascending: false,
    })
    .limit(5);

  if (reviewsError) {
    console.error("Load reviews:", reviewsError);
  }

  const displayName =
    profile.full_name ||
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "Companion";

  const email = user.email || "-";

  const phone = profile.phone || (await getMyPhone(supabase)) || "";

  const avatarUrl =
    profile.avatar_url ||
    user.user_metadata?.avatar_url ||
    user.user_metadata?.picture ||
    "";

  const createdAt = user.created_at
    ? new Date(user.created_at).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";

  const verificationStatus = companionProfile?.verification_status;

  const statusText =
    verificationStatus === "approved"
      ? "ยืนยันตัวตนแล้ว"
      : verificationStatus === "pending"
        ? "รอการตรวจสอบ"
        : verificationStatus === "rejected"
          ? "ไม่ผ่านการตรวจสอบ"
          : "ยังไม่มีข้อมูลการยืนยันตัวตน";

  const statusClass =
    verificationStatus === "approved"
      ? "bg-emerald-50 text-emerald-700"
      : verificationStatus === "rejected"
        ? "bg-rose-50 text-rose-700"
        : "bg-amber-50 text-amber-700";

  const ratingAvg = Number(companionProfile?.rating_avg ?? 0);

  const ratingCount = Number(companionProfile?.rating_count ?? 0);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 antialiased">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        {/* Profile header */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="h-20 w-20 rounded-full border border-sky-200 object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-sky-100 text-2xl font-bold text-sky-700">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="space-y-2">
                <h1 className="text-2xl font-bold">{displayName}</h1>

                <p className="text-sm font-medium text-sky-700">
                  ผู้ให้บริการ (Companion)
                </p>

                <span
                  className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}
                >
                  {statusText}
                </span>
              </div>
            </div>

            <form action={signOut}>
              <button
                type="submit"
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600
                            hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
              >
                ออกจากระบบ
              </button>
            </form>
          </div>

          {verificationStatus === "rejected" &&
            companionProfile?.rejection_reason && (
              <div className="mt-5 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">
                <p className="font-semibold">เหตุผลที่ไม่ผ่านการตรวจสอบ</p>
                <p className="mt-1 whitespace-pre-wrap">
                  {companionProfile.rejection_reason}
                </p>
              </div>
            )}
        </section>

        {/* Statistics */}
        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <p className="text-sm text-slate-500">คะแนนเฉลี่ย</p>
            <p className="mt-3 text-3xl font-bold text-amber-500">
              {reviewsError
                ? "-"
                : ratingCount > 0
                  ? ratingAvg.toFixed(1)
                  : "-"}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              {ratingCount > 0 ? "จากคะแนนเต็ม 5" : "ยังไม่มีคะแนน"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <p className="text-sm text-slate-500">จำนวนรีวิว</p>
            <p className="mt-3 text-3xl font-bold text-sky-600">
              {companionError ? "-" : ratingCount}
            </p>
            <p className="mt-2 text-xs text-slate-500">รีวิวจากลูกค้า</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <p className="text-sm text-slate-500">งานที่เสร็จสิ้น</p>
            <p className="mt-3 text-3xl font-bold text-emerald-600">
              {jobsError ? "-" : (completedJobs ?? 0)}
            </p>
            <p className="mt-2 text-xs text-slate-500">งานที่ให้บริการสำเร็จ</p>
          </div>
        </section>

        {/* Personal information */}
        <ProfileEditor
          userId={user.id}
          initialName={displayName}
          email={email}
          initialPhone={phone}
          initialAvatarUrl={avatarUrl}
          createdAt={createdAt}
        />

        {/* Service information */}
        {companionError || !companionProfile ? (
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
            ไม่สามารถโหลดข้อมูลการให้บริการได้ กรุณาตรวจสอบข้อมูล Companion
          </section>
        ) : (
          <ServiceProfileEditor
            userId={user.id}
            initialBio={companionProfile.bio ?? ""}
            initialExperience={companionProfile.experience ?? ""}
            initialAreas={companionAreas}
            allAreas={allAreas ?? []}
            initialAvailability={companionAvailability}
          />
        )}

        {/* Reviews */}
        {reviewsError ? (
          <section className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
            ไม่สามารถโหลดรีวิวได้ กรุณาลองใหม่
          </section>
        ) : (
          <CompanionReviews
            companionId={user.id}
            reviews={recentReviews ?? []}
            totalReviews={ratingCount}
          />
        )}

        {/* Quick links */}
        <section className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/companion/requests"
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-sky-300"
          >
            <h3 className="font-bold text-slate-900">คำของาน</h3>
            <p className="mt-2 text-sm text-slate-500">
              ดูคำขอใช้บริการที่รอการตอบรับ
            </p>
          </Link>

          <Link
            href="/companion/jobs"
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-sky-300"
          >
            <h3 className="font-bold text-slate-900">งานของฉัน</h3>
            <p className="mt-2 text-sm text-slate-500">
              ติดตามงานที่รับและประวัติการให้บริการ
            </p>
          </Link>
        </section>
      </div>
    </main>
  );
}
