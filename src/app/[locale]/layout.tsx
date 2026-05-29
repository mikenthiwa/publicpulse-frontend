import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";
import { I18nProvider } from "@/i18n/client";
import { getMessages } from "@/i18n/server";
import "../globals.css";

type LocaleLayoutProps = Readonly<{
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
}>;

export async function generateMetadata({
  params,
}: Pick<LocaleLayoutProps, "params">): Promise<Metadata> {
  const { locale: requestedLocale } = await params;
  const locale = isLocale(requestedLocale) ? requestedLocale : defaultLocale;
  const messages = getMessages(locale);

  return {
    title: "PublicPulse",
    description: messages.app.description,
  };
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale: requestedLocale } = await params;

  if (!isLocale(requestedLocale)) {
    notFound();
  }

  const locale: Locale = requestedLocale;
  const messages = getMessages(locale);

  return (
    <html lang={locale} className="h-full antialiased">
      <body className="min-h-full">
        <I18nProvider locale={locale} messages={messages}>
          <AppShell>{children}</AppShell>
        </I18nProvider>
      </body>
    </html>
  );
}
