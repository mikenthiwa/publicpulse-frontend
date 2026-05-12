"use client";

import type { ReportStatus } from "@/types/api";
import { getStatusLabelForLocale } from "@/i18n/server";
import { useI18n } from "@/i18n/client";

const statusClassNames: Record<string, string> = {
  "0": "border-[#d6ded3] bg-[#f7f8f4] text-[#405246]",
  Reported: "border-[#d6ded3] bg-[#f7f8f4] text-[#405246]",
  "1": "border-[#c7d6ec] bg-[#f3f7fd] text-[#2c4f7b]",
  InProgress: "border-[#c7d6ec] bg-[#f3f7fd] text-[#2c4f7b]",
  "2": "border-[#abd0b6] bg-[#f4fbf5] text-[#23583a]",
  Resolved: "border-[#abd0b6] bg-[#f4fbf5] text-[#23583a]",
};

export function getStatusLabel(status: ReportStatus, locale: "en" | "sw" = "en") {
  return getStatusLabelForLocale(status, locale);
}

export function ReportStatusBadge({ status }: { status: ReportStatus }) {
  const { getStatusLabel: getLocalizedStatusLabel } = useI18n();
  const key = String(status);

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
        statusClassNames[key] ?? statusClassNames.Reported
      }`}
    >
      {getLocalizedStatusLabel(status)}
    </span>
  );
}
