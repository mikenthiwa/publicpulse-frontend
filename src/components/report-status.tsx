"use client";

import { Icon, type IconName } from "@/components/icons";
import type { ReportStatus } from "@/types/api";
import { getStatusLabelForLocale } from "@/i18n/server";
import { useI18n } from "@/i18n/client";

const statusClassNames: Record<string, string> = {
  "0": "border-[#d8ded2] bg-[#f1f4ec] text-[#39483f]",
  Reported: "border-[#d8ded2] bg-[#f1f4ec] text-[#39483f]",
  "1": "border-[#c6d8ee] bg-[#eef5ff] text-[#294f7a]",
  InProgress: "border-[#c6d8ee] bg-[#eef5ff] text-[#294f7a]",
  "2": "border-[#a9cfb5] bg-[#eef8f1] text-[#22613f]",
  Resolved: "border-[#a9cfb5] bg-[#eef8f1] text-[#22613f]",
};

const statusIconNames: Record<string, IconName> = {
  "0": "file-text",
  "1": "info",
  "2": "check-circle",
};

export function getStatusLabel(status: ReportStatus, locale: "en" | "sw" = "en") {
  return getStatusLabelForLocale(status, locale);
}

export function ReportStatusBadge({ status }: { status: ReportStatus }) {
  const { getStatusLabel: getLocalizedStatusLabel } = useI18n();
  const key = String(status);

  return (
    <span
      className={`inline-flex min-h-7 items-center gap-1.5 rounded-full border px-3 text-xs font-bold ${
        statusClassNames[key] ?? statusClassNames.Reported
      }`}
    >
      <Icon name={statusIconNames[key] ?? "file-text"} size={14} />
      {getLocalizedStatusLabel(status)}
    </span>
  );
}
