export type UserRole = "ADMIN" | "DRIVER" | "CUSTOMER";
export type UserStatus = "ACTIVE" | "INACTIVE" | "BLOCKED";

export type OrderStatus =
  | "NEW"
  | "WAITING_DRIVER"
  | "WAITING_CONFIRMATION"
  | "ACTIVE"
  | "COMPLETED"
  | "CANCELLED"
  | "EXPIRED";

export interface SessionUser {
  id: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone: string;
  status: UserStatus;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T | null;
  errors: Record<string, string> | null;
  timestamp: string;
}
