import { AuthForm } from "@/components/auth-form";
import { elevatedSurface, eyebrow } from "@/components/ui";
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
    <main className="mx-auto grid min-h-[calc(100vh-138px)] w-full max-w-md content-center px-5 py-8 sm:px-8">
      <div className={`${elevatedSurface} p-6 sm:p-8`}>
        <p className={eyebrow}>
          {messages.auth.registerEyebrow}
        </p>
        <h1 className="mt-3 text-3xl font-black text-[#151d19]">
          {messages.auth.registerTitle}
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#4f5f55]">
          {messages.auth.registerDescription}
        </p>
        <div className="mt-6">
          <AuthForm mode="register" />
        </div>
      </div>
    </main>
  );
}
