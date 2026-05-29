import { StatusCard } from "@/components/status-card";
import { Icon } from "@/components/icons";
import { eyebrow, pageShell, primaryButton, secondaryButton } from "@/components/ui";
import { getLocale, localizePath } from "@/i18n/config";
import { getMessages } from "@/i18n/server";
import Link from "next/link";

type HomeProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function Home({ params }: HomeProps) {
  const { locale: requestedLocale } = await params;
  const locale = getLocale(requestedLocale);
  const messages = getMessages(locale);
  const stats = [
    { ...messages.home.stats.reportIssues, icon: "megaphone" as const },
    { ...messages.home.stats.trackProgress, icon: "check-circle" as const },
    { ...messages.home.stats.confirmImpact, icon: "thumbs-up" as const },
  ];

  return (
    <main>
      <section className={`${pageShell} flex min-h-[calc(100vh-138px)] flex-col justify-center`}>
        <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div className="max-w-3xl">
            <p className={eyebrow}>
              {messages.home.eyebrow}
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[1.04] text-[#151d19] sm:text-6xl">
              {messages.home.title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#4f5f55]">
              {messages.home.description}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                className={primaryButton}
                href={localizePath("/reports/new", locale)}
              >
                <Icon name="plus" size={17} />
                {messages.home.createReport}
              </Link>
              <Link
                className={secondaryButton}
                href={localizePath("/reports", locale)}
              >
                <Icon name="file-text" size={17} />
                {messages.home.browseReports}
              </Link>
            </div>
          </div>

          <div
            id="status"
            className="rounded-xl border border-[#d8ded2] bg-white p-4 shadow-[0_1px_2px_rgb(21_29_25/0.06),0_12px_32px_rgb(21_29_25/0.08)]"
          >
            <div className="rounded-lg border border-[#d8ded2] bg-[#eef1e9] p-5">
              <p className="inline-flex items-center gap-2 text-sm font-bold text-[#39483f]">
                <Icon name="shield" size={17} />
                PublicPulse
              </p>
              <p className="mt-3 text-2xl font-black leading-tight text-[#151d19]">
                {messages.home.eyebrow}
              </p>
            </div>
            <div className="mt-4 grid gap-4">
              {stats.map((stat) => (
                <StatusCard
                  icon={stat.icon}
                  key={stat.label}
                  label={stat.label}
                  value={stat.value}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
