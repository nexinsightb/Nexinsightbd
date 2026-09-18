"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export default function StickyBar() {
  const [isVisible, setIsVisible] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);
  const targetPhoneNumber = "+8801728463005";

  useEffect(() => {
    const handleScroll = () => {
      const heroSection = document.getElementById("hero");
      if (heroSection) {
        const heroBottom =
          heroSection.offsetTop + heroSection.offsetHeight - 100;
        setIsVisible(window.scrollY > heroBottom);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const hideToast = useCallback(() => {
    setToastVisible(false);
  }, []);

  const showToast = useCallback(
    (message: string) => {
      setToastMessage(message);
      setToastVisible(true);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(hideToast, 4000);
    },
    [hideToast]
  );

  const handleCallAction = async () => {
    // Copy number to clipboard
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(targetPhoneNumber);
      }
    } catch {
      // Silently fail
    }

    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) ||
      ("ontouchstart" in window && window.innerWidth <= 768);

    if (!isMobile) {
      showToast(
        `Dialing <strong>${targetPhoneNumber}</strong>... Number copied to clipboard!`
      );
    } else {
      showToast(
        `Opening phone dialer for <strong>${targetPhoneNumber}</strong>...`
      );
    }
  };

  return (
    <>
      {/* Sticky Bottom CTA Bar */}
      <div
        className={`sticky-cta ${isVisible ? "visible" : ""}`}
        id="stickyCta"
        role="complementary"
        aria-label="Quick actions"
      >
        <div className="sticky-cta-inner">
          <a
            href="https://wa.me/8801728463005?text=Hi%20NexInsight%2C%20I%27d%20like%20to%20learn%20about%20your%20review%20system."
            className="sticky-btn sticky-btn-whatsapp"
            target="_blank"
            rel="noopener"
          >
            <svg
              viewBox="0 0 32 32"
              width="34"
              height="34"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="cta-icon"
            >
              <path
                d="M16 2C8.27 2 2 8.27 2 16c0 2.47.64 4.87 1.87 7L2 30l7.21-1.85C11.26 29.33 13.6 30 16 30c7.73 0 14-6.27 14-14S23.73 2 16 2zm0 25.5c-2.18 0-4.32-.58-6.19-1.69l-.44-.26-4.6 1.18 1.23-4.48-.29-.46C4.55 19.92 3.96 17.99 3.96 16c0-6.64 5.4-12.04 12.04-12.04 6.64 0 12.04 5.4 12.04 12.04 0 6.64-5.4 12.04-12.04 12.04zm6.6-9.04c-.36-.18-2.13-1.05-2.46-1.17-.33-.12-.57-.18-.81.18-.24.36-.93 1.17-1.14 1.41-.21.24-.42.27-.78.09-2.11-1.05-3.52-1.92-4.93-4.34-.18-.31.18-.29.52-.97.12-.24.06-.45-.03-.63-.09-.18-.81-1.95-1.11-2.67-.29-.7-.59-.6-.81-.61h-.69c-.24 0-.63.09-.96.45-.33.36-1.26 1.23-1.26 3 0 1.77 1.29 3.48 1.47 3.72.18.24 2.54 3.88 6.16 5.44.86.37 1.54.59 2.06.76.86.27 1.65.23 2.27.14.69-.1 2.13-.87 2.43-1.71.3-.84.3-1.56.21-1.71-.09-.15-.36-.24-.72-.42z"
                fill="#FFFFFF"
              />
            </svg>
            <div className="cta-wa-text">
              <span className="cta-wa-sub">Message us on</span>
              <span className="cta-wa-title">WhatsApp</span>
            </div>
          </a>

          <a
            href="tel:+8801728463005"
            className="sticky-btn sticky-btn-demo"
            id="stickyCallBtn"
            aria-label="Call NexInsight now at +8801728463005"
            onClick={handleCallAction}
          >
            <svg
              viewBox="0 0 24 24"
              width="34"
              height="34"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="cta-icon"
              aria-hidden="true"
            >
              <path
                d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
                stroke="#1570EF"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="cta-demo-title">Call Now</span>
          </a>
        </div>
      </div>

      {/* Toast Notification */}
      <div
        id="callToast"
        className={`call-toast ${toastVisible ? "show" : ""}`}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        hidden={!toastVisible}
      >
        <div className="call-toast-content">
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="toast-icon"
            aria-hidden="true"
          >
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          <span
            id="callToastText"
            dangerouslySetInnerHTML={{ __html: toastMessage }}
          />
        </div>
        <button
          type="button"
          className="call-toast-close"
          aria-label="Close notification"
          onClick={hideToast}
        >
          &times;
        </button>
      </div>
    </>
  );
}
