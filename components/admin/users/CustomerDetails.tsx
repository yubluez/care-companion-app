type ServiceRequest = {
  id: string;
  serviceDate: string | null;
  destinationName: string | null;
  status: string;
  offeredFee: number | null;
};

type Props = {
  requests: ServiceRequest[];
};

export default function CustomerDetails({ requests }: Props) {
  const completed = requests.filter(
    (request) => request.status === "completed",
  ).length;

  const cancelled = requests.filter(
    (request) => request.status === "cancelled",
  ).length;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard title="คำขอทั้งหมด" value={requests.length} />

        <SummaryCard title="เสร็จสิ้น" value={completed} />

        <SummaryCard title="ยกเลิก" value={cancelled} />
      </div>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="font-bold text-slate-900">ประวัติคำขอใช้บริการ</h2>

          <p className="mt-1 text-sm text-slate-500">
            คำขอใช้บริการที่ผู้ใช้งานสร้างไว้
          </p>
        </div>

        {requests.length === 0 ? (
          <EmptyState message="ยังไม่มีประวัติคำขอใช้บริการ" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-4">วันที่ใช้บริการ</th>
                  <th className="px-6 py-4">ปลายทาง</th>
                  <th className="px-6 py-4">ค่าบริการ</th>
                  <th className="px-6 py-4">สถานะ</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {requests.map((request) => (
                  <tr key={request.id}>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {request.serviceDate
                        ? formatDate(request.serviceDate)
                        : "-"}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {request.destinationName || "-"}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {request.offeredFee != null
                        ? `${request.offeredFee.toLocaleString()} บาท`
                        : "-"}
                    </td>

                    <td className="px-6 py-4">
                      <RequestStatus status={request.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

function SummaryCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function RequestStatus({ status }: { status: string }) {
  const label: Record<string, string> = {
    pending: "รอดำเนินการ",
    accepted: "รับงานแล้ว",
    in_progress: "กำลังดำเนินการ",
    completed: "เสร็จสิ้น",
    cancelled: "ยกเลิก",
    rejected: "ปฏิเสธ",
  };

  return (
    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
      {label[status] ?? status}
    </span>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="px-6 py-12 text-center text-sm text-slate-400">
      {message}
    </div>
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}
