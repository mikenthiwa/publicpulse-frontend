import { render, screen } from "@testing-library/react";
import { ReportStatusBadge, getStatusLabel } from "@/components/report-status";

describe("report status", () => {
  it("formats numeric and string statuses", () => {
    expect(getStatusLabel(0)).toBe("Reported");
    expect(getStatusLabel(1)).toBe("In progress");
    expect(getStatusLabel(2)).toBe("Resolved");
    expect(getStatusLabel("InProgress")).toBe("In progress");
  });

  it("renders a friendly badge label", () => {
    render(<ReportStatusBadge status={1} />);

    expect(screen.getByText("In progress")).toBeInTheDocument();
  });
});
