import { redirect } from "next/navigation";
import { getUser, signOut } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/server";
import ProfileEditor from "@/components/shared/ProfileEditor";

export default async function Page() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("full_name, phone, avatar_url")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
  }

  const displayName =
    profile?.full_name ||
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "คุณลูกค้า";

  const email = user.email || "-";

  const phone = profile?.phone || "";

  const avatarUrl =
    profile?.avatar_url ||
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

  return (
    <div className="bg-slate-50 text-slate-800 antialiased min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6 py-10 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-5">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="avatar"
                className="w-15 h-15 rounded-full border border-sky-200 object-cover"
              />
            ) : (
              <div className="w-15 h-15 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-base">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="flex flex-col">
              <p className="mb-2 text-xl font-bold text-slate-800">
                {displayName}
              </p>

              <span className="text-xs text-sky-800 font-semibold">
                ผู้ต้องการผู้ช่วย (Customer)
              </span>
            </div>
          </div>

          <form action={signOut}>
            <button
              type="submit"
              className="text-xs text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-300 hover:border-rose-200 px-3.5 py-2 rounded-xl transition cursor-pointer font-medium"
            >
              ออกจากระบบ
            </button>
          </form>
        </div>

        {/* Editable Profile */}
        <ProfileEditor
          userId={user.id}
          initialName={displayName}
          email={email}
          initialPhone={phone}
          initialAvatarUrl={avatarUrl}
          createdAt={createdAt}
        />
      </div>
    </div>
  );
}
