"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  source: string;
}

export default function ContactModal({
  isOpen,
  onClose,
  source,
}: ContactModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [service, setService] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [feedback, setFeedback] = useState<{
    message: string;
    isError: boolean;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const nameInputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const serviceOptions = [
    "QR Code Review Systems",
    "Web Development",
    "AI Automation",
    "Data Analysis",
  ];

  // Focus trap and keyboard handling
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab") {
        const modal = document.getElementById("contact-modal");
        if (!modal) return;
        const focusable = modal.querySelectorAll<HTMLElement>(
          'button, input, [href], [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleKeyDown);
      setTimeout(() => nameInputRef.current?.focus(), 320);
    } else {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 11) val = val.slice(0, 11);
    setPhone(val);
  };

  const resetForm = () => {
    setName("");
    setPhone("");
    setAddress("");
    setEmail("");
    setService("");
    setDropdownOpen(false);
    setFeedback(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nameVal = name.trim();
    const rawPhone = phone.trim();
    const addressVal = address.trim();
    const emailVal = email.trim();

    // Clean phone: strip leading zeros
    const digitsOnly = rawPhone.replace(/\D/g, "");
    const cleanedLocalPhone = digitsOnly.replace(/^0+/, "");

    // Validation
    if (!nameVal || !rawPhone || !addressVal || !emailVal) {
      setFeedback({ message: "Please fill in all required fields.", isError: true });
      return;
    }

    const bdPhoneRegex = /^1[3-9]\d{8}$/;
    if (!bdPhoneRegex.test(cleanedLocalPhone)) {
      setFeedback({
        message: "Please enter a valid Bangladeshi mobile number (e.g. 1712345678).",
        isError: true,
      });
      return;
    }

    if (!service) {
      setFeedback({ message: "Please select a service from the dropdown.", isError: true });
      return;
    }

    const fullPhone = `+880${cleanedLocalPhone}`;

    setSubmitting(true);
    setFeedback({ message: "Sending your request...", isError: false });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nameVal,
          phone: fullPhone,
          address: addressVal,
          email: emailVal,
          service,
          source,
        }),
      });

      if (!response.ok) {
        throw new Error("Server error");
      }

      setFeedback({
        message: `Thanks, ${nameVal}! We've received your request and will contact you shortly.`,
        isError: false,
      });

      setTimeout(() => {
        resetForm();
        onClose();
      }, 1800);
    } catch {
      setFeedback({
        message:
          "Could not connect to server. Please check your connection or contact us via WhatsApp.",
        isError: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={`overlay ${isOpen ? "open" : ""}`}
      id="contact-overlay"
      ref={overlayRef}
      aria-hidden={!isOpen}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div
        className="modal"
        id="contact-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-heading"
      >
        <div className="modal-handle" />
        <button
          type="button"
          className="modal-close"
          id="modal-close"
          aria-label="Close contact form"
          onClick={onClose}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <p className="tagline">GET IN TOUCH</p>
        <h2 className="heading" id="modal-heading">
          Let&apos;s make real impact
        </h2>

        <form id="contact-form" noValidate onSubmit={handleSubmit}>
          <div className="row">
            <div className="field">
              <label htmlFor="name">
                Name<span className="req">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Your Name/Business Name"
                autoComplete="name"
                required
                ref={nameInputRef}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="phone">
                Phone Number<span className="req">*</span>
              </label>
              <div className="phone-input-group">
                <span className="phone-prefix" aria-hidden="true">
                  +880
                </span>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="1712345678"
                  autoComplete="tel-national"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={11}
                  required
                  value={phone}
                  onChange={handlePhoneInput}
                />
              </div>
            </div>
          </div>

          <div className="field">
            <label htmlFor="address">
              Address<span className="req">*</span>
            </label>
            <input
              type="text"
              id="address"
              name="address"
              placeholder="Your Business Address"
              autoComplete="street-address"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="row">
            <div className="field">
              <label htmlFor="email">
                Email<span className="req">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Your Email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div
              className={`field dropdown ${dropdownOpen ? "open" : ""}`}
              id="services-dropdown"
            >
              <label id="services-label">
                Services<span className="req">*</span>
              </label>
              <div
                className="dropdown-toggle"
                tabIndex={0}
                role="button"
                aria-haspopup="listbox"
                aria-expanded={dropdownOpen}
                aria-labelledby="services-label"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setDropdownOpen(!dropdownOpen);
                  } else if (e.key === "Escape") {
                    setDropdownOpen(false);
                    e.stopPropagation();
                  }
                }}
              >
                <span
                  className={service ? "selected-text" : "placeholder-text"}
                  data-display=""
                >
                  {service || "Select a service"}
                </span>
                <svg
                  className="chevron"
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
              <div className="dropdown-menu" role="listbox">
                {serviceOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    role="option"
                    data-value={opt}
                    onClick={() => {
                      setService(opt);
                      setDropdownOpen(false);
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              <input type="hidden" id="services" name="services" value={service} />
            </div>
          </div>

          {feedback && (
            <div
              id="form-feedback"
              className={`form-feedback ${
                feedback.isError ? "error" : "success"
              }`}
              aria-live="polite"
            >
              {feedback.message}
            </div>
          )}

          <div className="submit-row">
            <button
              type="submit"
              id="contact-submit-btn"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </div>

          <p className="alt-contact">
            You can also send us an email at{" "}
            <a href="mailto:nexinsightb@gmail.com">nexinsightb@gmail.com</a> if
            you prefer.
          </p>
        </form>
      </div>
    </div>
  );
}
