import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminNavbar from "@/components/AdminNavbar";
import EditRestaurantForm from "./EditRestaurantForm";

export const runtime = "edge";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  if (!id || !UUID_REGEX.test(id)) {
    return { title: "Restaurant Not Found — NexInsight Admin" };
  }

  const supabase = await createClient();
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("name")
    .eq("id", id)
    .single();

  return {
    title: restaurant
      ? `Edit ${restaurant.name} — NexInsight Admin`
      : "Edit Restaurant — NexInsight Admin",
    robots: { index: false, follow: false },
  };
}

export default async function EditRestaurantPage({ params }: Props) {
  const { id } = await params;

  // 1. Validate UUID parameter format
  if (!id || !UUID_REGEX.test(id)) {
    notFound();
  }

  const supabase = await createClient();

  // 2. Authenticate admin user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/admin/login");
  }

  // 3. Query restaurant record by UUID
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
    .eq("id", id)
    .single();

  if (restError || !restaurant) {
    console.error("[EditRestaurantPage] Restaurant query error:", restError);
    notFound();
  }

  // 4. Query backend records
  const { data: backend } = await supabase
    .from("restaurant_backends")
    .select("feedback_backend_url, campaign_backend_url")
    .eq("restaurant_id", id)
    .maybeSingle();

  // 5. Query subscription record
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan, start_date, expires_at, notes")
    .eq("restaurant_id", id)
    .maybeSingle();

  // 6. Query gallery images (sort_order 1–6)
  const { data: galleryImages } = await supabase
    .from("restaurant_images")
    .select("image_path, sort_order")
    .eq("restaurant_id", id)
    .order("sort_order", { ascending: true });

  return (
    <>
      <AdminNavbar />
      <main className="admin-page">
        <div className="container">
          <EditRestaurantForm
            restaurant={restaurant}
            backend={backend}
            subscription={subscription}
            galleryImages={galleryImages || []}
          />
        </div>
      </main>
    </>
  );
}
