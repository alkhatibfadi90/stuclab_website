import { useEffect } from 'react';

export function useRevealOnScroll() {
  useEffect(() => {
    const revealElements = document.querySelectorAll('[data-reveal]');

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
      revealElements.forEach((element) => observer.unobserve(element));
    };
  }, []);
}
