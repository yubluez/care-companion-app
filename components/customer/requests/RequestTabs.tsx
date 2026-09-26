import type { RequestFilter, ServiceRequest } from "./types";

type Props = {
  activeTab: RequestFilter;
  setActiveTab: (tab: RequestFilter) => void;
  requests: ServiceRequest[];
};

export default function RequestTabs({
  activeTab,
  setActiveTab,
  requests,
}: Props) {
  const tabs: {
    key: RequestFilter;
    label: string;
    count: number;
  }[] = [
    {
      key: "all",
      label: "ทั้งหมด",
      count: requests.length,
    },
    {
      key: "pending",
      label: "รอตอบรับ",
      count: requests.filter((r) => r.status === "pending").length,
    },
    {
      key: "progress",
      label: "กำลังดำเนินการ",
      count: requests.filter(
        (r) => r.status === "accepted" || r.status === "in_progress",
      ).length,
    },
    {
      key: "completed",
      label: "เสร็จสิ้น",
      count: requests.filter((r) => r.status === "completed").length,
    },
    {
      key: "cancelled",
      label: "ยกเลิก",
      count: requests.filter((r) =>
        ["cancelled", "rejected", "expired"].includes(r.status),
      ).length,
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-2 flex gap-2 overflow-x-auto">
      {tabs.map((tab) => {
        const active = activeTab === tab.key;

        return (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`
              flex items-center gap-2
              px-5 py-2.5
              rounded-xl
              whitespace-nowrap
              text-sm font-semibold
              transition
              cursor-pointer

              ${
                active
                  ? "bg-sky-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }
            `}
          >
            {tab.label}

            <span
              className={`
                min-w-6 h-6
                px-1.5
                flex items-center justify-center
                rounded-full
                text-xs

                ${
                  active
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-500"
                }
              `}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
