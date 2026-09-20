import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminNavbar from "@/components/AdminNavbar";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "Admin Dashboard — NexInsight",
  description: "Manage your restaurant pages and NexInsight services.",
  robots: { index: false, follow: false },
};

function formatDate(isoString: string): string {
  try {
    return new Date(isoString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return isoString;
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

export default async function AdminPage() {
  const supabase = await createClient();

  // 1. Authenticate admin user
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

  // 2. Query all restaurants from Supabase
  const { data: restaurantsData, error: restError } = await supabase
    .from("restaurants")
    .select("id, name, slug, theme, manual_status, created_at")
    .order("created_at", { ascending: false });

  if (restError) {
    console.error("[AdminDashboard] Error fetching restaurants:", restError);
  }

  const allRestaurants = restaurantsData || [];

  // 3. Query subscriptions expiring within 30 days
  const nowIso = new Date().toISOString();
  const in30DaysIso = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data: expiringData, error: expError } = await supabase
    .from("subscriptions")
    .select("id")
    .not("expires_at", "is", null)
    .gte("expires_at", nowIso)
    .lte("expires_at", in30DaysIso);

  if (expError) {
    console.error("[AdminDashboard] Error fetching expiring subscriptions:", expError);
  }

  // 4. Compute statistics
  const totalCount = allRestaurants.length;
  const activeCount = allRestaurants.filter((r) => r.manual_status === "active").length;
  const draftCount = allRestaurants.filter((r) => r.manual_status === "draft").length;
  const inactiveCount = allRestaurants.filter((r) => r.manual_status === "inactive").length;
  const disabledCount = allRestaurants.filter((r) => r.manual_status === "disabled").length;
  const expiringSoonCount = (expiringData || []).length;

  const stats = [
    { label: "Total Restaurants", value: totalCount },
    { label: "Active", value: activeCount },
    { label: "Draft", value: draftCount },
    { label: "Inactive", value: inactiveCount },
    { label: "Disabled", value: disabledCount },
    { label: "Expiring Soon", value: expiringSoonCount },
  ];

  // 5. Recent restaurants (latest 5)
  const recentRestaurants = allRestaurants.slice(0, 5);

  return (
    <>
      <AdminNavbar />

      <main className="admin-page">
        <div className="container">
          {/* Header & Quick Actions */}
          <div className="admin-header-section" style={{ marginBottom: 28 }}>
            <div>
              <h1 className="admin-title">Dashboard</h1>
              <p className="admin-subtitle">
                Manage your restaurant pages and NexInsight services.
              </p>
            </div>
            <div className="admin-header-actions" style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <Link href="/admin/restaurants/new" className="btn btn-primary">
                + Add Restaurant
              </Link>
              <Link
                href="/admin/restaurants"
                className="btn"
                style={{
                  background: "#ffffff",
                  border: "1.5px solid var(--border-light)",
                  color: "var(--navy)",
                  padding: "10px 18px",
                  borderRadius: "var(--radius-md)",
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                View Restaurants
              </Link>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="admin-stats-grid" style={{ marginBottom: 32 }}>
            {stats.map((stat) => (
              <div key={stat.label} className="admin-stat-card">
                <span className="admin-stat-label">{stat.label}</span>
                <span className="admin-stat-value">{stat.value}</span>
              </div>
            ))}
          </div>

          {/* Recent Restaurants Section */}
          <section className="admin-section">
            <div className="admin-section-header" style={{ marginBottom: 16 }}>
              <div>
                <h2 className="admin-section-title">Recent Restaurants</h2>
                <p className="admin-subtitle" style={{ fontSize: "0.85rem", marginTop: 2 }}>
                  Latest registered restaurant locations
                </p>
              </div>
              {totalCount > 0 && (
                <Link
                  href="/admin/restaurants"
                  style={{
                    color: "var(--blue)",
                    textDecoration: "none",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                  }}
                >
                  View All Restaurants →
                </Link>
              )}
            </div>

            {totalCount === 0 ? (
              <div className="admin-empty-card">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--mist)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                <div className="admin-empty-title">No restaurants created yet</div>
                <p className="admin-empty-sub">
                  Restaurant locations will appear here once added to NexInsight.
                </p>
                <Link href="/admin/restaurants/new" className="btn btn-primary" style={{ marginTop: 12 }}>
                  + Add Restaurant
                </Link>
              </div>
            ) : (
              <div className="arl-table-card">
                <div className="arl-table-responsive">
                  <table className="arl-table">
                    <thead>
                      <tr>
                        <th>Restaurant</th>
                        <th>URL Slug</th>
                        <th>Theme</th>
                        <th>Status</th>
                        <th>Created Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentRestaurants.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <div className="arl-name-cell">
                              <div className="arl-logo-placeholder" aria-hidden="true">
                                <svg
                                  width="18"
                                  height="18"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                </svg>
                              </div>
                              <Link href="/admin/restaurants" className="arl-name" style={{ textDecoration: "none" }}>
                                {item.name}
                              </Link>
                            </div>
                          </td>
                          <td>
                            <a
                              href={`/r/${item.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="arl-slug-link"
                            >
                              /r/{item.slug}
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                <polyline points="15 3 21 3 21 9" />
                                <line x1="10" y1="14" x2="21" y2="3" />
                              </svg>
                            </a>
                          </td>
                          <td>
                            <span className="arl-theme-badge">
                              {item.theme === "theme-1" ? "Dark Gold" : item.theme}
                            </span>
                          </td>
                          <td>
                            <span className={`arl-status-badge ${statusBadgeClass(item.manual_status)}`}>
                              {item.manual_status}
                            </span>
                          </td>
                          <td>
                            <span className="arl-date-text">
                              {formatDate(item.created_at)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
