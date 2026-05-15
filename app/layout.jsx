import { GoogleAnalytics } from '@next/third-parties/google';
import '../styles/tokens.css';
import '../styles/labkit.css';
import '../styles/styles.css';

export const metadata = {
  metadataBase: new URL('https://www.struclab.com.au'),
  title: {
    default: 'StrucLab — Structural & Computational Engineering',
    template: '%s | StrucLab',
  },
  description:
    'StrucLab provides structural and computational engineering support including structural design, advanced analysis, design review, and engineering automation for complex building projects.',
  openGraph: {
    siteName: 'StrucLab',
    locale: 'en_AU',
    type: 'website',
    images: ['/og-image.svg'],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-image.svg'],
  },
  icons: { icon: '/assets/favicon.png' },
  robots: { index: true, follow: true },
};

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/*
          IBM Plex is loaded by name via a standard stylesheet link. The
          existing CSS files (styles/labkit.css, styles/tokens.css) reference
          'IBM Plex Sans' / 'IBM Plex Mono' by their literal family names, so
          the fonts must keep those exact names — see MIGRATION_NOTES.md.
        */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
          precedence="default"
        />

        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>

        {children}

        {GA_ID ? <GoogleAnalytics gaId={GA_ID} /> : null}
      </body>
    </html>
  );
}
