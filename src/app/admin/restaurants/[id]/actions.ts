"use server";

import { createClient } from "@/lib/supabase/server";

export interface UpdateRestaurantInput {
  name: string;
  slug: string;
  theme: string;
  manualStatus: "draft" | "active" | "inactive" | "disabled";
  mainTitle?: string;
  googleReviewUrl?: string;
  googleButtonText?: string;
  feedbackButtonText?: string;
  campaignEnabled: boolean;
  campaignTitle?: string;
  campaignDescription?: string;
  campaignButtonText?: string;
  address?: string;
  phone?: string;
  openingTime?: string;
  closingTime?: string;
  closingText?: string;
  feedbackBackendUrl?: string;
  campaignBackendUrl?: string;
  plan?: string;
  startDate?: string;
  expiryDate?: string;
  notes?: string;
}

export interface ActionResult {
  success: boolean;
  error?: string;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function updateRestaurantAction(
  restaurantId: string,
  input: UpdateRestaurantInput
): Promise<ActionResult> {
  try {
    const supabase = await createClient();

    // 1. Verify authenticated admin user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized access. Please log in again." };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return { success: false, error: "Forbidden. Admin privileges required." };
    }

    // 2. Validate restaurant UUID format
    if (!restaurantId || !UUID_REGEX.test(restaurantId)) {
      return { success: false, error: "Invalid restaurant ID format." };
    }

    // 3. Validate & sanitize required fields
    const name = input.name?.trim();
    if (!name) {
      return { success: false, error: "Restaurant Name is required." };
    }

    const rawSlug = input.slug?.trim().toLowerCase();
    const sanitizedSlug = rawSlug ? rawSlug.replace(/[^a-z0-9-]/g, "") : "";
    if (!sanitizedSlug) {
      return { success: false, error: "A valid URL slug is required." };
    }

    // 4. Pre-check for duplicate slug (owned by another restaurant)
    const { data: existing, error: checkErr } = await supabase
      .from("restaurants")
      .select("id")
      .eq("slug", sanitizedSlug)
      .neq("id", restaurantId)
      .maybeSingle();

    if (checkErr) {
      console.error("[updateRestaurantAction] Slug check error:", checkErr);
      return { success: false, error: "Database error while verifying URL availability." };
    }

    if (existing) {
      return {
        success: false,
        error: `The URL slug "${sanitizedSlug}" is already taken by another restaurant.`,
      };
    }

    // 5. UPDATE `restaurants` table
    const { error: updateRestErr } = await supabase
      .from("restaurants")
      .update({
        name,
        slug: sanitizedSlug,
        theme: input.theme || "theme-1",
        manual_status: input.manualStatus || "draft",
        main_title: input.mainTitle?.trim() || null,
        google_review_url: input.googleReviewUrl?.trim() || null,
        google_button_text: input.googleButtonText?.trim() || null,
        feedback_button_text: input.feedbackButtonText?.trim() || null,
        campaign_enabled: Boolean(input.campaignEnabled),
        campaign_title: input.campaignTitle?.trim() || null,
        campaign_description: input.campaignDescription?.trim() || null,
        campaign_button_text: input.campaignButtonText?.trim() || null,
        address: input.address?.trim() || null,
        phone: input.phone?.trim() || null,
        opening_time: input.openingTime?.trim() || null,
        closing_time: input.closingTime?.trim() || null,
        closing_text: input.closingText?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", restaurantId);

    if (updateRestErr) {
      console.error("[updateRestaurantAction] Restaurant update error:", updateRestErr);
      return {
        success: false,
        error: updateRestErr.message || "Failed to update restaurant record.",
      };
    }

    // 6. UPSERT `restaurant_backends` table
    const { error: backendErr } = await supabase
      .from("restaurant_backends")
      .upsert(
        {
          restaurant_id: restaurantId,
          feedback_backend_url: input.feedbackBackendUrl?.trim() || null,
          campaign_backend_url: input.campaignBackendUrl?.trim() || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "restaurant_id" }
      );

    if (backendErr) {
      console.error("[updateRestaurantAction] Backends update error:", backendErr);
      return {
        success: false,
        error: backendErr.message || "Failed to update restaurant backend records.",
      };
    }

    // 7. UPSERT `subscriptions` table
    const startDateIso = input.startDate
      ? new Date(input.startDate).toISOString()
      : new Date().toISOString();
    const expiryDateIso = input.expiryDate
      ? new Date(input.expiryDate).toISOString()
      : null;

    const { error: subErr } = await supabase
      .from("subscriptions")
      .upsert(
        {
          restaurant_id: restaurantId,
          plan: input.plan || "free",
          start_date: startDateIso,
          expires_at: expiryDateIso,
          notes: input.notes?.trim() || "Managed via Admin Dashboard",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "restaurant_id" }
      );

    if (subErr) {
      console.error("[updateRestaurantAction] Subscriptions update error:", subErr);
      return {
        success: false,
        error: subErr.message || "Failed to update subscription record.",
      };
    }

    return { success: true };
  } catch (err: unknown) {
    console.error("[updateRestaurantAction] Unexpected error:", err);
    const msg = err instanceof Error ? err.message : "An unexpected server error occurred.";
    return { success: false, error: msg };
  }
}
