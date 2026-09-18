export default function HowItWorks() {
  const steps = [
    {
      day: "Day 1",
      title: "15-minute call",
      desc: "We look at your Google profile, your message volume, and your counter setup. You get a straight answer on what will actually move.",
    },
    {
      day: "Day 2–4",
      title: "We build it",
      desc: "Your branded review page, your QR design, your automation flows, your card or portfolio. You approve everything before it goes live.",
    },
    {
      day: "Day 5",
      title: "We install",
      desc: "QR standees and table tents printed and placed. WhatsApp and Messenger connected. One short walkthrough for your staff there\u0027s nothing for them to operate.",
    },
    {
      day: "From week 2",
      title: "You watch it run",
      desc: "Reviews arrive, complaints come to your inbox, messages get answered, numbers get collected. Monthly report if you want one.",
    },
  ];

  return (
    <section className="how-it-works section-padding" id="process">
      <div className="container">
        <span className="section-eyebrow reveal">How It Works</span>
        <h2 className="section-title reveal reveal-delay-1">
          From call to running in one week.
        </h2>

        <div className="timeline">
          {steps.map((step, idx) => (
            <div
              key={step.day}
              className={`timeline-step reveal reveal-delay-${idx + 1}`}
            >
              <div className="timeline-marker">{idx + 1}</div>
              <div className="timeline-content">
                <p className="timeline-day">{step.day}</p>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="what-we-need reveal">
          <h4>What we need from you</h4>
          <ul>
            <li>Your logo and brand colors</li>
            <li>Menu or FAQ content (for the bot)</li>
            <li>WhatsApp Business number</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
