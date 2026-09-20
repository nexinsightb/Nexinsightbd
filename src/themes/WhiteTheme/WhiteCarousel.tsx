"use client";

import { useEffect, useRef, useCallback } from "react";
import type { CarouselImage } from "@/types/restaurant";

interface WhiteCarouselProps {
  images: CarouselImage[];
}

const AUTO_SCROLL_INTERVAL = 2500;

export default function WhiteCarousel({ images }: WhiteCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);

  // We store the carousel controller instance in a ref so it persists across renders
  const controllerRef = useRef<CarouselController | null>(null);

  useEffect(() => {
    if (!trackRef.current || images.length === 0) return;

    const controller = new CarouselController(
      trackRef.current,
      dotsRef.current,
      images.length
    );
    controllerRef.current = controller;

    return () => {
      controller.destroy();
    };
  }, [images.length]);

  const handlePrev = useCallback(() => {
    controllerRef.current?.prev();
  }, []);

  const handleNext = useCallback(() => {
    controllerRef.current?.next();
  }, []);

  if (images.length === 0) return null;

  // Build cloned slides for infinite loop: [clone-end] [originals] [clone-start]
  const allSlides = [...images, ...images, ...images];

  return (
    <div className="wt-dish-wrap">
      <div
        className="wt-carousel"
        aria-roledescription="carousel"
        aria-label="Featured dishes"
      >
        <div className="wt-carousel-viewport">
          <div
            ref={trackRef}
            className="wt-carousel-track"
            style={{ transform: "translate3d(0px, 0, 0)" }}
          >
            {allSlides.map((img, i) => (
              <div
                key={`${img.src}-${i}`}
                className="wt-carousel-slide"
                aria-hidden={i < images.length || i >= images.length * 2}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.src}
                  alt={img.alt}
                  draggable={false}
                  style={{
                    transform: `scale(${img.zoom ?? 1}) translate(${img.shiftX ?? "0px"}, ${img.shiftY ?? "0px"})`,
                    transformOrigin: "center center",
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        <button
          className="wt-carousel-arrow wt-carousel-arrow--prev"
          aria-label="Previous slide"
          onClick={handlePrev}
          type="button"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path
              d="M15 4l-8 8 8 8"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <button
          className="wt-carousel-arrow wt-carousel-arrow--next"
          aria-label="Next slide"
          onClick={handleNext}
          type="button"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path
              d="M9 4l8 8-8 8"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div
          ref={dotsRef}
          className="wt-carousel-dots"
          role="tablist"
          aria-label="Slide navigation"
        >
          {images.map((_, i) => (
            <button
              key={i}
              className="wt-carousel-dot"
              role="tab"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => controllerRef.current?.goToReal(i)}
              type="button"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Carousel Controller class — holds all imperative DOM logic.
   Matches the bulletproof engine from DarkGoldTheme's RestaurantCarousel.
───────────────────────────────────────────────────────────────── */
class CarouselController {
  private track: HTMLDivElement;
  private viewport: HTMLElement;
  private dotsWrap: HTMLDivElement | null;
  private dots: HTMLButtonElement[] = [];
  private realCount: number;
  private totalSlides: number;
  private currentIndex: number;
  private stepWidth = 0;

  // ── Animation lock ──────────────────────────────────────────────
  private isAnimating = false;
  private pendingDelta: number | null = null;

  // ── Drag state ─────────────────────────────────────────────────
  private isDragging = false;
  private activePointerId = 0;
  private startX = 0;
  private startTranslate = 0;
  private currentTranslate = 0;
  private autoTimer: ReturnType<typeof setInterval> | null = null;
  private samples: { x: number; t: number }[] = [];

  // ── Bound handlers ─────────────────────────────────────────────
  private boundPointerDown: (e: PointerEvent) => void;
  private boundPointerMove: (e: PointerEvent) => void;
  private boundPointerUp: (e: PointerEvent) => void;
  private boundTransitionEnd: () => void;
  private boundMouseEnter: () => void;
  private boundMouseLeave: () => void;
  private resizeObserver: ResizeObserver;

  constructor(
    track: HTMLDivElement,
    dotsWrap: HTMLDivElement | null,
    realCount: number
  ) {
    this.track = track;
    this.dotsWrap = dotsWrap;
    this.realCount = realCount;
    this.totalSlides = realCount * 3; // [clone] [real] [clone]
    this.currentIndex = realCount; // start at first real slide

    // The viewport is the direct parent of the track
    this.viewport = track.parentElement as HTMLElement;

    this.boundPointerDown = this._onPointerDown.bind(this);
    this.boundPointerMove = this._onPointerMove.bind(this);
    this.boundPointerUp = this._onPointerUp.bind(this);
    this.boundTransitionEnd = this._onTransitionEnd.bind(this);
    this.boundMouseEnter = this.stopAutoScroll.bind(this);
    this.boundMouseLeave = this.startAutoScroll.bind(this);

    this.resizeObserver = new ResizeObserver(() => {
      this._measure();
      this._setTranslate(-this.currentIndex * this.stepWidth);
    });

    this._collectDots();
    this._bindEvents();

    this.resizeObserver.observe(this.viewport);

    requestAnimationFrame(() => {
      this._measure();
      this._setTranslate(-this.currentIndex * this.stepWidth);
      this._updateDots();
      this.startAutoScroll();
    });
  }

  private _collectDots() {
    if (!this.dotsWrap) return;
    this.dots = Array.from(
      this.dotsWrap.querySelectorAll<HTMLButtonElement>(".wt-carousel-dot")
    );
  }

  private _bindEvents() {
    this.track.addEventListener("pointerdown", this.boundPointerDown);
    this.track.addEventListener("pointermove", this.boundPointerMove);
    this.track.addEventListener("pointerup", this.boundPointerUp);
    this.track.addEventListener("pointercancel", this.boundPointerUp);
    this.track.addEventListener("dragstart", (e) => e.preventDefault());
    this.track.addEventListener("transitionend", this.boundTransitionEnd);

    const carousel = this.track.closest(".wt-carousel");
    if (carousel) {
      carousel.addEventListener("mouseenter", this.boundMouseEnter);
      carousel.addEventListener("mouseleave", this.boundMouseLeave);
    }
  }

  private _measure() {
    const w = this.viewport.offsetWidth;
    if (w > 0) {
      this.stepWidth = w;
      return;
    }
    const slides = this.track.children;
    if (slides.length < 2) return;
    const a = (slides[0] as HTMLElement).getBoundingClientRect();
    const b = (slides[1] as HTMLElement).getBoundingClientRect();
    const measured = b.left - a.left;
    if (measured > 0) this.stepWidth = measured;
  }

  private _onPointerDown(e: PointerEvent) {
    this.stopAutoScroll();
    this.isDragging = true;
    this.activePointerId = e.pointerId;
    this.track.setPointerCapture(e.pointerId);
    this.track.classList.remove("is-animating");
    this.isAnimating = false;
    this.pendingDelta = null;
    this.track.classList.add("is-dragging");
    this.startX = e.clientX;
    this.startTranslate = this.currentTranslate;
    this.samples = [{ x: e.clientX, t: performance.now() }];
  }

  private _onPointerMove(e: PointerEvent) {
    if (!this.isDragging) return;
    const dx = e.clientX - this.startX;
    this.currentTranslate = this.startTranslate + dx;
    this._setTranslate(this.currentTranslate);
    const now = performance.now();
    this.samples.push({ x: e.clientX, t: now });
    this.samples = this.samples.filter((s) => now - s.t < 100);
  }

  private _onPointerUp(e: PointerEvent) {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.track.classList.remove("is-dragging");
    try {
      this.track.releasePointerCapture(e.pointerId);
    } catch (_) {}

    let velocity = 0;
    if (this.samples.length >= 2) {
      const first = this.samples[0];
      const last = this.samples[this.samples.length - 1];
      const dt = last.t - first.t || 1;
      velocity = (last.x - first.x) / dt;
    }

    const draggedBy = this.currentTranslate - this.startTranslate;
    const FLICK = 0.35;
    let delta = 0;

    if (Math.abs(velocity) > FLICK) {
      delta = velocity < 0 ? 1 : -1;
    } else if (this.stepWidth > 0) {
      delta = Math.round(-draggedBy / this.stepWidth);
    }

    this.goTo(this.currentIndex + delta);
    this.startAutoScroll();
  }

  private _setTranslate(px: number) {
    this.track.style.transform = `translate3d(${px}px, 0, 0)`;
    this.currentTranslate = px;
  }

  private _onTransitionEnd() {
    this.track.classList.remove("is-animating");
    this.isAnimating = false;

    if (this.currentIndex >= this.realCount * 2) {
      this.currentIndex -= this.realCount;
      this._setTranslate(-this.currentIndex * this.stepWidth);
    } else if (this.currentIndex < this.realCount) {
      this.currentIndex += this.realCount;
      this._setTranslate(-this.currentIndex * this.stepWidth);
    }

    if (this.pendingDelta !== null) {
      const delta = this.pendingDelta;
      this.pendingDelta = null;
      this.goTo(this.currentIndex + delta);
    }
  }

  private _updateDots() {
    if (!this.dots.length) return;
    const realIndex =
      ((this.currentIndex % this.realCount) + this.realCount) % this.realCount;
    this.dots.forEach((dot, i) =>
      dot.classList.toggle("is-active", i === realIndex)
    );
  }

  goTo(index: number, animate = true) {
    if (animate && this.isAnimating) {
      this.pendingDelta = index - this.currentIndex;
      return;
    }

    if (this.stepWidth === 0) {
      this._measure();
      if (this.stepWidth === 0) return;
    }

    this.currentIndex = index;
    const target = -index * this.stepWidth;

    if (animate) {
      this.isAnimating = true;
      this.track.classList.add("is-animating");
    } else {
      this.track.classList.remove("is-animating");
    }

    this._setTranslate(target);
    this._updateDots();

    if (!animate) {
      requestAnimationFrame(() => this._onTransitionEnd());
    }
  }

  goToReal(realIndex: number) {
    this.goTo(this.realCount + realIndex);
    this.startAutoScroll();
  }

  prev() {
    this.goTo(this.currentIndex - 1);
    this.startAutoScroll();
  }

  next() {
    this.goTo(this.currentIndex + 1);
    this.startAutoScroll();
  }

  startAutoScroll() {
    this.stopAutoScroll();
    this.autoTimer = setInterval(() => {
      if (!this.isDragging) this.next();
    }, AUTO_SCROLL_INTERVAL);
  }

  stopAutoScroll() {
    if (this.autoTimer) {
      clearInterval(this.autoTimer);
      this.autoTimer = null;
    }
  }

  destroy() {
    this.stopAutoScroll();
    this.resizeObserver.disconnect();
    this.track.removeEventListener("pointerdown", this.boundPointerDown);
    this.track.removeEventListener("pointermove", this.boundPointerMove);
    this.track.removeEventListener("pointerup", this.boundPointerUp);
    this.track.removeEventListener("pointercancel", this.boundPointerUp);
    this.track.removeEventListener("transitionend", this.boundTransitionEnd);
    const carousel = this.track.closest(".wt-carousel");
    if (carousel) {
      carousel.removeEventListener("mouseenter", this.boundMouseEnter);
      carousel.removeEventListener("mouseleave", this.boundMouseLeave);
    }
  }
}
