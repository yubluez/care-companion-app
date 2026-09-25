type AvailabilityItem = {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
};

type Props = {
  availability: AvailabilityItem[];
};

const DAY_NAMES: Record<number, string> = {
  1: "วันจันทร์",
  2: "วันอังคาร",
  3: "วันพุธ",
  4: "วันพฤหัสบดี",
  5: "วันศุกร์",
  6: "วันเสาร์",
  7: "วันอาทิตย์",
};

function formatTime(time: string) {
  return time.slice(0, 5);
}

export default function Availability({ availability }: Props) {
  return (
    <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-800 mb-5">
        วันและเวลาที่ให้บริการ
      </h2>

      {availability.length === 0 ? (
        <p className="text-slate-400">ยังไม่ได้ระบุวันให้บริการ</p>
      ) : (
        <div className="divide-y divide-slate-100">
          {availability.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between py-3"
            >
              <span className="font-medium text-slate-700">
                {DAY_NAMES[item.day_of_week] ?? `วันที่ ${item.day_of_week}`}
              </span>

              <span className="text-sm bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg">
                {formatTime(item.start_time)} - {formatTime(item.end_time)}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
