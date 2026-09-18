export default function Problem() {
  return (
    <section className="problem-section section-padding" id="problem">
      <div className="container">
        <span className="section-eyebrow reveal">The Problem</span>
        <h2 className="section-title reveal reveal-delay-1">
          This is what&apos;s happening right now.
        </h2>

        <div className="problem-scenes">
          <div className="problem-scene reveal reveal-delay-1">
            Your best customers leave happy and say nothing. Your one angry
            customer writes a paragraph <strong>publicly.</strong>
          </div>
          <div className="problem-scene reveal reveal-delay-2">
            Your Messenger and WhatsApp fill up after closing. By morning, half
            of them have <strong>ordered somewhere else.</strong>
          </div>
          <div className="problem-scene reveal reveal-delay-3">
            You have no phone numbers, no birthdays, no way to bring anyone
            back.{" "}
            <strong>
              Every customer is a stranger again next month.
            </strong>
          </div>
          <div className="problem-scene reveal reveal-delay-4">
            You hand out a paper card. It&apos;s in a drawer, or a bin,{" "}
            <strong>by tomorrow.</strong>
          </div>
        </div>

        <h3
          className="section-title reveal"
          style={{ fontSize: 20, marginTop: 16, marginBottom: 24 }}
        >
          What it actually costs you
        </h3>

        <div className="cost-cards">
          <div className="cost-card reveal reveal-delay-1">
            <p className="cost-card-leak">
              Sitting at 3.9★ instead of 4.6★
            </p>
            <p className="cost-card-impact">
              Most people filter by rating you&apos;re invisible before they read
              a word.
            </p>
          </div>
          <div className="cost-card reveal reveal-delay-2">
            <p className="cost-card-leak">
              One public 1-star that could have been a private message
            </p>
            <p className="cost-card-impact">
              Days of damage from a problem you&apos;d have fixed in 5 minutes.
            </p>
          </div>
          <div className="cost-card reveal reveal-delay-3">
            <p className="cost-card-leak">20 unanswered messages a week</p>
            <p className="cost-card-impact">
              Missed orders every single week, from people who were ready to
              buy.
            </p>
          </div>
          <div className="cost-card reveal reveal-delay-4">
            <p className="cost-card-leak">Zero customer contact list</p>
            <p className="cost-card-impact">
              Paying to reach strangers again, instead of texting people who
              already like you.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
