import { render, screen } from "@testing-library/react";
import ReportDetailPage from "@/app/[locale]/reports/[id]/page";
import { I18nProvider } from "@/i18n/client";
import { messages } from "@/i18n/messages";
import type { ReportResponse } from "@/types/api";

const mocks = vi.hoisted(() => ({
  getReport: vi.fn(),
  notFound: vi.fn(),
}));

vi.mock("@/services/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/services/api")>();

  return {
    ...actual,
    publicPulseApi: {
      ...actual.publicPulseApi,
      getReport: mocks.getReport,
    },
  };
});

vi.mock("next/navigation", () => ({
  notFound: mocks.notFound,
}));

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
  lastModified: "2026-05-11T12:00:00Z",
};

describe("ReportDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getReport.mockResolvedValue(report);
  });

  it("renders created and last-modified timestamps from the report audit fields", async () => {
    await renderReportDetailPage();

    expect(screen.getByRole("heading", { name: "Road damage" })).toBeInTheDocument();
    expect(screen.getByText("Large pothole near the junction.")).toBeInTheDocument();
    expect(screen.getByText("Created")).toBeInTheDocument();
    expect(screen.getByText("May 10, 2026")).toBeInTheDocument();
    expect(screen.getByText("Updated")).toBeInTheDocument();
    expect(screen.getByText("May 11, 2026")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open image URL" })).toHaveAttribute(
      "href",
      "https://example.com/photo.jpg",
    );
  });

  it("renders the existing not-updated fallback when lastModified is null", async () => {
    mocks.getReport.mockResolvedValue({
      ...report,
      lastModified: null,
    });

    await renderReportDetailPage();

    expect(screen.getByText("Not updated")).toBeInTheDocument();
  });
});

async function renderReportDetailPage() {
  return render(
    <I18nProvider locale="en" messages={messages.en}>
      {await ReportDetailPage({
        params: Promise.resolve({ locale: "en", id: report.id }),
      })}
    </I18nProvider>,
  );
}
