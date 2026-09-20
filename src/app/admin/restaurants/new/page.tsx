import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminNavbar from "@/components/AdminNavbar";
import AddRestaurantForm from "./AddRestaurantForm";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "Add Restaurant — NexInsight Admin",
  description: "Create a new restaurant page for NexInsight.",
  robots: { index: false, follow: false },
};

export default async function AddRestaurantPage() {
  const supabase = await createClient();

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

  return (
    <>
      <AdminNavbar />
      <main className="admin-page">
        <div className="container">
          <AddRestaurantForm />
        </div>
      </main>
    </>
  );
}
