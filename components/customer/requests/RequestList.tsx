"use client";

import { useState } from "react";
import RequestTabs from "@/components/customer/requests/RequestTabs";
import RequestCard from "@/components/customer/requests/RequestCard";
import RequestDetailModal from "./RequestDetailModal";

export type RequestStatus =
  | "pending"
  | "accepted"
  | "in_progress"
  | "completed"
  | "cancelled";

export type ServiceRequest = {
  id: string;
  category: string;
  date: string;
  time: string;
  duration: string;
  origin: string;
  destination: string;
  companionName: string;
  status: RequestStatus;
};

const requests: ServiceRequest[] = [
  {
    id: "REQ001",
    category: "ไปโรงพยาบาล",
    date: "28 ก.ย. 2569",
    time: "09:00",
    duration: "3 ชั่วโมง",
    origin: "บางแค",
    destination: "โรงพยาบาลศิริราช",
    companionName: "สมชาย ใจดี",
    status: "pending",
  },
  {
    id: "REQ002",
    category: "ไปธนาคาร",
    date: "30 ก.ย. 2569",
    time: "13:00",
    duration: "2 ชั่วโมง",
    origin: "หนองแขม",
    destination: "ธนาคาร",
    companionName: "พิมพ์ชนก ดีงาม",
    status: "accepted",
  },
  {
    id: "REQ003",
    category: "ติดต่อหน่วยงานราชการ",
    date: "20 ก.ย. 2569",
    time: "10:00",
    duration: "2 ชั่วโมง",
    origin: "บางแค",
    destination: "สำนักงานเขต",
    companionName: "ธนกร มีสุข",
    status: "completed",
  },
];

export type RequestFilter =
  | "all"
  | "pending"
  | "progress"
  | "completed"
  | "cancelled";

export default function RequestList() {
  const [activeTab, setActiveTab] = useState<RequestFilter>("all");

  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(
    null,
  );

  const filteredRequests = requests.filter((request) => {
    if (activeTab === "all") {
      return true;
    }

    if (activeTab === "pending") {
      return request.status === "pending";
    }

    if (activeTab === "progress") {
      return request.status === "accepted" || request.status === "in_progress";
    }

    return request.status === activeTab;
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
          <div className="bg-white border border-slate-200 rounded-2xl py-16 text-center">
            <div className="text-4xl mb-3">📋</div>

            <h3 className="font-bold text-slate-800">ไม่พบคำขอ</h3>

            <p className="text-sm text-slate-500 mt-1">
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
