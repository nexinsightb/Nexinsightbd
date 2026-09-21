"use client";

import { useState, useCallback } from "react";
import type { Restaurant } from "@/types/restaurant";
import RestaurantCarousel from "./RestaurantCarousel";
import FeedbackModal from "./FeedbackModal";
import PromoModal from "./PromoModal";
import "./theme.css";

// Instagram SVG (Official Brand Gradient)
const InstagramIcon = () => (
  <svg width="28" height="28" viewBox="0 0 36 36" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="rp-ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#FEE440" />
        <stop offset="25%" stopColor="#FA7E1E" />
        <stop offset="50%" stopColor="#D62976" />
        <stop offset="75%" stopColor="#962FBF" />
        <stop offset="100%" stopColor="#4F5BD5" />
      </linearGradient>
    </defs>
    <rect width="36" height="36" rx="10" fill="url(#rp-ig-grad)" />
    <path
      d="M18 10.7C20.4 10.7 20.7 10.7 21.6 10.7C24.1 10.8 25.2 11.9 25.3 14.4C25.3 15.3 25.3 15.6 25.3 18C25.3 20.4 25.3 20.7 25.3 21.6C25.2 24.1 24.1 25.2 21.6 25.3C20.7 25.3 20.4 25.3 18 25.3C15.6 25.3 15.3 25.3 14.4 25.3C11.9 25.2 10.8 24.1 10.7 21.6C10.7 20.7 10.7 20.4 10.7 18C10.7 15.6 10.7 15.3 10.7 14.4C10.8 11.9 11.9 10.8 14.4 10.7C15.3 10.7 15.6 10.7 18 10.7ZM18 9C15.5 9 15.2 9 14.2 9.1C11 9.2 9.2 11 9.1 14.2C9 15.2 9 15.5 9 18C9 20.5 9 20.8 9.1 21.8C9.2 25 11 26.8 14.2 26.9C15.2 27 15.5 27 18 27C20.5 27 20.8 27 21.8 26.9C25 26.8 26.8 25 26.9 21.8C27 20.8 27 20.5 27 18C27 15.5 27 15.2 26.9 14.2C26.8 11 25 9.2 21.8 9.1C20.8 9 20.5 9 18 9Z"
      fill="#FFFFFF"
    />
    <path
      d="M18 13.4C15.4 13.4 13.4 15.4 13.4 18C13.4 20.6 15.4 22.6 18 22.6C20.6 22.6 22.6 20.6 22.6 18C22.6 15.4 20.6 13.4 18 13.4ZM18 21C16.3 21 15 19.7 15 18C15 16.3 16.3 15 18 15C19.7 15 21 16.3 21 18C21 19.7 19.7 21 18 21Z"
      fill="#FFFFFF"
    />
    <circle cx="22.7" cy="13.3" r="1.1" fill="#FFFFFF" />
  </svg>
);

// Facebook SVG (Official Blue Circle)
const FacebookIcon = () => (
  <svg width="28" height="28" viewBox="0 0 36 36" fill="none" aria-hidden="true">
    <circle cx="18" cy="18" r="18" fill="#1877F2" />
    <path
      d="M24.75 18H20.75V33H15.5V18H13V13.5H15.5V10.875C15.5 7.6875 17.25 5.5 21.375 5.5H25.125V10H22.875C21.1875 10 20.75 10.625 20.75 12V13.5H25.125L24.75 18Z"
      fill="#FFFFFF"
    />
  </svg>
);

// WhatsApp SVG (Official Green Circle)
const WhatsAppIcon = () => (
  <svg width="28" height="28" viewBox="0 0 36 36" fill="none" aria-hidden="true">
    <circle cx="18" cy="18" r="18" fill="#25D366" />
    <path
      d="M26.2 9.8A11.5 11.5 0 0 0 7.8 23.4L6.5 28.5L11.7 27.2A11.5 11.5 0 0 0 26.2 9.8ZM18 27.5A9.5 9.5 0 0 1 13.1 26.2L12.8 26L9.7 26.8L10.5 23.8L10.3 23.5A9.5 9.5 0 1 1 18 27.5ZM23.2 20.9C22.9 20.8 21.4 19.9 21.1 19.8C20.8 19.7 20.6 19.7 20.4 20C20.2 20.3 19.6 21 19.4 21.2C19.2 21.4 19 21.4 18.7 21.3C18.4 21.1 17.4 20.8 16.2 19.7C15.3 18.9 14.7 17.9 14.5 17.6C14.3 17.3 14.5 17.1 14.6 17C14.7 16.9 14.9 16.7 15.1 16.5C15.3 16.3 15.4 16.1 15.5 15.9C15.6 15.7 15.6 15.5 15.5 15.3C15.4 15.1 14.7 13.5 14.4 12.9C14.1 12.3 13.8 12.4 13.6 12.4H13C12.8 12.4 12.4 12.5 12.1 12.8C11.8 13.1 11 13.9 11 15.4C11 16.9 12.1 18.4 12.3 18.6C12.5 18.8 14.5 21.9 17.5 23.2C18.2 23.5 18.8 23.7 19.2 23.8C20 24.1 20.7 24 21.2 23.9C21.8 23.8 23 23.2 23.2 22.5C23.4 21.8 23.4 21.2 23.3 21.1C23.3 21 23.5 20.9 23.2 20.9Z"
      fill="#FFFFFF"
    />
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

        {/* ── FOLLOW US PILL SECTION ────────────────────────── */}
        {(restaurant.socialLinks?.instagram ||
          restaurant.socialLinks?.facebook ||
          restaurant.socialLinks?.whatsapp) && (
          <div className="rp-social-pill-wrap">
            <div className="rp-social-pill">
              <span className="rp-social-pill-label">Follow Us</span>
              <div className="rp-social-pill-icons" aria-label="Social media">
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
              </div>
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
