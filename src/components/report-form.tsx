"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Icon, type IconName } from "@/components/icons";
import { Message } from "@/components/message";
import { fieldLabel, inputControl, primaryButton } from "@/components/ui";
import { useI18n } from "@/i18n/client";
import { publicPulseApi } from "@/services/api";
import { addOwnedReport, getStoredAuth } from "@/services/auth-storage";
import { ApiError, type AuthResponse, type CategoryResponse } from "@/types/api";

type FormState = {
  description: string;
  categoryId: string;
  imageFiles: File[];
  county: string;
  roadName: string;
};

const initialFormState: FormState = {
  description: "",
  categoryId: "",
  imageFiles: [],
  county: "",
  roadName: "",
};

const acceptedImageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const maxImageSizeBytes = 5 * 1024 * 1024;
const maxImageCount = 5;

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
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const imagePreviewUrlsRef = useRef<string[]>([]);
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
      imagePreviewUrlsRef.current.forEach((imagePreviewUrl) => {
        URL.revokeObjectURL(imagePreviewUrl);
      });
    };
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const trimmedForm = {
      description: form.description.trim(),
      categoryId: form.categoryId,
      county: form.county.trim(),
      roadName: form.roadName.trim(),
    };

    if (Object.values(trimmedForm).some((value) => !value)) {
      setError(messages.reportForm.completeFields);
      return;
    }

    const imageValidationError = getImageValidationError(form.imageFiles);
    if (imageValidationError) {
      setError(imageValidationError);
      return;
    }

    if (form.imageFiles.length === 0) {
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
      const imageUpload = await publicPulseApi.requestReportImageUpload(auth.token);
      const uploadedImages = await Promise.all(
        form.imageFiles.map((file) =>
          publicPulseApi.uploadReportImage(imageUpload, file),
        ),
      );

      setSubmitLabel(messages.reportForm.submitting);

      const createdReport = await publicPulseApi.createReport(
        {
          ...trimmedForm,
          images: uploadedImages.map((uploadedImage) => ({
            publicId: uploadedImage.public_id,
            version: uploadedImage.version.toString(),
            signature: uploadedImage.signature,
          })),
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

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    if (files.length === 0) {
      event.target.value = "";
      return;
    }

    const nextImageFiles = [...form.imageFiles, ...files];
    const imageValidationError = getImageValidationError(nextImageFiles);
    if (imageValidationError) {
      setError(imageValidationError);
      event.target.value = "";
      return;
    }

    setError("");
    setForm({ ...form, imageFiles: nextImageFiles });
    const nextImagePreviewUrls = [
      ...imagePreviewUrls,
      ...files.map((file) => URL.createObjectURL(file)),
    ];
    imagePreviewUrlsRef.current = nextImagePreviewUrls;
    setImagePreviewUrls(nextImagePreviewUrls);
    event.target.value = "";
  }

  function getImageValidationError(files: File[]) {
    if (files.length > maxImageCount) {
      return messages.reportForm.tooManyImages;
    }

    if (files.some((file) => !acceptedImageTypes.includes(file.type))) {
      return messages.reportForm.imageTypeError;
    }

    if (files.some((file) => file.size > maxImageSizeBytes)) {
      return messages.reportForm.imageSizeError;
    }

    return "";
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
    <form className="grid gap-6" onSubmit={handleSubmit}>
      {error ? <Message tone="error">{error}</Message> : null}
      <label className={fieldLabel}>
        <span className="inline-flex items-center gap-2">
          <Icon name="upload" size={16} />
          {messages.reportForm.images}
        </span>
        <input
          aria-label={messages.reportForm.images}
          accept={acceptedImageTypes.join(",")}
          className="rounded-lg border border-dashed border-[#b9c4b4] bg-[#fbfcf8] px-4 py-4 font-normal outline-none transition file:mr-4 file:rounded-md file:border-0 file:bg-[#e1ede5] file:px-3 file:py-2 file:text-sm file:font-bold file:text-[#176b45] focus:border-[#176b45] focus:ring-2 focus:ring-[#cfe3d6]"
          multiple
          onChange={handleImageChange}
          type="file"
        />
        <span className="text-xs font-normal leading-5 text-[#5c6a61]">
          {messages.reportForm.imageHelp}
        </span>
        {form.imageFiles.length > 0 ? (
          <div className="grid gap-2 rounded-md bg-[#f1f4ec] p-3 text-xs font-normal text-[#39483f]">
            <span className="font-bold">{messages.reportForm.selectedImages}</span>
            <ul className="grid gap-1 leading-5">
              {form.imageFiles.map((file) => (
                <li key={`${file.name}-${file.size}`}>{file.name}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {imagePreviewUrls.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {imagePreviewUrls.map((imagePreviewUrl) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt=""
                className="h-40 w-full rounded-lg border border-[#d8ded2] object-cover"
                key={imagePreviewUrl}
                src={imagePreviewUrl}
              />
            ))}
          </div>
        ) : null}
      </label>
      <label className={fieldLabel}>
        <span className="inline-flex items-center gap-2">
          <Icon name="file-text" size={16} />
          {messages.reportForm.category}
        </span>
        <select
          className={inputControl}
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
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label={messages.reportForm.county}
          icon="map-pin"
          value={form.county}
          onChange={(value) => setForm({ ...form, county: value })}
          required
        />
        <Field
          label={messages.reportForm.roadName}
          icon="map-pin"
          value={form.roadName}
          onChange={(value) => setForm({ ...form, roadName: value })}
          required
        />
      </div>
      <label className={fieldLabel}>
        <span className="inline-flex items-center gap-2">
          <Icon name="megaphone" size={16} />
          {messages.reportForm.description}
        </span>
        <textarea
          className={`${inputControl} min-h-36 py-3`}
          value={form.description}
          onChange={(event) => setForm({ ...form, description: event.target.value })}
          required
        />
      </label>
      <button
        className={primaryButton}
        type="submit"
        disabled={isSubmitting || isLoadingCategories || categories.length === 0}
      >
        <Icon name="upload" size={17} />
        {isSubmitting ? submitLabel : messages.reportForm.submit}
      </button>
    </form>
  );
}

type FieldProps = {
  icon?: IconName;
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
  value: string;
};

function Field({
  icon,
  label,
  onChange,
  placeholder,
  required,
  type = "text",
  value,
}: FieldProps) {
  return (
    <label className={fieldLabel}>
      <span className="inline-flex items-center gap-2">
        {icon ? <Icon name={icon} size={16} /> : null}
        {label}
      </span>
      <input
        className={inputControl}
        placeholder={placeholder}
        required={required}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
