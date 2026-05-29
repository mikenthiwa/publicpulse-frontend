import type {
  ApiResponse,
  AuthResponse,
  CategoryResponse,
  CloudinaryUploadResponse,
  ConfirmReportResponse,
  CreateReportRequest,
  LocationLookupResponse,
  LoginRequest,
  RegisterRequest,
  RequestReportImageUploadResponse,
  ReportListItemResponse,
  ReportResponse,
  ReportStatus,
} from "@/types/api";
import { ApiError } from "@/types/api";

export const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT";
  body?: unknown;
  token?: string;
};

async function request<T>(
  path: string,
  { method = "GET", body, token }: RequestOptions = {},
): Promise<T> {
  const headers = new Headers({
    Accept: "application/json",
  });

  if (body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;

  try {
    response = await fetch(getRequestUrl(path), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    throw new ApiError("Unable to reach the PublicPulse API.", 0);
  }

  const payload = await readPayload<T>(response);

  if (!response.ok || !payload.success || payload.data === null) {
    throw new ApiError(
      payload.message || messageForStatus(response.status),
      response.status,
    );
  }

  return payload.data;
}

async function readPayload<T>(response: Response): Promise<ApiResponse<T>> {
  try {
    return (await response.json()) as ApiResponse<T>;
  } catch {
    return {
      success: false,
      message: messageForStatus(response.status),
      data: null,
    };
  }
}

function messageForStatus(status: number) {
  if (status === 0) return "Unable to reach the PublicPulse API.";
  if (status === 400) return "Check the form and try again.";
  if (status === 401) return "Log in to continue.";
  if (status === 403) return "You do not have permission to do that.";
  if (status === 404) return "That record could not be found.";
  if (status >= 500) return "The API is unavailable. Try again shortly.";

  return "Something went wrong. Try again.";
}

async function uploadReportImageToCloudinary(
  upload: RequestReportImageUploadResponse,
  file: File,
): Promise<CloudinaryUploadResponse> {
  const formData = new FormData();
  formData.set("file", file);
  formData.set("api_key", upload.apiKey);
  formData.set("timestamp", upload.timestamp.toString());
  formData.set("folder", upload.folder);
  formData.set("upload_preset", upload.uploadPreset);
  formData.set("signature", upload.signature);

  let response: Response;

  try {
    response = await fetch(getCloudinaryUploadUrl(upload.cloudName), {
      method: "POST",
      body: formData,
    });
  } catch {
    throw new ApiError("Unable to upload the report image.", 0);
  }

  let payload: Partial<CloudinaryUploadResponse> = {};

  try {
    payload = (await response.json()) as Partial<CloudinaryUploadResponse>;
  } catch {
    payload = {};
  }

  if (!response.ok) {
    throw new ApiError("Unable to upload the report image.", response.status);
  }

  if (
    !payload.public_id ||
    typeof payload.version !== "number" ||
    !payload.signature
  ) {
    throw new ApiError("Unable to upload the report image.", response.status);
  }

  return {
    public_id: payload.public_id,
    version: payload.version,
    signature: payload.signature,
  };
}

function getRequestUrl(path: string) {
  if (typeof window === "undefined") {
    return `${apiBaseUrl}${path}`;
  }

  return `/api/publicpulse${path}`;
}

function getCloudinaryUploadUrl(cloudName: string) {
  return `https://api.cloudinary.com/v1_1/${encodeURIComponent(
    cloudName,
  )}/image/upload`;
}

export const publicPulseApi = {
  register(requestBody: RegisterRequest) {
    return request<AuthResponse>("/api/Auth/register", {
      method: "POST",
      body: requestBody,
    });
  },
  login(requestBody: LoginRequest) {
    return request<AuthResponse>("/api/Auth/login", {
      method: "POST",
      body: requestBody,
    });
  },
  listCategories() {
    return request<CategoryResponse[]>("/api/Categories");
  },
  reverseGeocodeLocation(latitude: number, longitude: number) {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
    });

    return request<LocationLookupResponse>(`/api/Locations/reverse?${params}`);
  },
  listReports() {
    return request<ReportListItemResponse[]>("/api/Reports");
  },
  getReport(id: string) {
    return request<ReportResponse>(`/api/Reports/${id}`);
  },
  createReport(requestBody: CreateReportRequest, token: string) {
    return request<ReportResponse>("/api/Reports", {
      method: "POST",
      body: requestBody,
      token,
    });
  },
  requestReportImageUpload(token: string) {
    return request<RequestReportImageUploadResponse>(
      "/api/Reports/images/upload-signature",
      {
        method: "POST",
        token,
      },
    );
  },
  uploadReportImage(
    upload: RequestReportImageUploadResponse,
    file: File,
  ) {
    return uploadReportImageToCloudinary(upload, file);
  },
  confirmReport(id: string) {
    return request<ConfirmReportResponse>(`/api/Reports/${id}/confirmations`, {
      method: "POST",
    });
  },
  updateReportStatus(id: string, status: ReportStatus, token: string) {
    return request<ReportResponse>(`/api/Reports/${id}/status`, {
      method: "PUT",
      body: { status },
      token,
    });
  },
};
