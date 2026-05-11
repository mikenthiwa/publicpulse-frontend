import Link from "next/link";
import { Message } from "@/components/message";
import { ReportCard } from "@/components/report-card";
import { publicPulseApi } from "@/services/api";
import { ApiError, type ReportListItemResponse } from "@/types/api";

export default async function ReportsPage() {
  let reports: ReportListItemResponse[] = [];
  let error = "";

  try {
    reports = await publicPulseApi.listReports();
  } catch (caughtError) {
    error =
      caughtError instanceof ApiError
        ? caughtError.message
        : "Unable to load reports.";
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10 lg:px-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#2f6f4e]">
            Public reports
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-[#172019] sm:text-4xl">
            Infrastructure issues
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#536257]">
            Browse reported road and public infrastructure issues from citizens.
          </p>
        </div>
        <Link
          className="inline-flex h-11 items-center justify-center rounded-md bg-[#1f6f4a] px-5 text-sm font-semibold text-white transition hover:bg-[#185a3c]"
          href="/reports/new"
        >
          Create report
        </Link>
      </div>
      <div className="mt-8">
        {error ? <Message tone="error">{error}</Message> : null}
        {!error && reports.length === 0 ? (
          <Message title="No reports yet">
            Be the first to submit a public infrastructure report.
          </Message>
        ) : null}
        {!error && reports.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {reports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        ) : null}
      </div>
    </main>
  );
}
