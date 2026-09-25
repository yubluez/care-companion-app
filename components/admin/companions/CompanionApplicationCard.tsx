import Link from "next/link";

import VerificationBadge from "./VerificationBadge";

export type CompanionApplication = {
  userId: string;
  fullName: string | null;
  avatarUrl: string | null;
  phone: string | null;

  bio: string | null;
  experience: string | null;

  verificationStatus: string;
};

export default function CompanionApplicationCard({
  application,
}: {
  application: CompanionApplication;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col justify-between gap-5 sm:flex-row">
        <div className="flex gap-4">
          {application.avatarUrl ? (
            <img
              src={application.avatarUrl}
              alt={application.fullName || "Companion"}
              className="h-14 w-14 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-500">
              {(application.fullName || "C").charAt(0).toUpperCase()}
            </div>
          )}

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-bold text-slate-900">
                {application.fullName || "ไม่ระบุชื่อ"}
              </h2>

              <VerificationBadge status={application.verificationStatus} />
            </div>

            <p className="mt-1 text-sm text-slate-500">
              {application.phone || "ไม่มีเบอร์โทรศัพท์"}
            </p>

            {application.bio && (
              <p className="mt-3 line-clamp-2 max-w-xl text-sm text-slate-500">
                {application.bio}
              </p>
            )}
          </div>
        </div>

        <div>
          <Link
            href={`/admin/companions/${application.userId}`}
            className="inline-flex rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            ดูใบสมัคร
          </Link>
        </div>
      </div>
    </article>
  );
}
