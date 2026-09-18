"use client";

import { useState } from "react";

const faqData = [
  {
    id: 1,
    question: "Is filtering reviews like this allowed?",
    answer:
      "We never block anyone from reviewing. Both paths are open we simply make the private path the easy first stop for someone who's unhappy. Google's review page is always one tap away. We're routing, not filtering.",
  },
  {
    id: 2,
    question: "What if a customer still leaves a bad public review?",
    answer:
      "That can happen and it should. A business with only 5-star reviews looks suspicious. The difference is that you'll have far more positive reviews to balance it out, and you'll catch most complaints privately before they go public.",
  },
  {
    id: 3,
    question: "Do I need a new phone number or a new app?",
    answer:
      "No new app. The WhatsApp automation connects to your existing WhatsApp Business number via the official Cloud API. Your staff doesn't need to install or learn anything new.",
  },
  {
    id: 4,
    question: "Will this work with my existing Google Business profile?",
    answer:
      "We don't need to connect to your Google Business profile. No migration, no new listing. Your current reviews stay exactly where they are.",
  },
  {
    id: 5,
    question: "Can the WhatsApp bot actually take orders, or just reply?",
    answer:
      "Both. It handles FAQs, appointment scheduling, and order taking with a structured flow. Complex requests get routed to a real person. You set the rules.",
  },
  {
    id: 6,
    question: "Who owns the customer numbers we collect?",
    answer:
      "You do. The database is yours we set it up, you own it. If you stop working with us, you keep every number and every piece of data.",
  },
  {
    id: 7,
    question: "What does it cost, and is there a monthly fee?",
    answer:
      "The QR Review System starts from ৳7,500 one-time setup. WhatsApp automation and digital cards are quoted based on your needs. Optional monthly maintenance starts at ৳500/month covers updates, and priority support. No lock-in, cancel anytime. And Your First 3 months are free!!",
  },
  {
    id: 8,
    question: "How long until I see more reviews?",
    answer:
      "Most businesses see new reviews within the first week after the QR codes go live. The volume depends on your foot traffic, but even a small café typically gets more than 10 new reviews in the first month.",
  },
  {
    id: 9,
    question: "What happens if I want to stop?",
    answer:
      "You keep everything we built the review page, the QR designs, the customer data. If you're on a monthly plan, just cancel. No exit fees, no data hostage.",
  },
  {
    id: 10,
    question: "Can you do this in Bangla, English, or both?",
    answer:
      "Both. The review page, feedback forms, and WhatsApp bot can all be set up in Bangla, English, or a mix whatever your customers actually speak.",
  },
];

export default function FAQ() {
  const [activeId, setActiveId] = useState<number | null>(null);

  const toggle = (id: number) => {
    setActiveId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="faq-section section-padding" id="faq">
      <div className="container">
        <span className="section-eyebrow reveal">FAQ</span>
        <h2 className="section-title reveal reveal-delay-1">
          Questions you should be asking.
        </h2>

        <div className="faq-grid">
          {faqData.map((item) => {
            const isActive = activeId === item.id;
            return (
              <div
                key={item.id}
                className={`faq-item reveal ${isActive ? "active" : ""}`}
              >
                <button
                  className="faq-question"
                  aria-expanded={isActive}
                  id={`faq-btn-${item.id}`}
                  onClick={() => toggle(item.id)}
                >
                  <span>{item.question}</span>
                  <span className="faq-icon">+</span>
                </button>
                <div
                  className="faq-answer"
                  id={`faq-answer-${item.id}`}
                  role="region"
                  aria-labelledby={`faq-btn-${item.id}`}
                  style={{
                    maxHeight: isActive ? "500px" : "0px",
                  }}
                >
                  <div className="faq-answer-inner">{item.answer}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
