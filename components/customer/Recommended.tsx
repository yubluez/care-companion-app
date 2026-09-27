import Link from "next/link";
import { ArrowRight, Star, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function Recommended() {
  const supabase = await createClient();

  // ดึงเฉพาะ Companion ที่ผ่านการอนุมัติ
  const { data: approved, error: approvalError } = await supabase
    .from("companion_profiles")
    .select("user_id, rating_avg, rating_count, bio")
    .eq("verification_status", "approved")
    .limit(10);

  if (approvalError) {
    console.error("Approval query error:", approvalError);
  }

  const approvedProfiles = approved ?? [];
  const approvedIds = approvedProfiles.map((item) => item.user_id);

  const { data: profiles, error: profileError } =
    approvedIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", approvedIds)
      : { data: [], error: null };

  if (profileError) {
    console.error("Companion query error:", profileError);
  }

  const companions = (profiles ?? [])
    .map((profile) => {
      const details = approvedProfiles.find(
        (item) => item.user_id === profile.id,
      );

      return {
        ...profile,
        bio: details?.bio ?? null,
        rating_avg: details?.rating_avg ?? 0,
        rating_count: details?.rating_count ?? 0,
      };
    })
    .slice(0, 3);

  return (
    <div>
      {companions.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <Users size={30} className="mx-auto text-slate-400" />

          <p className="mt-3 font-medium text-slate-700">
            ยังไม่มี Companion แนะนำ
          </p>

          <p className="mt-1 text-sm text-slate-500">
            สามารถกลับมาตรวจสอบอีกครั้งได้ภายหลัง
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-3">
          {companions.map((companion) => (
            <article
              key={companion.id}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-sky-200 hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                {companion.avatar_url ? (
                  <img
                    src={companion.avatar_url}
                    alt={companion.full_name || "Companion"}
                    className="h-14 w-14 shrink-0 rounded-full border border-slate-100 object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xl font-bold text-sky-700">
                    {companion.full_name?.charAt(0) || "C"}
                  </div>
                )}

                <div className="min-w-0">
                  <h3 className="truncate font-bold text-slate-900">
                    {companion.full_name || "Companion"}
                  </h3>

                  {companion.rating_count > 0 ? (
                    <p className="mt-1 flex items-center gap-1 text-sm text-slate-600">
                      <Star
                        size={15}
                        className="fill-amber-400 text-amber-400"
                      />
                      {Number(companion.rating_avg).toFixed(1)}
                      <span className="text-slate-400">
                        ({companion.rating_count} รีวิว)
                      </span>
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-slate-500">ยังไม่มีรีวิว</p>
                  )}
                </div>
              </div>

              <p className="mt-5 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">
                {companion.bio ||
                  "ผู้ร่วมเดินทางสำหรับช่วยเหลือและอำนวยความสะดวกในการทำธุระ"}
              </p>

              <Link
                href={`/customer/compsearch/${companion.id}`}
                className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-sky-200 px-4 py-2.5 text-sm font-semibold text-sky-600 transition hover:bg-sky-50"
              >
                ดูโปรไฟล์
                <ArrowRight size={16} />
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
