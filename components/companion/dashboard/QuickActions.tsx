import Link from "next/link";

const ACTIONS = [
  {
    href: "/companion/requests",
    icon: "📋",
    title: "คำของาน",
    description: "ดูและตอบรับคำขอจากลูกค้า",
  },
  {
    href: "/companion/jobs",
    icon: "🗓️",
    title: "งานของฉัน",
    description: "ดูงานที่รับและตารางงาน",
  },
  {
    href: "/companion/profile",
    icon: "👤",
    title: "โปรไฟล์",
    description: "ดูและจัดการข้อมูลของคุณ",
  },
];

export default function QuickActions() {
  return (
    <section>
      <h2 className="text-xl font-bold text-slate-900 mb-4">เมนูลัด</h2>

      <div className="grid sm:grid-cols-3 gap-4">
        {ACTIONS.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group bg-white rounded-2xl border border-slate-200 p-5 hover:border-sky-300 hover:shadow-md transition"
          >
            <div className="text-2xl mb-3">{action.icon}</div>

            <h3 className="font-bold text-slate-800 group-hover:text-sky-700 transition">
              {action.title}
            </h3>

            <p className="text-sm text-slate-500 mt-1">{action.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
