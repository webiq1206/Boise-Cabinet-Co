import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation } from "wouter";

export function ScrollToTop() {
  const [location] = useLocation();
  const prevLocation = useRef(location);

  // Disable browser's scroll restoration
  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
  }, []);

  // Scroll to top on route change
  useLayoutEffect(() => {
    // Only scroll if the pathname changed (not hash changes)
    if (prevLocation.current !== location) {
      // Immediate scroll for instant navigation
      window.scrollTo(0, 0);
      
      // Backup scroll after a brief delay to handle any async rendering
      requestAnimationFrame(() => {
        window.scrollTo(0, 0);
      });
      
      prevLocation.current = location;
    }
  }, [location]);

  return null;
}
