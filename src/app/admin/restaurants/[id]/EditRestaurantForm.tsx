"use client";

import { useState, useRef, useEffect, ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateRestaurantAction } from "./actions";
import {
  uploadLogoAction,
  removeLogoAction,
  uploadGalleryImageAction,
  removeGalleryImageAction,
} from "./imageActions";

export interface RestaurantData {
  id: string;
  name: string;
  slug: string;
  theme: string;
  manual_status: string;
  brand_logo_path?: string | null;
  square_logo_path?: string | null;
  main_title?: string | null;
  google_review_url?: string | null;
  google_button_text?: string | null;
  feedback_button_text?: string | null;
  campaign_enabled?: boolean | null;
  campaign_title?: string | null;
  campaign_description?: string | null;
  campaign_button_text?: string | null;
  address?: string | null;
  phone?: string | null;
  opening_time?: string | null;
  closing_time?: string | null;
  closing_text?: string | null;
}

export interface BackendData {
  feedback_backend_url?: string | null;
  campaign_backend_url?: string | null;
}

export interface SubscriptionData {
  plan?: string | null;
  start_date?: string | null;
  expires_at?: string | null;
  notes?: string | null;
}

export interface GalleryImageRecord {
  image_path: string;
  sort_order: number;
}

interface Props {
  restaurant: RestaurantData;
  backend?: BackendData | null;
  subscription?: SubscriptionData | null;
  galleryImages?: GalleryImageRecord[];
}

interface FormErrors {
  name?: string;
  slug?: string;
  googleReviewUrl?: string;
  feedbackBackendUrl?: string;
  campaignBackendUrl?: string;
}

function formatDateForInput(isoString?: string | null): string {
  if (!isoString) return "";
  try {
    return isoString.split("T")[0];
  } catch {
    return "";
  }
}

