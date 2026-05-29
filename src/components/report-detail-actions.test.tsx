import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReportDetailActions } from "@/components/report-detail-actions";
import { I18nProvider } from "@/i18n/client";
import type { Locale } from "@/i18n/config";
import { messages } from "@/i18n/messages";
import type { AuthResponse, ReportResponse } from "@/types/api";

const mocks = vi.hoisted(() => ({
  confirmReport: vi.fn(),
  updateReportStatus: vi.fn(),
  getStoredAuth: vi.fn(),
  isOwnedReport: vi.fn(),
}));

vi.mock("@/services/api", () => ({
  publicPulseApi: {
    confirmReport: mocks.confirmReport,
    updateReportStatus: mocks.updateReportStatus,
  },
}));

vi.mock("@/services/auth-storage", () => ({
  getStoredAuth: mocks.getStoredAuth,
  isOwnedReport: mocks.isOwnedReport,
}));

const auth: AuthResponse = {
  userId: "user-1",
  email: "citizen@example.com",
  token: "token-1",
  expiresAtUtc: "2026-05-11T10:00:00Z",
};

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

describe("ReportDetailActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getStoredAuth.mockReturnValue(null);
    mocks.isOwnedReport.mockReturnValue(false);
  });

  it("confirms a report and updates the confirmation count", async () => {
    const user = userEvent.setup();
    mocks.confirmReport.mockResolvedValue({
      reportId: report.id,
      confirmationCount: 3,
    });

    renderReportDetailActions();

    expect(screen.getByText("2")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Confirm issue" }));

    await waitFor(() => {
      expect(mocks.confirmReport).toHaveBeenCalledWith(report.id);
    });
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("Report confirmed.")).toBeInTheDocument();
  });

  it("shows status controls for locally owned reports and updates status", async () => {
    const user = userEvent.setup();
    mocks.getStoredAuth.mockReturnValue(auth);
    mocks.isOwnedReport.mockReturnValue(true);
    mocks.updateReportStatus.mockResolvedValue({
      ...report,
      status: 2,
    });

    renderReportDetailActions();

    const resolvedButton = await screen.findByRole("button", { name: "Resolved" });

    await user.click(resolvedButton);

    await waitFor(() => {
      expect(mocks.updateReportStatus).toHaveBeenCalledWith(report.id, 2, auth.token);
    });
    expect(screen.getByText("Report status updated.")).toBeInTheDocument();
  });

  it("confirms a report with Swahili labels and messages", async () => {
    const user = userEvent.setup();
    mocks.confirmReport.mockResolvedValue({
      reportId: report.id,
      confirmationCount: 3,
    });

    renderReportDetailActions("sw");

    await user.click(screen.getByRole("button", { name: "Thibitisha tatizo" }));

    await waitFor(() => {
      expect(mocks.confirmReport).toHaveBeenCalledWith(report.id);
    });
    expect(screen.getByText("Ripoti imethibitishwa.")).toBeInTheDocument();
  });

  it("hides status controls when the report is not locally owned", async () => {
    renderReportDetailActions();

    await waitFor(() => {
      expect(mocks.isOwnedReport).not.toHaveBeenCalled();
    });
    expect(screen.queryByText("Update status")).not.toBeInTheDocument();
  });
});

function renderReportDetailActions(locale: Locale = "en") {
  return render(
    <I18nProvider locale={locale} messages={messages[locale]}>
      <ReportDetailActions report={report} />
    </I18nProvider>,
  );
}
