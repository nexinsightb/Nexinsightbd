"use client";

import { useState, useCallback, useEffect } from "react";

const FEEDBACK_CATEGORIES = [
  "Food quality",
  "Service speed",
  "Cleanliness",
  "Staff attitude",
  "Portion size",
  "Noise / Ambience",
  "Value for money",
  "Other",
];

interface FeedbackModalProps {
  restaurantName: string;
  googleSheetUrl: string;
  onClose: () => void;
}

type View = "form" | "success";

export default function FeedbackModal({
  restaurantName,
  googleSheetUrl,
  onClose,
}: FeedbackModalProps) {
  const [view, setView] = useState<View>("form");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [comment, setComment] = useState("");
  const [contact, setContact] = useState("");
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

  const toggleChip = useCallback((label: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    const payload = {
      formType: "feedback",
      business: restaurantName,
      categories: [...selected],
      comment,
      contact,
      timestamp: new Date().toISOString(),
    };

    try {
      const url =
        googleSheetUrl + "?data=" + encodeURIComponent(JSON.stringify(payload));
      await fetch(url, { method: "GET", mode: "no-cors" });
      setView("success");
    } catch (err) {
      console.error("Feedback submit error:", err);
      alert("Something went wrong sending your feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [restaurantName, googleSheetUrl, selected, comment, contact]);

  const handleReset = useCallback(() => {
    setSelected(new Set());
    setComment("");
    setContact("");
    setView("form");
    onClose();
  }, [onClose]);

  return (
    <div
      className="rp-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedbackTitle"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="rp-modal">
        <div className="rp-modal-handle" aria-hidden="true" />

        {view === "form" ? (
          <>
            <h2 className="rp-modal-title" id="feedbackTitle">
              We&apos;re sorry to hear that.
            </h2>
            <p className="rp-modal-sub">
              Tell us what went wrong — your feedback goes directly to our team,
              not online.
            </p>

            <div className="rp-field-group">
              <div>
                <label className="rp-field-label">
                  What area needs attention?
                </label>
                <div className="rp-chips">
                  {FEEDBACK_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      className={`rp-chip${selected.has(cat) ? " selected" : ""}`}
                      onClick={() => toggleChip(cat)}
                      type="button"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="rp-field-label" htmlFor="feedbackComment">
                  Tell us more (optional)
                </label>
                <textarea
                  className="rp-field-textarea"
                  id="feedbackComment"
                  placeholder="What could we have done better?"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>

              <div>
                <label className="rp-field-label" htmlFor="feedbackContact">
                  Your name or contact (optional)
                </label>
                <input
                  className="rp-field-input"
                  type="text"
                  id="feedbackContact"
                  placeholder="So we can follow up if needed"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                />
              </div>
            </div>

            <button
              className="rp-btn-submit"
              onClick={handleSubmit}
              disabled={submitting}
              type="button"
            >
              {submitting ? "Sending…" : "Send Feedback"}
            </button>
            <button
              className="rp-btn-cancel"
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
          </>
        ) : (
          <div className="rp-success">
            <div className="rp-success-icon">🙏</div>
            <div className="rp-success-title">Thank you for telling us.</div>
            <p className="rp-success-msg">
              Our team will review your feedback and make it right. We
              appreciate you giving us the chance to improve.
            </p>
            <button
              className="rp-btn-submit"
              style={{ marginTop: 20 }}
              onClick={handleReset}
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
