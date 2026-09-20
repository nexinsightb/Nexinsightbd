"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface ImageActionResult {
  success: boolean;
  error?: string;
  publicUrl?: string;
}

const BUCKET_NAME = "restaurant-assets";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function validateFile(file: File | null): string | null {
  if (!file) return "No file provided.";
  if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
    return "Unsupported file format. Please upload PNG, JPG, or WEBP.";
  }
  if (file.size > MAX_FILE_SIZE) {
    return "File size exceeds 5 MB limit.";
  }
  return null;
}

async function verifyAdminAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized access. Please log in again.");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    throw new Error("Forbidden. Admin privileges required.");
  }

  return supabase;
}

// Helper to extract relative storage path inside bucket from full URL
function extractStoragePath(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const cleanUrl = url.split("?")[0];
    const marker = `${BUCKET_NAME}/`;
    const index = cleanUrl.indexOf(marker);
    if (index !== -1) {
      return decodeURIComponent(cleanUrl.slice(index + marker.length));
    }
  } catch {
    // ignore parse error
  }
  return null;
}

async function getRestaurantSlug(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  restaurantId: string
): Promise<string | null> {
  const { data } = await supabase
    .from("restaurants")
    .select("slug")
    .eq("id", restaurantId)
    .maybeSingle();
  return data?.slug || null;
}

/**
 * Upload or Replace Brand / Square Logo
 */
