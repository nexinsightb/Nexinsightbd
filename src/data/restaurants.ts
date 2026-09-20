import type { Restaurant } from "@/types/restaurant";

/**
 * Restaurant data store.
 *
 * ADDING A NEW RESTAURANT:
 * 1. Add an entry to this array with a unique slug.
 * 2. Place images in /public/restaurants/[slug]/
 * 3. The page will be live at /r/[slug]
 *
 * Future: This will be replaced by a Supabase DB call.
 */
const restaurants: Restaurant[] = [
  {
    slug: "demo",
    name: "Your Restaurant",
    tagline: "Thank you for dining with us.",

    logoUrl: "/restaurants/demo/logo.jpg",
    footerLogoUrl: "/restaurants/demo/footer-logo.jpg",
    carouselImages: [
      { src: "/restaurants/demo/carousel-1.jpg", alt: "Featured dish 1" },
      { src: "/restaurants/demo/carousel-2.jpg", alt: "Featured dish 2" },
      { src: "/restaurants/demo/carousel-3.jpg", alt: "Featured dish 3" },
      { src: "/restaurants/demo/carousel-4.jpg", alt: "Featured dish 4" },
      { src: "/restaurants/demo/carousel-5.jpg", alt: "Featured dish 5" },
      { src: "/restaurants/demo/carousel-6.jpg", alt: "Featured dish 6" },
    ],

    address: "123 Demo Street, Dhaka",
    phone: "+880 1XXX-XXXXXX",
    businessHours: [
      { label: "Sat – Thu", time: "11:00 AM – 11:00 PM" },
      { label: "Fri", time: "2:00 PM – 11:00 PM" },
    ],
    socialLinks: {
      instagram: "https://instagram.com/your-page-here",
      facebook: "https://facebook.com/your-page-here",
      whatsapp: "https://wa.me/8801234567890",
    },

    googleReviewUrl:
      "https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID",
    googleSheetUrl:
      "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec",

    promoTitle: "Join our Birthday Club!",
    promoDescription:
      "Get a FREE brownie/mocktail on your special day. Also get an instant 5% discount on today's bill.",
    promoCtaLabel: "Join the Birthday Club",
    promoSuccessMessage:
      "Your 5% discount is ready to use today. We'll send you a special treat during your birth month!",

    theme: "theme-1",
  },

  // ── ADD YOUR RESTAURANTS BELOW ──────────────────────────────────
  // {
  //   slug: "pizzaburg",
  //   name: "Pizzaburg",
  //   ...
  // },
];

/**
 * Look up a restaurant by its slug.
 * Returns null if not found.
 */
export function getRestaurantBySlug(slug: string): Restaurant | null {
  return restaurants.find((r) => r.slug === slug) ?? null;
}

/**
 * Get all slugs — used for generateStaticParams in Next.js.
 */
export function getAllRestaurantSlugs(): string[] {
  return restaurants.map((r) => r.slug);
}

export default restaurants;
