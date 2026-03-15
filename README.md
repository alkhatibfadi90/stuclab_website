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

### Contact form email setup

The contact form submits to `/api/contact`, which sends emails via Resend.

Set these Vercel environment variables:

- `RESEND_API_KEY`: your Resend API key.
- `CONTACT_FROM_EMAIL`: verified sender, for example `StrucLab <website@your-domain.com>`.
- `CONTACT_TO_EMAIL`: optional recipient override. If omitted, it defaults to `info@struclab.com.au`.
- `CONTACT_RATE_LIMIT_MAX`: optional max submissions per IP in the window (default `5`).
- `CONTACT_RATE_LIMIT_WINDOW_MS`: optional rate-limit window in milliseconds (default `900000`, i.e. 15 minutes).

Without `RESEND_API_KEY` and `CONTACT_FROM_EMAIL`, contact form submissions will fail.

You can also deploy with Vercel CLI:

```bash
npx vercel --prod
```
