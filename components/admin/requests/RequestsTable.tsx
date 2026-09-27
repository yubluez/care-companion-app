import Link from "next/link";

import RequestPagination from "./RequestPagination";
import RequestStatusBadge from "./RequestStatusBadge";

import type {
  AdminServiceRequest,
  RequestFilterStatus,
  RequestPaginationData,
} from "./types";

type Props = {
  requests: AdminServiceRequest[];
  pagination: RequestPaginationData;
  status: RequestFilterStatus;
  search: string;
};

export default function RequestsTable({
  requests,
  pagination,
  status,
  search,
}: Props) {
  return (
    <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {requests.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-6 py-4">Customer</th>

                  <th className="px-6 py-4">Companion</th>

                  <th className="px-6 py-4">วันที่บริการ</th>

                  <th className="px-6 py-4">ปลายทาง</th>

                  <th className="px-6 py-4">ค่าบริการ</th>

                  <th className="px-6 py-4">สถานะ</th>

                  <th className="px-6 py-4 text-right">จัดการ</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {requests.map((request) => (
                  <tr key={request.id} className="transition hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <Person
                        name={request.customer.fullName}
                        avatarUrl={request.customer.avatarUrl}
                      />
                    </td>

                    <td className="px-6 py-4">
                      {request.companion ? (
                        <Person
                          name={request.companion.fullName}
                          avatarUrl={request.companion.avatarUrl}
                        />
                      ) : (
                        <span className="text-sm text-slate-400">
                          ยังไม่มีผู้รับงาน
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-700">
                        {formatDate(request.serviceDate)}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {formatTime(request.startTime)}
                      </p>
                    </td>

                    <td className="max-w-[220px] px-6 py-4">
                      <p className="truncate text-sm text-slate-600">
                        {request.destinationName || "-"}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {request.offeredFee != null
                        ? `${Number(request.offeredFee).toLocaleString()} บาท`
                        : "-"}
                    </td>

                    <td className="px-6 py-4">
                      <RequestStatusBadge status={request.status} />
                    </td>

                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/requests/${request.id}`}
                        className="inline-flex whitespace-nowrap rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 cursor-pointer shadow-sm"
                      >
                        ดูรายละเอียด
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <RequestPagination
            pagination={pagination}
            status={status}
            search={search}
          />
        </>
      )}
    </div>
  );
}

function Person({
  name,
  avatarUrl,
}: {
  name: string | null;
  avatarUrl: string | null;
}) {
  return (
    <div className="flex min-w-[150px] items-center gap-3">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt=""
          className="h-9 w-9 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-500">
          {getInitial(name)}
        </div>
      )}

      <p className="font-semibold text-slate-900">{name || "ไม่ระบุชื่อ"}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="px-6 py-16 text-center">
      <p className="font-semibold text-slate-700">ไม่พบคำขอใช้บริการ</p>

      <p className="mt-1 text-sm text-slate-400">
        ลองเปลี่ยนตัวกรองหรือคำค้นหา
      </p>
    </div>
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

function formatTime(time: string) {
  return time.slice(0, 5);
}
