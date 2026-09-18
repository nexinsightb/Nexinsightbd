
export default function FounderProof() {
  return (
    <section className="founder-proof section-padding" id="proof">
      <div className="container">
        <span className="section-eyebrow reveal">Why We Build This</span>

        <div className="founder-block">
          <div className="founder-left reveal reveal-delay-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/images/about-team.jpg"
              alt="NexInsight founding team"
              className="founder-photo"
              width={120}
              height={120}
              loading="lazy"
            />
            <div className="founder-meta">
              <p className="founder-name">
                Tasnim Ullah &amp; Faruk Abdullah Riyad
              </p>
              <p className="founder-role">Founders, NexInsight</p>
            </div>
          </div>

          <div className="founder-right reveal reveal-delay-2">
            <p className="founder-quote">
              We watched local businesses restaurants, salons, clinics lose
              customers to silence. Great service, zero reviews. One angry
              customer, a public 1-star. WhatsApp messages piling up after
              hours. We built NexInsight because every shop owner we talked to
              had the same problem and no simple fix. Every product below is
              live and working. Scan a demo, try it yourself.
            </p>

            <div className="demo-links">
              <a href="#solutions" className="demo-link-card">
                <div className="demo-link-icon">
                  <svg
                    viewBox="0 0 24 24"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                </div>
                <div>
                  <p className="demo-link-text">Smart Review Router</p>
                  <p className="demo-link-desc">
                    Try the Satisfied / Unsatisfied flow
                  </p>
                </div>
              </a>

              <a href="#solutions" className="demo-link-card">
                <div className="demo-link-icon">
                  <svg
                    viewBox="0 0 24 24"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                  </svg>
                </div>
                <div>
                  <p className="demo-link-text">WhatsApp Automation</p>
                  <p className="demo-link-desc">
                    Message our bot it replies instantly
                  </p>
                </div>
              </a>

              <a href="#solutions" className="demo-link-card">
                <div className="demo-link-icon">
                  <svg
                    viewBox="0 0 24 24"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <line x1="2" y1="10" x2="22" y2="10" />
                  </svg>
                </div>
                <div>
                  <p className="demo-link-text">Digital QR Card</p>
                  <p className="demo-link-desc">
                    Scan to save contact instantly
                  </p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
