const siteConfig = require('@/config/site.config');

export const metadata = {
  title: `Terms of Use | ${siteConfig.siteName}`,
};

export default function TermsPage() {
  const { siteName, domain } = siteConfig;
  return (
    <div className="policy-page">
      <h1>Terms of Use</h1>
      <p><strong>Last updated:</strong> January 1, 2026</p>
      <p>
        By accessing and using {siteName} ({domain}), you agree to be bound by these Terms of Use.
        Please read them carefully before using our website.
      </p>

      <h2>1. Use of Website</h2>
      <p>You may use this website for lawful purposes only. You must not use it in any way that violates applicable laws or regulations.</p>

      <h2>2. Intellectual Property</h2>
      <p>
        All content on {domain}, including text, graphics, logos, and images, is the property of {siteName}
        unless otherwise noted. You may not reproduce or distribute our content without express written permission.
      </p>

      <h2>3. Disclaimer of Warranties</h2>
      <p>
        This website is provided "as is" without any representations or warranties. We make no representations
        regarding the accuracy or completeness of scheme information. Always verify with official government sources.
      </p>

      <h2>4. Government Information Accuracy</h2>
      <p>
        While we strive to keep information about government schemes accurate and up-to-date,
        scheme details, eligibility, and benefits can change. Always refer to official government
        portals (myscheme.gov.in, pmkisan.gov.in, etc.) for final decisions.
      </p>

      <h2>5. Limitation of Liability</h2>
      <p>
        {siteName} shall not be liable for any direct, indirect, incidental, or consequential
        damages resulting from the use or inability to use this website or its content.
      </p>

      <h2>6. External Links</h2>
      <p>We are not responsible for the content or privacy practices of any linked third-party sites.</p>

      <h2>7. Changes to Terms</h2>
      <p>We reserve the right to modify these terms at any time. Continued use constitutes acceptance.</p>

      <h2>8. Governing Law</h2>
      <p>These terms are governed by the laws of India. Disputes are subject to the jurisdiction of courts in India.</p>

      <h2>9. Contact</h2>
      <p>For questions about these terms: <strong>legal@{domain}</strong></p>
    </div>
  );
}
