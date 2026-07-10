"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface BeforeAfterSliderProps {
  beforeSrc: string;
  afterSrc: string;
  beforeAlt: string;
  afterAlt: string;
  caption?: React.ReactNode;
  className?: string;
  aspectClass?: string;
  /**
   * `sizes` hint for next/image. Defaults to the 3-up gallery grid layout.
   * Full-bleed usages (e.g. the featured project) must pass `"100vw"` so the
   * loader serves a high-resolution variant instead of a small grid one.
   */
  sizes?: string;
}

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

export function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeAlt,
  afterAlt,
  caption,
  className = "",
  aspectClass = "aspect-[4/3]",
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
}: BeforeAfterSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const interactedRef = useRef(false);
  const [pos, setPos] = useState(50);
  const [dragging, setDragging] = useState(false);
  const [interacted, setInteracted] = useState(false);
  const instructionsId = useId();

  const markInteracted = () => {
    if (interactedRef.current) return;
    interactedRef.current = true;
    setInteracted(true);
  };

  const updateFromClientX = (clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const next = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(0, Math.min(100, next)));
  };

  // One-time gentle reveal sweep when the slider first scrolls into view, so
  // it reads as interactive without any interaction. Skipped if the visitor
  // already grabbed the handle, and for reduced-motion users.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const timers: number[] = [];
    let done = false;
    const sweep = (value: number) => {
      if (!interactedRef.current) setPos(value);
    };
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !done) {
            done = true;
            io.disconnect();
            timers.push(window.setTimeout(() => sweep(68), 450));
            timers.push(window.setTimeout(() => sweep(32), 1150));
            timers.push(window.setTimeout(() => sweep(50), 1850));
          }
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      timers.forEach((t) => clearTimeout(t));
    };
  }, []);

  const motion = dragging ? "none" : `320ms ${EASE}`;

  return (
    <div
      ref={containerRef}
      className={`group relative w-full overflow-hidden select-none touch-none cursor-ew-resize ${aspectClass} ${className}`}
      onPointerDown={(e) => {
        draggingRef.current = true;
        setDragging(true);
        markInteracted();
        e.currentTarget.setPointerCapture(e.pointerId);
        updateFromClientX(e.clientX);
      }}
      onPointerMove={(e) => {
        if (draggingRef.current) updateFromClientX(e.clientX);
      }}
      onPointerUp={(e) => {
        draggingRef.current = false;
        setDragging(false);
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
      }}
      onPointerCancel={() => {
        draggingRef.current = false;
        setDragging(false);
      }}
      onLostPointerCapture={() => {
        draggingRef.current = false;
        setDragging(false);
      }}
      data-testid="slider-before-after"
    >
      <p id={instructionsId} className="sr-only">
        {beforeAlt} on the left, {afterAlt} on the right. Drag the handle, or
        use the arrow keys, Home, and End to reveal the transformation.
      </p>

      {/* After image (base layer) */}
      <Image
        src={afterSrc}
        alt={afterAlt}
        fill
        sizes={sizes}
        className="object-cover pointer-events-none"
      />

      {/* Before image (clipped overlay, revealed on the left) */}
      <div
        aria-hidden="true"
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{
          clipPath: `inset(0 ${100 - pos}% 0 0)`,
          transition: `clip-path ${motion}`,
        }}
      >
        <Image
          src={beforeSrc}
          alt={beforeAlt}
          fill
          sizes={sizes}
          className="object-cover"
        />
      </div>

      {/* Corner labels */}
      <div className="absolute top-3 left-3 md:top-4 md:left-4 px-2.5 py-1 rounded-sm bg-inverse/75 backdrop-blur-sm text-inverse-foreground text-[10px] tracking-[0.14em] uppercase font-medium pointer-events-none">
        Before
      </div>
      <div className="absolute top-3 right-3 md:top-4 md:right-4 px-2.5 py-1 rounded-sm bg-inverse/75 backdrop-blur-sm text-inverse-foreground text-[10px] tracking-[0.14em] uppercase font-medium pointer-events-none">
        After
      </div>

      {/* Divider line + drag handle */}
      <div
        className="absolute inset-y-0 z-10 w-0.5 bg-inverse-foreground pointer-events-none shadow-[0_0_0_1px_rgba(0,0,0,0.18)]"
        style={{
          left: `${pos}%`,
          transform: "translateX(-1px)",
          transition: `left ${motion}`,
        }}
      >
        {/* Fading hint above the knob until first interaction */}
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[calc(50%+2.9rem)] whitespace-nowrap rounded-full bg-inverse/85 backdrop-blur-sm px-3 py-1 text-[11px] tracking-wide text-inverse-foreground shadow-md transition-opacity duration-500"
          style={{ opacity: interacted ? 0 : 1 }}
        >
          Drag to compare
        </div>

        <button
          type="button"
          role="slider"
          aria-label="Compare before and after"
          aria-orientation="horizontal"
          aria-describedby={instructionsId}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pos)}
          onFocus={markInteracted}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
              e.preventDefault();
              markInteracted();
              setPos((p) => Math.max(0, p - 4));
            } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
              e.preventDefault();
              markInteracted();
              setPos((p) => Math.min(100, p + 4));
            } else if (e.key === "Home") {
              e.preventDefault();
              markInteracted();
              setPos(0);
            } else if (e.key === "End") {
              e.preventDefault();
              markInteracted();
              setPos(100);
            }
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-11 w-11 md:h-12 md:w-12 items-center justify-center rounded-full bg-inverse-foreground text-inverse shadow-[0_2px_12px_rgba(0,0,0,0.35)] ring-1 ring-inverse/10 pointer-events-auto cursor-ew-resize transition-transform duration-200 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          data-testid="handle-before-after"
        >
          <ChevronLeft className="h-4 w-4 -mr-1" />
          <ChevronRight className="h-4 w-4 -ml-1" />
        </button>
      </div>

      {/* Caption */}
      {caption && (
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-inverse/70 via-inverse/20 to-transparent pointer-events-none" />
      )}
      {caption && (
        <div className="absolute bottom-4 left-4 right-4 md:bottom-8 md:left-8 md:right-8 pointer-events-none">
          {caption}
        </div>
      )}
    </div>
  );
}
