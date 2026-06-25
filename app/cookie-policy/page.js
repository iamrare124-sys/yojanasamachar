const siteConfig = require('@/config/site.config');

export const metadata = {
  title: `Cookie Policy | ${siteConfig.siteName}`,
};

export default function CookiePolicyPage() {
  const { siteName, domain } = siteConfig;
  return (
    <div className="policy-page">
      <h1>Cookie Policy</h1>
      <p><strong>Last updated:</strong> January 1, 2026</p>
      <p>
        This Cookie Policy explains how {siteName} uses cookies and similar tracking
        technologies when you visit {domain}.
      </p>

      <h2>What Are Cookies?</h2>
      <p>Cookies are small text files placed on your device when you visit a website.</p>

      <h2>1. Essential Cookies</h2>
      <ul>
        <li><strong>cookie_consent</strong> — Stores your cookie consent preference (localStorage)</li>
      </ul>

      <h2>2. Analytics Cookies</h2>
      <p>We use Google Analytics to understand how visitors use our website.</p>
      <ul>
        <li><strong>_ga, _ga_*</strong> — Google Analytics (2 years)</li>
        <li><strong>_gid</strong> — Google Analytics session (24 hours)</li>
      </ul>

      <h2>3. Advertising Cookies</h2>
      <p>If Google AdSense is enabled, Google may set cookies to show relevant advertisements.</p>

      <h2>How to Control Cookies</h2>
      <ul>
        <li>Use your browser settings to block or delete cookies</li>
        <li>Use our cookie consent banner to decline non-essential cookies</li>
        <li>Visit <a href="https://optout.aboutads.info/" target="_blank" rel="noopener noreferrer">aboutads.info</a> to opt out</li>
        <li>Visit <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">Google Analytics Opt-out</a></li>
      </ul>

      <h2>Contact</h2>
      <p>For questions: <strong>privacy@{domain}</strong></p>
    </div>
  );
}
