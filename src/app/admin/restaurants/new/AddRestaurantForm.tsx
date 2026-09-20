"use client";

import { useState, useRef, useCallback, useEffect, ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createRestaurantAction } from "./actions";

/* ─────────────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────────────── */
interface ImageSlot {
  file: File | null;
  preview: string | null;
}

interface FormErrors {
  name?: string;
  slug?: string;
  googleReviewUrl?: string;
  feedbackBackendUrl?: string;
  campaignBackendUrl?: string;
}

interface FormState {
  // § 1 Basic Information (→ restaurants)
  name: string;
  slug: string;
  theme: string;
  status: string;
  // § 2 Branding (→ restaurants)
  brandLogo: ImageSlot;
  squareLogo: ImageSlot;
  // § 3 Main Experience (→ restaurants)
  mainTitle: string;
  googleReviewUrl: string;
  googleButtonText: string;
  feedbackButtonText: string;
  // § 4 Gallery (→ restaurant_images, sort_order 1-6)
  gallery: ImageSlot[];
  // § 5 Campaign (→ restaurants)
  campaignEnabled: boolean;
  campaignTitle: string;
  campaignDescription: string;
  campaignButtonText: string;
  // § 6 Restaurant Information (→ restaurants)
  address: string;
  phone: string;
  openingTime: string;
  closingTime: string;
  closingText: string;
  // § 7 Form Backends (→ restaurant_backends)
  feedbackBackendUrl: string;
  campaignBackendUrl: string;
  // § 8 Subscription (→ subscriptions)
  plan: string;
  startDate: string;
  expiryDate: string;
}

const EMPTY_SLOT: ImageSlot = { file: null, preview: null };

const INITIAL_STATE: FormState = {
  name: "",
  slug: "",
  theme: "theme-1",
  status: "draft",
  brandLogo: { ...EMPTY_SLOT },
  squareLogo: { ...EMPTY_SLOT },
  mainTitle: "",
  googleReviewUrl: "",
  googleButtonText: "",
  feedbackButtonText: "",
  gallery: Array.from({ length: 6 }, () => ({ ...EMPTY_SLOT })),
  campaignEnabled: false,
  campaignTitle: "",
  campaignDescription: "",
  campaignButtonText: "",
  address: "",
  phone: "",
  openingTime: "",
  closingTime: "",
  closingText: "",
  feedbackBackendUrl: "",
  campaignBackendUrl: "",
  plan: "",
  startDate: "",
  expiryDate: "",
};

/* ─────────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────────── */
const BASE_URL = "https://nexinsightbd.online";
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function isValidUrl(val: string): boolean {
  try {
    const u = new URL(val);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function validateImageFile(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return "Only PNG, JPG, JPEG, or WEBP images are accepted.";
  }
  if (file.size > MAX_BYTES) {
    return "Image must be smaller than 5 MB.";
  }
  return null;
}

function themeLabel(theme: string): string {
  const labels: Record<string, string> = {
    "theme-1": "Dark Gold",
    "theme-white": "White",
  };
  return labels[theme] ?? theme;
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    draft: "Draft",
    active: "Active",
    inactive: "Inactive",
    disabled: "Disabled",
  };
  return map[status] ?? status;
}

/* ─────────────────────────────────────────────────────────────────
   Sub-components (small, inline)
───────────────────────────────────────────────────────────────── */

/** Reusable hidden file input trigger */
function useFileInput(
  onSelect: (file: File) => void,
  inputRef: React.RefObject<HTMLInputElement | null>
) {
  const trigger = useCallback(() => inputRef.current?.click(), [inputRef]);
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onSelect(file);
      // reset so the same file can be re-selected after removal
      if (inputRef.current) inputRef.current.value = "";
    },
    [onSelect, inputRef]
  );
  return { trigger, handleChange };
}

