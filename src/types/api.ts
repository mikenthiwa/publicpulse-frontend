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
  description: string;
  categoryId: string;
  county: string;
  roadName: string;
  images: CreateReportImageRequest[];
};

export type CreateReportImageRequest = {
  publicId: string;
  version: string;
  signature: string;
};

export type RequestReportImageUploadResponse = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  uploadPreset: string;
  signature: string;
};

export type CloudinaryUploadResponse = {
  public_id: string;
  version: number;
  signature: string;
};

export type UpdateReportStatusRequest = {
  status: ReportStatus;
};

export type ReportListItemResponse = {
  id: string;
  categoryId: string;
  categoryName: string;
  images: ReportImageResponse[];
  county: string;
  roadName: string;
  status: ReportStatus;
  confirmationCount: number;
  created: string;
};

export type ReportImageResponse = {
  id: string;
  imageUrl: string;
  publicId: string;
};

export type ReportResponse = ReportListItemResponse & {
  description: string;
  lastModified: string | null;
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
