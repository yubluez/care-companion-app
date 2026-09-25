export type UserRole = "customer" | "companion";

export type UserFilterRole = "all" | UserRole;

export type AdminUser = {
  id: string;
  fullName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  role: UserRole;
  createdAt: string;
};

export type UserCounts = {
  total: number;
  customer: number;
  companion: number;
};

export type UserPaginationData = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
};
