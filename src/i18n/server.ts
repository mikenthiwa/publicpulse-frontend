import { getLocale, type Locale } from "@/i18n/config";
import { messages, type Messages } from "@/i18n/messages";

export function getMessages(locale: string | undefined): Messages {
  return messages[getLocale(locale)];
}

export function formatDateForLocale(date: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function getStatusLabelForLocale(
  status: string | number,
  locale: Locale,
) {
  const statusMessages = messages[locale].status;
  const statusLabels: Record<string, string> = {
    "0": statusMessages.reported,
    "1": statusMessages.inProgress,
    "2": statusMessages.resolved,
    Reported: statusMessages.reported,
    InProgress: statusMessages.inProgress,
    Resolved: statusMessages.resolved,
  };

  return statusLabels[String(status)] ?? String(status);
}
