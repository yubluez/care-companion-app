import Link from "next/link";

import VerificationBadge from "./VerificationBadge";
import CompanionPagination from "./CompanionPagination";

import type {
  CompanionApplication,
  CompanionFilterStatus,
  CompanionPaginationData,
} from "./types";

type Props = {
  applications: CompanionApplication[];
  pagination: CompanionPaginationData;
  status: CompanionFilterStatus;
  search: string;
};

export default function CompanionApplicationsTable({
  applications,
  pagination,
  status,
  search,
}: Props) {
  return (
    <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {applications.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-6 py-4">Companion</th>

                  <th className="px-6 py-4">เบอร์โทร</th>

                  <th className="px-6 py-4">วันที่สมัคร</th>

                  <th className="px-6 py-4">สถานะ</th>

                  <th className="px-6 py-4 text-right">จัดการ</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {applications.map((application) => (
                  <tr
                    key={application.userId}
                    className="transition hover:bg-slate-50"
                  >
                    {/* Companion */}

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {application.avatarUrl ? (
                          <img
                            src={application.avatarUrl}
                            alt=""
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-500">
                            {getInitial(application.fullName)}
                          </div>
                        )}

                        <p className="font-semibold text-slate-900">
                          {application.fullName || "ยังไม่ได้ระบุชื่อ"}
                        </p>
                      </div>
                    </td>

                    {/* Phone */}

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {application.phone || "-"}
                    </td>

                    {/* Date */}

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {formatDate(application.createdAt)}
                    </td>

                    {/* Status */}

                    <td className="px-6 py-4">
                      <VerificationBadge
                        status={application.verificationStatus}
                      />
                    </td>

                    {/* Action */}

                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/companions/${application.userId}`}
                        className="inline-flex rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 cursor-pointer shadow-sm"
                      >
                        ดูใบสมัคร
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <CompanionPagination
            pagination={pagination}
            status={status}
            search={search}
          />
        </>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="px-6 py-16 text-center">
      <p className="font-semibold text-slate-700">ไม่พบใบสมัคร</p>

      <p className="mt-1 text-sm text-slate-400">
        ลองเปลี่ยนตัวกรองหรือคำค้นหา
      </p>
    </div>
  );
}

function getInitial(name: string | null) {
  if (!name) {
    return "?";
  }

  return name.trim().charAt(0).toUpperCase();
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}
