"use client";

interface FinalCTAProps {
  onBookNow: () => void;
}

export default function FinalCTA({ onBookNow }: FinalCTAProps) {
  return (
    <section className="final-cta section-padding" id="final-cta">
      <div className="container">
        <h2 className="section-title reveal">
          Your next 50 reviews are already walking through your door.
        </h2>
        <p className="final-cta-subtitle reveal reveal-delay-1">
          Free 15-minute setup demo. We&apos;ll show you your own review page,
          live, before you pay anything.
        </p>

        <div className="final-cta-buttons reveal reveal-delay-2">
          <button
            type="button"
            className="btn btn-primary-white"
            id="finalPrimaryCta"
            aria-haspopup="dialog"
            aria-controls="contact-modal"
            onClick={onBookNow}
          >
            Book Now &rarr;
          </button>
          <a
            href="https://wa.me/8801728463005?text=Hi%20NexInsight%2C%20I%20have%20a%20question."
            className="text-link text-link-white"
            target="_blank"
            rel="noopener"
          >
            Message us on WhatsApp our automation answers instantly
          </a>
        </div>

        <div className="risk-reducers reveal reveal-delay-3">
          <span className="risk-reducer">No lock-in</span>
          <span className="risk-reducer">Setup in 5–7 days</span>
          <span className="risk-reducer">You keep everything we build</span>
        </div>
      </div>
    </section>
  );
}
