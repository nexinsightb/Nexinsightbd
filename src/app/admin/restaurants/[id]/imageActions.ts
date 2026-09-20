"use server";

import { createClient } from "@/lib/supabase/server";

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

    // 2. Get Public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;
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
    const fileName = logoType === "brand" ? "logo.webp" : "square-logo.webp";
    const filePath = `${restaurantId}/${fileName}`;

    // 1. Remove storage object
    await supabase.storage.from(BUCKET_NAME).remove([filePath]);

    // 2. Clear database column
    const fieldToUpdate = logoType === "brand" ? "brand_logo_path" : "square_logo_path";
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

    // 2. Get Public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;

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
    const filePath = `${restaurantId}/image-${sortOrder}.webp`;

    // 1. Remove storage object
    await supabase.storage.from(BUCKET_NAME).remove([filePath]);

    // 2. Delete database row from `restaurant_images`
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

    return { success: true };
  } catch (err: unknown) {
    console.error("[removeGalleryImageAction] Unexpected error:", err);
    const msg = err instanceof Error ? err.message : "An unexpected server error occurred.";
    return { success: false, error: msg };
  }
}
