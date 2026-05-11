import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReportDetailActions } from "@/components/report-detail-actions";
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

    render(<ReportDetailActions report={report} />);

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

    render(<ReportDetailActions report={report} />);

    const resolvedButton = await screen.findByRole("button", { name: "Resolved" });

    await user.click(resolvedButton);

    await waitFor(() => {
      expect(mocks.updateReportStatus).toHaveBeenCalledWith(report.id, 2, auth.token);
    });
    expect(screen.getByText("Report status updated.")).toBeInTheDocument();
  });

  it("hides status controls when the report is not locally owned", async () => {
    render(<ReportDetailActions report={report} />);

    await waitFor(() => {
      expect(mocks.isOwnedReport).not.toHaveBeenCalled();
    });
    expect(screen.queryByText("Update status")).not.toBeInTheDocument();
  });
});
