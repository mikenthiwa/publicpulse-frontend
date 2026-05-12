import { render, screen } from "@testing-library/react";
import { ReportStatusBadge, getStatusLabel } from "@/components/report-status";
import { I18nProvider } from "@/i18n/client";
import { messages } from "@/i18n/messages";

describe("report status", () => {
  it("formats numeric and string statuses", () => {
    expect(getStatusLabel(0)).toBe("Reported");
    expect(getStatusLabel(1)).toBe("In progress");
    expect(getStatusLabel(2)).toBe("Resolved");
    expect(getStatusLabel("InProgress")).toBe("In progress");
    expect(getStatusLabel("InProgress", "sw")).toBe("Inaendelea");
  });

  it("renders a friendly badge label", () => {
    render(
      <I18nProvider locale="en" messages={messages.en}>
        <ReportStatusBadge status={1} />
      </I18nProvider>,
    );

    expect(screen.getByText("In progress")).toBeInTheDocument();
  });

  it("renders a localized Swahili badge label", () => {
    render(
      <I18nProvider locale="sw" messages={messages.sw}>
        <ReportStatusBadge status={1} />
      </I18nProvider>,
    );

    expect(screen.getByText("Inaendelea")).toBeInTheDocument();
  });
});
