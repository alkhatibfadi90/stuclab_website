# StrucLab — Vite → Next.js 14 migration notes

This file records the decisions made during the migration and the manual
follow-up steps that still need to be done.

## Manual follow-up required

The migration was performed with file write/edit tools only — the shell was
unavailable in the migration environment, so the following could **not** be
done automatically and must be done by hand:

1. **Install dependencies** — `npm install`
2. **Delete the old Vite files** (they are now dead code; Next.js ignores them,
   but they should be removed for cleanliness):
   - `index.html`
   - `vite.config.js`
   - `src/` (the entire old Vite source tree, including `src/main.jsx` and
     `src/App.jsx` — every file has been ported into `app/`, `components/`,
     `content/`, `hooks/`, `utils/`, `styles/`)
   - `api/contact.js` (replaced by `app/api/contact/route.js`)
   - `vercel.json` — neutralised to `{}` so Vercel auto-detects Next.js;
     delete it entirely if preferred (the `/toolkit` redirects it used to
     carry are now in `next.config.js`).
3. **Run the build** — `npm run build` — and the Step 10 verification.

## Decisions where the prompt was ambiguous or constraints conflicted

### Fonts — kept a `<link>` instead of `next/font`

The prompt asked to load IBM Plex Sans/Mono via `next/font/google`, replacing
the Google Fonts `<link>`. However, `next/font` generates **hashed** font
family names, while `styles/labkit.css` and `styles/tokens.css` reference the
fonts by their **literal** names (`'IBM Plex Sans'`, `'IBM Plex Mono'`).
The constraints forbid editing those CSS files.

Using `next/font` would therefore break the LabKit tool-page typography unless
the CSS were changed. The two constraints genuinely conflict, so the literal
`<link>` to Google Fonts was kept in `app/layout.jsx`. The SPA-shell SEO
problem (the actual migration goal) is fully solved regardless of how fonts
load. To adopt `next/font`, `labkit.css`/`tokens.css` would need to consume a
CSS variable instead of the literal family name.

The `Inter` / `Montserrat` / `Poppins` `@import` at the top of `styles.css`
was left untouched (that file must not change).

### Removed redundant `window.scrollTo` on-mount effects

`LabKit`, `ConcreteIndex`, `ModellingAnalysisIndex` and `InsightsIndex`
each had a `useEffect` that scrolled to the top on mount. Next.js App Router
scrolls to the top on navigation by default, so these effects were dropped —
which let those components stay **server components** (better for SEO; no
`'use client'` needed). No visual change.

### `vercel.json` redirects → `next.config.js`

`vercel.json` previously carried `/toolkit` → `/labkit` permanent redirects.
The prompt said to delete `vercel.json`; the redirects were moved into
`next.config.js` so that behaviour is preserved.

### Insight post 404

Both dynamic routes use `export const dynamicParams = false`, so any slug or
tag not generated at build time returns a real 404 (`app/not-found.jsx`),
rather than the inline "post not found" view the SPA used to render with a
200 status.

## Known minor item

The LabKit tool pages compute a "today" date string. Because the pages are
statically generated, that string is baked at build time and the client
re-computes it on hydration. On a day later than the build, React will
re-render that one text node on the client (a benign hydration mismatch).
The calculator components were ported byte-for-byte per the brief, so this
was left as-is. If desired, move the date into a `useEffect`-set state.
