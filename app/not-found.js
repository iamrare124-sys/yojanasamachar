import Link from 'next/link';

const siteConfig = require('@/config/site.config');

export const metadata = {
  title: `404 - Page Not Found | ${siteConfig.siteName}`,
  description: 'The page you are looking for does not exist.',
};

export default function NotFound() {
  return (
    <div className="not-found-page">
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>The scheme or page you are looking for does not exist or has been moved.</p>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link href="/" className="btn-primary">← Back to Home</Link>
        <Link href="/search" className="btn-primary" style={{ background: '#555' }}>Search Schemes</Link>
      </div>
      <div style={{ marginTop: 40, color: '#888', fontSize: 14 }}>
        <p>Looking for a specific scheme? Try these popular ones:</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 12 }}>
          {['PM Kisan', 'Ayushman Bharat', 'PMAY', 'PM Ujjwala', 'Sukanya Samriddhi'].map((s) => (
            <Link key={s} href={`/search?q=${encodeURIComponent(s)}`} style={{ color: '#c0392b', textDecoration: 'underline', fontSize: 14 }}>
              {s}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
