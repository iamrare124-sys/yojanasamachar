const siteConfig = require('@/config/site.config');

export const metadata = {
  title: `Disclaimer | ${siteConfig.siteName}`,
};

export default function DisclaimerPage() {
  const { siteName, domain } = siteConfig;
  return (
    <div className="policy-page">
      <h1>Disclaimer</h1>
      <p><strong>Last updated:</strong> January 1, 2026</p>

      <div style={{ background: '#fff8e1', border: '1px solid #f0c040', borderRadius: 8, padding: 16, marginBottom: 24 }}>
        <strong>⚠️ Important:</strong> {siteName} is an independent informational website.
        We are NOT affiliated with, endorsed by, or part of the Government of India or any state government.
      </div>

      <h2>1. Not Official Government Website</h2>
      <p>
        {domain} is a private, independent website. We are not the official website of any government scheme,
        ministry, or department. The official government portal for schemes is{' '}
        <a href="https://www.myscheme.gov.in/" target="_blank" rel="noopener noreferrer">myscheme.gov.in</a>.
      </p>

      <h2>2. Informational Purpose Only</h2>
      <p>
        All content published on this website is for general informational purposes only.
        We make no representation or warranty of any kind regarding the accuracy, adequacy, validity,
        reliability, or completeness of any information.
      </p>

      <h2>3. Scheme Information May Change</h2>
      <p>
        Government scheme eligibility, benefit amounts, application procedures, and deadlines can change
        at any time. Always verify current details from official government sources before applying.
      </p>

      <h2>4. No Professional Advice</h2>
      <p>Nothing on this website constitutes legal, financial, or professional advice.</p>

      <h2>5. AI-Generated Content</h2>
      <p>
        Some content on this website is generated or assisted by artificial intelligence tools.
        All AI-generated content is reviewed for accuracy but may contain errors.
        Please verify all scheme details from official sources.
      </p>

      <h2>6. External Links</h2>
      <p>Inclusion of a link does not imply endorsement of any third-party site.</p>

      <h2>7. Contact for Corrections</h2>
      <p>
        If you find inaccurate information, contact: <strong>corrections@{domain}</strong>.
        We will review and update promptly.
      </p>
    </div>
  );
}
