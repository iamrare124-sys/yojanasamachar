const siteConfig = require('@/config/site.config');

export const metadata = {
  title: `Privacy Policy | ${siteConfig.siteName}`,
  description: `Privacy Policy for ${siteConfig.siteName} (${siteConfig.domain}).`,
};

export default function PrivacyPolicyPage() {
  const { siteName, domain } = siteConfig;
  return (
    <div className="policy-page">
      <h1>Privacy Policy</h1>
      <p><strong>Last updated:</strong> January 1, 2026</p>
      <p>
        {siteName} ("we", "our", or "us") is committed to protecting your privacy.
        This Privacy Policy explains how we collect, use, and safeguard your information
        when you visit {domain}.
      </p>

      <h2>1. Information We Collect</h2>
      <p>We may collect the following types of information:</p>
      <ul>
        <li><strong>Usage Data:</strong> Pages visited, time spent, referral sources (via Google Analytics)</li>
        <li><strong>Device Information:</strong> Browser type, operating system, screen resolution</li>
        <li><strong>Cookies:</strong> Session and preference cookies (see Cookie Policy)</li>
        <li><strong>Search Queries:</strong> Search terms entered on our website (not linked to identity)</li>
      </ul>

      <h2>2. How We Use Information</h2>
      <ul>
        <li>To improve website content and user experience</li>
        <li>To analyze traffic patterns and popular schemes</li>
        <li>To display relevant content and schemes</li>
        <li>To comply with legal obligations</li>
      </ul>

      <h2>3. Cookies</h2>
      <p>
        We use cookies to improve your experience. You can control cookie settings through your
        browser. See our <a href="/cookie-policy">Cookie Policy</a> for details.
      </p>

      <h2>4. Third-Party Services</h2>
      <ul>
        <li><strong>Google Analytics:</strong> Website traffic analysis</li>
        <li><strong>Google AdSense:</strong> Display advertising</li>
        <li><strong>Supabase:</strong> Database hosting</li>
      </ul>

      <h2>5. Data Retention</h2>
      <p>We retain analytics data for up to 26 months. Cookie consent preferences are stored locally in your browser.</p>

      <h2>6. Your Rights</h2>
      <p>
        You have the right to access, correct, or delete any personal data we hold about you.
        Contact us at the email below to exercise these rights.
      </p>

      <h2>7. Children's Privacy</h2>
      <p>Our website is not directed at children under 13. We do not knowingly collect personal information from children.</p>

      <h2>8. Contact</h2>
      <p>For privacy concerns, contact: <strong>privacy@{domain}</strong></p>
    </div>
  );
}
