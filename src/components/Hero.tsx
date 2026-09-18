"use client";

interface HeroProps {
  onBookNow: () => void;
}

export default function Hero({ onBookNow }: HeroProps) {
  const handleSmoothScroll = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="hero" id="hero">
      <div className="hero-content">
        <div className="hero-eyebrow">
          <span className="hero-eyebrow-label">
            Smart Solution. Real Results.
          </span>
        </div>

        <h1 className="hero-title">
          Smarter
          <br />
          Systems.
          <br />
          <span className="hero-title-accent">Stronger</span>
          <br />
          Business.
        </h1>

        <p className="hero-subtitle">
          We build tech that gets you more reviews, happier customers, and less
          busywork.
        </p>

        <div className="hero-divider" />

        <div className="hero-cta-group">
          <button
            type="button"
            className="hero-btn-primary"
            id="heroPrimaryCta"
            aria-haspopup="dialog"
            aria-controls="contact-modal"
            onClick={onBookNow}
          >
            Book Now
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      </div>

      <div className="hero-scroll-cue" aria-hidden="true">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
        <span>Scroll to see how</span>
      </div>

      <svg
        className="hero-waves"
        viewBox="0 0 900 300"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M-20,260 C180,200 320,320 620,240 C780,200 850,260 940,180"
          stroke="#DCE5FB"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M-20,290 C200,230 350,340 640,260 C800,220 870,280 940,210"
          stroke="#DCE5FB"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M-20,220 C160,170 300,270 600,210 C760,175 830,225 940,155"
          stroke="#E7EDFC"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M-20,320 C220,260 380,360 660,290 C810,255 880,310 940,245"
          stroke="#E7EDFC"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M-20,180 C140,140 260,220 560,170 C740,140 810,185 940,120"
          stroke="#F0F3FD"
          strokeWidth="1.5"
          fill="none"
        />
      </svg>
    </section>
  );
}
