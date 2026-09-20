"use client";

import { useState, useCallback } from "react";
import type { Restaurant } from "@/types/restaurant";
import RestaurantCarousel from "./RestaurantCarousel";
import FeedbackModal from "./FeedbackModal";
import PromoModal from "./PromoModal";
import "./theme.css";

// Instagram SVG
const InstagramIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

// Facebook SVG
const FacebookIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

// WhatsApp SVG
const WhatsAppIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.96 9.96 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.96 7.96 0 01-4.068-1.112l-.292-.174-3.024.899.899-3.024-.174-.292A7.96 7.96 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8zm4.406-5.845c-.242-.121-1.433-.707-1.655-.787-.222-.08-.384-.121-.545.121-.16.242-.624.787-.765.948-.14.162-.281.182-.523.06-.242-.12-1.022-.376-1.946-1.2-.72-.641-1.206-1.433-1.347-1.675-.14-.242-.015-.373.106-.493.109-.108.242-.282.363-.423.12-.14.16-.242.242-.403.08-.161.04-.302-.02-.423-.06-.12-.545-1.314-.746-1.8-.197-.473-.397-.408-.545-.416-.14-.006-.302-.008-.463-.008-.162 0-.423.06-.645.303-.222.242-.846.828-.846 2.021s.866 2.344.986 2.505c.12.16 1.703 2.6 4.125 3.645.576.249 1.025.398 1.375.51.578.183 1.104.157 1.52.095.463-.069 1.433-.585 1.635-1.15.201-.565.201-1.049.14-1.15-.06-.101-.222-.161-.463-.282z" />
  </svg>
);

// Gift icon SVG
const GiftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="white" aria-hidden="true">
    <path d="M22 8h-4.3c.2-.5.3-1 .3-1.5C18 4.6 16.4 3 14.5 3c-1.3 0-2.5.8-3.1 1.9L12 5.5l-.4-.6C11 3.8 9.8 3 8.5 3 6.6 3 5 4.6 5 6.5c0 .5.1 1 .3 1.5H1v3h2v10h18V11h2V8zM14.5 5c1 0 1.8.8 1.8 1.8S15.5 8.5 14.5 8.5h-2L14 6c.1-.6.5-1 1-1zM8.5 5c.5 0 1 .4 1 1l1.5 2.5h-2C8.2 8.5 7.4 7.7 7.4 6.8S8.2 5 9.1 5h-.6zM11 20H5v-9h6v9zm0-11H3V9h8v1zm8 11h-6v-9h6v9zm2-11h-8V9h8v1z" />
  </svg>
);

type Modal = "feedback" | "promo" | null;

interface RestaurantFeedbackPageProps {
  restaurant: Restaurant;
}

