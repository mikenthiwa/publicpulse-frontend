import Link from "next/link";
import { Icon } from "@/components/icons";
import { Message } from "@/components/message";
import { ReportCard } from "@/components/report-card";
import { elevatedSurface, eyebrow, pageShell, primaryButton } from "@/components/ui";
import { getLocale, localizePath } from "@/i18n/config";
import { getMessages } from "@/i18n/server";
import { publicPulseApi } from "@/services/api";
import { ApiError, type ReportListItemResponse } from "@/types/api";

type ReportsPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function ReportsPage({ params }: ReportsPageProps) {
  const { locale: requestedLocale } = await params;
  const locale = getLocale(requestedLocale);
  const messages = getMessages(locale);
  let reports: ReportListItemResponse[] = [];
  let error = "";

  try {
    reports = await publicPulseApi.listReports();
  } catch (caughtError) {
    error =
      caughtError instanceof ApiError
        ? caughtError.message
        : messages.reports.loadError;
  }

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
        {!error && reports.length === 0 ? (
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
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {reports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        ) : null}
      </div>
    </main>
  );
}
