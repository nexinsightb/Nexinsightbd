"use client";

import { useEffect, useRef, useCallback } from "react";

export default function Navbar() {
  const navRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

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

    // Close when clicking outside
    const handleClickOutside = (e: MouseEvent) => {
      if (!nav.contains(e.target as Node) && nav.classList.contains("open")) {
        toggleNav(false);
      }
    };

    // Close on Escape
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

  const handleSmoothScroll = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    if (href === "#") return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  const navLinks = [
    { href: "#solutions", section: "solutions", label: "Services & Systems" },
    { href: "#proof", section: "proof", label: "Why NexInsight" },
    { href: "#problem", section: "problem", label: "The Problem" },
    { href: "#process", section: "process", label: "How It Works" },
    { href: "#faq", section: "faq", label: "FAQ" },
    { href: "#final-cta", section: "final-cta", label: "Live Demo" },
  ];

  return (
    <nav
      className="floating-nav"
      id="floatingNav"
      ref={navRef}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Header Row (always visible) */}
      <div className="nav-header">
        <a
          href="#hero"
          className="nav-logo"
          aria-label="NexInsight home"
          onClick={(e) => handleSmoothScroll(e, "#hero")}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/images/logo-main-full.png"
            alt="NexInsight"
            className="nav-logo-img"
            width={160}
            height={34}
          />
        </a>

        <button
          className="nav-toggle"
          id="navToggle"
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
      <div className="nav-body" id="navBody">
        <div className="nav-divider" />
        <ul className="nav-links">
          {navLinks.map((link) => (
            <li key={link.section}>
              <a
                href={link.href}
                className="nav-link"
                data-section={link.section}
                onClick={(e) => {
                  handleLinkClick();
                  handleSmoothScroll(e, link.href);
                }}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <a
          href="https://wa.me/8801601063303?text=Hi%20NexInsight%2C%20I%27d%20like%20to%20learn%20about%20your%20review%20system."
          className="nav-contact-btn"
          target="_blank"
          rel="noopener"
          onClick={handleLinkClick}
        >
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path
              d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
              fill="currentColor"
            />
          </svg>
          Message Us On WhatsApp
        </a>
      </div>
    </nav>
  );
}
