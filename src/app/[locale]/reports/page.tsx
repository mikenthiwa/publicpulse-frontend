import Link from "next/link";
import { redirect } from "next/navigation";
import { Icon } from "@/components/icons";
import { Message } from "@/components/message";
import { ReportCard } from "@/components/report-card";
import { elevatedSurface, eyebrow, pageShell, primaryButton } from "@/components/ui";
import { getLocale, localizePath, type Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/server";
import { publicPulseApi } from "@/services/api";
import {
  ApiError,
  type PaginatedList,
  type ReportListItemResponse,
} from "@/types/api";

type ReportsPageProps = {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    page?: string | string[];
  }>;
};

const pageSize = 10;

export default async function ReportsPage({
  params,
  searchParams,
}: ReportsPageProps) {
  const { locale: requestedLocale } = await params;
  const { page: requestedPage } = await searchParams;
  const locale = getLocale(requestedLocale);
  const messages = getMessages(locale);
  const pageNumber = parsePageNumber(requestedPage);
  let pagination: PaginatedList<ReportListItemResponse> | null = null;
  let error = "";

  try {
    pagination = await publicPulseApi.listReports(pageNumber, pageSize);
  } catch (caughtError) {
    error =
      caughtError instanceof ApiError
        ? caughtError.message
        : messages.reports.loadError;
  }

  if (
    pagination &&
    pagination.count > 0 &&
    pagination.totalPages > 0 &&
    pagination.pageNumber > pagination.totalPages
  ) {
    redirect(reportPageHref(locale, pagination.totalPages));
  }

  const reports = pagination?.items ?? [];

  return (
    <main className={pageShell}>
      <div className={`${elevatedSurface} p-6 sm:p-8`}>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className={eyebrow}>{messages.reports.eyebrow}</p>
            <h1 className="mt-3 text-3xl font-black leading-tight text-[#151d19] sm:text-4xl">
              {messages.reports.title}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#4f5f55]">
              {messages.reports.description}
            </p>
          </div>
          <Link className={primaryButton} href={localizePath("/reports/new", locale)}>
            <Icon name="plus" size={17} />
            {messages.reports.createReport}
          </Link>
        </div>
      </div>
      <div className="mt-6">
        {error ? <Message tone="error">{error}</Message> : null}
        {!error && pagination?.count === 0 ? (
          <div className="rounded-lg border border-dashed border-[#b9c4b4] bg-white p-8 text-center">
            <Message title={messages.reports.emptyTitle}>
              {messages.reports.emptyBody}
            </Message>
            <Link
              className={`${primaryButton} mt-5`}
              href={localizePath("/reports/new", locale)}
            >
              <Icon name="plus" size={17} />
              {messages.reports.createReport}
            </Link>
          </div>
        ) : null}
        {!error && reports.length > 0 ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {reports.map((report) => (
                <ReportCard key={report.id} report={report} />
              ))}
            </div>
            {pagination ? (
              <nav
                aria-label={messages.reports.pageStatus
                  .replace("{page}", pagination.pageNumber.toString())
                  .replace("{total}", pagination.totalPages.toString())}
                className="mt-6 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 border-t border-[#d8ded2] pt-5"
              >
                <PaginationDirection
                  enabled={pagination.hasPreviousPage}
                  href={reportPageHref(locale, pagination.pageNumber - 1)}
                  icon="chevron-left"
                  label={messages.reports.previous}
                />
                <p className="text-center text-sm font-bold text-[#4f5f55]">
                  {messages.reports.pageStatus
                    .replace("{page}", pagination.pageNumber.toString())
                    .replace("{total}", pagination.totalPages.toString())}
                </p>
                <PaginationDirection
                  enabled={pagination.hasNextPage}
                  href={reportPageHref(locale, pagination.pageNumber + 1)}
                  icon="chevron-right"
                  label={messages.reports.next}
                  iconAfter
                />
              </nav>
            ) : null}
          </>
        ) : null}
      </div>
    </main>
  );
}

type PaginationDirectionProps = {
  enabled: boolean;
  href: string;
  icon: "chevron-left" | "chevron-right";
  label: string;
  iconAfter?: boolean;
};

function PaginationDirection({
  enabled,
  href,
  icon,
  label,
  iconAfter = false,
}: PaginationDirectionProps) {
  const content = (
    <>
      {!iconAfter ? <Icon name={icon} size={16} /> : null}
      {label}
      {iconAfter ? <Icon name={icon} size={16} /> : null}
    </>
  );
  const className =
    "inline-flex min-h-11 min-w-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-md border px-3 text-sm font-bold";

  return enabled ? (
    <Link
      className={`${className} border-[#b9c4b4] bg-white text-[#27362e] transition hover:border-[#8ea08f] hover:bg-[#f7f9f3]`}
      href={href}
    >
      {content}
    </Link>
  ) : (
    <span
      aria-disabled="true"
      className={`${className} cursor-not-allowed border-[#d8ded2] bg-[#eef1e9] text-[#7b877d]`}
    >
      {content}
    </span>
  );
}

function parsePageNumber(value: string | string[] | undefined) {
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) return 1;

  const pageNumber = Number(value);
  return Number.isSafeInteger(pageNumber) ? pageNumber : 1;
}

function reportPageHref(locale: Locale, pageNumber: number) {
  return `${localizePath("/reports", locale)}?page=${pageNumber}`;
}
