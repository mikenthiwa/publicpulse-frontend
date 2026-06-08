"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FieldErrors } from "@/components/field-errors";
import { Icon } from "@/components/icons";
import { Message } from "@/components/message";
import { fieldLabel, inputControl, primaryButton, tertiaryLink } from "@/components/ui";
import { useI18n } from "@/i18n/client";
import { publicPulseApi } from "@/services/api";
import { storeAuth } from "@/services/auth-storage";
import { splitValidationErrors } from "@/services/validation-errors";
import { ApiError } from "@/types/api";

type AuthFormProps = {
  mode: "login" | "register";
};

const authFieldNames = ["email", "password"] as const;

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const { href, messages } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [errorDetails, setErrorDetails] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isLogin = mode === "login";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setErrorDetails([]);
    setFieldErrors({});

    if (!email.trim() || !password) {
      setError(messages.auth.requiredError);
      return;
    }

    setIsSubmitting(true);

    try {
      const auth = isLogin
        ? await publicPulseApi.login({ email: email.trim(), password })
        : await publicPulseApi.register({ email: email.trim(), password });

      storeAuth(auth);
      window.dispatchEvent(new Event("publicpulse-auth-change"));
      router.push(href("/reports"));
      router.refresh();
    } catch (caughtError) {
      if (caughtError instanceof ApiError) {
        const validation = splitValidationErrors(
          caughtError.validationErrors,
          authFieldNames,
        );
        setError(caughtError.message);
        setErrorDetails(validation.unmatchedErrors);
        setFieldErrors(validation.fieldErrors);
      } else {
        setError(messages.auth.authError);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit}>
      {error ? (
        <Message tone="error">
          <p>{error}</p>
          {errorDetails.length > 0 ? (
            <ul className="mt-1 list-disc pl-5">
              {errorDetails.map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
          ) : null}
        </Message>
      ) : null}
      <label className={fieldLabel}>
        <span className="inline-flex items-center gap-2">
          <Icon name="mail" size={16} />
          {messages.auth.email}
        </span>
        <input
          autoComplete="email"
          aria-describedby={fieldErrors.email?.length ? "email-errors" : undefined}
          aria-invalid={fieldErrors.email?.length ? true : undefined}
          className={`${inputControl} ${
            fieldErrors.email?.length ? "border-[#c46b59]" : ""
          }`}
          type="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setFieldErrors((current) => ({ ...current, email: [] }));
          }}
          required
        />
        <FieldErrors errors={fieldErrors.email} id="email-errors" />
      </label>
      <label className={fieldLabel}>
        <span className="inline-flex items-center gap-2">
          <Icon name="lock" size={16} />
          {messages.auth.password}
        </span>
        <input
          autoComplete={isLogin ? "current-password" : "new-password"}
          aria-describedby={
            fieldErrors.password?.length ? "password-errors" : undefined
          }
          aria-invalid={fieldErrors.password?.length ? true : undefined}
          className={`${inputControl} ${
            fieldErrors.password?.length ? "border-[#c46b59]" : ""
          }`}
          type="password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setFieldErrors((current) => ({ ...current, password: [] }));
          }}
          required
        />
        <FieldErrors errors={fieldErrors.password} id="password-errors" />
      </label>
      <button
        className={primaryButton}
        type="submit"
        disabled={isSubmitting}
      >
        <Icon name={isLogin ? "log-in" : "user-plus"} size={17} />
        {isSubmitting
          ? messages.auth.working
          : isLogin
            ? messages.auth.loginSubmit
            : messages.auth.registerSubmit}
      </button>
      <p className="text-sm text-[#4f5f55]">
        {isLogin ? messages.auth.needAccount : messages.auth.haveAccount}{" "}
        <Link
          className={tertiaryLink}
          href={isLogin ? href("/register") : href("/login")}
        >
          {isLogin ? messages.auth.registerLink : messages.auth.loginLink}
        </Link>
      </p>
    </form>
  );
}
