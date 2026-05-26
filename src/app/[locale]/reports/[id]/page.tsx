import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon, type IconName } from "@/components/icons";
import { Message } from "@/components/message";
import { ReportDetailActions } from "@/components/report-detail-actions";
import { ReportStatusBadge } from "@/components/report-status";
import { cardSurface, pageShell, tertiaryLink } from "@/components/ui";
import { getLocale, localizePath } from "@/i18n/config";
import { formatDateForLocale, getMessages } from "@/i18n/server";
import { publicPulseApi } from "@/services/api";
import { ApiError, type ReportResponse } from "@/types/api";

type ReportDetailPageProps = {
  params: Promise<{
    locale: string;
    id: string;
  }>;
};

export default async function ReportDetailPage({ params }: ReportDetailPageProps) {
  const { id, locale: requestedLocale } = await params;
  const locale = getLocale(requestedLocale);
  const messages = getMessages(locale);
  const result = await getReportPageResult(id, messages.reportDetail.loadError);

  if (result.kind === "not-found") {
    notFound();
  }

  if (result.kind === "error") {
    return (
      <main className={pageShell}>
        <Message tone="error">{result.error}</Message>
      </main>
    );
  }

  const report = result.report;

  return (
    <main className={pageShell}>
      <Link
        className={`inline-flex items-center gap-1.5 text-sm ${tertiaryLink}`}
        href={localizePath("/reports", locale)}
      >
        <Icon name="chevron-left" size={16} />
        {messages.reportDetail.back}
      </Link>
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <article className={`${cardSurface} overflow-hidden`}>
          <div className="border-b border-[#d8ded2] bg-[#fbfcf8] p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#176b45]">
                  <Icon className="mr-2 inline" name="file-text" size={14} />
                  {messages.reports.eyebrow}
                </p>
                <h1 className="mt-3 text-3xl font-black leading-tight text-[#151d19] sm:text-4xl">
                  {report.categoryName}
                </h1>
              </div>
              <ReportStatusBadge status={report.status} />
            </div>
          </div>
          <div className="p-6 sm:p-8">
            <p className="whitespace-pre-wrap leading-7 text-[#39483f]">
              {report.description}
            </p>
            <dl className="mt-8 grid gap-4 border-t border-[#d8ded2] pt-6 sm:grid-cols-2">
              <Detail label={messages.reportDetail.county} value={report.county} />
              <Detail label={messages.reportDetail.roadName} value={report.roadName} />
              <Detail
                label={messages.reportDetail.created}
                value={formatDateForLocale(report.created, locale)}
              />
              <Detail
                label={messages.reportDetail.updated}
                value={
                  report.lastModified
                    ? formatDateForLocale(report.lastModified, locale)
                    : messages.reportDetail.notUpdated
                }
              />
            </dl>
            {report.images.length > 0 ? (
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {report.images.map((image) => (
                  <a
                    className="group grid gap-2 text-sm font-bold text-[#176b45] underline-offset-4 hover:underline"
                    href={image.imageUrl}
                    key={image.id}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt=""
                      className="h-48 w-full rounded-lg border border-[#d8ded2] object-cover transition group-hover:border-[#b9c4b4]"
                      src={image.imageUrl}
                    />
                    <span className="inline-flex items-center gap-2">
                      <Icon name="image" size={16} />
                      {messages.reportDetail.openImage}
                    </span>
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </article>
        <aside className="grid content-start gap-6">
          <ReportDetailActions report={report} />
        </aside>
      </div>
    </main>
  );
}

async function getReportPageResult(
  id: string,
  fallbackError: string,
): Promise<
  | { kind: "success"; report: ReportResponse }
  | { kind: "error"; error: string }
  | { kind: "not-found" }
> {
  try {
    return { kind: "success", report: await publicPulseApi.getReport(id) };
  } catch (caughtError) {
    if (caughtError instanceof ApiError && caughtError.status === 404) {
      return { kind: "not-found" };
    }

    return {
      kind: "error",
      error:
        caughtError instanceof ApiError
          ? caughtError.message
          : fallbackError,
    };
  }
}

function Detail({ label, value }: { label: string; value: string }) {
  const iconName = getDetailIconName(label);

  return (
    <div className="rounded-md bg-[#f7f9f3] p-3">
      <dt className="inline-flex items-center gap-2 text-sm font-bold text-[#39483f]">
        <Icon name={iconName} size={16} />
        {label}
      </dt>
      <dd className="mt-1 text-[#151d19]">{value}</dd>
    </div>
  );
}

function getDetailIconName(label: string): IconName {
  const lowerLabel = label.toLowerCase();

  if (lowerLabel.includes("county") || lowerLabel.includes("kaunti")) {
    return "map-pin";
  }

  if (lowerLabel.includes("road") || lowerLabel.includes("barabara")) {
    return "map-pin";
  }

  return "calendar";
}
