export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T | null;
};

export type RegisterRequest = {
  email: string;
  password: string;
};

export type LoginRequest = RegisterRequest;

export type AuthResponse = {
  userId: string;
  email: string;
  token: string;
  expiresAtUtc: string;
};

export type CategoryResponse = {
  id: string;
  name: string;
  description: string | null;
};

export type ReportStatus = "Reported" | "InProgress" | "Resolved" | 0 | 1 | 2;

export type CreateReportRequest = {
  title: string;
  description: string;
  categoryId: string;
  photoUrl: string;
  county: string;
  roadName: string;
};

export type UpdateReportStatusRequest = {
  status: ReportStatus;
};

export type ReportListItemResponse = {
  id: string;
  title: string;
  categoryId: string;
  categoryName: string;
  county: string;
  roadName: string;
  status: ReportStatus;
  confirmationCount: number;
  createdAtUtc: string;
};

export type ReportResponse = ReportListItemResponse & {
  description: string;
  photoUrl: string;
  updatedAtUtc: string | null;
};

export type ConfirmReportResponse = {
  reportId: string;
  confirmationCount: number;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
