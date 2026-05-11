import { ReportForm } from "@/components/report-form";

export default function NewReportPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10 lg:px-10">
      <div className="rounded-md border border-[#d6ded3] bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#2f6f4e]">
          New report
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-[#172019]">
          Report an infrastructure issue
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#536257]">
          Provide the issue details, location, category, and a photo URL so the
          report can be tracked publicly.
        </p>
        <div className="mt-6">
          <ReportForm />
        </div>
      </div>
    </main>
  );
}
