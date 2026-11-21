'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Phone and tablet helper for the homepage finish picker (owner, 21 November
 * 2026: "it should look feel and function like a mobile application").
 * The picker itself stays native radios driven by CSS and works without this
 * file. Once the page is interactive this adds what an app would have: swipe
 * the door left or right, or tap an arrow, to move to the next finish, and the
 * swatch tray follows the choice. Every change goes through the radio itself,
 * so the CSS, the links and the keyboard behave exactly as they do on a tap.
 * Nothing is rendered before hydration, so no dead button is ever shown.
 */
export function FinishSwipe() {
  const anchor = useRef<HTMLSpanElement>(null);
  const [ready, setReady] = useState(false);
  const [spoken, setSpoken] = useState('');

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const section = anchor.current?.closest<HTMLElement>('.fp');
    if (!section) return;
    const stage = section.querySelector<HTMLElement>('.fp-stage');
    const tray = section.querySelector<HTMLElement>('.fp-row');
    const radios = () => Array.from(section.querySelectorAll<HTMLInputElement>('input[name="home-finish"]'));

    const reveal = (input: HTMLInputElement) => {
      const chip = input.closest<HTMLElement>('.fp-opt');
      if (!tray || !chip || tray.scrollWidth <= tray.clientWidth) return;
      const pad = 24;
      const left = chip.offsetLeft - tray.offsetLeft;
      const right = left + chip.offsetWidth;
      if (left - pad < tray.scrollLeft) tray.scrollTo({ left: Math.max(0, left - pad), behavior: 'smooth' });
      else if (right + pad > tray.scrollLeft + tray.clientWidth) tray.scrollTo({ left: right + pad - tray.clientWidth, behavior: 'smooth' });
    };

    const onChange = (event: Event) => {
      const input = event.target as HTMLInputElement;
      if (input.name !== 'home-finish' || !input.checked) return;
      reveal(input);
      setSpoken(input.closest('.fp-opt')?.querySelector('.sr-only')?.textContent ?? '');
    };
    section.addEventListener('change', onChange);

    let startX = 0;
    let startY = 0;
    let tracking = false;
    const onStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;
      tracking = true;
      startX = event.touches[0].clientX;
      startY = event.touches[0].clientY;
    };
    const onEnd = (event: TouchEvent) => {
      if (!tracking) return;
      tracking = false;
      const touch = event.changedTouches[0];
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;
      if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 1.4) return;
      step(radios(), dx < 0 ? 1 : -1);
    };
    stage?.addEventListener('touchstart', onStart, { passive: true });
    stage?.addEventListener('touchend', onEnd, { passive: true });

    return () => {
      section.removeEventListener('change', onChange);
      stage?.removeEventListener('touchstart', onStart);
      stage?.removeEventListener('touchend', onEnd);
    };
  }, [ready]);

  const move = (direction: 1 | -1) => {
    const section = anchor.current?.closest<HTMLElement>('.fp');
    if (section) step(Array.from(section.querySelectorAll<HTMLInputElement>('input[name="home-finish"]')), direction);
  };

  return (
    <span ref={anchor} className="fp-swipe">
      {ready ? (
        <>
          <button type="button" className="fp-nav fp-nav-prev" aria-label="Previous finish" onClick={() => move(-1)}>
            <ChevronLeft size={22} aria-hidden="true" />
          </button>
          <button type="button" className="fp-nav fp-nav-next" aria-label="Next finish" onClick={() => move(1)}>
            <ChevronRight size={22} aria-hidden="true" />
          </button>
          <span className="sr-only" aria-live="polite">{spoken}</span>
        </>
      ) : null}
    </span>
  );
}

function step(all: HTMLInputElement[], direction: 1 | -1) {
  if (!all.length) return;
  const current = Math.max(0, all.findIndex((input) => input.checked));
  const next = all[(current + direction + all.length) % all.length];
  next.checked = true;
  next.dispatchEvent(new Event('change', { bubbles: true }));
}
