"use client";

import { createContext, useContext } from "react";
import { localizePath, type Locale } from "@/i18n/config";
import { formatDateForLocale, getStatusLabelForLocale } from "@/i18n/server";
import type { Messages } from "@/i18n/messages";

type I18nContextValue = {
  locale: Locale;
  messages: Messages;
  formatDate: (date: string) => string;
  getStatusLabel: (status: string | number) => string;
  href: (path: string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

type I18nProviderProps = {
  children: React.ReactNode;
  locale: Locale;
  messages: Messages;
};

export function I18nProvider({ children, locale, messages }: I18nProviderProps) {
  const value: I18nContextValue = {
    locale,
    messages,
    formatDate: (date) => formatDateForLocale(date, locale),
    getStatusLabel: (status) => getStatusLabelForLocale(status, locale),
    href: (path) => localizePath(path, locale),
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const value = useContext(I18nContext);

  if (!value) {
    throw new Error("useI18n must be used within I18nProvider.");
  }

  return value;
}
