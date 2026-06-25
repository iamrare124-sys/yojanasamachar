'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  } catch { return ''; }
}

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      doSearch(q);
    }
  }, [searchParams]);

  async function doSearch(q) {
    if (!q || q.trim().length < 2) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch {
      setResults([]);
    }
    setLoading(false);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <>
      <div style={{ background: 'linear-gradient(135deg,#fff5f5,#fff)', padding: '32px 16px 24px', borderBottom: '1px solid #e8e8e8' }}>
        <div className="container">
          <h1 style={{ fontSize: 'clamp(22px,4vw,34px)', fontWeight: 800, marginBottom: 20 }}>
            🔍 Search Government Schemes
          </h1>
          <form onSubmit={handleSubmit} className="search-form">
            <input
              type="search"
              className="search-input"
              placeholder="Search schemes, PM Yojana, eligibility..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search schemes"
            />
            <button type="submit" className="search-btn">Search</button>
          </form>
          <p style={{ fontSize: 13, color: '#888', marginTop: 8 }}>
            Try: PM Kisan, Ayushman Bharat, PMAY, Scholarship, Ration Card
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '24px 16px' }}>
        {loading && (
          <div style={{ padding: '40px 0', textAlign: 'center', color: '#888' }}>
            <div className="sk sk-title" style={{ maxWidth: 400, margin: '0 auto 12px' }} />
            <div className="sk sk-text" style={{ maxWidth: 600, margin: '0 auto 8px' }} />
            <div className="sk sk-text" style={{ maxWidth: 500, margin: '0 auto' }} />
            <p style={{ marginTop: 16 }}>Searching...</p>
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="empty-state">
            <h2>No Results Found</h2>
            <p>No schemes found for "{searchParams.get('q')}". Try different keywords.</p>
            <Link href="/" className="btn-primary" style={{ display: 'inline-block', marginTop: 16 }}>
              Browse All Schemes
            </Link>
          </div>
        )}

        {!loading && results.length > 0 && (
          <>
            <p style={{ color: '#555', marginBottom: 16, fontSize: 14 }}>
              Found <strong>{results.length}</strong> results for "{searchParams.get('q')}"
            </p>
            <div className="posts-grid">
              {results.map((post) => (
                <article key={post.id} className="post-card">
                  <div className="post-card-img">
                    {post.image_url ? (
                      <img src={post.image_url} alt={post.title} loading="lazy" width={200} height={150} />
                    ) : (
                      <div style={{ background: '#fff0f0', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>🏛️</div>
                    )}
                  </div>
                  <div className="post-card-body">
                    <span className="post-cat-badge">{post.category}</span>
                    <h2 className="post-card-title">
                      <Link href={`/${post.slug}`}>{post.title}</Link>
                    </h2>
                    {post.excerpt && <p className="post-card-excerpt">{post.excerpt}</p>}
                    <div className="post-card-meta">
                      <span>📅 {formatDate(post.published_at)}</span>
                    </div>
                    <Link href={`/${post.slug}`} className="read-more">Read More →</Link>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}

        {!searched && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#888' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏛️</div>
            <p style={{ fontSize: 16 }}>Enter a scheme name or keyword to search across all government schemes.</p>
          </div>
        )}
      </div>
    </>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="container" style={{ padding: '40px 16px', textAlign: 'center' }}>
        <p>Loading search...</p>
      </div>
    }>
      <SearchResults />
    </Suspense>
  );
}
