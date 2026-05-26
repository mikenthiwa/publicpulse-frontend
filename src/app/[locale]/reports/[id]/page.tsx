import Link from "next/link";
import { notFound } from "next/navigation";
import { Message } from "@/components/message";
import { ReportDetailActions } from "@/components/report-detail-actions";
import { ReportStatusBadge } from "@/components/report-status";
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
      <main className="mx-auto w-full max-w-3xl px-6 py-10 lg:px-10">
        <Message tone="error">{result.error}</Message>
      </main>
    );
  }

  const report = result.report;

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10 lg:px-10">
      <Link
        className="text-sm font-semibold text-[#1f6f4a] underline-offset-4 hover:underline"
        href={localizePath("/reports", locale)}
      >
        {messages.reportDetail.back}
      </Link>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <article className="rounded-md border border-[#d6ded3] bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold leading-tight text-[#172019] sm:text-4xl">
                {report.categoryName}
              </h1>
            </div>
            <ReportStatusBadge status={report.status} />
          </div>
          <p className="mt-6 whitespace-pre-wrap leading-7 text-[#405246]">
            {report.description}
          </p>
          <dl className="mt-8 grid gap-4 border-t border-[#e1e7de] pt-6 sm:grid-cols-2">
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
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {report.images.map((image) => (
                <a
                  className="group grid gap-2 text-sm font-semibold text-[#1f6f4a] underline-offset-4 hover:underline"
                  href={image.imageUrl}
                  key={image.id}
                  rel="noreferrer"
                  target="_blank"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt=""
                    className="h-44 w-full rounded-md border border-[#d6e1d9] object-cover"
                    src={image.imageUrl}
                  />
                  <span>{messages.reportDetail.openImage}</span>
                </a>
              ))}
            </div>
          ) : null}
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
  return (
    <div>
      <dt className="text-sm font-semibold text-[#405246]">{label}</dt>
      <dd className="mt-1 text-[#172019]">{value}</dd>
    </div>
  );
}
