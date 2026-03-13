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

## Vercel deployment

Use these settings in Vercel:

- Framework preset: `Vite`
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: `/` (project root)

### Included deployment files

- `vercel.json`: framework, build command, and output directory for Vercel.

You can also deploy with Vercel CLI:

```bash
npx vercel --prod
```
