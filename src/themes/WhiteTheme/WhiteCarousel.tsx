"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { CarouselImage } from "@/types/restaurant";

interface WhiteCarouselProps {
  images: CarouselImage[];
}

export default function WhiteCarousel({ images }: WhiteCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  // Drag state refs (no re-render needed)
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startTranslate = useRef(0);
  const currentTranslate = useRef(0);
  const stepWidth = useRef(0);
  const currentIndex = useRef(0); // index within tripled track
  const samplesRef = useRef<{ x: number; t: number }[]>([]);
  const autoTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const activePointerId = useRef<number | null>(null);
  const realCount = images.length;

  // --- Helpers ---
  const setTrackTranslate = useCallback((px: number) => {
    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(${px}px, 0, 0)`;
    }
  }, []);

  const measure = useCallback(() => {
    if (!trackRef.current) return;
    const slides = trackRef.current.children;
    if (slides.length < 2) return;
    const a = slides[0].getBoundingClientRect();
    const b = slides[1].getBoundingClientRect();
    stepWidth.current = b.left - a.left;
  }, []);

  const updateDots = useCallback((idx: number) => {
    const realIdx = ((idx % realCount) + realCount) % realCount;
    setActiveIndex(realIdx);
  }, [realCount]);

  const settleLoop = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    track.classList.remove("is-animating");
    if (currentIndex.current >= realCount * 2) {
      currentIndex.current -= realCount;
      setTrackTranslate(-currentIndex.current * stepWidth.current);
    } else if (currentIndex.current < realCount) {
      currentIndex.current += realCount;
      setTrackTranslate(-currentIndex.current * stepWidth.current);
    }
  }, [realCount, setTrackTranslate]);

  const goTo = useCallback((index: number, animate = true) => {
    const track = trackRef.current;
    if (!track) return;
    currentIndex.current = index;
    const target = -index * stepWidth.current;
    currentTranslate.current = target;

    if (animate) {
      track.classList.add("is-animating");
    } else {
      track.classList.remove("is-animating");
    }
    setTrackTranslate(target);

    if (!animate) {
      requestAnimationFrame(() => settleLoop());
    }

    updateDots(index);
  }, [setTrackTranslate, settleLoop, updateDots]);

  const stopAutoScroll = useCallback(() => {
    if (autoTimer.current) {
      clearInterval(autoTimer.current);
      autoTimer.current = null;
    }
  }, []);

  const startAutoScroll = useCallback(() => {
    stopAutoScroll();
    autoTimer.current = setInterval(() => {
      if (!isDragging.current) {
        goTo(currentIndex.current + 1);
      }
    }, 1500);
  }, [goTo, stopAutoScroll]);

  // --- Mount: measure, park, start auto-scroll ---
  useEffect(() => {
    if (realCount === 0) return;

    // Small delay to let DOM paint
    const t = setTimeout(() => {
      measure();
      goTo(realCount, false); // start at first real slide in tripled track
      startAutoScroll();
    }, 50);

    const handleResize = () => {
      measure();
      goTo(currentIndex.current, false);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", handleResize);
      stopAutoScroll();
    };
  }, [realCount, measure, goTo, startAutoScroll, stopAutoScroll]);

  // --- Transition end: settle infinite loop ---
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const handler = () => settleLoop();
    track.addEventListener("transitionend", handler);
    return () => track.removeEventListener("transitionend", handler);
  }, [settleLoop]);

  // --- Pointer events ---
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    stopAutoScroll();
    isDragging.current = true;
    activePointerId.current = e.pointerId;
    trackRef.current?.setPointerCapture(e.pointerId);
    trackRef.current?.classList.remove("is-animating");
    trackRef.current?.classList.add("is-dragging");
    startX.current = e.clientX;
    startTranslate.current = currentTranslate.current;
    samplesRef.current = [{ x: e.clientX, t: performance.now() }];
  }, [stopAutoScroll]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - startX.current;
    currentTranslate.current = startTranslate.current + dx;
    setTrackTranslate(currentTranslate.current);
    const now = performance.now();
    samplesRef.current.push({ x: e.clientX, t: now });
    samplesRef.current = samplesRef.current.filter(s => now - s.t < 100);
  }, [setTrackTranslate]);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    trackRef.current?.classList.remove("is-dragging");
    try { trackRef.current?.releasePointerCapture(e.pointerId); } catch (_) { /* noop */ }

    let velocity = 0;
    const samples = samplesRef.current;
    if (samples.length >= 2) {
      const first = samples[0];
      const last = samples[samples.length - 1];
      const dt = last.t - first.t || 1;
      velocity = (last.x - first.x) / dt;
    }

    const draggedBy = currentTranslate.current - startTranslate.current;
    const FLICK_VELOCITY = 0.35;
    let delta = 0;
    if (Math.abs(velocity) > FLICK_VELOCITY) {
      delta = velocity < 0 ? 1 : -1;
    } else if (stepWidth.current > 0) {
      delta = Math.round(-draggedBy / stepWidth.current);
    }

    goTo(currentIndex.current + delta);
    startAutoScroll();
  }, [goTo, startAutoScroll]);

  if (realCount === 0) return null;

  // Triple the slides for infinite loop
  const tripledImages = [...images, ...images, ...images];

  return (
    <div className="wt-dish-wrap">
      <div
        className="wt-carousel"
        onMouseEnter={stopAutoScroll}
        onMouseLeave={startAutoScroll}
      >
        <div className="wt-carousel-viewport" ref={viewportRef}>
          <div
            className="wt-carousel-track"
            ref={trackRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onDragStart={(e) => e.preventDefault()}
          >
            {tripledImages.map((img, i) => (
              <div
                key={i}
                className="wt-carousel-slide"
                style={{
                  /* @ts-expect-error CSS custom properties */
                  "--zoom": img.zoom ?? 1,
                  "--shift-x": img.shiftX ?? "0px",
                  "--shift-y": img.shiftY ?? "0px",
                }}
                aria-hidden={i < realCount || i >= realCount * 2 ? true : undefined}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.src} alt={img.alt} draggable={false} />
              </div>
            ))}
          </div>
        </div>

        {/* Arrow: Previous */}
        <button
          className="wt-carousel-arrow wt-carousel-arrow--prev"
          aria-label="Previous slide"
          onClick={() => { goTo(currentIndex.current - 1); startAutoScroll(); }}
          type="button"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path d="M15 4l-8 8 8 8" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Arrow: Next */}
        <button
          className="wt-carousel-arrow wt-carousel-arrow--next"
          aria-label="Next slide"
          onClick={() => { goTo(currentIndex.current + 1); startAutoScroll(); }}
          type="button"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path d="M9 4l8 8-8 8" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Dots */}
        <div className="wt-carousel-dots" role="tablist" aria-label="Slide navigation">
          {images.map((_, i) => (
            <button
              key={i}
              className={`wt-carousel-dot${i === activeIndex ? " is-active" : ""}`}
              role="tab"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => { goTo(realCount + i); startAutoScroll(); }}
              type="button"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
