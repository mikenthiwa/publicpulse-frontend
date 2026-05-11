import { render, screen } from "@testing-library/react";
import { ReportCard } from "@/components/report-card";
import type { ReportListItemResponse } from "@/types/api";

const report: ReportListItemResponse = {
  id: "report-1",
  title: "Blocked drainage near market",
  categoryId: "category-1",
  categoryName: "Drainage",
  county: "Nairobi",
  roadName: "Market Road",
  status: 1,
  confirmationCount: 7,
  createdAtUtc: "2026-05-10T10:00:00Z",
};

describe("ReportCard", () => {
  it("renders report summary and details link", () => {
    render(<ReportCard report={report} />);

    expect(screen.getByRole("heading", { name: report.title })).toBeInTheDocument();
    expect(screen.getByText("Drainage")).toBeInTheDocument();
    expect(screen.getByText("Market Road, Nairobi")).toBeInTheDocument();
    expect(screen.getByText("In progress")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View details" })).toHaveAttribute(
      "href",
      "/reports/report-1",
    );
  });
});
