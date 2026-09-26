export type CompanionRequestStatus = "pending" | "rejected" | "expired";

export type CompanionRequest = {
  id: string;

  serviceDate: string;
  startTime: string;
  durationMinutes: number | null;

  destinationName: string | null;
  offeredFee: number | null;

  status: CompanionRequestStatus;

  customer: {
    fullName: string | null;
    avatarUrl: string | null;
  } | null;

  category: {
    name: string;
  } | null;
};

export type RequestFilter = "all" | CompanionRequestStatus;

export type RequestCounts = {
  total: number;
  pending: number;
  rejected: number;
  expired: number;
};
