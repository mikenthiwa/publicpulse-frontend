import type {
  ApiResponse,
  AuthResponse,
  CategoryResponse,
  CloudinaryUploadResponse,
  ConfirmReportResponse,
  CreateReportRequest,
  LocationLookupResponse,
  LoginRequest,
  PaginatedList,
  RegisterRequest,
  RequestReportImageUploadResponse,
  ReportListItemResponse,
  ReportResponse,
  ReportStatus,
  ValidationProblemDetails,
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

  const payload = await readJson(response);

  if (!response.ok) {
    throw createApiError(response.status, payload);
  }

  if (!isApiResponse<T>(payload) || !payload.success || payload.data === null) {
    throw new ApiError(messageForStatus(response.status), response.status);
  }

  return payload.data;
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function createApiError(status: number, payload: unknown) {
  const problemDetails = parseProblemDetails(payload);

  return new ApiError(
    problemDetails?.detail || messageForStatus(status),
    status,
    {
      title: problemDetails?.title,
      type: problemDetails?.type,
      instance: problemDetails?.instance,
      traceId: problemDetails?.traceId,
      validationErrors: normalizeValidationErrors(problemDetails?.errors),
    },
  );
}

function isApiResponse<T>(payload: unknown): payload is ApiResponse<T> {
  return (
    isRecord(payload) &&
    typeof payload.success === "boolean" &&
    typeof payload.message === "string" &&
    "data" in payload
  );
}

function parseProblemDetails(payload: unknown): ValidationProblemDetails | null {
  if (!isRecord(payload)) return null;

  return {
    type: optionalString(payload.type),
    title: optionalString(payload.title),
    status: typeof payload.status === "number" ? payload.status : undefined,
    detail: optionalString(payload.detail),
    instance: optionalString(payload.instance),
    traceId: optionalString(payload.traceId),
    errors: normalizeValidationErrors(payload.errors),
  };
}

function normalizeValidationErrors(errors: unknown) {
  if (!isRecord(errors)) return {};

  return Object.fromEntries(
    Object.entries(errors).flatMap(([key, messages]) => {
      if (!Array.isArray(messages)) return [];

      const normalizedMessages = messages.filter(
        (message): message is string => typeof message === "string",
      );

      return normalizedMessages.length > 0
        ? [[key.toLowerCase(), normalizedMessages]]
        : [];
    }),
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function optionalString(value: unknown) {
  return typeof value === "string" ? value : undefined;
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
  listReports(pageNumber: number, pageSize = 10) {
    const params = new URLSearchParams({
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString(),
    });

    return request<PaginatedList<ReportListItemResponse>>(
      `/api/Reports?${params}`,
    );
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
