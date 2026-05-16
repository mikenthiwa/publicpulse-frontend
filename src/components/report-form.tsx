"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Message } from "@/components/message";
import { useI18n } from "@/i18n/client";
import { publicPulseApi } from "@/services/api";
import { addOwnedReport, getStoredAuth } from "@/services/auth-storage";
import { ApiError, type AuthResponse, type CategoryResponse } from "@/types/api";

type FormState = {
  title: string;
  description: string;
  categoryId: string;
  photoFile: File | null;
  county: string;
  roadName: string;
};

const initialFormState: FormState = {
  title: "",
  description: "",
  categoryId: "",
  photoFile: null,
  county: "",
  roadName: "",
};

const acceptedImageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const maxImageSizeBytes = 5 * 1024 * 1024;

export function ReportForm() {
  const router = useRouter();
  const { href, messages } = useI18n();
  const loadCategoriesError = messages.reportForm.loadCategoriesError;
  const [form, setForm] = useState<FormState>(initialFormState);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [error, setError] = useState("");
  const [auth, setAuth] = useState<AuthResponse | null>(null);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [submitLabel, setSubmitLabel] = useState<string>(messages.reportForm.submit);

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
            : loadCategoriesError,
        );
      } finally {
        if (isMounted) setIsLoadingCategories(false);
      }
    }

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, [auth, hasCheckedAuth, loadCategoriesError]);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    };
  }, [imagePreviewUrl]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const trimmedForm = {
      title: form.title.trim(),
      description: form.description.trim(),
      categoryId: form.categoryId,
      county: form.county.trim(),
      roadName: form.roadName.trim(),
    };

    if (Object.values(trimmedForm).some((value) => !value)) {
      setError(messages.reportForm.completeFields);
      return;
    }

    if (!form.photoFile) {
      setError(messages.reportForm.imageRequired);
      return;
    }

    if (!auth) {
      setError(messages.reportForm.loginToCreate);
      return;
    }

    setIsSubmitting(true);
    setSubmitLabel(messages.reportForm.uploading);

    try {
      const imageUpload = await publicPulseApi.requestReportImageUpload(
        {
          fileName: form.photoFile.name,
          contentType: form.photoFile.type,
          contentLength: form.photoFile.size,
        },
        auth.token,
      );

      await publicPulseApi.uploadReportImage(imageUpload, form.photoFile);
      setSubmitLabel(messages.reportForm.submitting);

      const createdReport = await publicPulseApi.createReport(
        {
          ...trimmedForm,
          photoUrl: imageUpload.imageUrl,
        },
        auth.token,
      );
      addOwnedReport(auth.userId, createdReport.id);
      router.push(href(`/reports/${createdReport.id}`));
      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : messages.reportForm.createError,
      );
    } finally {
      setIsSubmitting(false);
      setSubmitLabel(messages.reportForm.submit);
    }
  }

  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl("");
    }

    if (!file) {
      setForm({ ...form, photoFile: null });
      return;
    }

    if (!acceptedImageTypes.includes(file.type)) {
      setError(messages.reportForm.imageTypeError);
      setForm({ ...form, photoFile: null });
      event.target.value = "";
      return;
    }

    if (file.size > maxImageSizeBytes) {
      setError(messages.reportForm.imageSizeError);
      setForm({ ...form, photoFile: null });
      event.target.value = "";
      return;
    }

    setError("");
    setForm({ ...form, photoFile: file });
    setImagePreviewUrl(URL.createObjectURL(file));
  }

  if (!hasCheckedAuth) {
    return <Message>{messages.reportForm.checkingAuth}</Message>;
  }

  if (!auth) {
    return (
      <Message title={messages.reportForm.authRequiredTitle}>
        {messages.reportForm.authRequiredBody}
      </Message>
    );
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit}>
      {error ? <Message tone="error">{error}</Message> : null}
      <Field
        label={messages.reportForm.title}
        value={form.title}
        onChange={(value) => setForm({ ...form, title: value })}
        required
      />
      <label className="grid gap-2 text-sm font-semibold text-[#26352b]">
        {messages.reportForm.description}
        <textarea
          className="min-h-32 rounded-md border border-[#b7c7bb] bg-white px-3 py-3 font-normal outline-none transition focus:border-[#1f6f4a] focus:ring-2 focus:ring-[#cfe3d4]"
          value={form.description}
          onChange={(event) => setForm({ ...form, description: event.target.value })}
          required
        />
      </label>
      <label className="grid gap-2 text-sm font-semibold text-[#26352b]">
        {messages.reportForm.category}
        <select
          className="h-11 rounded-md border border-[#b7c7bb] bg-white px-3 font-normal outline-none transition focus:border-[#1f6f4a] focus:ring-2 focus:ring-[#cfe3d4]"
          value={form.categoryId}
          onChange={(event) => setForm({ ...form, categoryId: event.target.value })}
          disabled={isLoadingCategories || categories.length === 0}
          required
        >
          {isLoadingCategories ? <option>{messages.reportForm.loadingCategories}</option> : null}
          {!isLoadingCategories && categories.length === 0 ? (
            <option>{messages.reportForm.noCategories}</option>
          ) : null}
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-2 text-sm font-semibold text-[#26352b]">
        {messages.reportForm.photo}
        <input
          aria-label={messages.reportForm.photo}
          accept={acceptedImageTypes.join(",")}
          className="rounded-md border border-[#b7c7bb] bg-white px-3 py-2 font-normal outline-none transition file:mr-4 file:rounded-md file:border-0 file:bg-[#e5efe8] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-[#1f6f4a] focus:border-[#1f6f4a] focus:ring-2 focus:ring-[#cfe3d4]"
          onChange={handlePhotoChange}
          required
          type="file"
        />
        <span className="text-xs font-normal text-[#5f7168]">
          {messages.reportForm.photoHelp}
        </span>
        {form.photoFile ? (
          <span className="text-xs font-normal text-[#3f5148]">
            {messages.reportForm.selectedPhoto}: {form.photoFile.name}
          </span>
        ) : null}
        {imagePreviewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt=""
            className="h-40 w-full rounded-md border border-[#d6e1d9] object-cover"
            src={imagePreviewUrl}
          />
        ) : null}
      </label>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label={messages.reportForm.county}
          value={form.county}
          onChange={(value) => setForm({ ...form, county: value })}
          required
        />
        <Field
          label={messages.reportForm.roadName}
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
        {isSubmitting ? submitLabel : messages.reportForm.submit}
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
