type Props = {
  fullName: string;
  email: string;
  phone: string;
};

export default function PersonalInfo({ fullName, email, phone }: Props) {
  return (
    <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-800 mb-5">ข้อมูลส่วนตัว</h2>

      <div className="grid sm:grid-cols-2 gap-5">
        <Info label="ชื่อ-นามสกุล" value={fullName} />
        <Info label="อีเมล" value={email} />
        <Info label="เบอร์โทรศัพท์" value={phone} />
      </div>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-slate-400 mb-1">{label}</p>

      <p className="font-medium text-slate-800">{value || "-"}</p>
    </div>
  );
}
