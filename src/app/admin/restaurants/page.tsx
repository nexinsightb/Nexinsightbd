import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminNavbar from "@/components/AdminNavbar";
import RestaurantList, { RestaurantWithSubscription } from "./RestaurantList";

export const metadata: Metadata = {
  title: "Restaurants — NexInsight Admin",
  description: "View and manage registered restaurant locations.",
  robots: { index: false, follow: false },
};

export default async function AdminRestaurantsPage() {
  const supabase = await createClient();

  // 1. Authenticate user & role check
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

  // 2. Fetch restaurants with subscriptions from Supabase
  const { data: restaurantsData, error } = await supabase
    .from("restaurants")
    .select(`
      id,
      name,
      slug,
      theme,
      manual_status,
      created_at,
      subscriptions (
        plan,
        expires_at
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[AdminRestaurantsPage] Database fetch error:", error);
  }

  // Map database response to component interface shape
  const restaurants: RestaurantWithSubscription[] = (restaurantsData || []).map(
    (item: any) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      theme: item.theme,
      manual_status: item.manual_status,
      created_at: item.created_at,
      subscriptions: Array.isArray(item.subscriptions)
        ? item.subscriptions[0] || null
        : item.subscriptions || null,
    })
  );

  return (
    <>
      <AdminNavbar />
      <main className="admin-page">
        <div className="container">
          <RestaurantList restaurants={restaurants} />
        </div>
      </main>
    </>
  );
}
