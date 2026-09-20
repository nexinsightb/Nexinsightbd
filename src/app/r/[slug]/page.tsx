import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getThemeComponent } from "@/themes";
import type { Restaurant } from "@/types/restaurant";

export const runtime = "edge";
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Dynamic metadata generated from active Supabase restaurant record.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("name, campaign_description, main_title, brand_logo_path, manual_status")
    .eq("slug", slug)
    .single();

  if (!restaurant || restaurant.manual_status !== "active") {
    return { title: "Page Not Found — NexInsight" };
  }

  const title = `${restaurant.name} | NexInsight`;
  const description =
    restaurant.campaign_description ||
    restaurant.main_title ||
    `Share your dining experience at ${restaurant.name}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: restaurant.brand_logo_path ? [{ url: restaurant.brand_logo_path }] : [],
    },
    robots: { index: false, follow: false },
  };
}

export default async function RestaurantPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // 1. Query main restaurant record by slug
  const { data: restaurant, error: restError } = await supabase
    .from("restaurants")
    .select(`
      id,
      name,
      slug,
      theme,
      manual_status,
      brand_logo_path,
      square_logo_path,
      main_title,
      google_review_url,
      google_button_text,
      feedback_button_text,
      campaign_enabled,
      campaign_title,
      campaign_description,
      campaign_button_text,
      address,
      phone,
      opening_time,
      closing_time,
      closing_text
    `)
    .eq("slug", slug)
    .single();

  // 2. Active status protection rule: ONLY 'active' status renders
  if (restError || !restaurant || restaurant.manual_status !== "active") {
    notFound();
  }

  // 3. Query gallery images (sort_order 1–6)
  const { data: images } = await supabase
    .from("restaurant_images")
    .select("image_path, sort_order")
    .eq("restaurant_id", restaurant.id)
    .order("sort_order", { ascending: true })
    .limit(6);

  // 4. Query backend Integration Endpoints
  const { data: backend } = await supabase
    .from("restaurant_backends")
    .select("feedback_backend_url, campaign_backend_url")
    .eq("restaurant_id", restaurant.id)
    .maybeSingle();

  // 5. Map database fields to Theme Component contract
  const mappedRestaurant: Restaurant = {
    slug: restaurant.slug,
    name: restaurant.name,
    tagline: "Powered by NexInsight",
    logoUrl:
      restaurant.brand_logo_path ||
      restaurant.square_logo_path ||
      "/assets/images/logo-placeholder.png",
    footerLogoUrl:
      restaurant.square_logo_path ||
      restaurant.brand_logo_path ||
      "/assets/images/logo-placeholder.png",
    carouselImages: (images || []).map((img, idx) => ({
      src: img.image_path,
      alt: `${restaurant.name} photo ${idx + 1}`,
    })),
    address: restaurant.address || "Location details unavailable",
    phone: restaurant.phone || "",
    businessHours: [
      {
        label: "Hours",
        time: `${restaurant.opening_time || "11:00 AM"} – ${restaurant.closing_time || "11:00 PM"}`,
      },
      ...(restaurant.closing_text ? [{ label: "Notes", time: restaurant.closing_text }] : []),
    ],
    socialLinks: {},
    googleReviewUrl: restaurant.google_review_url || "#",
    googleSheetUrl: backend?.feedback_backend_url || "",
    campaignBackendUrl: backend?.campaign_backend_url || "",
    mainTitle: restaurant.main_title || undefined,
    googleButtonText: restaurant.google_button_text || undefined,
    feedbackButtonText: restaurant.feedback_button_text || undefined,
    campaignEnabled: Boolean(restaurant.campaign_enabled),
    promoTitle: restaurant.campaign_title || "Join Our Birthday Club!",
    promoDescription:
      restaurant.campaign_description ||
      "Sign up to get exclusive birthday perks and special offers.",
    promoCtaLabel: restaurant.campaign_button_text || "Join Club",
    promoSuccessMessage: "You've successfully joined the club! Show this to your server.",
    theme: (restaurant.theme as any) || "theme-1",
  };

  const ThemeComponent = getThemeComponent(mappedRestaurant.theme);

  return <ThemeComponent restaurant={mappedRestaurant} />;
}
