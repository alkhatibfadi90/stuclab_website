'use client';

import { useEffect, useState } from 'react';

// Light/dark toggle scoped to the LabKit tool workspace (.labkit-page).
// Dark is the default; light is opt-in and persisted in localStorage.
function applyTheme(theme) {
  const el = document.querySelector('.labkit-page');
  if (!el) return;
  if (theme === 'light') el.setAttribute('data-theme', 'light');
  else el.removeAttribute('data-theme');
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState('dark');

  // Restore the saved choice on mount (runs per tool page).
  useEffect(() => {
    try {
      const saved = localStorage.getItem('labkit-theme');
      if (saved === 'light') {
        applyTheme('light');
        setTheme('light');
      }
    } catch (e) {}
  }, []);

  function toggleTheme() {
    const el = document.querySelector('.labkit-page');
    if (!el) return;
    const next = el.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    applyTheme(next);
    setTheme(next);
    try { localStorage.setItem('labkit-theme', next); } catch (e) {}
  }

  return (
    <button className="btn-theme" type="button" aria-label="Toggle light/dark" onClick={toggleTheme}>
      {theme === 'dark' ? (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
      ) : (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>
      )}
    </button>
  );
}
