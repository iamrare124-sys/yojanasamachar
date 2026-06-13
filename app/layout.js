import './globals.css';
import Link from 'next/link';
import MobileMenu from '@/components/MobileMenu';
import CookieBanner from '@/components/CookieBanner';
import { getLiveData, formatTickerData } from '@/lib/live-data';

const siteConfig = require('@/config/site.config');

export const metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: `${siteConfig.siteName} - ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.siteName}`,
  },
  description: siteConfig.description,
  keywords: [siteConfig.primaryKeyword, ...siteConfig.secondaryKeywords],
  authors: [{ name: siteConfig.author.name }],
  openGraph: {
    siteName: siteConfig.siteName,
    locale: 'en_IN',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.BING_SITE_VERIFICATION
      ? { 'msvalidate.01': process.env.BING_SITE_VERIFICATION }
      : {},
  },
};

const categories = siteConfig.categories;

export default async function RootLayout({ children }) {
  let tickerItems = [];
  try {
    const liveData = await getLiveData();
    tickerItems = formatTickerData(liveData);
  } catch {}

  const ga4Id = process.env.NEXT_PUBLIC_GA4_ID;
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;
  const hasGA4 = ga4Id && ga4Id !== 'G-XXXXXXXXXX' && ga4Id.startsWith('G-');
  const hasAdsense = adsenseId && adsenseId !== 'ca-pub-XXXXXXXXX' && adsenseId.startsWith('ca-pub-');

  return (
    <html lang="en">
      <head>
        {hasGA4 && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga4Id}');`,
              }}
            />
          </>
        )}
        {hasAdsense && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body>
        {/* Ticker */}
        {tickerItems.length > 0 && (
          <div className="ticker-wrap" aria-label="Live scheme stats">
            <div className="ticker-content">
              {[...tickerItems, ...tickerItems].map((item, i) => (
                <span key={i} className="ticker-item">
                  <span className="label">{item.label}:</span>
                  <span className="value">{item.value}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Header */}
        <header className="site-header">
          <div className="header-inner">
            <Link href="/" className="site-logo" aria-label={siteConfig.siteName}>
              <svg className="logo-icon" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <rect width="40" height="40" rx="6" fill="#fff0f0"/>
                <path d="M20 4L6 12v4h28v-4L20 4z" fill="#c0392b"/>
                <rect x="8" y="16" width="4" height="14" fill="#c0392b" opacity="0.7"/>
                <rect x="14" y="16" width="4" height="14" fill="#c0392b" opacity="0.7"/>
                <rect x="22" y="16" width="4" height="14" fill="#c0392b" opacity="0.7"/>
                <rect x="28" y="16" width="4" height="14" fill="#c0392b" opacity="0.7"/>
                <rect x="4" y="30" width="32" height="3" rx="1" fill="#c0392b"/>
                <circle cx="20" cy="10" r="2" fill="#fff"/>
              </svg>
              <div className="logo-text">
                <span className="yojana">Yojana</span>
                <span className="samachar">Samachar</span>
              </div>
            </Link>
            <div className="header-right">
              <Link href="/search" className="search-icon-btn" aria-label="Search">
                🔍
              </Link>
              <MobileMenu />
            </div>
          </div>
        </header>

        {/* Category Nav */}
        <nav className="cat-nav" aria-label="Categories">
          <div className="cat-nav-inner">
            <Link href="/" className="cat-nav-link">Home</Link>
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="cat-nav-link"
              >
                {cat.label}
              </Link>
            ))}
            <Link href="/about" className="cat-nav-link">About</Link>
          </div>
        </nav>

        {/* Main */}
        <main>{children}</main>

        {/* Footer */}
        <footer className="site-footer">
          <div className="footer-main">
            <div className="footer-brand">
              <div className="logo-text" style={{ fontSize: 22, fontWeight: 800 }}>
                <span className="yojana">Yojana</span>
                <span className="samachar" style={{ color: '#e74c3c' }}>Samachar</span>
              </div>
              <p className="footer-tagline">
                {siteConfig.tagline}<br />
                Helping Indian citizens access government benefits since 2019.
              </p>
            </div>
            <div className="footer-col">
              <h4>Quick Links</h4>
              <ul>
                <li><Link href="/">Home</Link></li>
                <li><Link href="/search">Search Schemes</Link></li>
                <li><Link href="/about">About Us</Link></li>
                <li><Link href="/contact">Contact</Link></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Categories</h4>
              <ul>
                {categories.map((cat) => (
                  <li key={cat.slug}>
                    <Link href={`/category/${cat.slug}`}>{cat.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="footer-col">
              <h4>Legal</h4>
              <ul>
                <li><Link href="/privacy-policy">Privacy Policy</Link></li>
                <li><Link href="/terms">Terms of Use</Link></li>
                <li><Link href="/disclaimer">Disclaimer</Link></li>
                <li><Link href="/cookie-policy">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>
              © {new Date().getFullYear()} {siteConfig.siteName} ({siteConfig.domain}).
              All rights reserved. | This website is not affiliated with the Government of India.
              Content is for informational purposes only.
            </p>
          </div>
        </footer>

        <CookieBanner />

        {/* Back to top */}
        <button id="back-to-top" aria-label="Back to top" title="Back to top">↑</button>

        <script
          dangerouslySetInnerHTML={{
            __html: `
              var btt = document.getElementById('back-to-top');
              window.addEventListener('scroll', function() {
                if (window.scrollY > 400) {
                  btt.classList.add('visible');
                } else {
                  btt.classList.remove('visible');
                }
              });
              btt.addEventListener('click', function() {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              });
            `,
          }}
        />
      </body>
    </html>
  );
}
