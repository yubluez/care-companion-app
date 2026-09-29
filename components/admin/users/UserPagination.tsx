import Link from "next/link";

import type { UserFilterRole, UserPaginationData } from "./types";

type Props = {
  pagination: UserPaginationData;
  role: UserFilterRole;
  search: string;
};

export default function UserPagination({ pagination, role, search }: Props) {
  const { currentPage, totalPages, totalItems, startIndex, endIndex } =
    pagination;

  function buildUrl(page: number) {
    const params = new URLSearchParams();

    if (role !== "all") {
      params.set("role", role);
    }

    if (search) {
      params.set("search", search);
    }

    if (page > 1) {
      params.set("page", String(page));
    }

    const query = params.toString();

    return query ? `/admin/users?${query}` : "/admin/users";
  }

  return (
    <div className="flex flex-col gap-4 border-t border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-500">
        {totalItems === 0
          ? "ไม่มีรายการ"
          : `แสดง ${startIndex + 1}-${Math.min(
              endIndex,
              totalItems,
            )} จาก ${totalItems} รายการ`}
      </p>

      {totalPages > 1 && (
        <div className="flex flex-wrap items-center gap-1">
          <PaginationButton
            href={buildUrl(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            ก่อนหน้า
          </PaginationButton>

          {Array.from({ length: totalPages }, (_, index) => index + 1).map(
            (pageNumber) => (
              <Link
                key={pageNumber}
                href={buildUrl(pageNumber)}
                className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-semibold transition cursor-pointer ${
                  pageNumber === currentPage
                    ? "bg-sky-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-sky-50 hover:text-sky-700"
                }`}
              >
                {pageNumber}
              </Link>
            ),
          )}

          <PaginationButton
            href={buildUrl(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            ถัดไป
          </PaginationButton>
        </div>
      )}
    </div>
  );
}

function PaginationButton({
  href,
  disabled,
  children,
}: {
  href: string;
  disabled: boolean;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span className="cursor-not-allowed rounded-lg px-3 py-2 text-sm font-semibold text-slate-300">
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className="cursor-pointer rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-sky-50 hover:text-sky-700"
    >
      {children}
    </Link>
  );
}
