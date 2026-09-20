export interface CarouselImage {
  src: string;
  alt: string;
  /** CSS transform zoom factor, e.g. 1.1 */
  zoom?: number;
  /** CSS translate X offset, e.g. "10px" */
  shiftX?: string;
  /** CSS translate Y offset, e.g. "-5px" */
  shiftY?: string;
}

export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  whatsapp?: string;
}

export interface BusinessHours {
  label: string; // e.g. "Sat – Thu"
  time: string;  // e.g. "11:00 AM – 11:00 PM"
}

/** Theme identifier — add new theme keys here to register them globally */
export type RestaurantTheme = "theme-1" | "theme-white";

export interface Restaurant {
  /** URL slug — used in /r/[slug] */
  slug: string;
  /** Display name of the restaurant */
  name: string;
  /** Short tagline shown at the bottom of the page */
  tagline: string;

  // ── Images ────────────────────────────────────────────────────────
  /** Header logo image path (relative to /public or absolute URL) */
  logoUrl: string;
  /** Footer logo image path */
  footerLogoUrl: string;
  /** Carousel dish images */
  carouselImages: CarouselImage[];

  // ── Contact & Location ────────────────────────────────────────────
  address: string;
  phone: string;
  businessHours: BusinessHours[];
  socialLinks: SocialLinks;

  // ── Review & Feedback ────────────────────────────────────────────
  /**
   * Full Google Review URL, e.g.:
   * https://search.google.com/local/writereview?placeid=ChIJ...
   */
  googleReviewUrl: string;
  /**
   * Google Apps Script URL for form submission.
   * Each restaurant has its own Sheet.
   */
  googleSheetUrl: string;

  // ── Dynamic Custom Content ───────────────────────────────────────
  mainTitle?: string;
  googleButtonText?: string;
  feedbackButtonText?: string;
  campaignEnabled?: boolean;
  campaignBackendUrl?: string;

  // ── Promo / Birthday Club ─────────────────────────────────────────
  promoTitle: string;
  promoDescription: string;
  /** Short promo label shown on the CTA button, e.g. "Join the Birthday Club" */
  promoCtaLabel: string;
  /** Success message shown after promo signup */
  promoSuccessMessage: string;

  // ── Theme ─────────────────────────────────────────────────────────
  theme?: RestaurantTheme;
}
