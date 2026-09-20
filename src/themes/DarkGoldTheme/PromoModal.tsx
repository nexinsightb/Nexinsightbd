"use client";

import { useState, useCallback, useEffect } from "react";

interface PromoModalProps {
  restaurantName: string;
  googleSheetUrl: string;
  promoTitle: string;
  promoDescription: string;
  promoSuccessMessage: string;
  onClose: () => void;
}

type View = "form" | "success";

export default function PromoModal({
  restaurantName,
  googleSheetUrl,
  promoTitle,
  promoDescription,
  promoSuccessMessage,
  onClose,
}: PromoModalProps) {
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
    if (!birthDate)   { setError("Please select your birth date."); return; }
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
      const url =
        googleSheetUrl + "?data=" + encodeURIComponent(JSON.stringify(payload));
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
      className="rp-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="promoTitle"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="rp-modal">
        <div className="rp-modal-handle" aria-hidden="true" />

        {view === "form" ? (
          <>
            <h2 className="rp-modal-title" id="promoTitle">
              {promoTitle}
            </h2>
            <p className="rp-modal-sub">{promoDescription}</p>

            {error && (
              <p className="rp-form-error" role="alert">
                {error}
              </p>
            )}

            <div className="rp-field-group">
              <div>
                <label className="rp-field-label" htmlFor="promoName">
                  Your name
                </label>
                <input
                  className="rp-field-input"
                  type="text"
                  id="promoName"
                  placeholder="First name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="rp-field-label" htmlFor="promoBirthDate">
                  Birth Date
                </label>
                <input
                  className="rp-field-input"
                  type="date"
                  id="promoBirthDate"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                />
              </div>
              <div>
                <label className="rp-field-label" htmlFor="promoMobile">
                  Mobile Number
                </label>
                <input
                  className="rp-field-input"
                  type="tel"
                  id="promoMobile"
                  placeholder="+880 1XXX XXXXXX"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                />
              </div>
            </div>

            <button
              className="rp-btn-submit"
              onClick={handleSubmit}
              disabled={submitting}
              type="button"
            >
              {submitting ? "Joining…" : "Join & Get My Perks"}
            </button>
            <button
              className="rp-btn-cancel"
              onClick={onClose}
              type="button"
            >
              Maybe later
            </button>
          </>
        ) : (
          <div className="rp-success">
            <div className="rp-success-icon">🎉</div>
            <div className="rp-success-title">You&apos;re in!</div>
            <p className="rp-success-msg">{promoSuccessMessage}</p>
            <button
              className="rp-btn-submit"
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
