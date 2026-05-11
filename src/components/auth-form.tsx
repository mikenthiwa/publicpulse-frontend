"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Message } from "@/components/message";
import { publicPulseApi } from "@/services/api";
import { storeAuth } from "@/services/auth-storage";
import { ApiError } from "@/types/api";

type AuthFormProps = {
  mode: "login" | "register";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isLogin = mode === "login";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Enter an email and password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const auth = isLogin
        ? await publicPulseApi.login({ email: email.trim(), password })
        : await publicPulseApi.register({ email: email.trim(), password });

      storeAuth(auth);
      window.dispatchEvent(new Event("publicpulse-auth-change"));
      router.push("/reports");
      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Unable to complete authentication.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit}>
      {error ? <Message tone="error">{error}</Message> : null}
      <label className="grid gap-2 text-sm font-semibold text-[#26352b]">
        Email
        <input
          className="h-11 rounded-md border border-[#b7c7bb] bg-white px-3 font-normal outline-none transition focus:border-[#1f6f4a] focus:ring-2 focus:ring-[#cfe3d4]"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </label>
      <label className="grid gap-2 text-sm font-semibold text-[#26352b]">
        Password
        <input
          className="h-11 rounded-md border border-[#b7c7bb] bg-white px-3 font-normal outline-none transition focus:border-[#1f6f4a] focus:ring-2 focus:ring-[#cfe3d4]"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </label>
      <button
        className="inline-flex h-11 items-center justify-center rounded-md bg-[#1f6f4a] px-5 text-sm font-semibold text-white transition hover:bg-[#185a3c] disabled:cursor-not-allowed disabled:bg-[#8caf9a]"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Working..." : isLogin ? "Log in" : "Register"}
      </button>
      <p className="text-sm text-[#536257]">
        {isLogin ? "Need an account?" : "Already have an account?"}{" "}
        <Link
          className="font-semibold text-[#1f6f4a] underline-offset-4 hover:underline"
          href={isLogin ? "/register" : "/login"}
        >
          {isLogin ? "Register" : "Log in"}
        </Link>
      </p>
    </form>
  );
}