/* ─────────────────────────────────────────────────────────────────
   Main component
───────────────────────────────────────────────────────────────── */
export default function AddRestaurantForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [errors, setErrors] = useState<FormErrors>({});
  const [imageErrors, setImageErrors] = useState<Record<string, string>>({});
  const [submitState, setSubmitState] = useState<"idle" | "success" | "error">("idle");
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  // track whether slug was manually edited (prevents auto-override)
  const slugManualRef = useRef(false);

  /* ── Unsaved changes warning ───────────────────────────────── */
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  /* ── Generic field setter ──────────────────────────────────── */
  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
    // Clear error for this key if it exists in FormErrors
    if (key in errors) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
    if (submitState !== "idle") setSubmitState("idle");
  }

  /* ── Name → Slug auto-generation ──────────────────────────── */
  function handleNameChange(value: string) {
    setField("name", value);
    if (!slugManualRef.current) {
      setForm((prev) => ({ ...prev, slug: toSlug(value) }));
    }
  }

  function handleSlugChange(value: string) {
    slugManualRef.current = true;
    setField("slug", value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
  }

  /* ── Image helpers ─────────────────────────────────────────── */
  function createImageSlot(file: File): ImageSlot {
    return { file, preview: URL.createObjectURL(file) };
  }

  function revokeSlot(slot: ImageSlot) {
    if (slot.preview) URL.revokeObjectURL(slot.preview);
  }

  function setLogoSlot(key: "brandLogo" | "squareLogo", file: File) {
    const err = validateImageFile(file);
    if (err) {
      setImageErrors((prev) => ({ ...prev, [key]: err }));
      return;
    }
    setImageErrors((prev) => ({ ...prev, [key]: undefined as unknown as string }));
    revokeSlot(form[key]);
    setField(key, createImageSlot(file));
  }

  function removeLogoSlot(key: "brandLogo" | "squareLogo") {
    revokeSlot(form[key]);
    setField(key, { ...EMPTY_SLOT });
  }

  function setGallerySlot(index: number, file: File) {
    const err = validateImageFile(file);
    const errKey = `gallery_${index}`;
    if (err) {
      setImageErrors((prev) => ({ ...prev, [errKey]: err }));
      return;
    }
    setImageErrors((prev) => ({ ...prev, [errKey]: undefined as unknown as string }));
    revokeSlot(form.gallery[index]);
    const updated = [...form.gallery];
    updated[index] = createImageSlot(file);
    setField("gallery", updated);
  }

  function removeGallerySlot(index: number) {
    revokeSlot(form.gallery[index]);
    const updated = [...form.gallery];
    updated[index] = { ...EMPTY_SLOT };
    setField("gallery", updated);
  }

  /* ── Cleanup object URLs on unmount ────────────────────────── */
  useEffect(() => {
    return () => {
      if (form.brandLogo.preview) URL.revokeObjectURL(form.brandLogo.preview);
      if (form.squareLogo.preview) URL.revokeObjectURL(form.squareLogo.preview);
      form.gallery.forEach((s) => { if (s.preview) URL.revokeObjectURL(s.preview); });
    };
    // Only run on unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Validation ────────────────────────────────────────────── */
  function validate(): FormErrors {
    const errs: FormErrors = {};
    if (!form.name.trim()) errs.name = "Restaurant name is required.";
    if (!form.slug.trim()) {
      errs.slug = "Slug is required.";
    } else if (!/^[a-z0-9-]+$/.test(form.slug)) {
      errs.slug = "Slug can only contain lowercase letters, numbers, and hyphens.";
    }
    if (form.googleReviewUrl && !isValidUrl(form.googleReviewUrl)) {
      errs.googleReviewUrl = "Must be a valid URL (https://...).";
    }
    if (form.feedbackBackendUrl && !isValidUrl(form.feedbackBackendUrl)) {
      errs.feedbackBackendUrl = "Must be a valid URL.";
    }
    if (form.campaignBackendUrl && !isValidUrl(form.campaignBackendUrl)) {
      errs.campaignBackendUrl = "Must be a valid URL.";
    }
    return errs;
  }

  /* ── Submit handler ────────────────────────────────────────── */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setSubmitState("error");
      const firstKey = Object.keys(errs)[0];
      document.getElementById(`arf-field-${firstKey}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const res = await createRestaurantAction({
        name: form.name,
        slug: form.slug,
        theme: form.theme,
        manualStatus: form.status as "draft" | "active" | "inactive" | "disabled",
        mainTitle: form.mainTitle,
        googleReviewUrl: form.googleReviewUrl,
        googleButtonText: form.googleButtonText,
        feedbackButtonText: form.feedbackButtonText,
        campaignEnabled: form.campaignEnabled,
        campaignTitle: form.campaignTitle,
        campaignDescription: form.campaignDescription,
        campaignButtonText: form.campaignButtonText,
        address: form.address,
        phone: form.phone,
        openingTime: form.openingTime,
        closingTime: form.closingTime,
        closingText: form.closingText,
        feedbackBackendUrl: form.feedbackBackendUrl,
        campaignBackendUrl: form.campaignBackendUrl,
        plan: form.plan,
        startDate: form.startDate,
        expiryDate: form.expiryDate,
      });

      if (!res.success) {
        setServerError(res.error || "Failed to create restaurant record.");
        setSubmitState("error");
        window.scrollTo({ top: 0, behavior: "smooth" });
        if (res.error?.toLowerCase().includes("slug")) {
          setErrors({ slug: res.error });
          document.getElementById("arf-field-slug")?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        return;
      }

      setIsDirty(false);
      setSubmitState("success");
      window.scrollTo({ top: 0, behavior: "smooth" });
      router.push("/admin/restaurants?created=true");
    } catch (err: unknown) {
      console.error(err);
      setServerError("An unexpected connection error occurred.");
      setSubmitState("error");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  }

  /* ── Derived state for Review panel ───────────────────────── */
  const galleryCount = form.gallery.filter((s) => s.preview !== null).length;

  /* ── Refs for hidden file inputs ───────────────────────────── */
  const brandRef = useRef<HTMLInputElement>(null);
  const squareRef = useRef<HTMLInputElement>(null);
  const galleryRefs = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null));

  const { trigger: triggerBrand, handleChange: handleBrandChange } = useFileInput(
    (f) => setLogoSlot("brandLogo", f),
    brandRef
  );
  const { trigger: triggerSquare, handleChange: handleSquareChange } = useFileInput(
    (f) => setLogoSlot("squareLogo", f),
    squareRef
  );

  /* ─────────────────────────────────────────────────────────────
     Render
  ───────────────────────────────────────────────────────────── */
  return (
    <form onSubmit={handleSubmit} noValidate>

      {/* ── Back link & header ─────────────────────────────────── */}
      <Link href="/admin" className="arf-back-link">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to Dashboard
      </Link>

      <div className="admin-header-section" style={{ marginBottom: 28 }}>
        <div>
          <h1 className="admin-title">Add Restaurant</h1>
          <p className="admin-subtitle">Create a new restaurant page for NexInsight.</p>
        </div>
      </div>

      {/* ── Global success banner ───────────────────────────── */}
      {submitState === "success" && (
        <div className="arf-success-banner" style={{ marginBottom: 24 }} role="alert">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <div>
            <strong>Restaurant record created successfully!</strong> Redirecting to restaurant list...
          </div>
        </div>
      )}

      {/* ── Global validation / server error banner ───────────── */}
      {submitState === "error" && (serverError || Object.keys(errors).length > 0) && (
        <div className="arf-form-error-banner" role="alert">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {serverError ? serverError : "Please fix the highlighted fields before continuing."}
        </div>
      )}

      {/* ── Two-column layout on desktop ───────────────────────── */}
      <div className="arf-layout">

        {/* ════════════════════════════════════════════════════════
            FORM COLUMN (sections 1-8)
        ════════════════════════════════════════════════════════ */}
        <div className="arf-form-col">

          {/* ════ § 1 — BASIC INFORMATION ════════════════════════ */}
          <div className="arf-card">
            <div className="arf-section-header">
              <span className="arf-section-badge" aria-hidden="true">1</span>
              <div>
                <div className="arf-section-title">Basic Information</div>
                <div className="arf-section-sub">Restaurant identity &amp; publishing settings</div>
              </div>
            </div>

            <div className="arf-fields">
              {/* Name */}
              <div className="arf-field" id="arf-field-name">
                <label htmlFor="arf-name" className="arf-label">
                  Restaurant Name <span className="arf-required" aria-label="required">*</span>
                </label>
                <input
                  id="arf-name"
                  type="text"
                  className={`arf-input${errors.name ? " arf-input-error" : ""}`}
                  placeholder="Burger House"
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  autoComplete="off"
                />
                {errors.name && <span className="arf-error-text" role="alert">{errors.name}</span>}
              </div>

              {/* Slug */}
              <div className="arf-field" id="arf-field-slug">
                <label htmlFor="arf-slug" className="arf-label">
                  Slug <span className="arf-required" aria-label="required">*</span>
                </label>
                <input
                  id="arf-slug"
                  type="text"
                  className={`arf-input${errors.slug ? " arf-input-error" : ""}`}
                  placeholder="burger-house"
                  value={form.slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                />
                {errors.slug && <span className="arf-error-text" role="alert">{errors.slug}</span>}
                {form.slug && !errors.slug && (
                  <span className="arf-url-preview" aria-live="polite">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                    {BASE_URL}/r/{form.slug}
                  </span>
                )}
                {!form.slug && (
                  <span className="arf-helper">Lowercase letters, numbers, and hyphens only. Auto-generated from name.</span>
                )}
              </div>

              {/* Theme + Status row */}
              <div className="arf-row arf-row-2">
                <div className="arf-field">
                  <label htmlFor="arf-theme" className="arf-label">Theme</label>
                  <select
                    id="arf-theme"
                    className="arf-select"
                    value={form.theme}
                    onChange={(e) => setField("theme", e.target.value)}
                  >
                    <option value="theme-1">Theme - Dark Gold</option>
                    <option value="theme-white">Theme - White</option>
                  </select>
                  <span className="arf-helper">More themes coming soon.</span>
                </div>

                <div className="arf-field">
                  <label htmlFor="arf-status" className="arf-label">Status</label>
                  <select
                    id="arf-status"
                    className="arf-select"
                    value={form.status}
                    onChange={(e) => setField("status", e.target.value)}
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* ════ § 2 — BRANDING ══════════════════════════════════ */}
          <div className="arf-card">
            <div className="arf-section-header">
              <span className="arf-section-badge" aria-hidden="true">2</span>
              <div>
                <div className="arf-section-title">Branding</div>
                <div className="arf-section-sub">Logos shown on the customer-facing page</div>
              </div>
            </div>

            {/* Hidden file inputs */}
            <input ref={brandRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleBrandChange} style={{ display: "none" }} aria-hidden="true" />
            <input ref={squareRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleSquareChange} style={{ display: "none" }} aria-hidden="true" />

            <div className="arf-logo-pair">
              {/* Brand Logo */}
              <div className="arf-logo-wrap">
                <span className="arf-label">Brand Logo</span>
                <div
                  className={`arf-logo-preview-box${form.brandLogo.preview ? " has-image" : ""}`}
                  onClick={form.brandLogo.preview ? undefined : triggerBrand}
                  role={form.brandLogo.preview ? undefined : "button"}
                  aria-label={form.brandLogo.preview ? undefined : "Upload brand logo"}
                  tabIndex={form.brandLogo.preview ? undefined : 0}
                  onKeyDown={form.brandLogo.preview ? undefined : (e) => e.key === "Enter" && triggerBrand()}
                >
                  {form.brandLogo.preview ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={form.brandLogo.preview} alt="Brand logo preview" className="arf-logo-img" />
                      <div className="arf-upload-overlay">
                        <button type="button" className="arf-img-btn arf-img-btn-replace" onClick={triggerBrand} aria-label="Replace brand logo">Replace</button>
                        <button type="button" className="arf-img-btn arf-img-btn-remove" onClick={() => removeLogoSlot("brandLogo")} aria-label="Remove brand logo">Remove</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <svg className="arf-upload-empty-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                      </svg>
                      <span className="arf-upload-label">Upload<br />Logo</span>
                    </>
                  )}
                </div>
                {imageErrors.brandLogo && <span className="arf-error-text">{imageErrors.brandLogo}</span>}
                <span className="arf-helper">PNG, JPG, WEBP · max 5 MB</span>
              </div>

              {/* Square Logo */}
              <div className="arf-logo-wrap">
                <span className="arf-label">Square Logo</span>
                <div
                  className={`arf-logo-preview-box${form.squareLogo.preview ? " has-image" : ""}`}
                  onClick={form.squareLogo.preview ? undefined : triggerSquare}
                  role={form.squareLogo.preview ? undefined : "button"}
                  aria-label={form.squareLogo.preview ? undefined : "Upload square logo"}
                  tabIndex={form.squareLogo.preview ? undefined : 0}
                  onKeyDown={form.squareLogo.preview ? undefined : (e) => e.key === "Enter" && triggerSquare()}
                >
                  {form.squareLogo.preview ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={form.squareLogo.preview} alt="Square logo preview" className="arf-logo-img" />
                      <div className="arf-upload-overlay">
                        <button type="button" className="arf-img-btn arf-img-btn-replace" onClick={triggerSquare} aria-label="Replace square logo">Replace</button>
                        <button type="button" className="arf-img-btn arf-img-btn-remove" onClick={() => removeLogoSlot("squareLogo")} aria-label="Remove square logo">Remove</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <svg className="arf-upload-empty-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                      </svg>
                      <span className="arf-upload-label">Upload<br />Logo</span>
                    </>
                  )}
                </div>
                {imageErrors.squareLogo && <span className="arf-error-text">{imageErrors.squareLogo}</span>}
                <span className="arf-helper">PNG, JPG, WEBP · max 5 MB</span>
              </div>
            </div>
          </div>

          {/* ════ § 3 — MAIN EXPERIENCE ═══════════════════════════ */}
          <div className="arf-card">
            <div className="arf-section-header">
              <span className="arf-section-badge" aria-hidden="true">3</span>
              <div>
                <div className="arf-section-title">Main Experience</div>
                <div className="arf-section-sub">Text shown on the customer feedback page</div>
              </div>
            </div>

            <div className="arf-fields">
              <div className="arf-field">
                <label htmlFor="arf-main-title" className="arf-label">Main Title</label>
                <input
                  id="arf-main-title"
                  type="text"
                  className="arf-input"
                  placeholder="How was your experience today?"
                  value={form.mainTitle}
                  onChange={(e) => setField("mainTitle", e.target.value)}
                />
              </div>

              <div className="arf-row arf-row-2">
                <div className="arf-field">
                  <label htmlFor="arf-google-btn-text" className="arf-label">Google Review Button Text</label>
                  <input
                    id="arf-google-btn-text"
                    type="text"
                    className="arf-input"
                    placeholder="Leave a Google Review"
                    value={form.googleButtonText}
                    onChange={(e) => setField("googleButtonText", e.target.value)}
                  />
                </div>

                <div className="arf-field">
                  <label htmlFor="arf-feedback-btn-text" className="arf-label">Feedback Button Text</label>
                  <input
                    id="arf-feedback-btn-text"
                    type="text"
                    className="arf-input"
                    placeholder="Send Feedback"
                    value={form.feedbackButtonText}
                    onChange={(e) => setField("feedbackButtonText", e.target.value)}
                  />
                </div>
              </div>

              <div className="arf-field" id="arf-field-googleReviewUrl">
                <label htmlFor="arf-google-url" className="arf-label">Google Review URL</label>
                <input
                  id="arf-google-url"
                  type="url"
                  className={`arf-input${errors.googleReviewUrl ? " arf-input-error" : ""}`}
                  placeholder="https://search.google.com/local/writereview?placeid=..."
                  value={form.googleReviewUrl}
                  onChange={(e) => setField("googleReviewUrl", e.target.value)}
                  autoComplete="off"
                />
                {errors.googleReviewUrl && <span className="arf-error-text" role="alert">{errors.googleReviewUrl}</span>}
                <span className="arf-helper">The URL customers are sent to when tapping the Google Review button.</span>
              </div>
            </div>
          </div>

          {/* ════ § 4 — RESTAURANT GALLERY ════════════════════════ */}
          <div className="arf-card">
            <div className="arf-section-header">
              <span className="arf-section-badge" aria-hidden="true">4</span>
              <div>
                <div className="arf-section-title">Restaurant Gallery</div>
                <div className="arf-section-sub">Add up to 6 dish images for the carousel</div>
              </div>
            </div>

            <div className="arf-gallery-grid">
              {form.gallery.map((slot, i) => {
                const errKey = `gallery_${i}`;
                const triggerGallery = () => galleryRefs.current[i]?.click();
                return (
                  <div key={i}>
                    {/* Hidden file input */}
                    <input
                      ref={(el) => { galleryRefs.current[i] = el; }}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setGallerySlot(i, file);
                        if (e.target) e.target.value = "";
                      }}
                      style={{ display: "none" }}
                      aria-hidden="true"
                    />
                    <div
                      className={`arf-gallery-slot${slot.preview ? " has-image" : ""}`}
                      onClick={slot.preview ? undefined : triggerGallery}
                      role={slot.preview ? undefined : "button"}
                      aria-label={slot.preview ? undefined : `Upload gallery image ${i + 1}`}
                      tabIndex={slot.preview ? undefined : 0}
                      onKeyDown={slot.preview ? undefined : (e) => e.key === "Enter" && triggerGallery()}
                    >
                      {slot.preview ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={slot.preview} alt={`Gallery image ${i + 1}`} className="arf-gallery-thumb" />
                          <div className="arf-upload-overlay">
                            <button type="button" className="arf-img-btn arf-img-btn-replace" onClick={triggerGallery} aria-label={`Replace image ${i + 1}`}>Replace</button>
                            <button type="button" className="arf-img-btn arf-img-btn-remove" onClick={() => removeGallerySlot(i)} aria-label={`Remove image ${i + 1}`}>✕</button>
                          </div>
                        </>
                      ) : (
                        <>
                          <svg className="arf-upload-empty-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                          </svg>
                          <span className="arf-gallery-slot-num">Image {i + 1}</span>
                        </>
                      )}
                    </div>
                    {imageErrors[errKey] && (
                      <span className="arf-error-text" style={{ fontSize: "0.72rem", marginTop: 4, display: "block" }}>{imageErrors[errKey]}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ════ § 5 — CAMPAIGN ══════════════════════════════════ */}
          <div className="arf-card">
            <div className="arf-section-header">
              <span className="arf-section-badge" aria-hidden="true">5</span>
              <div>
                <div className="arf-section-title">Campaign / Birthday Club</div>
                <div className="arf-section-sub">Opt-in loyalty or birthday campaign</div>
              </div>
            </div>

            {/* Toggle row */}
            <div className="arf-toggle-row" style={{ marginBottom: 20 }}>
              <div>
                <div className="arf-toggle-label">Campaign Enabled</div>
                <div className="arf-toggle-sub">
                  {form.campaignEnabled ? "Campaign is active — fields below are editable." : "Campaign is off — fields are disabled."}
                </div>
              </div>
              <label className="arf-toggle-switch" aria-label="Enable campaign">
                <input
                  type="checkbox"
                  checked={form.campaignEnabled}
                  onChange={(e) => setField("campaignEnabled", e.target.checked)}
                />
                <span className="arf-toggle-track" />
                <span className="arf-toggle-thumb" />
              </label>
            </div>

            <div className={`arf-campaign-fields${form.campaignEnabled ? "" : " is-disabled"}`} aria-disabled={!form.campaignEnabled}>
              <div className="arf-field">
                <label htmlFor="arf-campaign-title" className="arf-label">Campaign Title</label>
                <input
                  id="arf-campaign-title"
                  type="text"
                  className="arf-input"
                  placeholder="Join our Birthday Club!"
                  value={form.campaignTitle}
                  onChange={(e) => setField("campaignTitle", e.target.value)}
                  disabled={!form.campaignEnabled}
                />
              </div>

              <div className="arf-field">
                <label htmlFor="arf-campaign-desc" className="arf-label">Campaign Description</label>
                <textarea
                  id="arf-campaign-desc"
                  className="arf-textarea"
                  placeholder="Celebrate your birthday with us and receive a free mocktail or dessert!"
                  value={form.campaignDescription}
                  onChange={(e) => setField("campaignDescription", e.target.value)}
                  disabled={!form.campaignEnabled}
                />
              </div>

              <div className="arf-field">
                <label htmlFor="arf-campaign-btn" className="arf-label">Campaign Button Text</label>
                <input
                  id="arf-campaign-btn"
                  type="text"
                  className="arf-input"
                  placeholder="Join the Birthday Club"
                  value={form.campaignButtonText}
                  onChange={(e) => setField("campaignButtonText", e.target.value)}
                  disabled={!form.campaignEnabled}
                />
              </div>
            </div>
          </div>

          {/* ════ § 6 — RESTAURANT INFORMATION ═══════════════════ */}
          <div className="arf-card">
            <div className="arf-section-header">
              <span className="arf-section-badge" aria-hidden="true">6</span>
              <div>
                <div className="arf-section-title">Restaurant Information</div>
                <div className="arf-section-sub">Contact details shown in the footer</div>
              </div>
            </div>

            <div className="arf-fields">
              <div className="arf-field">
                <label htmlFor="arf-address" className="arf-label">Address</label>
                <textarea
                  id="arf-address"
                  className="arf-textarea"
                  placeholder="Dhanmondi, Dhaka"
                  value={form.address}
                  onChange={(e) => setField("address", e.target.value)}
                  style={{ minHeight: 72 }}
                />
              </div>

              <div className="arf-field">
                <label htmlFor="arf-phone" className="arf-label">Phone Number</label>
                <input
                  id="arf-phone"
                  type="tel"
                  className="arf-input"
                  placeholder="017XXXXXXXX"
                  value={form.phone}
                  onChange={(e) => setField("phone", e.target.value)}
                />
              </div>

              <div className="arf-row arf-row-2">
                <div className="arf-field">
                  <label htmlFor="arf-opening" className="arf-label">Opening Time</label>
                  <input
                    id="arf-opening"
                    type="text"
                    className="arf-input"
                    placeholder="11:00 AM"
                    value={form.openingTime}
                    onChange={(e) => setField("openingTime", e.target.value)}
                  />
                </div>

                <div className="arf-field">
                  <label htmlFor="arf-closing" className="arf-label">Closing Time</label>
                  <input
                    id="arf-closing"
                    type="text"
                    className="arf-input"
                    placeholder="11:00 PM"
                    value={form.closingTime}
                    onChange={(e) => setField("closingTime", e.target.value)}
                  />
                </div>
              </div>

              <div className="arf-field">
                <label htmlFor="arf-closing-text" className="arf-label">Closing Text</label>
                <textarea
                  id="arf-closing-text"
                  className="arf-textarea"
                  placeholder="Thank you for dining with us."
                  value={form.closingText}
                  onChange={(e) => setField("closingText", e.target.value)}
                  style={{ minHeight: 72 }}
                />
              </div>
            </div>
          </div>

          {/* ════ § 7 — FORM BACKENDS ══════════════════════════════ */}
          <div className="arf-card">
            <div className="arf-section-header">
              <span className="arf-section-badge" aria-hidden="true">7</span>
              <div>
                <div className="arf-section-title">Form Backends</div>
                <div className="arf-section-sub">Admin-only — private Google Apps Script URLs</div>
              </div>
            </div>

            <div className="arf-info-box" role="note">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="8" /><line x1="12" y1="12" x2="12" y2="16" />
              </svg>
              <span className="arf-info-box-text">
                These private Web App URLs are used by NexInsight to send customer feedback and campaign signups directly to the restaurant&apos;s configured Google Apps Script Sheet. They are never exposed publicly.
              </span>
            </div>

            <div className="arf-fields">
              <div className="arf-field" id="arf-field-feedbackBackendUrl">
                <label htmlFor="arf-feedback-url" className="arf-label">Feedback Web App URL</label>
                <input
                  id="arf-feedback-url"
                  type="url"
                  className={`arf-input${errors.feedbackBackendUrl ? " arf-input-error" : ""}`}
                  placeholder="https://script.google.com/macros/s/..."
                  value={form.feedbackBackendUrl}
                  onChange={(e) => setField("feedbackBackendUrl", e.target.value)}
                  autoComplete="off"
                />
                {errors.feedbackBackendUrl && <span className="arf-error-text" role="alert">{errors.feedbackBackendUrl}</span>}
              </div>

              <div className="arf-field" id="arf-field-campaignBackendUrl">
                <label htmlFor="arf-campaign-url" className="arf-label">Campaign Web App URL</label>
                <input
                  id="arf-campaign-url"
                  type="url"
                  className={`arf-input${errors.campaignBackendUrl ? " arf-input-error" : ""}`}
                  placeholder="https://script.google.com/macros/s/..."
                  value={form.campaignBackendUrl}
                  onChange={(e) => setField("campaignBackendUrl", e.target.value)}
                  autoComplete="off"
                />
                {errors.campaignBackendUrl && <span className="arf-error-text" role="alert">{errors.campaignBackendUrl}</span>}
              </div>
            </div>
          </div>

          {/* ════ § 8 — SUBSCRIPTION ══════════════════════════════ */}
          <div className="arf-card">
            <div className="arf-section-header">
              <span className="arf-section-badge" aria-hidden="true">8</span>
              <div>
                <div className="arf-section-title">Subscription</div>
                <div className="arf-section-sub">Plan details — no payment processed here</div>
              </div>
            </div>

            <div className="arf-fields">
              <div className="arf-field">
                <label htmlFor="arf-plan" className="arf-label">Plan</label>
                <select
                  id="arf-plan"
                  className="arf-select"
                  value={form.plan}
                  onChange={(e) => setField("plan", e.target.value)}
                >
                  <option value="">— Select a plan —</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div className="arf-row arf-row-2">
                <div className="arf-field">
                  <label htmlFor="arf-start-date" className="arf-label">Start Date</label>
                  <input
                    id="arf-start-date"
                    type="date"
                    className="arf-input"
                    value={form.startDate}
                    onChange={(e) => setField("startDate", e.target.value)}
                  />
                </div>

                <div className="arf-field">
                  <label htmlFor="arf-expiry-date" className="arf-label">Expiry Date</label>
                  <input
                    id="arf-expiry-date"
                    type="date"
                    className="arf-input"
                    value={form.expiryDate}
                    onChange={(e) => setField("expiryDate", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Mobile: Review + Submit shown here below section 8 ── */}
          <div className="arf-sidebar" style={{ display: "flex" }} aria-label="Review and create panel">
            <ReviewCard
              form={form}
              galleryCount={galleryCount}
              submitState={submitState}
              isSubmitting={isSubmitting}
            />
          </div>

        </div>

        {/* ════════════════════════════════════════════════════════
            DESKTOP SIDEBAR — sticky review panel
        ════════════════════════════════════════════════════════ */}
        <aside className="arf-sidebar" style={{ display: "none" }} aria-hidden="true">
          {/* Hidden via inline style; shown via CSS at ≥1024px via the class */}
        </aside>

      </div>
    </form>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Review Card sub-component
   Shown both in the mobile flow (below sections) and in the
   desktop sidebar. Rendered once in mobile position only for now.
───────────────────────────────────────────────────────────────── */
interface ReviewCardProps {
  form: FormState;
  galleryCount: number;
  submitState: "idle" | "success" | "error";
  isSubmitting: boolean;
}

function ReviewCard({ form, galleryCount, submitState, isSubmitting }: ReviewCardProps) {
  function planLabel(plan: string) {
    return plan ? plan.charAt(0).toUpperCase() + plan.slice(1) : "—";
  }

  return (
    <>
      {/* ════ § 9 — REVIEW & CREATE ═════════════════════════════ */}
      <div className="arf-review-card">
        <div className="arf-review-title">
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                width: 24, height: 24, borderRadius: "50%",
                background: "rgba(255,255,255,0.15)",
                fontSize: "0.72rem", fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}
              aria-hidden="true"
            >9</span>
            Review &amp; Create
          </span>
        </div>

        <div className="arf-review-rows" aria-live="polite" aria-label="Form summary">
          <div className="arf-review-row">
            <span className="arf-review-key">Name</span>
            <span className={`arf-review-val${!form.name ? " muted" : ""}`}>
              {form.name || "Not set"}
            </span>
          </div>
          <div className="arf-review-row">
            <span className="arf-review-key">URL</span>
            <span className={`arf-review-val${!form.slug ? " muted" : " active"}`} style={{ fontSize: "0.72rem" }}>
              {form.slug ? `/r/${form.slug}` : "—"}
            </span>
          </div>
          <div className="arf-review-row">
            <span className="arf-review-key">Theme</span>
            <span className="arf-review-val">Dark Gold</span>
          </div>
          <div className="arf-review-row">
            <span className="arf-review-key">Status</span>
            <span className="arf-review-val" style={{ textTransform: "capitalize" }}>{form.status}</span>
          </div>
          <div className="arf-review-row">
            <span className="arf-review-key">Campaign</span>
            <span className={`arf-review-val${form.campaignEnabled ? " active" : ""}`}>
              {form.campaignEnabled ? "Enabled" : "Disabled"}
            </span>
          </div>
          <div className="arf-review-row">
            <span className="arf-review-key">Gallery</span>
            <span className="arf-review-val">{galleryCount} / 6 images</span>
          </div>
          <div className="arf-review-row">
            <span className="arf-review-key">Plan</span>
            <span className={`arf-review-val${!form.plan ? " muted" : ""}`}>{planLabel(form.plan)}</span>
          </div>
        </div>

        <button type="submit" className="arf-submit-btn" disabled={isSubmitting} aria-label="Create restaurant">
          {isSubmitting ? "Creating Restaurant..." : "Create Restaurant"}
        </button>

        <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", marginTop: 10, textAlign: "center", lineHeight: 1.5 }}>
          Creates database records in Supabase (images stored locally until Task 7).
        </p>
      </div>
    </>
  );
}
