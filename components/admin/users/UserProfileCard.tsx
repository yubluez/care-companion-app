import RoleBadge from "./RoleBadge";
import type { UserRole } from "./types";

type Props = {
  fullName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  role: UserRole;
  createdAt: string;
};

export default function UserProfileCard({
  fullName,
  phone,
  avatarUrl,
  role,
  createdAt,
}: Props) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt=""
            className="h-20 w-20 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-2xl font-bold text-slate-500">
            {getInitial(fullName)}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">
              {fullName || "ยังไม่ได้ระบุชื่อ"}
            </h1>

            <RoleBadge role={role} />
          </div>

          <div className="mt-3 flex flex-wrap gap-x-8 gap-y-2 text-sm">
            <div>
              <span className="text-slate-400">เบอร์โทร</span>
              <p className="mt-0.5 font-medium text-slate-700">
                {phone || "-"}
              </p>
            </div>

            <div>
              <span className="text-slate-400">วันที่สมัคร</span>
              <p className="mt-0.5 font-medium text-slate-700">
                {formatDate(createdAt)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function getInitial(name: string | null) {
  if (!name) return "?";

  return name.trim().charAt(0).toUpperCase();
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}
