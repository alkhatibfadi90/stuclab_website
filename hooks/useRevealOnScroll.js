import { useEffect } from 'react';

export function useRevealOnScroll(trigger, options) {
  const disabled = Boolean(options && options.disabled);

  useEffect(() => {
    if (disabled) {
      // Caller opted out (e.g. content-heavy routes like /insights).
      // The page wrapper applies .no-reveal-animations so CSS forces
      // [data-reveal] elements to their final visible state.
      return undefined;
    }

    const revealElements = document.querySelectorAll('[data-reveal]:not(.is-visible)');

    if (!revealElements.length) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries, observerInstance) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observerInstance.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.18,
        rootMargin: '0px 0px -8% 0px',
      },
    );

    revealElements.forEach((element) => observer.observe(element));

    return () => {
      observer.disconnect();
    };
  }, [trigger, disabled]);
}
