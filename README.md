# StrucLab Website

Single-page React + Vite static website for StrucLab.

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

Build output is generated in `dist/`.

## Cloudflare Pages deployment

Use these settings in Cloudflare Pages:

- Framework preset: `Vite` (or `None`)
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: `/` (project root)

### Included deployment files

- `wrangler.toml`: sets `pages_build_output_dir = "dist"` for Wrangler-based Pages deploys.
- `public/_headers`: basic security and cache headers.

Note: this site does not use client-side route paths, so no `_redirects` fallback is required.

You can also deploy with Wrangler:

```bash
npx wrangler pages deploy dist --project-name struclab-website
```
