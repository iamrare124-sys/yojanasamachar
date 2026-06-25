import Link from 'next/link';
import { getPosts } from '@/lib/supabase';

const siteConfig = require('@/config/site.config');

const categories = siteConfig.categories;

const states = [
  'Andhra Pradesh', 'Bihar', 'Delhi', 'Gujarat', 'Haryana',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
  'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh',
  'West Bengal', 'Uttarakhand', 'Odisha', 'Assam', 'Jharkhand', 'Chhattisgarh',
];
function safeExcerpt(text) {
  if (!text) return '';
  const clean = text.replace(/<[^>]+>/g, '').replace(/#+\s/g, '').replace(/\s+/g, ' ').trim();
  if (clean.length > 250) return clean.slice(0, 180) + '...';
  return clean.slice(0, 200);
}
function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  } catch { return ''; }
}

function categoryLabel(slug) {
  const cat = categories.find((c) => c.slug === slug);
  return cat ? cat.label : slug;
}

function PostCard({ post }) {
  // Support both old (image_url) and new (cover_image) schema column names
  const img = post.cover_image || post.image_url || null;
  const imgAlt = post.cover_image_alt || post.title;
  const date = post.published_at || post.created_at;

  return (
    <article className="post-card">
      <div className="post-card-img">
        {img ? (
          <img src={img} alt={imgAlt} loading="lazy" width={200} height={150} />
        ) : (
          <div style={{ background: 'linear-gradient(135deg,#fff0f0,#ffe0e0)', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>
            🏛️
          </div>
        )}
      </div>
      <div className="post-card-body">
        <div>
          <Link href={`/category/${post.category}`} className="post-cat-badge">
            {categoryLabel(post.category)}
          </Link>
        </div>
        <h2 className="post-card-title">
          <Link href={`/${post.slug}`}>{post.title}</Link>
        </h2>
        {post.excerpt && (
          <p className="post-card-excerpt">{safeExcerpt(post.excerpt)}</p>
        )}
        <div className="post-card-meta">
          <span>✍️ <strong>{post.author_name || siteConfig.author.name}</strong></span>
          {post.reading_time && <span>⏱️ {post.reading_time} min read</span>}
          <span>📅 {formatDate(date)}</span>
        </div>
        <Link href={`/${post.slug}`} className="read-more">Read More →</Link>
      </div>
    </article>
  );
}

function Sidebar({ recentPosts }) {
  return (
    <aside className="sidebar">
      {/* Author Widget */}
      <div className="sidebar-widget">
        <div className="widget-title">About the Author</div>
        <div className="widget-body">
          <div className="author-widget">
            <div className="author-avatar">{siteConfig.author.name.charAt(0)}</div>
            <div className="author-name">{siteConfig.author.name}</div>
            <div className="author-title">{siteConfig.author.title}</div>
            <p className="author-bio">{siteConfig.author.bio}</p>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="sidebar-widget">
        <div className="widget-title">Browse Categories</div>
        <div className="widget-body">
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {categories.map((cat) => (
              <li key={cat.slug}>
                <Link href={`/category/${cat.slug}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0', color: '#333', fontSize: 14, textDecoration: 'none' }}>
                  <span>▶ {cat.label}</span>
                  <span style={{ color: '#c0392b', fontWeight: 700 }}>→</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recent Posts */}
      {recentPosts.length > 0 && (
        <div className="sidebar-widget">
          <div className="widget-title">Recent Posts</div>
          <div className="widget-body">
            <div className="sidebar-post-list">
              {recentPosts.slice(0, 5).map((post) => {
                const img = post.cover_image || post.image_url;
                return (
                  <Link key={post.id} href={`/${post.slug}`} className="sidebar-post-item">
                    {img ? (
                      <img src={img} alt={post.cover_image_alt || post.title} className="sidebar-post-thumb" loading="lazy" width={80} height={60} />
                    ) : (
                      <div className="sidebar-post-thumb" style={{ background: '#fff0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🏛️</div>
                    )}
                    <div>
                      <div className="sidebar-post-title">{post.title}</div>
                      <div className="sidebar-post-date">{formatDate(post.published_at || post.created_at)}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Official Links */}
      <div className="sidebar-widget">
        <div className="widget-title">Official Government Links</div>
        <div className="widget-body">
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: 'MyScheme Portal',  url: 'https://www.myscheme.gov.in/' },
              { label: 'PM Kisan Portal',  url: 'https://pmkisan.gov.in/' },
              { label: 'Jan Dhan Yojana', url: 'https://pmjdy.gov.in/' },
              { label: 'Umang App',        url: 'https://web.umang.gov.in/' },
              { label: 'DigiLocker',       url: 'https://www.digilocker.gov.in/' },
            ].map((link) => (
              <li key={link.url}>
                <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: '#c0392b', display: 'flex', alignItems: 'center', gap: 6 }}>
                  🔗 {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}

export default async function HomePage() {
  let posts = [];
  try {
    posts = await getPosts({ limit: 20 });
  } catch {}

  return (
    <>
      {/* Hero */}
      <section className="hero-section">
        <h1 className="hero-title">🏛️ Sarkari Yojana Guide</h1>
        <p className="hero-subtitle">Latest Government Schemes & PM Yojana Updates 2026</p>
        <p className="hero-desc">
          Find complete information on government schemes — eligibility, documents, benefits, and step-by-step application process. All in simple language.
        </p>
        <div className="live-stats" style={{ justifyContent: 'center', marginTop: 24 }}>
          <div className="live-stat-card">
            <div className="live-stat-value">500+</div>
            <div className="live-stat-label">Active Schemes</div>
          </div>
          <div className="live-stat-card">
            <div className="live-stat-value">12</div>
            <div className="live-stat-label">New This Month</div>
          </div>
          <div className="live-stat-card" style={{ background: 'linear-gradient(135deg,#f39c12,#e67e22)' }}>
            <div className="live-stat-value">28</div>
            <div className="live-stat-label">States Covered</div>
          </div>
        </div>
        <div className="state-pills">
          {states.map((state) => (
            <Link key={state} href="/category/state-schemes" className="state-pill">{state}</Link>
          ))}
        </div>
      </section>

      <div className="page-wrapper">
        <div className="main-content">
          <div className="section-heading">
            <span>📰</span> Latest <span>Scheme News</span>
          </div>

          {posts.length === 0 ? (
            <div className="empty-state">
              <h2>No Posts Yet</h2>
              <p>Articles are generated automatically. Trigger the cron to publish the first article:</p>
              <div className="cron-url">
                {siteConfig.siteUrl}/api/cron?secret=YOUR_CRON_SECRET
              </div>
              <p style={{ marginTop: 16, fontSize: 13 }}>
                Or visit <Link href="/api/cron" style={{ color: '#c0392b' }}>/api/cron</Link> with your secret to trigger manually.
              </p>
            </div>
          ) : (
            <div className="posts-grid">
              {posts.map((post) => <PostCard key={post.id} post={post} />)}
            </div>
          )}
        </div>

        <Sidebar recentPosts={posts} />
      </div>
    </>
  );
}
