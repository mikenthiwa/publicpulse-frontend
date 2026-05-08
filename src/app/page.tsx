import { StatusCard } from "@/components/status-card";

const stats = [
  { label: "Report issues", value: "Roads" },
  { label: "Track progress", value: "Repairs" },
  { label: "Inform decisions", value: "Data" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f8f4] text-[#172019]">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-12 sm:px-8 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2f6f4e]">
              Civic infrastructure reporting
            </p>
            <h1 className="mt-5 text-4xl font-semibold leading-tight sm:text-6xl">
              PublicPulse helps citizens report local infrastructure problems.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#536257]">
              A simple civic-tech platform for reporting damaged roads, broken
              drainage, unsafe walkways, and other public infrastructure issues
              that need attention.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                className="inline-flex h-12 items-center justify-center rounded-md bg-[#1f6f4a] px-5 text-sm font-semibold text-white transition hover:bg-[#185a3c]"
                href="mailto:civic@example.com"
              >
                Contact project team
              </a>
              <a
                className="inline-flex h-12 items-center justify-center rounded-md border border-[#b7c7bb] px-5 text-sm font-semibold text-[#26352b] transition hover:bg-white"
                href="#status"
              >
                View project status
              </a>
            </div>
          </div>

          <div
            id="status"
            className="grid gap-4 rounded-lg border border-[#d6ded3] bg-white p-5 shadow-sm"
          >
            {stats.map((stat) => (
              <StatusCard key={stat.label} label={stat.label} value={stat.value} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
