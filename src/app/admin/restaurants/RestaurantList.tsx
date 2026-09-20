"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export interface RestaurantWithSubscription {
  id: string;
  name: string;
  slug: string;
  theme: string;
  manual_status: string;
  created_at: string;
  subscriptions?: {
    plan?: string | null;
    expires_at?: string | null;
  } | null;
}

interface Props {
  restaurants: RestaurantWithSubscription[];
}

export default function RestaurantList({ restaurants }: Props) {
  const searchParams = useSearchParams();
  const [showCreatedBanner, setShowCreatedBanner] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    if (searchParams.get("created") === "true") {
      setShowCreatedBanner(true);
    }
  }, [searchParams]);

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((item) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.slug.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "all" || item.manual_status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [restaurants, search, statusFilter]);

  function formatDate(isoString?: string | null): string {
    if (!isoString) return "N/A";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-US", {
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

  return (
    <div className="arl-container">
      {/* ── Created Success Banner ─────────────────────────────────── */}
      {showCreatedBanner && (
        <div className="arf-success-banner" style={{ marginBottom: 24 }} role="alert">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <div style={{ flex: 1 }}>
            <strong>Restaurant record created successfully!</strong> Database row saved in Supabase.
          </div>
          <button
            type="button"
            onClick={() => setShowCreatedBanner(false)}
            style={{ background: "none", border: "none", color: "#065f46", cursor: "pointer", fontWeight: 700 }}
            aria-label="Dismiss banner"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="admin-header-section" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="admin-title">Restaurants</h1>
          <p className="admin-subtitle">
            Manage your registered restaurant locations ({restaurants.length} total)
          </p>
        </div>
        <Link href="/admin/restaurants/new" className="btn btn-primary">
          + Add Restaurant
        </Link>
      </div>

      {/* ── Filter & Search Toolbar ───────────────────────────────── */}
      <div className="arl-toolbar">
        <div className="arl-search-wrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="arl-search-icon">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search by name or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="arl-filter-wrap">
          <label htmlFor="arl-status-select" className="admin-form-label" style={{ margin: 0 }}>
            Status:
          </label>
          <select
            id="arl-status-select"
            className="arf-select"
            style={{ minHeight: 40, width: "auto", padding: "8px 36px 8px 12px" }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>
      </div>

      {/* ── Restaurant Table / List ────────────────────────────────── */}
      {filteredRestaurants.length === 0 ? (
        <div className="admin-empty-card" style={{ marginTop: 20 }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--mist)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <div className="admin-empty-title">
            {restaurants.length === 0 ? "No restaurants created yet" : "No matching restaurants"}
          </div>
          <p className="admin-empty-sub">
            {restaurants.length === 0
              ? "Click + Add Restaurant above to register your first restaurant location."
              : "Try adjusting your search terms or status filter."}
          </p>
          {restaurants.length === 0 && (
            <Link href="/admin/restaurants/new" className="btn btn-primary" style={{ marginTop: 12 }}>
              + Add Restaurant
            </Link>
          )}
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
                  <th>Plan</th>
                  <th>Expiry</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {filteredRestaurants.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="arl-name-cell">
                        <div className="arl-logo-placeholder" aria-hidden="true">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                          </svg>
                        </div>
                        <Link
                          href={`/admin/restaurants/${item.id}`}
                          className="arl-name"
                          style={{ textDecoration: "none" }}
                          title="Edit restaurant"
                        >
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
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                      <span className="arl-plan-text">
                        {item.subscriptions?.plan
                          ? item.subscriptions.plan.toUpperCase()
                          : "FREE"}
                      </span>
                    </td>
                    <td>
                      <span className="arl-date-text">
                        {formatDate(item.subscriptions?.expires_at)}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                        <span className="arl-date-text">
                          {formatDate(item.created_at)}
                        </span>
                        <Link
                          href={`/admin/restaurants/${item.id}`}
                          className="btn"
                          style={{
                            padding: "4px 10px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            background: "rgba(27, 123, 228, 0.08)",
                            color: "var(--blue)",
                            border: "1px solid rgba(27, 123, 228, 0.2)",
                            borderRadius: "var(--radius-sm)",
                            textDecoration: "none",
                          }}
                        >
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
