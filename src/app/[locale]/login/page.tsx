import { AuthForm } from "@/components/auth-form";
import { getLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/server";

type LoginPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function LoginPage({ params }: LoginPageProps) {
  const { locale: requestedLocale } = await params;
  const locale = getLocale(requestedLocale);
  const messages = getMessages(locale);

  return (
    <main className="mx-auto w-full max-w-md px-6 py-12">
      <div className="rounded-md border border-[#d6ded3] bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#2f6f4e]">
          {messages.auth.loginEyebrow}
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-[#172019]">
          {messages.auth.loginTitle}
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#536257]">
          {messages.auth.loginDescription}
        </p>
        <div className="mt-6">
          <AuthForm mode="login" />
        </div>
      </div>
    </main>
  );
}
