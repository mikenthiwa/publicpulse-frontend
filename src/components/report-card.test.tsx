import { render, screen } from "@testing-library/react";
import { ReportCard } from "@/components/report-card";
import { I18nProvider } from "@/i18n/client";
import type { Locale } from "@/i18n/config";
import { messages } from "@/i18n/messages";
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
  created: "2026-05-10T10:00:00Z",
};

describe("ReportCard", () => {
  it("renders report summary and details link", () => {
    renderReportCard();

    expect(screen.getByRole("heading", { name: report.title })).toBeInTheDocument();
    expect(screen.getByText("Drainage")).toBeInTheDocument();
    expect(screen.getByText("Market Road, Nairobi")).toBeInTheDocument();
    expect(screen.getByText("In progress")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("May 10, 2026")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View details" })).toHaveAttribute(
      "href",
      "/en/reports/report-1",
    );
  });

  it("renders localized report summary in Swahili", () => {
    renderReportCard("sw");

    expect(screen.getByText("Inaendelea")).toBeInTheDocument();
    expect(screen.getByText("Mahali")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Tazama maelezo" })).toHaveAttribute(
      "href",
      "/sw/reports/report-1",
    );
  });
});

function renderReportCard(locale: Locale = "en") {
  return render(
    <I18nProvider locale={locale} messages={messages[locale]}>
      <ReportCard report={report} />
    </I18nProvider>,
  );
}
