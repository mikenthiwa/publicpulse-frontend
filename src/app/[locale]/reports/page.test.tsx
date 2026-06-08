import { render, screen } from "@testing-library/react";
import ReportsPage from "@/app/[locale]/reports/page";
import { I18nProvider } from "@/i18n/client";
import { messages } from "@/i18n/messages";
import type { PaginatedList, ReportListItemResponse } from "@/types/api";

const mocks = vi.hoisted(() => ({
  listReports: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock("@/services/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/services/api")>();

  return {
    ...actual,
    publicPulseApi: {
      ...actual.publicPulseApi,
      listReports: mocks.listReports,
    },
  };
});

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}));

const report: ReportListItemResponse = {
  id: "report-1",
  categoryId: "category-1",
  categoryName: "Road damage",
  images: [],
  county: "Nairobi",
  roadName: "Main Road",
  status: 0,
  confirmationCount: 2,
  created: "2026-05-10T10:00:00Z",
};

describe("ReportsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("defaults invalid page values to the first page", async () => {
    mocks.listReports.mockResolvedValue(paginatedReports({ pageNumber: 1 }));

    await renderReportsPage("invalid");

    expect(mocks.listReports).toHaveBeenCalledWith(1, 10);
    expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Previous" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Next" })).toHaveAttribute(
      "href",
      "/en/reports?page=2",
    );
  });

  it("renders previous and next navigation for a middle page", async () => {
    mocks.listReports.mockResolvedValue(
      paginatedReports({ pageNumber: 2, hasPreviousPage: true }),
    );

    await renderReportsPage("2");

    expect(screen.getByRole("link", { name: "Previous" })).toHaveAttribute(
      "href",
      "/en/reports?page=1",
    );
    expect(screen.getByRole("link", { name: "Next" })).toHaveAttribute(
      "href",
      "/en/reports?page=3",
    );
  });

  it("disables next navigation on the final page", async () => {
    mocks.listReports.mockResolvedValue(
      paginatedReports({
        pageNumber: 3,
        hasPreviousPage: true,
        hasNextPage: false,
      }),
    );

    await renderReportsPage("3");

    expect(screen.getByRole("link", { name: "Previous" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Next" })).not.toBeInTheDocument();
  });

  it("shows the empty state only when the total count is zero", async () => {
    mocks.listReports.mockResolvedValue(
      paginatedReports({
        items: [],
        count: 0,
        pageNumber: 1,
        totalPages: 0,
        hasPreviousPage: false,
        hasNextPage: false,
      }),
    );

    await renderReportsPage();

    expect(screen.getByText("No reports yet")).toBeInTheDocument();
    expect(screen.queryByText(/Page \d/)).not.toBeInTheDocument();
  });

  it("redirects an out-of-range page to the final valid page", async () => {
    mocks.listReports.mockResolvedValue(
      paginatedReports({
        items: [],
        count: 21,
        pageNumber: 9,
        totalPages: 3,
        hasPreviousPage: true,
        hasNextPage: false,
      }),
    );
    mocks.redirect.mockImplementation(() => {
      throw new Error("NEXT_REDIRECT");
    });

    await expect(renderReportsPage("9")).rejects.toThrow("NEXT_REDIRECT");
    expect(mocks.redirect).toHaveBeenCalledWith("/en/reports?page=3");
  });
});

function paginatedReports(
  overrides: Partial<PaginatedList<ReportListItemResponse>> = {},
): PaginatedList<ReportListItemResponse> {
  return {
    items: [report],
    count: 21,
    pageNumber: 1,
    pageSize: 10,
    totalPages: 3,
    hasPreviousPage: false,
    hasNextPage: true,
    ...overrides,
  };
}

async function renderReportsPage(page?: string) {
  return render(
    <I18nProvider locale="en" messages={messages.en}>
      {await ReportsPage({
        params: Promise.resolve({ locale: "en" }),
        searchParams: Promise.resolve(page === undefined ? {} : { page }),
      })}
    </I18nProvider>,
  );
}
