"use client";

import { useEffect } from "react";

/**
 * Highlights the active nav link based on which section is in view.
 */
export function useScrollSpy(sectionIds: string[]) {
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY + 120;
      const navLinks = document.querySelectorAll<HTMLAnchorElement>(
        ".nav-link[data-section]"
      );

      for (const id of sectionIds) {
        const section = document.getElementById(id);
        if (!section) continue;
        const top = section.offsetTop;
        const height = section.offsetHeight;

        if (scrollY >= top && scrollY < top + height) {
          navLinks.forEach((link) => {
            link.classList.remove("active");
            if (link.getAttribute("data-section") === id) {
              link.classList.add("active");
            }
          });
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sectionIds]);
}
