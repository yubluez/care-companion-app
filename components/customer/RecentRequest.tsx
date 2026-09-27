import Link from "next/link";
import { getCustomerRequests } from "@/lib/queries/customerRequests";
import RecentRequestCard from "./RecentRequestCard";

export default async function RecentRequest() {
  const requests = await getCustomerRequests();
  const latestRequest = requests[0];

  if (!latestRequest) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="font-medium text-slate-700">ยังไม่มีคำขอใช้บริการ</p>

        <p className="mt-2 text-sm text-slate-500">
          เริ่มต้นด้วยการค้นหา Companion หรือสร้างคำขอใหม่
        </p>

        <Link
          href="/customer/requests/new"
          className="mt-5 inline-flex cursor-pointer rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-700 transition"
        >
          เพิ่มคำขอใหม่
        </Link>
      </div>
    );
  }

  return <RecentRequestCard request={latestRequest} />;
}
