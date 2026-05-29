"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon, type IconName } from "@/components/icons";
import { useI18n } from "@/i18n/client";
import { locales, localizePath, removeLocalePrefix } from "@/i18n/config";
import { clearStoredAuth, getStoredAuth } from "@/services/auth-storage";
import type { AuthResponse } from "@/types/api";
import { cn } from "@/utils/cn";

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

  const navItems: Array<{ href: string; icon: IconName; label: string }> = [
    { href: "/reports", icon: "file-text", label: messages.nav.reports },
    { href: "/reports/new", icon: "plus", label: messages.nav.newReport },
  ];

  return (
    <div className="min-h-screen bg-[#f5f6f1] text-[#151d19]">
      <header className="sticky top-0 z-20 border-b border-[#d8ded2] bg-[#f5f6f1]/95 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-4 sm:px-8 lg:px-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link className="group inline-flex items-center gap-3" href={href("/")}>
              <span className="grid size-9 place-items-center rounded-md bg-[#176b45] text-white">
                <Icon name="shield" size={19} />
              </span>
              <span className="text-lg font-black tracking-normal text-[#151d19]">
                PublicPulse
              </span>
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              <div
                aria-label={messages.nav.language}
                className="flex items-center gap-1 rounded-md border border-[#b9c4b4] bg-white p-1"
              >
                <Icon className="ml-1 text-[#5c6a61]" name="language" size={16} />
                {locales.map((option) => (
                  <Link
                    aria-current={locale === option ? "true" : undefined}
                    className={cn(
                      "rounded px-2.5 py-1.5 text-xs font-bold transition",
                      locale === option
                        ? "bg-[#176b45] text-white"
                        : "text-[#39483f] hover:bg-[#eef1e9]",
                    )}
                    href={localizePath(activePath, option)}
                    key={option}
                  >
                    {option.toUpperCase()}
                  </Link>
                ))}
              </div>
              {auth ? (
                <>
                  <span className="max-w-44 truncate rounded-md border border-[#d8ded2] bg-white px-3 py-2 text-sm font-bold text-[#39483f]">
                    {auth.email}
                  </span>
                  <button
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-[#b9c4b4] bg-white px-3 text-sm font-bold text-[#27362e] transition hover:border-[#8ea08f] hover:bg-[#f7f9f3]"
                    type="button"
                    onClick={handleLogout}
                  >
                    <Icon name="log-out" size={16} />
                    {messages.nav.logout}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    className="inline-flex min-h-10 items-center gap-2 rounded-md px-3 text-sm font-bold text-[#39483f] transition hover:bg-white"
                    href={href("/login")}
                  >
                    <Icon name="log-in" size={16} />
                    {messages.nav.login}
                  </Link>
                  <Link
                    className="inline-flex min-h-10 items-center gap-2 rounded-md bg-[#176b45] px-3 text-sm font-bold text-white transition hover:bg-[#0f5335]"
                    href={href("/register")}
                  >
                    <Icon name="user-plus" size={16} />
                    {messages.nav.register}
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm font-bold">
            {navItems.map((item) => {
              const isActive =
                item.href === "/reports"
                  ? activePath === "/reports" ||
                    (activePath.startsWith("/reports/") &&
                      !activePath.startsWith("/reports/new"))
                  : activePath === item.href ||
                    activePath.startsWith(`${item.href}/`);

              return (
                <Link
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-md px-3 py-2 transition",
                    isActive
                      ? "bg-white text-[#151d19] shadow-[0_1px_2px_rgb(21_29_25/0.06)]"
                      : "text-[#39483f] hover:bg-white",
                  )}
                  href={href(item.href)}
                  key={item.href}
                >
                  <Icon name={item.icon} size={16} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </header>
      {children}
    </div>
  );
}
