'use client';

import { useEffect, useRef, useState } from 'react';

const MEDIA = '/media/cabinet/boise-cabinet-co-';
const POSTER = `${MEDIA}poster.jpg`;
const PHONE_VIDEO = `${MEDIA}background-720p.mp4`;
const DESKTOP_VIDEO = `${MEDIA}background-1080p.mp4`;

/** The poster is first-response content; JavaScript adds native autoplay. */
export function CabinetHeroVideo() {
  const media = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  // The video mounts once the page has loaded and the browser is idle (SEO audit
  // CAB-S7, 20 November 2026): the poster is the largest paint, and starting a
  // 3 to 10 MB download during the first render delayed it on phones. The video,
  // its sources and its autoplay behaviour are unchanged.
  useEffect(() => {
    let cancelled = false;
    let idle: number | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const start = () => { if (!cancelled) setReady(true); };
    const whenIdle = () => {
      if (typeof window.requestIdleCallback === 'function') idle = window.requestIdleCallback(start, { timeout: 2000 });
      else timer = setTimeout(start, 200);
    };
    if (document.readyState === 'complete') whenIdle();
    else window.addEventListener('load', whenIdle, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener('load', whenIdle);
      if (idle !== undefined && typeof window.cancelIdleCallback === 'function') window.cancelIdleCallback(idle);
      if (timer) clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const element = video.current;
    if (!element || failed) return;
    let desktop = window.innerWidth >= 1024;
    const initialSource = desktop ? DESKTOP_VIDEO : PHONE_VIDEO;
    // Native playback may start before hydration and an early viewport change.
    if (element.currentSrc && !element.currentSrc.endsWith(initialSource)) {
      element.src = initialSource;
      element.load();
    }
    const shouldPlay = () => {
      const bounds = media.current?.getBoundingClientRect();
      return document.visibilityState === 'visible' && Boolean(bounds &&
        bounds.bottom > 0 && bounds.top < window.innerHeight &&
        bounds.right > 0 && bounds.left < window.innerWidth);
    };
    const update = () => {
      if (!shouldPlay()) {
        element.pause();
        return;
      }
      element.muted = true;
      void element.play().then(() => {
        // A late autoplay completion must not restart hidden/offscreen media.
        if (!shouldPlay()) element.pause();
      }).catch(() => {
        // Browser-enforced autoplay restrictions retain the native poster.
      });
    };
    const resize = () => {
      const nextDesktop = window.innerWidth >= 1024;
      if (nextDesktop !== desktop) {
        desktop = nextDesktop;
        element.src = desktop ? DESKTOP_VIDEO : PHONE_VIDEO;
        element.load();
      }
      update();
    };
    const playing = () => { if (!shouldPlay()) element.pause(); };
    const observer = typeof IntersectionObserver === 'function'
      ? new IntersectionObserver(update, { threshold: [0, 0.05] }) : null;
    if (media.current) observer?.observe(media.current);
    document.addEventListener('visibilitychange', update);
    window.addEventListener('resize', resize);
    window.addEventListener('scroll', update, { passive: true });
    element.addEventListener('playing', playing);
    update();
    return () => {
      observer?.disconnect();
      document.removeEventListener('visibilitychange', update);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', update);
      element.removeEventListener('playing', playing);
      element.pause();
    };
  }, [failed, ready]);

  return (
    <div ref={media} className="fam-hero-media" aria-hidden="true">
      {/* The approved poster is immediately readable, including while loading. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img data-hero-poster="" src={POSTER} alt="Custom kitchen cabinets in Boise, Idaho: oak kitchen with a plaster range hood, two bronze pendant lights and an island with four woven stools" width={1920} height={1080}
        fetchPriority="high" loading="eager" className="fam-hero-img" />
      {ready ? <video ref={video} id="cabinet-hero-video" poster={POSTER}
        autoPlay muted loop playsInline preload="auto" tabIndex={-1}
        disablePictureInPicture hidden={failed} className="cabinet-hero-video"
        onError={event => { if (event.currentTarget.error) setFailed(true); }}>
        <source media="(min-width: 1024px)" src={DESKTOP_VIDEO} type="video/mp4" />
        <source src={PHONE_VIDEO} type="video/mp4" />
      </video> : null}
    </div>
  );
}
