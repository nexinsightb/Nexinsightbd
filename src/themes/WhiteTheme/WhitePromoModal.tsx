"use client";

import { useState, useCallback, useEffect } from "react";

interface WhitePromoModalProps {
  restaurantName: string;
  googleSheetUrl: string;
  promoTitle: string;
  promoDescription: string;
  promoSuccessMessage: string;
  onClose: () => void;
}

type View = "form" | "success";

export default function WhitePromoModal({
  restaurantName,
  googleSheetUrl,
  promoTitle,
  promoDescription,
  promoSuccessMessage,
  onClose,
}: WhitePromoModalProps) {
  const [view, setView] = useState<View>("form");
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Close on ESC
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleSubmit = useCallback(async () => {
    setError("");
    if (!name.trim()) { setError("Please enter your name."); return; }
    if (!birthDate) { setError("Please select your birth date."); return; }
    if (!mobile.trim()) { setError("Please enter a valid mobile number."); return; }

    setSubmitting(true);
    const payload = {
      formType: "birthday",
      business: restaurantName,
      name: name.trim(),
      birthDate,
      mobileNumber: mobile.trim(),
      timestamp: new Date().toISOString(),
    };

    try {
      const url = googleSheetUrl + "?data=" + encodeURIComponent(JSON.stringify(payload));
      await fetch(url, { method: "GET", mode: "no-cors" });
      setView("success");
    } catch (err) {
      console.error("Promo submit error:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [restaurantName, googleSheetUrl, name, birthDate, mobile]);

  return (
    <div
      className="wt-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wtPromoTitle"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="wt-modal">
        <div className="wt-modal-handle" aria-hidden="true" />

        {view === "form" ? (
          <>
            <h2 className="wt-modal-title" id="wtPromoTitle">{promoTitle}</h2>
            <p className="wt-modal-sub">{promoDescription}</p>

            {error && (
              <p className="wt-form-error" role="alert">{error}</p>
            )}

            <div className="wt-field-group">
              <div>
                <label className="wt-field-label" htmlFor="wtPromoName">Your name</label>
                <input
                  className="wt-field-input"
                  type="text"
                  id="wtPromoName"
                  placeholder="First name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="given-name"
                />
              </div>
              <div>
                <label className="wt-field-label" htmlFor="wtPromoBirthDate">Birth Date</label>
                <input
                  className="wt-field-input"
                  type="date"
                  id="wtPromoBirthDate"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                />
              </div>
              <div>
                <label className="wt-field-label" htmlFor="wtPromoMobile">Mobile Number</label>
                <input
                  className="wt-field-input"
                  type="tel"
                  id="wtPromoMobile"
                  placeholder="+880 1XXX XXXXXX"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  autoComplete="tel"
                />
              </div>
            </div>

            <button
              className="wt-btn-submit"
              onClick={handleSubmit}
              disabled={submitting}
              type="button"
            >
              {submitting ? "Joining…" : "Join & Get My Perks"}
            </button>
            <button
              className="wt-btn-cancel"
              onClick={onClose}
              type="button"
            >
              Maybe later
            </button>
          </>
        ) : (
          <div className="wt-success">
            <div className="wt-success-icon">🎉</div>
            <div className="wt-success-title">You&apos;re in!</div>
            <p className="wt-success-msg">{promoSuccessMessage}</p>
            <button
              className="wt-btn-submit"
              style={{ marginTop: 20 }}
              onClick={onClose}
              type="button"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
