"use client";

import Link from "next/link";
import { Icon } from "@/components/icons";
import { ReportStatusBadge } from "@/components/report-status";
import { cardSurface, secondaryButton } from "@/components/ui";
import { useI18n } from "@/i18n/client";
import type { ReportListItemResponse } from "@/types/api";

export function ReportCard({ report }: { report: ReportListItemResponse }) {
  const { formatDate, href, messages } = useI18n();

  return (
    <article className={`${cardSurface} flex h-full flex-col p-5 transition hover:border-[#b9c4b4] hover:shadow-[0_1px_2px_rgb(21_29_25/0.06),0_12px_28px_rgb(21_29_25/0.08)]`}>
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-xl font-black leading-tight text-[#151d19]">
          {report.categoryName}
        </h2>
        <ReportStatusBadge status={report.status} />
      </div>
      <dl className="mt-5 grid flex-1 gap-4 text-sm text-[#4f5f55]">
        <div className="rounded-md bg-[#f7f9f3] p-3">
          <dt className="inline-flex items-center gap-2 font-bold text-[#39483f]">
            <Icon name="map-pin" size={16} />
            {messages.reportCard.location}
          </dt>
          <dd className="mt-1 leading-6">
            {report.roadName}, {report.county}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div>
            <dt className="inline-flex items-center gap-2 font-bold text-[#39483f]">
              <Icon name="thumbs-up" size={16} />
              {messages.reportCard.confirmations}
            </dt>
            <dd className="mt-1 text-2xl font-black text-[#151d19]">
              {report.confirmationCount}
            </dd>
          </div>
          <div className="text-right">
            <dt className="inline-flex items-center justify-end gap-2 font-bold text-[#39483f]">
              <Icon name="calendar" size={16} />
              {messages.reportCard.created}
            </dt>
            <dd className="mt-1">{formatDate(report.created)}</dd>
          </div>
        </div>
      </dl>
      <Link
        className={`${secondaryButton} mt-5`}
        href={href(`/reports/${report.id}`)}
      >
        {messages.reportCard.viewDetails}
        <Icon name="arrow-right" size={16} />
      </Link>
    </article>
  );
}
