"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { locales, localizePath, removeLocalePrefix } from "@/i18n/config";
import { useI18n } from "@/i18n/client";
import { clearStoredAuth, getStoredAuth } from "@/services/auth-storage";
import type { AuthResponse } from "@/types/api";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const { href, locale, messages } = useI18n();
  const [auth, setAuth] = useState<AuthResponse | null>(null);
  const activePath = removeLocalePrefix(pathname);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setAuth(getStoredAuth()), 0);

    function handleAuthChange() {
      setAuth(getStoredAuth());
    }

    window.addEventListener("publicpulse-auth-change", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("publicpulse-auth-change", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  function handleLogout() {
    clearStoredAuth();
    window.dispatchEvent(new Event("publicpulse-auth-change"));
    setAuth(null);
  }

  return (
    <div className="min-h-screen bg-[#f7f8f4] text-[#172019]">
      <header className="border-b border-[#dce5d8] bg-[#f7f8f4]/95">
        <nav className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-10">
          <Link className="text-xl font-semibold text-[#172019]" href={href("/")}>
            PublicPulse
          </Link>
          <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
            <Link
              className="rounded-md px-3 py-2 text-[#405246] hover:bg-white"
              href={href("/reports")}
            >
              {messages.nav.reports}
            </Link>
            <Link
              className="rounded-md px-3 py-2 text-[#405246] hover:bg-white"
              href={href("/reports/new")}
            >
              {messages.nav.newReport}
            </Link>
            {auth ? (
              <>
                <span className="max-w-44 truncate px-2 text-[#647266]">{auth.email}</span>
                <button
                  className="rounded-md border border-[#b7c7bb] px-3 py-2 text-[#26352b] transition hover:bg-white"
                  type="button"
                  onClick={handleLogout}
                >
                  {messages.nav.logout}
                </button>
              </>
            ) : (
              <>
                <Link
                  className="rounded-md px-3 py-2 text-[#405246] hover:bg-white"
                  href={href("/login")}
                >
                  {messages.nav.login}
                </Link>
                <Link
                  className="rounded-md bg-[#1f6f4a] px-3 py-2 text-white transition hover:bg-[#185a3c]"
                  href={href("/register")}
                >
                  {messages.nav.register}
                </Link>
              </>
            )}
            <div
              aria-label={messages.nav.language}
              className="flex rounded-md border border-[#b7c7bb] bg-white p-1"
            >
              {locales.map((option) => (
                <Link
                  aria-current={locale === option ? "true" : undefined}
                  className={`rounded px-2 py-1 text-xs transition ${
                    locale === option
                      ? "bg-[#1f6f4a] text-white"
                      : "text-[#405246] hover:bg-[#f7f8f4]"
                  }`}
                  href={localizePath(activePath, option)}
                  key={option}
                >
                  {option.toUpperCase()}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      </header>
      {children}
    </div>
  );
}
