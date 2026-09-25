type Props = {
  status: string;
};

export default function VerificationBadge({ status }: Props) {
  if (status === "approved") {
    return (
      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
        อนุมัติแล้ว
      </span>
    );
  }

  if (status === "rejected") {
    return (
      <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
        ไม่ผ่านการตรวจสอบ
      </span>
    );
  }

  return (
    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
      รอตรวจสอบ
    </span>
  );
}
