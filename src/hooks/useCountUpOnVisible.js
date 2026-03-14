import { useEffect, useRef, useState } from 'react';

export function useCountUpOnVisible(items, options = {}) {
  const { threshold = 0.35, duration = 1250 } = options;
  const triggerRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [counts, setCounts] = useState(() => items.map(() => 0));

  useEffect(() => {
    if (!triggerRef.current || hasAnimated) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasAnimated(true);
          observer.disconnect();
        }
      },
      { threshold },
    );

    observer.observe(triggerRef.current);

    return () => observer.disconnect();
  }, [hasAnimated, threshold]);

  useEffect(() => {
    if (!hasAnimated) {
      return undefined;
    }

    let frameId;
    let start;

    const tick = (timestamp) => {
      if (!start) {
        start = timestamp;
      }

      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setCounts(items.map(({ target }) => Math.round(target * eased)));

      if (progress < 1) {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    frameId = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(frameId);
  }, [duration, hasAnimated, items]);

  return { triggerRef, counts };
}
