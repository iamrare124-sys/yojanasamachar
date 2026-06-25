import Link from 'next/link';

const siteConfig = require('@/config/site.config');

export const metadata = {
  title: `About Us | ${siteConfig.siteName}`,
  description: `Learn about ${siteConfig.siteName} and our mission to help Indian citizens access government schemes and benefits.`,
};

export default function AboutPage() {
  const { siteName, domain, tagline, author, categories } = siteConfig;

  return (
    <div className="about-page">
      <h1>About {siteName}</h1>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <p>
            <strong>{domain}</strong> is India's trusted guide for government schemes and Sarkari Yojana.
            We help millions of Indian citizens discover, understand, and apply for central and state government benefits.
          </p>
          <p>
            Our mission is simple: <em>no eligible Indian citizen should miss out on a government benefit due to lack of information.</em>
          </p>
        </div>
        <div style={{ background: '#fff0f0', border: '1px solid #f0d0d0', borderRadius: 8, padding: 20, minWidth: 200, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🏛️</div>
          <div style={{ fontWeight: 700, color: '#c0392b', fontSize: 18 }}>500+</div>
          <div style={{ fontSize: 13, color: '#666' }}>Active Schemes Covered</div>
          <div style={{ fontWeight: 700, color: '#c0392b', fontSize: 18, marginTop: 12 }}>28</div>
          <div style={{ fontSize: 13, color: '#666' }}>States & UTs</div>
        </div>
      </div>

      <h2>Meet the Author</h2>
      <div style={{ background: '#f9f9f9', border: '1px solid #e8e8e8', borderRadius: 8, padding: 20, marginBottom: 24, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#c0392b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, color: '#fff', fontWeight: 700, flexShrink: 0 }}>
          {author.name.charAt(0)}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>{author.name}</div>
          <div style={{ color: '#c0392b', fontSize: 13, marginBottom: 8 }}>{author.title}</div>
          <p style={{ margin: 0 }}>{author.bio}</p>
        </div>
      </div>

      <h2>What We Cover</h2>
      <ul>
        {categories.map((cat) => (
          <li key={cat.slug}>
            <strong>{cat.label}:</strong>{' '}
            <Link href={`/category/${cat.slug}`}>Browse {cat.label}</Link>
          </li>
        ))}
      </ul>

      <h2>Our Commitment</h2>
      <p>All content on {domain} is written in simple, jargon-free language. We always include:</p>
      <ul>
        <li>Eligibility criteria in plain language</li>
        <li>Complete document checklist (Aadhaar, ration card, Jan Dhan account, etc.)</li>
        <li>Step-by-step application process</li>
        <li>Official government links</li>
        <li>Benefit amounts and disbursement details</li>
      </ul>

      <h2>Disclaimer</h2>
      <p>
        {siteName} is an independent informational website. We are not affiliated with, endorsed by,
        or part of any government ministry or department. Always verify information from official government
        portals before applying. See our full <Link href="/disclaimer">Disclaimer</Link>.
      </p>

      <h2>Contact Us</h2>
      <p>For corrections, suggestions, or feedback, please email us. We aim to respond within 48 hours.</p>
    </div>
  );
}
