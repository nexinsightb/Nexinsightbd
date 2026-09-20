"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AdminNavbar from "@/components/AdminNavbar";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setLoading(true);

      try {
        const supabase = createClient();
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (authError) {
          setError(authError.message || "Invalid email or password.");
          setLoading(false);
          return;
        }

        // Verify profile role
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setError("Authentication failed.");
          setLoading(false);
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (!profile || profile.role !== "admin") {
          await supabase.auth.signOut();
          setError("Access denied: You do not have administrator permissions.");
          setLoading(false);
          return;
        }

        router.push("/admin");
        router.refresh();
      } catch (err) {
        console.error("Login error:", err);
        setError("An unexpected error occurred. Please try again.");
        setLoading(false);
      }
    },
    [email, password, router]
  );

  return (
    <>
      <AdminNavbar />

      <main className="admin-login-page">
        <div className="admin-login-card">
          <h1 className="admin-login-title">Admin Login</h1>
          <p className="admin-login-sub">
            Sign in to access the NexInsight admin dashboard.
          </p>

          {error && <div className="admin-error-banner">{error}</div>}

          <form onSubmit={handleLogin}>
            <div className="admin-form-group">
              <div className="admin-form-field">
                <label className="admin-form-label" htmlFor="adminEmail">
                  Email Address
                </label>
                <input
                  id="adminEmail"
                  type="email"
                  className="admin-form-input"
                  placeholder="admin@nexinsight.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="admin-form-field">
                <label className="admin-form-label" htmlFor="adminPassword">
                  Password
                </label>
                <input
                  id="adminPassword"
                  type="password"
                  className="admin-form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%" }}
              disabled={loading}
            >
              {loading ? "Signing in…" : "Login"}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
