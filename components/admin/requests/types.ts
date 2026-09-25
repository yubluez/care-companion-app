export type RequestStatus =
  | "pending"
  | "accepted"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "rejected"
  | "expired";

export type RequestFilterStatus = "all" | RequestStatus;

export type AdminServiceRequest = {
  id: string;

  customer: {
    id: string;
    fullName: string | null;
    avatarUrl: string | null;
  };

  companion: {
    id: string;
    fullName: string | null;
    avatarUrl: string | null;
  } | null;

  serviceDate: string;
  startTime: string;
  destinationName: string | null;
  offeredFee: number | null;
  status: RequestStatus;
  createdAt: string;
};

export type RequestCounts = {
  total: number;
  pending: number;
  accepted: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  rejected: number;
  expired: number;
};

export type RequestPaginationData = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
};
