"use client";

import { useRef, useState, useCallback } from "react";
import { useScrollReveal } from "@/lib/useScrollReveal";
import { useScrollSpy } from "@/lib/useScrollSpy";

import Navbar from "@/components/Navbar";
import StickyBar from "@/components/StickyBar";
import Hero from "@/components/Hero";
import FounderProof from "@/components/FounderProof";
import Problem from "@/components/Problem";
import Solutions from "@/components/Solutions";
import HowItWorks from "@/components/HowItWorks";
import FAQ from "@/components/FAQ";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";
import ContactModal from "@/components/ContactModal";

const SECTION_IDS = [
  "hero",
  "proof",
  "problem",
  "solutions",
  "process",
  "faq",
  "final-cta",
];

export default function Home() {
  const mainRef = useRef<HTMLDivElement>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSource, setModalSource] = useState("Hero Section");

  useScrollReveal(mainRef);
  useScrollSpy(SECTION_IDS);

  const openModal = useCallback((source: string) => {
    setModalSource(source);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  return (
    <div ref={mainRef}>
      <Navbar />
      <StickyBar />

      <Hero onBookNow={() => openModal("Hero Section")} />
      <FounderProof />
      <Problem />
      <Solutions />
      <HowItWorks />
      <FAQ />
      <FinalCTA onBookNow={() => openModal("Footer Section")} />
      <Footer />

      <ContactModal
        isOpen={modalOpen}
        onClose={closeModal}
        source={modalSource}
      />
    </div>
  );
}
