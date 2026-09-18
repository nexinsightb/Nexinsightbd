"use client";

import { useEffect, useRef } from "react";

/**
 * Observes `.reveal` elements inside a container ref and adds `.visible`
 * class when they enter the viewport. Respects `prefers-reduced-motion`.
 */
export function useScrollReveal(containerRef: React.RefObject<HTMLElement | null>) {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const elements = container.querySelectorAll(".reveal");

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      elements.forEach((el) => el.classList.add("visible"));
      return;
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    elements.forEach((el) => observerRef.current?.observe(el));

    return () => {
      observerRef.current?.disconnect();
    };
  }, [containerRef]);
}