export async function uploadLogoAction(
  restaurantId: string,
  logoType: "brand" | "square",
  formData: FormData
): Promise<ImageActionResult> {
  try {
    if (!restaurantId || !UUID_REGEX.test(restaurantId)) {
      return { success: false, error: "Invalid restaurant ID format." };
    }

    const file = formData.get("file") as File | null;
    const valErr = validateFile(file);
    if (valErr || !file) {
      return { success: false, error: valErr || "Invalid file." };
    }

    const supabase = await verifyAdminAuth();

    const fileName = logoType === "brand" ? "logo.webp" : "square-logo.webp";
    const filePath = `${restaurantId}/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();

    // 1. Upload file to Supabase Storage with upsert
    const { error: storageErr } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, arrayBuffer, {
        contentType: file.type || "image/webp",
        upsert: true,
      });

    if (storageErr) {
      console.error("[uploadLogoAction] Storage error:", storageErr);
      return {
        success: false,
        error: storageErr.message || "Failed to upload file to storage.",
      };
    }

    // 2. Get Public URL with cache-busting timestamp
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    const publicUrl = `${urlData.publicUrl}?v=${Date.now()}`;
    const fieldToUpdate = logoType === "brand" ? "brand_logo_path" : "square_logo_path";

    // 3. Update database row
    const { error: dbErr } = await supabase
      .from("restaurants")
      .update({
        [fieldToUpdate]: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", restaurantId);

    if (dbErr) {
      console.error("[uploadLogoAction] Database error:", dbErr);
      return {
        success: false,
        error: dbErr.message || "Failed to save logo path in database.",
      };
    }

    // 4. Revalidate cache
    const slug = await getRestaurantSlug(supabase, restaurantId);
    revalidatePath(`/admin/restaurants/${restaurantId}`);
    revalidatePath("/admin/restaurants");
    if (slug) {
      revalidatePath(`/r/${slug}`);
    }

    return { success: true, publicUrl };
  } catch (err: unknown) {
    console.error("[uploadLogoAction] Unexpected error:", err);
    const msg = err instanceof Error ? err.message : "An unexpected server error occurred.";
    return { success: false, error: msg };
  }
}

/**
 * Remove Brand / Square Logo
 */
export async function removeLogoAction(
  restaurantId: string,
  logoType: "brand" | "square"
): Promise<ImageActionResult> {
  try {
    if (!restaurantId || !UUID_REGEX.test(restaurantId)) {
      return { success: false, error: "Invalid restaurant ID format." };
    }

    const supabase = await verifyAdminAuth();
    const fieldToUpdate = logoType === "brand" ? "brand_logo_path" : "square_logo_path";

    // 1. Fetch current logo URL to remove exact file from storage
    const { data: rest } = await supabase
      .from("restaurants")
      .select("slug, brand_logo_path, square_logo_path")
      .eq("id", restaurantId)
      .maybeSingle();

    const currentUrl = rest ? (rest[fieldToUpdate] as string | null) : null;
    const defaultFileName = logoType === "brand" ? "logo.webp" : "square-logo.webp";
    const defaultFilePath = `${restaurantId}/${defaultFileName}`;

    const filesToRemove = new Set<string>();
    filesToRemove.add(defaultFilePath);

    const extracted = extractStoragePath(currentUrl);
    if (extracted) {
      filesToRemove.add(extracted);
    }

    // 2. Remove storage object(s)
    const { error: storageErr } = await supabase.storage
      .from(BUCKET_NAME)
      .remove(Array.from(filesToRemove));

    if (storageErr) {
      console.error("[removeLogoAction] Storage error:", storageErr);
    }

    // 3. Clear database column
    const { error: dbErr } = await supabase
      .from("restaurants")
      .update({
        [fieldToUpdate]: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", restaurantId);

    if (dbErr) {
      console.error("[removeLogoAction] Database error:", dbErr);
      return {
        success: false,
        error: dbErr.message || "Failed to clear logo path in database.",
      };
    }

    // 4. Revalidate cache
    revalidatePath(`/admin/restaurants/${restaurantId}`);
    revalidatePath("/admin/restaurants");
    if (rest?.slug) {
      revalidatePath(`/r/${rest.slug}`);
    }

    return { success: true };
  } catch (err: unknown) {
    console.error("[removeLogoAction] Unexpected error:", err);
    const msg = err instanceof Error ? err.message : "An unexpected server error occurred.";
    return { success: false, error: msg };
  }
}

/**
 * Upload or Replace Gallery Image (Sort Order 1–6)
 */
export async function uploadGalleryImageAction(
  restaurantId: string,
  sortOrder: number,
  formData: FormData
): Promise<ImageActionResult> {
  try {
    if (!restaurantId || !UUID_REGEX.test(restaurantId)) {
      return { success: false, error: "Invalid restaurant ID format." };
    }

    if (sortOrder < 1 || sortOrder > 6) {
      return { success: false, error: "Gallery sort order must be between 1 and 6." };
    }

    const file = formData.get("file") as File | null;
    const valErr = validateFile(file);
    if (valErr || !file) {
      return { success: false, error: valErr || "Invalid file." };
    }

    const supabase = await verifyAdminAuth();
    const filePath = `${restaurantId}/image-${sortOrder}.webp`;

    const arrayBuffer = await file.arrayBuffer();

    // 1. Upload to Storage
    const { error: storageErr } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, arrayBuffer, {
        contentType: file.type || "image/webp",
        upsert: true,
      });

    if (storageErr) {
      console.error("[uploadGalleryImageAction] Storage error:", storageErr);
      return {
        success: false,
        error: storageErr.message || "Failed to upload image to storage.",
      };
    }

    // 2. Get Public URL with cache-busting timestamp
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    const publicUrl = `${urlData.publicUrl}?v=${Date.now()}`;

    // 3. Upsert into `restaurant_images` table
    const { error: dbErr } = await supabase
      .from("restaurant_images")
      .upsert(
        {
          restaurant_id: restaurantId,
          image_path: publicUrl,
          sort_order: sortOrder,
        },
        { onConflict: "restaurant_id,sort_order" }
      );

    if (dbErr) {
      console.error("[uploadGalleryImageAction] Database error:", dbErr);
      return {
        success: false,
        error: dbErr.message || "Failed to save gallery image in database.",
      };
    }

    // 4. Revalidate cache
    const slug = await getRestaurantSlug(supabase, restaurantId);
    revalidatePath(`/admin/restaurants/${restaurantId}`);
    revalidatePath("/admin/restaurants");
    if (slug) {
      revalidatePath(`/r/${slug}`);
    }

    return { success: true, publicUrl };
  } catch (err: unknown) {
    console.error("[uploadGalleryImageAction] Unexpected error:", err);
    const msg = err instanceof Error ? err.message : "An unexpected server error occurred.";
    return { success: false, error: msg };
  }
}

/**
 * Remove Gallery Image (Sort Order 1–6)
 */
export async function removeGalleryImageAction(
  restaurantId: string,
  sortOrder: number
): Promise<ImageActionResult> {
  try {
    if (!restaurantId || !UUID_REGEX.test(restaurantId)) {
      return { success: false, error: "Invalid restaurant ID format." };
    }

    if (sortOrder < 1 || sortOrder > 6) {
      return { success: false, error: "Gallery sort order must be between 1 and 6." };
    }

    const supabase = await verifyAdminAuth();

    // 1. Fetch current gallery image record & restaurant slug
    const [{ data: imgRecord }, { data: rest }] = await Promise.all([
      supabase
        .from("restaurant_images")
        .select("image_path")
        .eq("restaurant_id", restaurantId)
        .eq("sort_order", sortOrder)
        .maybeSingle(),
      supabase
        .from("restaurants")
        .select("slug")
        .eq("id", restaurantId)
        .maybeSingle(),
    ]);

    const defaultFilePath = `${restaurantId}/image-${sortOrder}.webp`;
    const filesToRemove = new Set<string>();
    filesToRemove.add(defaultFilePath);

    const extracted = extractStoragePath(imgRecord?.image_path);
    if (extracted) {
      filesToRemove.add(extracted);
    }

    // 2. Remove storage object(s)
    const { error: storageErr } = await supabase.storage
      .from(BUCKET_NAME)
      .remove(Array.from(filesToRemove));

    if (storageErr) {
      console.error("[removeGalleryImageAction] Storage error:", storageErr);
    }

    // 3. Delete database row from `restaurant_images`
    const { error: dbErr } = await supabase
      .from("restaurant_images")
      .delete()
      .eq("restaurant_id", restaurantId)
      .eq("sort_order", sortOrder);

    if (dbErr) {
      console.error("[removeGalleryImageAction] Database error:", dbErr);
      return {
        success: false,
        error: dbErr.message || "Failed to delete gallery image record.",
      };
    }

    // 4. Revalidate cache
    revalidatePath(`/admin/restaurants/${restaurantId}`);
    revalidatePath("/admin/restaurants");
    if (rest?.slug) {
      revalidatePath(`/r/${rest.slug}`);
    }

    return { success: true };
  } catch (err: unknown) {
    console.error("[removeGalleryImageAction] Unexpected error:", err);
    const msg = err instanceof Error ? err.message : "An unexpected server error occurred.";
    return { success: false, error: msg };
  }
}
