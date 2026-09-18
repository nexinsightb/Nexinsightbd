export default function Solutions() {
  const solutions = [
    {
      number: "System 01",
      title: "Smart Review Router",
      promise:
        "One QR → two buttons. Satisfied → your Google Maps review page, pre-opened. Unsatisfied → a private form that lands in your inbox, never in public.",
      outcome: "Reviews go up, complaints come to you first.",
      youGet: [
        "Branded review page with your logo",
        "QR code designs for print",
        "Private feedback inbox",
      ],
      weHandle: [
        "Page design and hosting",
        "Google review link setup",
        "Feedback email routing",
      ],
    },
    {
      number: "System 02",
      title: "Campaign Capture",
      promise:
        "Built into the same page: Birthday Club and WhatsApp Club. Customer drops their number for a discount; you get a real, permission-based customer list.",
      outcome: "A reason to bring people back, forever.",
      youGet: [
        "Birthday & WhatsApp signup forms",
        "Customer contact database",
        "Campaign message templates",
      ],
      weHandle: [
        "Form design and integration",
        "Database setup (you own it)",
        "First campaign launch",
      ],
    },
    {
      number: "System 03",
      title: "WhatsApp & Messenger Automation",
      promise:
        "Built on n8n + official APIs. Instant replies, FAQ handling, order taking, follow-ups, review requests after purchase.",
      outcome: "Never lose a customer to silence.",
      youGet: [
        "24/7 auto-replies on WhatsApp",
        "Order taking and FAQ bot",
        "Follow-up and review requests",
      ],
      weHandle: [
        "WhatsApp Cloud API setup",
        "n8n automation flows",
        "Ongoing bot updates",
      ],
    },
    {
      number: "System 04",
      title: "Digital QR Card + Portfolio",
      promise:
        "One scan saves your contact or opens a portfolio built to your exact ask for people and for businesses.",
      outcome: "A card that can\u0027t be thrown away and updates itself.",
      youGet: [
        "Digital contact card with vCard",
        "Custom portfolio page",
        "QR code for print",
      ],
      weHandle: [
        "Card and portfolio design",
        "Hosting and updates",
        "Analytics (scan tracking)",
      ],
    },
  ];

  return (
    <section className="solution-section section-padding" id="solutions">
      <div className="container">
        <span className="section-eyebrow reveal">What We Install</span>
        <h2 className="section-title reveal reveal-delay-1">
          Four systems. One counter. Zero extra staff.
        </h2>
        <p className="section-subtitle reveal reveal-delay-2">
          Each system works on its own, but together they turn your counter into
          a customer-experience machine.
        </p>

        <div className="solution-grid">
          {solutions.map((sol, idx) => (
            <div
              key={sol.number}
              className={`solution-card reveal reveal-delay-${idx + 1}`}
            >
              <p className="solution-card-number">{sol.number}</p>
              <h3>{sol.title}</h3>
              <p className="solution-card-promise">{sol.promise}</p>
              <p className="solution-card-outcome">{sol.outcome}</p>
              <div className="solution-strip">
                <div className="solution-strip-col">
                  <h4>What you get</h4>
                  <ul>
                    {sol.youGet.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="solution-strip-col">
                  <h4>What we handle</h4>
                  <ul>
                    {sol.weHandle.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
