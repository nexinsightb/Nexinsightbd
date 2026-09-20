"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminNavbar() {
  const navRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const toggleNav = useCallback((forceState?: boolean) => {
    const nav = navRef.current;
    if (!nav) return;
    const navHeader = nav.querySelector<HTMLElement>(".nav-header");
    const navBody = nav.querySelector<HTMLElement>(".nav-body");
    if (!navHeader || !navBody) return;

    const isOpen =
      typeof forceState === "boolean"
        ? forceState
        : !nav.classList.contains("open");

    if (isOpen) {
      nav.classList.add("open");
      toggleRef.current?.setAttribute("aria-expanded", "true");
      const totalHeight = navHeader.offsetHeight + navBody.scrollHeight;
      nav.style.height = `${totalHeight}px`;
    } else {
      nav.classList.remove("open");
      toggleRef.current?.setAttribute("aria-expanded", "false");
      nav.style.height = "";
    }
  }, []);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (!nav.contains(e.target as Node) && nav.classList.contains("open")) {
        toggleNav(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && nav.classList.contains("open")) {
        toggleNav(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [toggleNav]);

  const handleLinkClick = () => {
    toggleNav(false);
  };

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    toggleNav(false);
    setLoggingOut(true);

    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/admin/login");
      router.refresh();
    } catch (err) {
      console.error("Logout error:", err);
      router.push("/admin/login");
    } finally {
      setLoggingOut(false);
    }
  };

  const adminNavLinks = [
    { href: "/admin", label: "Dashboard", active: false, isLogout: false },
    { href: "/admin/restaurants", label: "Restaurants", active: false, isLogout: false },
    { href: "#", label: "Subscriptions", active: false, isLogout: false },
    { href: "#", label: "Settings", active: false, isLogout: false },
    { href: "#", label: loggingOut ? "Logging out…" : "Logout", active: false, isLogout: true },
  ];

  return (
    <nav
      className="floating-nav"
      id="adminFloatingNav"
      ref={navRef}
      role="navigation"
      aria-label="Admin navigation"
    >
      {/* Header Row (always visible) */}
      <div className="nav-header">
        <Link href="/admin" className="nav-logo" aria-label="NexInsight Admin home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/images/logo-main-full.png"
            alt="NexInsight"
            className="nav-logo-img"
            width={160}
            height={34}
          />
        </Link>

        <button
          className="nav-toggle"
          id="adminNavToggle"
          ref={toggleRef}
          aria-label="Toggle navigation"
          aria-expanded="false"
          onClick={(e) => {
            e.stopPropagation();
            toggleNav();
          }}
        >
          <span className="label-menu">MENU</span>
          <span className="label-close">CLOSE</span>
        </button>
      </div>

      {/* Expandable Menu Body */}
      <div className="nav-body" id="adminNavBody">
        <div className="nav-divider" />
        <ul className="nav-links">
          {adminNavLinks.map((link) => (
            <li key={link.label}>
              {link.isLogout ? (
                <a
                  href="#"
                  className="nav-link"
                  onClick={handleLogout}
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  href={link.href}
                  className={`nav-link ${link.active ? "active" : ""}`}
                  onClick={handleLinkClick}
                >
                  {link.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
