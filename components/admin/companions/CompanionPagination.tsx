import Link from "next/link";

import type { CompanionFilterStatus, CompanionPaginationData } from "./types";

type Props = {
  pagination: CompanionPaginationData;
  status: CompanionFilterStatus;
  search: string;
};

export default function CompanionPagination({
  pagination,
  status,
  search,
}: Props) {
  const { currentPage, totalPages, totalItems, startIndex, endIndex } =
    pagination;

  function buildUrl(page: number) {
    const params = new URLSearchParams();

    if (status !== "all") {
      params.set("status", status);
    }

    if (search) {
      params.set("search", search);
    }

    if (page > 1) {
      params.set("page", String(page));
    }

    const query = params.toString();

    return query ? `/admin/companions?${query}` : "/admin/companions";
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
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
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
      className="cursor-pointer rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700"
    >
      {children}
    </Link>
  );
}
