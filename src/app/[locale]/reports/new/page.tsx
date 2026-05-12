import { ReportForm } from "@/components/report-form";
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
    <main className="mx-auto w-full max-w-3xl px-6 py-10 lg:px-10">
      <div className="rounded-md border border-[#d6ded3] bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#2f6f4e]">
          {messages.newReport.eyebrow}
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-[#172019]">
          {messages.newReport.title}
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#536257]">
          {messages.newReport.description}
        </p>
        <div className="mt-6">
          <ReportForm />
        </div>
      </div>
    </main>
  );
}
