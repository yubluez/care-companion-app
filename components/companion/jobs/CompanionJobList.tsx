"use client";

import { useState } from "react";
import Link from "next/link";
import StatusBadge from "@/components/companion/dashboard/StatusBadge";
import type { CompanionJob } from "./JobCard";

type JobFilter = "all" | "progress" | "completed" | "cancelled";

type Props = {
  jobs: CompanionJob[];
};

export default function CompanionJobList({ jobs }: Props) {
  const [activeTab, setActiveTab] = useState<JobFilter>("all");

  const filteredJobs = jobs.filter((job) => {
    switch (activeTab) {
      case "all":
        return true;
      case "progress":
        return job.status === "accepted" || job.status === "in_progress";
      case "completed":
        return job.status === "completed";
      case "cancelled":
        return ["cancelled", "rejected", "expired"].includes(job.status);
      default:
        return true;
    }
  });

  const tabs: {
    key: JobFilter;
    label: string;
    count: number;
  }[] = [
    {
      key: "all",
      label: "ทั้งหมด",
      count: jobs.length,
    },
    {
      key: "progress",
      label: "กำลังดำเนินการ",
      count: jobs.filter(
        (j) => j.status === "accepted" || j.status === "in_progress",
      ).length,
    },
    {
      key: "completed",
      label: "เสร็จสิ้น",
      count: jobs.filter((j) => j.status === "completed").length,
    },
    {
      key: "cancelled",
      label: "ยกเลิก",
      count: jobs.filter((j) =>
        ["cancelled", "rejected", "expired"].includes(j.status),
      ).length,
    },
  ];

  return (
    <>
      {/* Tabs */}
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

      {/* Jobs List */}
      <div className="mt-6 space-y-4">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-sky-200 hover:shadow-sm transition"
            >
              {/* Header */}
              <div className="flex justify-between gap-4">
                <div>
                  <p className="text-xs text-slate-400 mb-1">#{job.id}</p>
                  <h2 className="text-lg font-bold text-slate-900">
                    {job.category?.name || "บริการ Companion"}
                  </h2>
                </div>

                <div>
                  <StatusBadge status={job.status} />
                </div>
              </div>

              {/* Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5 text-sm">
                <div>
                  <p className="text-slate-400 mb-1">วันที่และเวลา</p>
                  <p className="font-medium text-slate-700">
                    📅 {formatDate(job.serviceDate)} เวลา {formatTime(job.startTime)} น.
                  </p>
                </div>

                <div>
                  <p className="text-slate-400 mb-1">ระยะเวลา</p>
                  <p className="font-medium text-slate-700">
                    ⏱ {job.durationMinutes != null ? formatDuration(job.durationMinutes) : "-"}
                  </p>
                </div>

                <div>
                  <p className="text-slate-400 mb-1">ลูกค้า</p>
                  <p className="font-medium text-slate-700">
                    👤 {job.customer?.fullName || "ไม่ระบุชื่อ"}
                  </p>
                </div>

                <div>
                  <p className="text-slate-400 mb-1">ค่าบริการ</p>
                  <p className="font-bold text-lg text-emerald-600">
                    {job.offeredFee != null
                      ? `฿${job.offeredFee.toLocaleString("th-TH", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`
                      : "ยังไม่มีข้อมูลราคา"}
                  </p>
                </div>
              </div>

              {/* Route & Action */}
              <div className="mt-5 pt-5 border-t border-slate-100 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-slate-400 mb-1">จุดหมาย</p>
                  <p className="text-sm font-medium text-slate-700">
                    📍 {job.destinationName || "ไม่ระบุจุดหมาย"}
                  </p>
                </div>

                <Link
                  href={`/companion/jobs/${job.id}`}
                  className="border border-sky-300 text-sky-600 hover:bg-sky-600 hover:text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition whitespace-nowrap cursor-pointer"
                >
                  ดูรายละเอียด
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center">
            <div className="mb-3 text-4xl">📋</div>
            <h3 className="font-bold text-slate-800">ไม่พบงาน</h3>
            <p className="mt-1 text-sm text-slate-500">ยังไม่มีงานในสถานะนี้</p>
          </div>
        )}
      </div>
    </>
  );
}

function formatDate(date: string) {
  if (!date) return "-";

  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function formatTime(time: string) {
  if (!time) return "-";
  return time.slice(0, 5);
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;

  if (hours === 0) {
    return `${remaining} นาที`;
  }

  if (remaining === 0) {
    return `${hours} ชั่วโมง`;
  }

  return `${hours} ชม. ${remaining} นาที`;
}
