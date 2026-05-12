"use client";

import Link from "next/link";
import { ReportStatusBadge } from "@/components/report-status";
import { useI18n } from "@/i18n/client";
import type { ReportListItemResponse } from "@/types/api";

export function ReportCard({ report }: { report: ReportListItemResponse }) {
  const { formatDate, href, messages } = useI18n();

  return (
    <article className="flex h-full flex-col rounded-md border border-[#d6ded3] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-semibold text-[#2f6f4e]">{report.categoryName}</p>
        <ReportStatusBadge status={report.status} />
      </div>
      <h2 className="mt-4 text-xl font-semibold leading-tight text-[#172019]">
        {report.title}
      </h2>
      <dl className="mt-4 grid gap-2 text-sm text-[#536257]">
        <div>
          <dt className="font-semibold text-[#405246]">{messages.reportCard.location}</dt>
          <dd>
            {report.roadName}, {report.county}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div>
            <dt className="font-semibold text-[#405246]">
              {messages.reportCard.confirmations}
            </dt>
            <dd>{report.confirmationCount}</dd>
          </div>
          <div className="text-right">
            <dt className="font-semibold text-[#405246]">{messages.reportCard.created}</dt>
            <dd>{formatDate(report.createdAtUtc)}</dd>
          </div>
        </div>
      </dl>
      <Link
        className="mt-5 inline-flex h-10 items-center justify-center rounded-md border border-[#b7c7bb] px-4 text-sm font-semibold text-[#26352b] transition hover:bg-[#f7f8f4]"
        href={href(`/reports/${report.id}`)}
      >
        {messages.reportCard.viewDetails}
      </Link>
    </article>
  );
}