export default function RestaurantFeedbackPage({
  restaurant,
}: RestaurantFeedbackPageProps) {
  const [activeModal, setActiveModal] = useState<Modal>(null);

  const openFeedback = useCallback(() => setActiveModal("feedback"), []);
  const openPromo = useCallback(() => setActiveModal("promo"), []);
  const closeModal = useCallback(() => setActiveModal(null), []);

  const handleSatisfied = useCallback(() => {
    const ua = navigator.userAgent || "";
    const reviewUrl = restaurant.googleReviewUrl;

    if (/android/i.test(ua)) {
      // Android deep-link: opens Google Maps review screen directly
      try {
        const url = new URL(reviewUrl);
        const placeId = url.searchParams.get("placeid") ?? "";
        const browserFallback = encodeURIComponent(reviewUrl);
        const intentUrl =
          "intent://search.google.com/local/writereview/mobile?placeid=" +
          placeId +
          "#Intent;scheme=https;" +
          "S.browser_fallback_url=" +
          browserFallback +
          ";end";
        const a = document.createElement("a");
        a.href = intentUrl;
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        setTimeout(() => document.body.removeChild(a), 200);
      } catch {
        window.location.href = reviewUrl;
      }
    } else {
      window.location.href = reviewUrl;
    }
  }, [restaurant.googleReviewUrl]);

  return (
    <div className="rp-root">
      {/* Google Fonts for this template */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@300;400;500&display=swap');`}</style>

      <div className="rp-page">

        {/* ── HEADER ─────────────────────────────────────────── */}
        <header className="rp-header">
          <div className="rp-logo-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="rp-header-logo"
              src={restaurant.logoUrl}
              alt={restaurant.name}
            />
          </div>
        </header>

        {/* ── FEEDBACK SECTION ───────────────────────────────── */}
        <section className="rp-feedback" aria-label="Feedback">
          <h1 className="rp-feedback-headline">
            {restaurant.mainTitle || "How was your experience today?"}
          </h1>
          <div className="rp-btn-row">
            <button
              className="rp-btn-satisfied"
              onClick={handleSatisfied}
              aria-label={restaurant.googleButtonText || "I am satisfied"}
              type="button"
            >
              <span className="rp-btn-icon" aria-hidden="true">☺</span>
              {restaurant.googleButtonText || "Satisfied"}
            </button>
            <button
              className="rp-btn-not-satisfied"
              onClick={openFeedback}
              aria-label={restaurant.feedbackButtonText || "I am not satisfied"}
              type="button"
            >
              <span className="rp-btn-icon" aria-hidden="true">☹</span>
              {restaurant.feedbackButtonText || "Not Satisfied"}
            </button>
          </div>
        </section>

        {/* ── CAROUSEL ───────────────────────────────────────── */}
        <RestaurantCarousel images={restaurant.carouselImages} />

        {/* ── PROMO BANNER ───────────────────────────────────── */}
        {restaurant.campaignEnabled !== false && (
          <div className="rp-promo">
            <div className="rp-promo-left">
              <p className="rp-promo-offer">
                {restaurant.promoTitle ? restaurant.promoTitle.split("!")[0] : "Join Our Birthday Club"}
                <strong>
                  {restaurant.promoTitle && restaurant.promoTitle.includes("!")
                    ? "!" + restaurant.promoTitle.split("!").slice(1).join("!")
                    : "!"}
                </strong>
              </p>
              <p className="rp-promo-sub">{restaurant.promoDescription}</p>
            </div>
            <div className="rp-promo-right">
              <div className="rp-icon-bubble">
                <GiftIcon />
              </div>
              <button
                className="rp-btn-join"
                onClick={openPromo}
                type="button"
              >
                {restaurant.promoCtaLabel || "Join Club"}
              </button>
            </div>
          </div>
        )}

        {/* ── DIVIDER ────────────────────────────────────────── */}
        <div className="rp-hr" aria-hidden="true" />

        {/* ── FOOTER ─────────────────────────────────────────── */}
        <footer className="rp-footer">
          <div className="rp-footer-inner">
            <div className="rp-footer-brand">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="rp-footer-logo"
                src={restaurant.footerLogoUrl}
                alt={`${restaurant.name} logo`}
              />
              <nav className="rp-footer-socials" aria-label="Social media">
                {restaurant.socialLinks.instagram && (
                  <a
                    className="rp-social-icon"
                    href={restaurant.socialLinks.instagram}
                    aria-label="Instagram"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <InstagramIcon />
                  </a>
                )}
                {restaurant.socialLinks.facebook && (
                  <a
                    className="rp-social-icon"
                    href={restaurant.socialLinks.facebook}
                    aria-label="Facebook"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FacebookIcon />
                  </a>
                )}
                {restaurant.socialLinks.whatsapp && (
                  <a
                    className="rp-social-icon"
                    href={restaurant.socialLinks.whatsapp}
                    aria-label="WhatsApp"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <WhatsAppIcon />
                  </a>
                )}
              </nav>
            </div>

            <div className="rp-footer-divider" aria-hidden="true" />

            <address className="rp-footer-info" style={{ fontStyle: "normal" }}>
              <div className="rp-info-row">
                <span className="rp-info-icon" aria-hidden="true">📍</span>
                <span>{restaurant.address}</span>
              </div>
              <div className="rp-info-row">
                <span className="rp-info-icon" aria-hidden="true">📞</span>
                <span>{restaurant.phone}</span>
              </div>
              <div className="rp-info-row">
                <span className="rp-info-icon" aria-hidden="true">🕐</span>
                <div>
                  {restaurant.businessHours.map((h, i) => (
                    <span key={i}>
                      {h.label}: {h.time}
                      {i < restaurant.businessHours.length - 1 && <br />}
                    </span>
                  ))}
                </div>
              </div>
            </address>
          </div>

          <div className="rp-tagline-wrap">
            <div className="rp-tagline-line" aria-hidden="true" />
            <span className="rp-tagline">{restaurant.tagline}</span>
            <div className="rp-tagline-line" aria-hidden="true" />
          </div>

          <p className="rp-heart">Contact NexInsight For Support</p>
        </footer>
      </div>

      {/* ── MODALS ─────────────────────────────────────────────── */}
      {activeModal === "feedback" && (
        <FeedbackModal
          restaurantName={restaurant.name}
          googleSheetUrl={restaurant.googleSheetUrl}
          onClose={closeModal}
        />
      )}
      {activeModal === "promo" && (
        <PromoModal
          restaurantName={restaurant.name}
          googleSheetUrl={restaurant.campaignBackendUrl || restaurant.googleSheetUrl}
          promoTitle={restaurant.promoTitle}
          promoDescription={restaurant.promoDescription}
          promoSuccessMessage={restaurant.promoSuccessMessage || "You've successfully joined!"}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
