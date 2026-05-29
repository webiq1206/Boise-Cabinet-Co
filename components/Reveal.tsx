"use client";

import { useRef, useEffect, useState } from "react";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
  threshold?: number;
}

export function Reveal({ children, className = "", style, delay = 0, threshold = 0.12 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      setVisible(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold, reduceMotion]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        transitionDelay: reduceMotion ? "0ms" : `${delay}ms`,
        transition: reduceMotion
          ? "none"
          : "opacity 0.75s cubic-bezier(.2,.7,.2,1), transform 0.75s cubic-bezier(.2,.7,.2,1)",
        opacity: visible ? 1 : reduceMotion ? 1 : 0,
        transform: visible ? "translateY(0)" : reduceMotion ? "none" : "translateY(28px)",
      }}
    >
      {children}
    </div>
  );
}
