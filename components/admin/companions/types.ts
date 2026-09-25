export type CompanionVerificationStatus = "pending" | "approved" | "rejected";

export type CompanionApplication = {
  userId: string;
  fullName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  verificationStatus: CompanionVerificationStatus;
  createdAt: string;
};

export type CompanionFilterStatus = "all" | "pending" | "approved" | "rejected";

export type CompanionCounts = {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
};

export type CompanionPaginationData = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
};
