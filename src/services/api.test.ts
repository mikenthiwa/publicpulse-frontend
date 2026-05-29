import { publicPulseApi } from "@/services/api";
import { ApiError, type ReportResponse } from "@/types/api";

const report: ReportResponse = {
  id: "report-1",
  description: "Large pothole near the junction.",
  categoryId: "category-1",
  categoryName: "Road damage",
  images: [
    {
      id: "image-1",
      imageUrl: "https://example.com/photo.jpg",
      publicId: "reports/photo",
    },
  ],
  county: "Nairobi",
  roadName: "Main Road",
  status: 0,
  confirmationCount: 2,
  created: "2026-05-10T10:00:00Z",
  lastModified: null,
};

describe("publicPulseApi", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("parses successful ApiResponse payloads", async () => {
    mockFetchResponse(200, {
      success: true,
      message: "Reports retrieved successfully.",
      data: [report],
    });

    await expect(publicPulseApi.listReports()).resolves.toEqual([report]);
    expect(fetch).toHaveBeenCalledWith(
      "/api/publicpulse/api/Reports",
      expect.objectContaining({
        method: "GET",
        cache: "no-store",
      }),
    );
  });

  it("sends JSON bodies and bearer tokens for authenticated requests", async () => {
    mockFetchResponse(200, {
      success: true,
      message: "Report created successfully.",
      data: report,
    });

    await publicPulseApi.createReport(
      {
        description: report.description,
        categoryId: report.categoryId,
        county: report.county,
        roadName: report.roadName,
        images: [
          {
            publicId: report.images[0].publicId,
            version: "1",
            signature: "cloudinary-signature",
          },
        ],
      },
      "token-1",
    );

    const [, options] = vi.mocked(fetch).mock.calls[0];
    const headers = options?.headers as Headers;

    expect(options).toEqual(
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          description: report.description,
          categoryId: report.categoryId,
          county: report.county,
          roadName: report.roadName,
          images: [
            {
              publicId: report.images[0].publicId,
              version: "1",
              signature: "cloudinary-signature",
            },
          ],
        }),
      }),
    );
    expect(headers.get("Authorization")).toBe("Bearer token-1");
    expect(headers.get("Content-Type")).toBe("application/json");
  });

  it("requests signed Cloudinary report image upload params", async () => {
    const upload = {
      cloudName: "publicpulse",
      apiKey: "api-key",
      timestamp: 1780000000,
      folder: "reports",
      uploadPreset: "publicpulse-reports",
      signature: "upload-signature",
    };

    mockFetchResponse(200, {
      success: true,
      message: "Upload signature created.",
      data: upload,
    });

    await expect(
      publicPulseApi.requestReportImageUpload("token-1"),
    ).resolves.toEqual(upload);

    const [, options] = vi.mocked(fetch).mock.calls[0];
    const headers = options?.headers as Headers;

    expect(fetch).toHaveBeenCalledWith(
      "/api/publicpulse/api/Reports/images/upload-signature",
      expect.objectContaining({
        method: "POST",
      }),
    );
    expect(headers.get("Authorization")).toBe("Bearer token-1");
    expect(headers.get("Content-Type")).toBeNull();
  });

  it("uploads report images directly to Cloudinary", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({
        secure_url: "https://res.cloudinary.com/publicpulse/image/upload/v1/reports/road.jpg",
        public_id: "reports/road",
        version: 1,
        signature: "cloudinary-response-signature",
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );

    const file = new File(["image"], "road.jpg", { type: "image/jpeg" });

    await expect(publicPulseApi.uploadReportImage(
      {
        cloudName: "publicpulse",
        apiKey: "api-key",
        timestamp: 1780000000,
        folder: "reports",
        uploadPreset: "publicpulse-reports",
        signature: "upload-signature",
      },
      file,
    )).resolves.toEqual({
      public_id: "reports/road",
      version: 1,
      signature: "cloudinary-response-signature",
    });

    const [, options] = vi.mocked(fetch).mock.calls[0];
    const body = options?.body as FormData;

    expect(fetch).toHaveBeenCalledWith(
      "https://api.cloudinary.com/v1_1/publicpulse/image/upload",
      expect.objectContaining({
        method: "POST",
        body,
      }),
    );
    expect(body.get("file")).toBe(file);
    expect(body.get("api_key")).toBe("api-key");
    expect(body.get("timestamp")).toBe("1780000000");
    expect(body.get("folder")).toBe("reports");
    expect(body.get("upload_preset")).toBe("publicpulse-reports");
    expect(body.get("signature")).toBe("upload-signature");
  });

  it("throws ApiError with backend messages", async () => {
    mockFetchResponse(403, {
      success: false,
      message: "You do not own this report.",
      data: null,
    });

    await expect(publicPulseApi.updateReportStatus("report-1", 2, "token-1")).rejects.toMatchObject({
      message: "You do not own this report.",
      status: 403,
    });
  });

  it("maps network failures to ApiError", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("network failed"));

    await expect(publicPulseApi.listCategories()).rejects.toBeInstanceOf(ApiError);
    await expect(publicPulseApi.listCategories()).rejects.toMatchObject({
      message: "Unable to reach the PublicPulse API.",
      status: 0,
    });
  });
});

function mockFetchResponse(status: number, payload: unknown) {
  vi.mocked(fetch).mockResolvedValue(
    new Response(JSON.stringify(payload), {
      status,
      headers: {
        "Content-Type": "application/json",
      },
    }),
  );
}
