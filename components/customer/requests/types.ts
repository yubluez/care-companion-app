export type RequestStatus =
  | "pending"
  | "accepted"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "rejected"
  | "expired";

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

  // ข้อมูลเพิ่มเติมสำหรับแสดงรายละเอียด
  returnLocation?: string | null;
  meetingType?: "pickup" | "destination";
  transportType?: string;
  outboundDistanceKm?: number;
  returnDistanceKm?: number;
  offeredFee?: number | null;
  note?: string | null;
  meetingDetail?: string | null;
};

export type RequestFilter =
  | "all"
  | "pending"
  | "progress"
  | "completed"
  | "cancelled";
