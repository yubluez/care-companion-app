import Link from "next/link";

import RoleBadge from "./RoleBadge";
import UserPagination from "./UserPagination";

import type { AdminUser, UserFilterRole, UserPaginationData } from "./types";

type Props = {
  users: AdminUser[];
  pagination: UserPaginationData;
  role: UserFilterRole;
  search: string;
};

export default function UsersTable({ users, pagination, role, search }: Props) {
  return (
    <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {users.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-6 py-4">ผู้ใช้งาน</th>

                  <th className="px-6 py-4">เบอร์โทร</th>

                  <th className="px-6 py-4">ประเภทผู้ใช้</th>

                  <th className="px-6 py-4">วันที่สมัคร</th>

                  <th className="px-6 py-4 text-right">จัดการ</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user.id} className="transition hover:bg-slate-50">
                    {/* User */}

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt=""
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-500">
                            {getInitial(user.fullName)}
                          </div>
                        )}

                        <p className="font-semibold text-slate-900">
                          {user.fullName || "ยังไม่ได้ระบุชื่อ"}
                        </p>
                      </div>
                    </td>

                    {/* Phone */}

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {user.phone || "-"}
                    </td>

                    {/* Role */}

                    <td className="px-6 py-4">
                      <RoleBadge role={user.role} />
                    </td>

                    {/* Created */}

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {formatDate(user.createdAt)}
                    </td>

                    {/* Action */}

                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="inline-flex rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 cursor-pointer shadow-sm"
                      >
                        ดูรายละเอียด
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <UserPagination pagination={pagination} role={role} search={search} />
        </>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="px-6 py-16 text-center">
      <p className="font-semibold text-slate-700">ไม่พบผู้ใช้งาน</p>

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
