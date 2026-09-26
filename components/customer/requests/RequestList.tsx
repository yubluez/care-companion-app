"use client";

import { useState } from "react";
import RequestTabs from "./RequestTabs";
import RequestCard from "./RequestCard";
import RequestDetailModal from "./RequestDetailModal";

import type { ServiceRequest, RequestFilter } from "./types";

type Props = {
  requests: ServiceRequest[];
};

export default function RequestList({ requests }: Props) {
  const [activeTab, setActiveTab] = useState<RequestFilter>("all");

  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(
    null,
  );

  const filteredRequests = requests.filter((request) => {
    switch (activeTab) {
      case "all":
        return true;

      case "pending":
        return request.status === "pending";

      case "progress":
        return (
          request.status === "accepted" || request.status === "in_progress"
        );

      case "completed":
        return request.status === "completed";

      case "cancelled":
        return ["cancelled", "rejected", "expired"].includes(request.status);

      default:
        return true;
    }
  });

  return (
    <>
      <RequestTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        requests={requests}
      />

      <div className="mt-6 space-y-4">
        {filteredRequests.length > 0 ? (
          filteredRequests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              onViewDetail={setSelectedRequest}
            />
          ))
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center">
            <div className="mb-3 text-4xl">📋</div>

            <h3 className="font-bold text-slate-800">ไม่พบคำขอ</h3>

            <p className="mt-1 text-sm text-slate-500">
              ยังไม่มีคำขอในสถานะนี้
            </p>
          </div>
        )}
      </div>

      <RequestDetailModal
        request={selectedRequest}
        onClose={() => setSelectedRequest(null)}
      />
    </>
  );
}
