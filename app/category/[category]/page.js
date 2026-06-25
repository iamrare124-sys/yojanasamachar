import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPosts } from '@/lib/supabase';

const siteConfig = require('@/config/site.config');

export const revalidate = 3600;

export async function generateStaticParams() {
  return siteConfig.categories.map((cat) => ({ category: cat.slug }));
}

export async function generateMetadata({ params }) {
  const cat = siteConfig.categories.find((c) => c.slug === params.category);
  if (!cat) return { title: 'Category Not Found' };
  return {
    title:       `${cat.label} - ${siteConfig.siteName}`,
    description: `Latest ${cat.label} updates, eligibility, and application process. All ${cat.label} on ${siteConfig.siteName}.`,
    alternates:  { canonical: `${siteConfig.siteUrl}/category/${cat.slug}` },
  };
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return ''; }
}

export default async function CategoryPage({ params }) {
  const cat = siteConfig.categories.find((c) => c.slug === params.category);
  if (!cat) notFound();

  let posts = [];
  try { posts = await getPosts({ limit: 20, category: params.category }); } catch {}

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type':    'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',      item: siteConfig.siteUrl },
      { '@type': 'ListItem', position: 2, name: cat.label, item: `${siteConfig.siteUrl}/category/${cat.slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div style={{ background: 'linear-gradient(135deg,#fff5f5,#fff)', padding: '32px 16px 24px', borderBottom: '1px solid #e8e8e8' }}>
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span className="sep">›</span>
            <span className="current">{cat.label}</span>
          </nav>
          <h1 style={{ fontSize: 'clamp(24px,4vw,36px)', fontWeight: 800, color: '#1a1a1a', marginTop: 8 }}>{cat.label}</h1>
          <p style={{ color: '#555', fontSize: 15, marginTop: 8 }}>
            Find latest {cat.label} — eligibility, benefits, documents, and application process for Indian citizens.
          </p>
        </div>
      </div>

      <div className="page-wrapper">
        <div className="main-content">
          <div className="section-heading"><span>📋</span> All <span>{cat.label}</span> Posts</div>

          {posts.length === 0 ? (
            <div className="empty-state">
              <h2>No Articles Yet</h2>
              <p>No articles in this category yet. Check back soon!</p>
              <Link href="/" className="btn-primary" style={{ marginTop: 16, display: 'inline-block' }}>← Back to Home</Link>
            </div>
          ) : (
            <div className="posts-grid">
              {posts.map((post) => {
                const img = post.cover_image || post.image_url;
                return (
                  <article key={post.id} className="post-card">
                    <div className="post-card-img">
                      {img ? (
                        <img src={img} alt={post.cover_image_alt || post.title} loading="lazy" width={200} height={150} />
                      ) : (
                        <div style={{ background: '#fff0f0', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>🏛️</div>
                      )}
                    </div>
                    <div className="post-card-body">
                      <span className="post-cat-badge">{cat.label}</span>
                      <h2 className="post-card-title"><Link href={`/${post.slug}`}>{post.title}</Link></h2>
                      {post.excerpt && <p className="post-card-excerpt">{post.excerpt}</p>}
                      <div className="post-card-meta">
                        <span>✍️ <strong>{post.author_name || siteConfig.author.name}</strong></span>
                        {post.reading_time && <span>⏱️ {post.reading_time} min</span>}
                        <span>📅 {formatDate(post.published_at || post.created_at)}</span>
                      </div>
                      <Link href={`/${post.slug}`} className="read-more">Read More →</Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <aside className="sidebar">
          <div className="sidebar-widget">
            <div className="widget-title">All Categories</div>
            <div className="widget-body">
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {siteConfig.categories.map((c) => (
                  <li key={c.slug}>
                    <Link href={`/category/${c.slug}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0', color: c.slug === cat.slug ? '#c0392b' : '#333', fontWeight: c.slug === cat.slug ? 700 : 400, fontSize: 14, textDecoration: 'none' }}>
                      <span>{c.slug === cat.slug ? '▶' : '○'} {c.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="sidebar-widget">
            <div className="widget-title">About</div>
            <div className="widget-body">
              <div className="author-widget">
                <div className="author-avatar">{siteConfig.author.name.charAt(0)}</div>
                <div className="author-name">{siteConfig.author.name}</div>
                <div className="author-title">{siteConfig.author.title}</div>
                <p className="author-bio">{siteConfig.author.bio}</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
