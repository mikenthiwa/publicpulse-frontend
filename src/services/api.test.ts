import { publicPulseApi } from "@/services/api";
import { ApiError, type ReportResponse } from "@/types/api";

const report: ReportResponse = {
  id: "report-1",
  title: "Pothole on main road",
  description: "Large pothole near the junction.",
  categoryId: "category-1",
  categoryName: "Road damage",
  photoUrl: "https://example.com/photo.jpg",
  county: "Nairobi",
  roadName: "Main Road",
  status: 0,
  confirmationCount: 2,
  createdAtUtc: "2026-05-10T10:00:00Z",
  updatedAtUtc: null,
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
        title: report.title,
        description: report.description,
        categoryId: report.categoryId,
        photoUrl: report.photoUrl,
        county: report.county,
        roadName: report.roadName,
      },
      "token-1",
    );

    const [, options] = vi.mocked(fetch).mock.calls[0];
    const headers = options?.headers as Headers;

    expect(options).toEqual(
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          title: report.title,
          description: report.description,
          categoryId: report.categoryId,
          photoUrl: report.photoUrl,
          county: report.county,
          roadName: report.roadName,
        }),
      }),
    );
    expect(headers.get("Authorization")).toBe("Bearer token-1");
    expect(headers.get("Content-Type")).toBe("application/json");
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
