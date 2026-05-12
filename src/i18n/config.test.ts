import { describe, expect, it } from "vitest";
import {
  defaultLocale,
  getLocale,
  isLocale,
  localizePath,
  removeLocalePrefix,
} from "@/i18n/config";
import { formatDateForLocale, getStatusLabelForLocale } from "@/i18n/server";

describe("i18n config", () => {
  it("validates supported locales and falls back to the default locale", () => {
    expect(isLocale("en")).toBe(true);
    expect(isLocale("sw")).toBe(true);
    expect(isLocale("fr")).toBe(false);
    expect(getLocale("fr")).toBe(defaultLocale);
  });

  it("builds locale-aware paths", () => {
    expect(localizePath("/", "sw")).toBe("/sw");
    expect(localizePath("/reports", "sw")).toBe("/sw/reports");
    expect(localizePath("/en/reports/report-1", "sw")).toBe("/sw/reports/report-1");
    expect(removeLocalePrefix("/sw/reports/report-1")).toBe("/reports/report-1");
  });

  it("formats localized dates and status labels", () => {
    expect(formatDateForLocale("2026-05-10T10:00:00Z", "en")).toContain("2026");
    expect(formatDateForLocale("2026-05-10T10:00:00Z", "sw")).toContain("2026");
    expect(getStatusLabelForLocale(1, "en")).toBe("In progress");
    expect(getStatusLabelForLocale(1, "sw")).toBe("Inaendelea");
  });
});
