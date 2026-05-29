import { ReportForm } from "@/components/report-form";
import { elevatedSurface, eyebrow, pageShell } from "@/components/ui";
import { getLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/server";

type NewReportPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function NewReportPage({ params }: NewReportPageProps) {
  const { locale: requestedLocale } = await params;
  const locale = getLocale(requestedLocale);
  const messages = getMessages(locale);

  return (
    <main className={pageShell}>
      <div className={`${elevatedSurface} mx-auto max-w-3xl p-6 sm:p-8`}>
        <p className={eyebrow}>
          {messages.newReport.eyebrow}
        </p>
        <h1 className="mt-3 text-3xl font-black text-[#151d19]">
          {messages.newReport.title}
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#4f5f55]">
          {messages.newReport.description}
        </p>
        <div className="mt-8">
          <ReportForm />
        </div>
      </div>
    </main>
  );
}
