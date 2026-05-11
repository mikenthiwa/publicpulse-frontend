import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <main className="mx-auto w-full max-w-md px-6 py-12">
      <div className="rounded-md border border-[#d6ded3] bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#2f6f4e]">
          Welcome back
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-[#172019]">Log in</h1>
        <p className="mt-3 text-sm leading-6 text-[#536257]">
          Use your PublicPulse account to create reports and update report status.
        </p>
        <div className="mt-6">
          <AuthForm mode="login" />
        </div>
      </div>
    </main>
  );
}
