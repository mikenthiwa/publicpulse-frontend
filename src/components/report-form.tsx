"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Message } from "@/components/message";
import { publicPulseApi } from "@/services/api";
import { addOwnedReport, getStoredAuth } from "@/services/auth-storage";
import { ApiError, type AuthResponse, type CategoryResponse } from "@/types/api";

type FormState = {
  title: string;
  description: string;
  categoryId: string;
  photoUrl: string;
  county: string;
  roadName: string;
};

const initialFormState: FormState = {
  title: "",
  description: "",
  categoryId: "",
  photoUrl: "",
  county: "",
  roadName: "",
};

export function ReportForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialFormState);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [error, setError] = useState("");
  const [auth, setAuth] = useState<AuthResponse | null>(null);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setAuth(getStoredAuth());
      setHasCheckedAuth(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    let isMounted = true;

    if (!hasCheckedAuth) return;
    if (!auth) {
      return;
    }

    async function loadCategories() {
      setError("");
      setIsLoadingCategories(true);

      try {
        const loadedCategories = await publicPulseApi.listCategories();
        if (!isMounted) return;

        setCategories(loadedCategories);
        setForm((current) => ({
          ...current,
          categoryId: current.categoryId || loadedCategories[0]?.id || "",
        }));
      } catch (caughtError) {
        if (!isMounted) return;
        setError(
          caughtError instanceof ApiError
            ? caughtError.message
            : "Unable to load categories.",
        );
      } finally {
        if (isMounted) setIsLoadingCategories(false);
      }
    }

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, [auth, hasCheckedAuth]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const trimmedForm = {
      title: form.title.trim(),
      description: form.description.trim(),
      categoryId: form.categoryId,
      photoUrl: form.photoUrl.trim(),
      county: form.county.trim(),
      roadName: form.roadName.trim(),
    };

    if (Object.values(trimmedForm).some((value) => !value)) {
      setError("Complete all report fields before submitting.");
      return;
    }

    if (!auth) {
      setError("Log in to create a report.");
      return;
    }

    setIsSubmitting(true);

    try {
      const createdReport = await publicPulseApi.createReport(trimmedForm, auth.token);
      addOwnedReport(auth.userId, createdReport.id);
      router.push(`/reports/${createdReport.id}`);
      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Unable to create the report.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!hasCheckedAuth) {
    return <Message>Checking authentication...</Message>;
  }

  if (!auth) {
    return (
      <Message title="Authentication required">
        Log in or register before creating an infrastructure report.
      </Message>
    );
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit}>
      {error ? <Message tone="error">{error}</Message> : null}
      <Field
        label="Title"
        value={form.title}
        onChange={(value) => setForm({ ...form, title: value })}
        required
      />
      <label className="grid gap-2 text-sm font-semibold text-[#26352b]">
        Description
        <textarea
          className="min-h-32 rounded-md border border-[#b7c7bb] bg-white px-3 py-3 font-normal outline-none transition focus:border-[#1f6f4a] focus:ring-2 focus:ring-[#cfe3d4]"
          value={form.description}
          onChange={(event) => setForm({ ...form, description: event.target.value })}
          required
        />
      </label>
      <label className="grid gap-2 text-sm font-semibold text-[#26352b]">
        Category
        <select
          className="h-11 rounded-md border border-[#b7c7bb] bg-white px-3 font-normal outline-none transition focus:border-[#1f6f4a] focus:ring-2 focus:ring-[#cfe3d4]"
          value={form.categoryId}
          onChange={(event) => setForm({ ...form, categoryId: event.target.value })}
          disabled={isLoadingCategories || categories.length === 0}
          required
        >
          {isLoadingCategories ? <option>Loading categories...</option> : null}
          {!isLoadingCategories && categories.length === 0 ? (
            <option>No categories available</option>
          ) : null}
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>
      <Field
        label="Photo URL"
        placeholder="https://example.com/damaged-road.jpg"
        type="url"
        value={form.photoUrl}
        onChange={(value) => setForm({ ...form, photoUrl: value })}
        required
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="County"
          value={form.county}
          onChange={(value) => setForm({ ...form, county: value })}
          required
        />
        <Field
          label="Road name"
          value={form.roadName}
          onChange={(value) => setForm({ ...form, roadName: value })}
          required
        />
      </div>
      <button
        className="inline-flex h-11 items-center justify-center rounded-md bg-[#1f6f4a] px-5 text-sm font-semibold text-white transition hover:bg-[#185a3c] disabled:cursor-not-allowed disabled:bg-[#8caf9a]"
        type="submit"
        disabled={isSubmitting || isLoadingCategories || categories.length === 0}
      >
        {isSubmitting ? "Submitting..." : "Submit report"}
      </button>
    </form>
  );
}

type FieldProps = {
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
  value: string;
};

function Field({
  label,
  onChange,
  placeholder,
  required,
  type = "text",
  value,
}: FieldProps) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-[#26352b]">
      {label}
      <input
        className="h-11 rounded-md border border-[#b7c7bb] bg-white px-3 font-normal outline-none transition focus:border-[#1f6f4a] focus:ring-2 focus:ring-[#cfe3d4]"
        placeholder={placeholder}
        required={required}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