function isValidUrl(val: string): boolean {
  if (!val) return true;
  try {
    const parsed = new URL(val);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function statusBadgeClass(status: string): string {
  switch (status) {
    case "active":
      return "arl-status-active";
    case "inactive":
      return "arl-status-inactive";
    case "disabled":
      return "arl-status-disabled";
    default:
      return "arl-status-draft";
  }
}

export default function EditRestaurantForm({
  restaurant,
  backend,
  subscription,
  galleryImages = [],
}: Props) {
  const router = useRouter();

  // Primary form data state
  const [form, setForm] = useState({
    name: restaurant.name || "",
    slug: restaurant.slug || "",
    theme: restaurant.theme || "theme-1",
    status: restaurant.manual_status || "draft",
    mainTitle: restaurant.main_title || "",
    googleReviewUrl: restaurant.google_review_url || "",
    googleButtonText: restaurant.google_button_text || "",
    feedbackButtonText: restaurant.feedback_button_text || "",
    campaignEnabled: Boolean(restaurant.campaign_enabled),
    campaignTitle: restaurant.campaign_title || "",
    campaignDescription: restaurant.campaign_description || "",
    campaignButtonText: restaurant.campaign_button_text || "",
    address: restaurant.address || "",
    phone: restaurant.phone || "",
    openingTime: restaurant.opening_time || "",
    closingTime: restaurant.closing_time || "",
    closingText: restaurant.closing_text || "",
    feedbackBackendUrl: backend?.feedback_backend_url || "",
    campaignBackendUrl: backend?.campaign_backend_url || "",
    plan: subscription?.plan || "free",
    startDate: formatDateForInput(subscription?.start_date),
    expiryDate: formatDateForInput(subscription?.expires_at),
    notes: subscription?.notes || "",
  });

  // Live storage image states
  const [brandLogoPath, setBrandLogoPath] = useState<string | null>(
    restaurant.brand_logo_path || null
  );
  const [squareLogoPath, setSquareLogoPath] = useState<string | null>(
    restaurant.square_logo_path || null
  );

  // Gallery map (sort_order 1..6 => image_path)
  const [galleryMap, setGalleryMap] = useState<Record<number, string>>(() => {
    const map: Record<number, string> = {};
    galleryImages.forEach((img) => {
      if (img.sort_order >= 1 && img.sort_order <= 6) {
        map[img.sort_order] = img.image_path;
      }
    });
    return map;
  });

  const [imageLoading, setImageLoading] = useState<Record<string, boolean>>({});
  const [imageErrors, setImageErrors] = useState<Record<string, string>>({});

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitState, setSubmitState] = useState<"idle" | "success" | "error">("idle");
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // File input refs
  const brandRef = useRef<HTMLInputElement>(null);
  const squareRef = useRef<HTMLInputElement>(null);
  const galleryRefs = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null));

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

  function setField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
    if (key in errors) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
    if (submitState !== "idle") setSubmitState("idle");
  }

  /* ── Logo Upload & Remove Handlers ─────────────────────────── */
  async function handleLogoUpload(logoType: "brand" | "square", file: File) {
    const key = logoType;
    setImageErrors((prev) => ({ ...prev, [key]: undefined as unknown as string }));
    setImageLoading((prev) => ({ ...prev, [key]: true }));

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await uploadLogoAction(restaurant.id, logoType, formData);
      if (!res.success || !res.publicUrl) {
        setImageErrors((prev) => ({ ...prev, [key]: res.error || "Upload failed." }));
        return;
      }

      const cacheBustedUrl = `${res.publicUrl}?t=${Date.now()}`;
      if (logoType === "brand") {
        setBrandLogoPath(cacheBustedUrl);
      } else {
        setSquareLogoPath(cacheBustedUrl);
      }
    } catch (err: unknown) {
      console.error(err);
      setImageErrors((prev) => ({ ...prev, [key]: "Unexpected error during upload." }));
    } finally {
      setImageLoading((prev) => ({ ...prev, [key]: false }));
    }
  }

  async function handleLogoRemove(logoType: "brand" | "square") {
    const key = logoType;
    setImageErrors((prev) => ({ ...prev, [key]: undefined as unknown as string }));
    setImageLoading((prev) => ({ ...prev, [key]: true }));

    try {
      const res = await removeLogoAction(restaurant.id, logoType);
      if (!res.success) {
        setImageErrors((prev) => ({ ...prev, [key]: res.error || "Remove failed." }));
        return;
      }

      if (logoType === "brand") {
        setBrandLogoPath(null);
      } else {
        setSquareLogoPath(null);
      }
    } catch (err: unknown) {
      console.error(err);
      setImageErrors((prev) => ({ ...prev, [key]: "Unexpected error during removal." }));
    } finally {
      setImageLoading((prev) => ({ ...prev, [key]: false }));
    }
  }

  /* ── Gallery Upload & Remove Handlers ───────────────────────── */
  async function handleGalleryUpload(sortOrder: number, file: File) {
    const key = `gallery_${sortOrder}`;
    setImageErrors((prev) => ({ ...prev, [key]: undefined as unknown as string }));
    setImageLoading((prev) => ({ ...prev, [key]: true }));

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await uploadGalleryImageAction(restaurant.id, sortOrder, formData);
      if (!res.success || !res.publicUrl) {
        setImageErrors((prev) => ({ ...prev, [key]: res.error || "Upload failed." }));
        return;
      }

      const cacheBustedUrl = `${res.publicUrl}?t=${Date.now()}`;
      setGalleryMap((prev) => ({ ...prev, [sortOrder]: cacheBustedUrl }));
    } catch (err: unknown) {
      console.error(err);
      setImageErrors((prev) => ({ ...prev, [key]: "Unexpected error during upload." }));
    } finally {
      setImageLoading((prev) => ({ ...prev, [key]: false }));
    }
  }

  async function handleGalleryRemove(sortOrder: number) {
    const key = `gallery_${sortOrder}`;
    setImageErrors((prev) => ({ ...prev, [key]: undefined as unknown as string }));
    setImageLoading((prev) => ({ ...prev, [key]: true }));

    try {
      const res = await removeGalleryImageAction(restaurant.id, sortOrder);
      if (!res.success) {
        setImageErrors((prev) => ({ ...prev, [key]: res.error || "Remove failed." }));
        return;
      }

      setGalleryMap((prev) => {
        const copy = { ...prev };
        delete copy[sortOrder];
        return copy;
      });
    } catch (err: unknown) {
      console.error(err);
      setImageErrors((prev) => ({ ...prev, [key]: "Unexpected error during removal." }));
    } finally {
      setImageLoading((prev) => ({ ...prev, [key]: false }));
    }
  }

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
      const res = await updateRestaurantAction(restaurant.id, {
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
        notes: form.notes,
      });

      if (!res.success) {
        setServerError(res.error || "Failed to update restaurant record.");
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
      router.refresh();
    } catch (err: unknown) {
      console.error(err);
      setServerError("An unexpected connection error occurred.");
      setSubmitState("error");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={brandRef}
        accept="image/png,image/jpeg,image/jpg,image/webp"
        style={{ display: "none" }}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0];
          if (file) handleLogoUpload("brand", file);
          e.target.value = "";
        }}
      />
      <input
        type="file"
        ref={squareRef}
        accept="image/png,image/jpeg,image/jpg,image/webp"
        style={{ display: "none" }}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0];
          if (file) handleLogoUpload("square", file);
          e.target.value = "";
        }}
      />
      {[1, 2, 3, 4, 5, 6].map((sortOrder, idx) => (
        <input
          key={sortOrder}
          type="file"
          ref={(el) => {
            galleryRefs.current[idx] = el;
          }}
          accept="image/png,image/jpeg,image/jpg,image/webp"
          style={{ display: "none" }}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) handleGalleryUpload(sortOrder, file);
            e.target.value = "";
          }}
        />
      ))}

      {/* ── Back link ────────────────────────────────────────── */}
      <Link href="/admin/restaurants" className="arf-back-link">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to Restaurants
      </Link>

      {/* ── Header ───────────────────────────────────────────── */}
      <div className="admin-header-section" style={{ marginBottom: 28 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h1 className="admin-title">Edit Restaurant</h1>
            <span className={`arl-status-badge ${statusBadgeClass(form.status)}`}>
              {form.status}
            </span>
          </div>
          <p className="admin-subtitle">Manage this restaurant's content &amp; assets.</p>
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
            <strong>Restaurant updated successfully!</strong> All changes saved to Supabase.
          </div>
        </div>
      )}

      {/* ── Global validation / server error banner ───────────── */}
      {submitState === "error" && (serverError || Object.keys(errors).length > 0) && (
        <div className="arf-form-error-banner" role="alert">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {serverError ? serverError : "Please fix the highlighted fields before saving."}
        </div>
      )}

      {/* ── Two-column layout ─────────────────────────────────── */}
      <div className="arf-layout">
        <div className="arf-form-col">

          {/* ════ § 1 — BASIC INFORMATION ════════════════════════ */}
          <div className="arf-card">
            <div className="arf-section-header">
              <span className="arf-section-badge" aria-hidden="true">1</span>
              <div>
                <div className="arf-section-title">Basic Information</div>
                <div className="arf-section-sub">Restaurant identity &amp; publishing status</div>
              </div>
            </div>

            <div className="arf-fields">
              <div className="arf-field" id="arf-field-name">
                <label htmlFor="arf-name" className="arf-label">
                  Restaurant Name <span className="arf-required">*</span>
                </label>
                <input
                  id="arf-name"
                  type="text"
                  className={`arf-input${errors.name ? " arf-input-error" : ""}`}
                  placeholder="e.g. Burger House"
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  aria-invalid={Boolean(errors.name)}
                />
                {errors.name && <span className="arf-error-text">{errors.name}</span>}
              </div>

              <div className="arf-field" id="arf-field-slug">
                <label htmlFor="arf-slug" className="arf-label">
                  URL Slug <span className="arf-required">*</span>
                </label>
                <input
                  id="arf-slug"
                  type="text"
                  className={`arf-input${errors.slug ? " arf-input-error" : ""}`}
                  placeholder="e.g. burger-house"
                  value={form.slug}
                  onChange={(e) => setField("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  aria-invalid={Boolean(errors.slug)}
                />
                {form.slug && (
                  <div className="arf-url-preview">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                    <span>https://nexinsightbd.online/r/{form.slug}</span>
                  </div>
                )}
                {errors.slug && <span className="arf-error-text">{errors.slug}</span>}
              </div>

              <div className="arf-row arf-row-2">
                <div className="arf-field">
                  <label htmlFor="arf-theme" className="arf-label">Theme</label>
                  <select id="arf-theme" className="arf-select" value={form.theme} onChange={(e) => setField("theme", e.target.value)}>
                    <option value="theme-1">Theme - Dark Gold (Default)</option>
                    <option value="theme-white">Theme - White</option>
                  </select>
                </div>
                <div className="arf-field">
                  <label htmlFor="arf-status" className="arf-label">Status</label>
                  <select id="arf-status" className="arf-select" value={form.status} onChange={(e) => setField("status", e.target.value)}>
                    <option value="draft">Draft (Hidden)</option>
                    <option value="active">Active (Published)</option>
                    <option value="inactive">Inactive</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* ════ § 2 — BRANDING LOGOS ═══════════════════════════ */}
          <div className="arf-card">
            <div className="arf-section-header">
              <span className="arf-section-badge" aria-hidden="true">2</span>
              <div>
                <div className="arf-section-title">Branding &amp; Logos</div>
                <div className="arf-section-sub">Stored in restaurant-assets/{restaurant.id}/...</div>
              </div>
            </div>

            <div className="arf-logo-pair">
              {/* Brand Logo Slot */}
              <div className="arf-logo-wrap">
                <span className="arf-label">Brand Logo</span>
                <div
                  className={`arf-logo-preview-box${brandLogoPath ? " has-image" : ""}`}
                  onClick={() => !imageLoading.brand && brandRef.current?.click()}
                >
                  {imageLoading.brand ? (
                    <span className="arf-upload-label">Uploading...</span>
                  ) : brandLogoPath ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={brandLogoPath} alt="Brand Logo" className="arf-logo-img" />
                      <div className="arf-upload-overlay">
                        <button
                          type="button"
                          className="arf-img-btn arf-img-btn-replace"
                          onClick={(e) => {
                            e.stopPropagation();
                            brandRef.current?.click();
                          }}
                        >
                          Replace
                        </button>
                        <button
                          type="button"
                          className="arf-img-btn arf-img-btn-remove"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLogoRemove("brand");
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </>
                  ) : (
                    <div style={{ textAlign: "center", padding: 12 }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--mist)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 4px" }}>
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                      </svg>
                      <span className="arf-upload-label" style={{ display: "block" }}>Upload Logo</span>
                      <span className="arf-upload-accept">PNG, JPG, WEBP (&lt;5MB)</span>
                    </div>
                  )}
                </div>
                {imageErrors.brand && <span className="arf-error-text">{imageErrors.brand}</span>}
              </div>

              {/* Square Logo Slot */}
              <div className="arf-logo-wrap">
                <span className="arf-label">Square Logo</span>
                <div
                  className={`arf-logo-preview-box${squareLogoPath ? " has-image" : ""}`}
                  onClick={() => !imageLoading.square && squareRef.current?.click()}
                >
                  {imageLoading.square ? (
                    <span className="arf-upload-label">Uploading...</span>
                  ) : squareLogoPath ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={squareLogoPath} alt="Square Logo" className="arf-logo-img" />
                      <div className="arf-upload-overlay">
                        <button
                          type="button"
                          className="arf-img-btn arf-img-btn-replace"
                          onClick={(e) => {
                            e.stopPropagation();
                            squareRef.current?.click();
                          }}
                        >
                          Replace
                        </button>
                        <button
                          type="button"
                          className="arf-img-btn arf-img-btn-remove"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLogoRemove("square");
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </>
                  ) : (
                    <div style={{ textAlign: "center", padding: 12 }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--mist)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 4px" }}>
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                      </svg>
                      <span className="arf-upload-label" style={{ display: "block" }}>Upload Icon</span>
                      <span className="arf-upload-accept">PNG, JPG, WEBP (&lt;5MB)</span>
                    </div>
                  )}
                </div>
                {imageErrors.square && <span className="arf-error-text">{imageErrors.square}</span>}
              </div>
            </div>
          </div>

          {/* ════ § 3 — PHOTO GALLERY (6 SLOTS) ═════════════════════ */}
          <div className="arf-card">
            <div className="arf-section-header">
              <span className="arf-section-badge" aria-hidden="true">3</span>
              <div>
                <div className="arf-section-title">Dish &amp; Atmosphere Gallery</div>
                <div className="arf-section-sub">Up to 6 photos stored in restaurant_images (sort orders 1–6)</div>
              </div>
            </div>

            <div className="arf-gallery-grid">
              {[1, 2, 3, 4, 5, 6].map((sortOrder, idx) => {
                const imgPath = galleryMap[sortOrder];
                const key = `gallery_${sortOrder}`;
                const isLoading = Boolean(imageLoading[key]);
                const errText = imageErrors[key];

                return (
                  <div key={sortOrder} className="arf-field">
                    <div
                      className={`arf-gallery-slot${imgPath ? " has-image" : ""}`}
                      onClick={() => !isLoading && galleryRefs.current[idx]?.click()}
                    >
                      {isLoading ? (
                        <span className="arf-gallery-slot-num">Uploading...</span>
                      ) : imgPath ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={imgPath}
                            alt={`Gallery photo ${sortOrder}`}
                            className="arf-gallery-thumb"
                          />
                          <div className="arf-upload-overlay">
                            <button
                              type="button"
                              className="arf-img-btn arf-img-btn-replace"
                              onClick={(e) => {
                                e.stopPropagation();
                                galleryRefs.current[idx]?.click();
                              }}
                            >
                              Replace
                            </button>
                            <button
                              type="button"
                              className="arf-img-btn arf-img-btn-remove"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleGalleryRemove(sortOrder);
                              }}
                            >
                              Remove
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--mist)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                          </svg>
                          <span className="arf-gallery-slot-num">Slot {sortOrder}</span>
                        </>
                      )}
                    </div>
                    {errText && <span className="arf-error-text" style={{ fontSize: "0.72rem" }}>{errText}</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ════ § 4 — MAIN EXPERIENCE CONTENT ═══════════════════ */}
          <div className="arf-card">
            <div className="arf-section-header">
              <span className="arf-section-badge" aria-hidden="true">4</span>
              <div>
                <div className="arf-section-title">Main Experience Content</div>
                <div className="arf-section-sub">Public page title and CTA button labels</div>
              </div>
            </div>

            <div className="arf-fields">
              <div className="arf-field">
                <label htmlFor="arf-main-title" className="arf-label">Main Header Title</label>
                <input
                  id="arf-main-title"
                  type="text"
                  className="arf-input"
                  placeholder="How was your experience today?"
                  value={form.mainTitle}
                  onChange={(e) => setField("mainTitle", e.target.value)}
                />
              </div>

              <div className="arf-field" id="arf-field-googleReviewUrl">
                <label htmlFor="arf-google-url" className="arf-label">Google Review URL</label>
                <input
                  id="arf-google-url"
                  type="url"
                  className={`arf-input${errors.googleReviewUrl ? " arf-input-error" : ""}`}
                  placeholder="https://g.page/r/your-google-review-link/review"
                  value={form.googleReviewUrl}
                  onChange={(e) => setField("googleReviewUrl", e.target.value)}
                />
                {errors.googleReviewUrl && <span className="arf-error-text">{errors.googleReviewUrl}</span>}
              </div>

              <div className="arf-row arf-row-2">
                <div className="arf-field">
                  <label htmlFor="arf-google-btn" className="arf-label">Google Button Label</label>
                  <input
                    id="arf-google-btn"
                    type="text"
                    className="arf-input"
                    placeholder="Rate us on Google"
                    value={form.googleButtonText}
                    onChange={(e) => setField("googleButtonText", e.target.value)}
                  />
                </div>
                <div className="arf-field">
                  <label htmlFor="arf-feedback-btn" className="arf-label">Feedback Button Label</label>
                  <input
                    id="arf-feedback-btn"
                    type="text"
                    className="arf-input"
                    placeholder="Send Private Feedback"
                    value={form.feedbackButtonText}
                    onChange={(e) => setField("feedbackButtonText", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ════ § 5 — PROMOTIONAL CAMPAIGN ═════════════════════ */}
          <div className="arf-card">
            <div className="arf-section-header">
              <span className="arf-section-badge" aria-hidden="true">5</span>
              <div>
                <div className="arf-section-title">Promotional Campaign</div>
                <div className="arf-section-sub">Birthday Club &amp; special offer popup settings</div>
              </div>
            </div>

            <div className="arf-fields">
              <div className="arf-toggle-row">
                <div>
                  <div className="arf-toggle-label">Enable Birthday / Offer Club</div>
                  <div className="arf-toggle-sub">Shows offer campaign popup on customer template</div>
                </div>
                <label className="arf-toggle-switch">
                  <input
                    type="checkbox"
                    checked={form.campaignEnabled}
                    onChange={(e) => setField("campaignEnabled", e.target.checked)}
                  />
                  <span className="arf-toggle-track" />
                  <span className="arf-toggle-thumb" />
                </label>
              </div>

              <div className={`arf-campaign-fields${!form.campaignEnabled ? " is-disabled" : ""}`}>
                <div className="arf-field">
                  <label htmlFor="arf-camp-title" className="arf-label">Campaign Title</label>
                  <input
                    id="arf-camp-title"
                    type="text"
                    className="arf-input"
                    placeholder="Join Our Birthday Club!"
                    value={form.campaignTitle}
                    onChange={(e) => setField("campaignTitle", e.target.value)}
                    disabled={!form.campaignEnabled}
                  />
                </div>
                <div className="arf-field">
                  <label htmlFor="arf-camp-desc" className="arf-label">Campaign Description</label>
                  <textarea
                    id="arf-camp-desc"
                    className="arf-textarea"
                    placeholder="Get a free dessert on your birthday month!"
                    value={form.campaignDescription}
                    onChange={(e) => setField("campaignDescription", e.target.value)}
                    disabled={!form.campaignEnabled}
                  />
                </div>
                <div className="arf-field">
                  <label htmlFor="arf-camp-btn" className="arf-label">Campaign Button Text</label>
                  <input
                    id="arf-camp-btn"
                    type="text"
                    className="arf-input"
                    placeholder="Claim Birthday Gift"
                    value={form.campaignButtonText}
                    onChange={(e) => setField("campaignButtonText", e.target.value)}
                    disabled={!form.campaignEnabled}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ════ § 6 — LOCATION & OPERATING HOURS ═════════════════ */}
          <div className="arf-card">
            <div className="arf-section-header">
              <span className="arf-section-badge" aria-hidden="true">6</span>
              <div>
                <div className="arf-section-title">Location &amp; Operating Hours</div>
                <div className="arf-section-sub">Contact information shown on public page</div>
              </div>
            </div>

            <div className="arf-fields">
              <div className="arf-field">
                <label htmlFor="arf-address" className="arf-label">Address</label>
                <input
                  id="arf-address"
                  type="text"
                  className="arf-input"
                  placeholder="Dhanmondi, Dhaka"
                  value={form.address}
                  onChange={(e) => setField("address", e.target.value)}
                />
              </div>

              <div className="arf-field">
                <label htmlFor="arf-phone" className="arf-label">Phone Number</label>
                <input
                  id="arf-phone"
                  type="tel"
                  className="arf-input"
                  placeholder="+880 1700-000000"
                  value={form.phone}
                  onChange={(e) => setField("phone", e.target.value)}
                />
              </div>

              <div className="arf-row arf-row-2">
                <div className="arf-field">
                  <label htmlFor="arf-open-time" className="arf-label">Opening Time</label>
                  <input
                    id="arf-open-time"
                    type="text"
                    className="arf-input"
                    placeholder="11:00 AM"
                    value={form.openingTime}
                    onChange={(e) => setField("openingTime", e.target.value)}
                  />
                </div>
                <div className="arf-field">
                  <label htmlFor="arf-close-time" className="arf-label">Closing Time</label>
                  <input
                    id="arf-close-time"
                    type="text"
                    className="arf-input"
                    placeholder="11:00 PM"
                    value={form.closingTime}
                    onChange={(e) => setField("closingTime", e.target.value)}
                  />
                </div>
              </div>

              <div className="arf-field">
                <label htmlFor="arf-close-text" className="arf-label">Closing Day / Notes</label>
                <input
                  id="arf-close-text"
                  type="text"
                  className="arf-input"
                  placeholder="Open 7 days a week"
                  value={form.closingText}
                  onChange={(e) => setField("closingText", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* ════ § 7 — BACKEND ENDPOINTS ══════════════════════════ */}
          <div className="arf-card">
            <div className="arf-section-header">
              <span className="arf-section-badge" aria-hidden="true">7</span>
              <div>
                <div className="arf-section-title">Backend Integration Endpoints</div>
                <div className="arf-section-sub">Google Apps Script Web App URLs</div>
              </div>
            </div>

            <div className="arf-fields">
              <div className="arf-field" id="arf-field-feedbackBackendUrl">
                <label htmlFor="arf-fb-backend" className="arf-label">Feedback Web App URL</label>
                <input
                  id="arf-fb-backend"
                  type="url"
                  className={`arf-input${errors.feedbackBackendUrl ? " arf-input-error" : ""}`}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  value={form.feedbackBackendUrl}
                  onChange={(e) => setField("feedbackBackendUrl", e.target.value)}
                />
                {errors.feedbackBackendUrl && <span className="arf-error-text">{errors.feedbackBackendUrl}</span>}
              </div>

              <div className="arf-field" id="arf-field-campaignBackendUrl">
                <label htmlFor="arf-camp-backend" className="arf-label">Campaign Web App URL</label>
                <input
                  id="arf-camp-backend"
                  type="url"
                  className={`arf-input${errors.campaignBackendUrl ? " arf-input-error" : ""}`}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  value={form.campaignBackendUrl}
                  onChange={(e) => setField("campaignBackendUrl", e.target.value)}
                />
                {errors.campaignBackendUrl && <span className="arf-error-text">{errors.campaignBackendUrl}</span>}
              </div>
            </div>
          </div>

          {/* ════ § 8 — SUBSCRIPTION MANAGEMENT ═══════════════════ */}
          <div className="arf-card">
            <div className="arf-section-header">
              <span className="arf-section-badge" aria-hidden="true">8</span>
              <div>
                <div className="arf-section-title">Subscription &amp; Validity</div>
                <div className="arf-section-sub">Package tier &amp; internal expiration tracking</div>
              </div>
            </div>

            <div className="arf-fields">
              <div className="arf-field">
                <label htmlFor="arf-plan" className="arf-label">Plan Tier</label>
                <select id="arf-plan" className="arf-select" value={form.plan} onChange={(e) => setField("plan", e.target.value)}>
                  <option value="free">Free</option>
                  <option value="starter">Starter</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
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
                  <label htmlFor="arf-expiry-date" className="arf-label">Expiration Date</label>
                  <input
                    id="arf-expiry-date"
                    type="date"
                    className="arf-input"
                    value={form.expiryDate}
                    onChange={(e) => setField("expiryDate", e.target.value)}
                  />
                </div>
              </div>

              <div className="arf-field">
                <label htmlFor="arf-sub-notes" className="arf-label">Internal Notes</label>
                <textarea
                  id="arf-sub-notes"
                  className="arf-textarea"
                  placeholder="Offline payment received via bKash/Bank..."
                  value={form.notes}
                  onChange={(e) => setField("notes", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* ── Actions Row ───────────────────────────────────────── */}
          <div style={{ display: "flex", gap: "14px", marginTop: "10px" }}>
            <button
              type="submit"
              className="arf-submit-btn"
              disabled={isSubmitting}
              style={{ flex: 1 }}
            >
              {isSubmitting ? "Saving Changes..." : "Save Changes"}
            </button>
            <Link
              href="/admin/restaurants"
              className="btn"
              style={{
                background: "#ffffff",
                border: "1.5px solid var(--border-light)",
                color: "var(--navy)",
                padding: "14px 24px",
                borderRadius: "var(--radius-md)",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "1rem",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "52px",
              }}
            >
              Cancel
            </Link>
          </div>

        </div>
      </div>
    </form>
  );
}
