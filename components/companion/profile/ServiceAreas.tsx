type Area = {
  id: string;
  province: string;
  district: string;
};

type Props = {
  areas: Area[];
};

export default function ServiceAreas({ areas }: Props) {
  return (
    <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-800 mb-5">
        พื้นที่ให้บริการ
      </h2>

      {areas.length === 0 ? (
        <p className="text-slate-400">ยังไม่ได้ระบุพื้นที่ให้บริการ</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {areas.map((area) => (
            <span
              key={area.id}
              className="bg-sky-50 border border-sky-200 text-sky-700 px-3 py-2 rounded-xl text-sm font-medium"
            >
              {area.district}, {area.province}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
