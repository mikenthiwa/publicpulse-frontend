import { AuthForm } from "@/components/auth-form";
import { getLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/server";

type RegisterPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function RegisterPage({ params }: RegisterPageProps) {
  const { locale: requestedLocale } = await params;
  const locale = getLocale(requestedLocale);
  const messages = getMessages(locale);

  return (
    <main className="mx-auto w-full max-w-md px-6 py-12">
      <div className="rounded-md border border-[#d6ded3] bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#2f6f4e]">
          {messages.auth.registerEyebrow}
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-[#172019]">
          {messages.auth.registerTitle}
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#536257]">
          {messages.auth.registerDescription}
        </p>
        <div className="mt-6">
          <AuthForm mode="register" />
        </div>
      </div>
    </main>
  );
}
