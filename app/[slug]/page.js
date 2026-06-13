import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPostBySlug, getPosts, getRelatedPosts } from '@/lib/supabase';

const siteConfig = require('@/config/site.config');

export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    const posts = await getPosts({ limit: 50 });
    return posts.map((p) => ({ slug: p.slug }));
  } catch { return []; }
}

export async function generateMetadata({ params }) {
  let post = null;
  try { post = await getPostBySlug(params.slug); } catch {}
  if (!post) return { title: 'Article Not Found' };

  const url      = `${siteConfig.siteUrl}/${post.slug}`;
  const catLabel = siteConfig.categories.find((c) => c.slug === post.category)?.label || post.category;
  const img      = post.cover_image || null;

  return {
    title:       post.meta_title || post.title,
    description: post.meta_description || post.excerpt,
    keywords:    post.tags,
    alternates:  { canonical: url },
    openGraph: {
      title:         post.meta_title || post.title,
      description:   post.meta_description || post.excerpt,
      url,
      type:          'article',
      publishedTime: post.published_at || post.created_at,
      modifiedTime:  post.updated_at   || post.published_at || post.created_at,
      authors:       [post.author_name || siteConfig.author.name],
      section:       catLabel,
      tags:          post.tags,
      images: img ? [{ url: img, width: 1200, height: 630, alt: post.cover_image_alt || post.title }] : [],
    },
    twitter: {
      card:        'summary_large_image',
      title:       post.meta_title || post.title,
      description: post.meta_description || post.excerpt,
      images:      img ? [img] : [],
    },
  };
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  } catch { return ''; }
}

function categoryLabel(slug) {
  return siteConfig.categories.find((c) => c.slug === slug)?.label || slug;
}

// ─── Content renderer — 3 fallbacks ─────────────────────────
function renderContent(post) {
  const content = post.content;

  // 1. Object with sections (parsed from JSON.stringify TEXT)
  if (content && typeof content === 'object' && content.sections?.length > 0) {
    return (
      <div className="article-content">
        {content.hook && <div dangerouslySetInnerHTML={{ __html: content.hook }} />}
        {content.sections.map((section, i) => (
          <div key={i}>
            {section.heading && <h2>{section.heading}</h2>}
            <div dangerouslySetInnerHTML={{ __html: section.body || '' }} />
          </div>
        ))}
      </div>
    );
  }

  // 2. rawContent string fallback
  const rawContent = content?.rawContent || post.rawContent || null;
  if (rawContent) {
    return <div className="article-content" dangerouslySetInnerHTML={{ __html: rawContent }} />;
  }

  // 3. Plain text split by paragraphs
  const text = typeof content === 'string' ? content : JSON.stringify(content || '');
  return (
    <div className="article-content">
      {text.split(/\n\n+/).filter(Boolean).map((para, i) => <p key={i}>{para}</p>)}
    </div>
  );
}

export default async function ArticlePage({ params }) {
  let post = null;
  let relatedPosts = [];

  try { post = await getPostBySlug(params.slug); } catch {}
  if (!post) notFound();

  // content is TEXT in DB — parse to object
  if (typeof post.content === 'string') {
    try { post.content = JSON.parse(post.content); } catch {}
  }
  // faq is JSONB top-level column
  const faqItems = Array.isArray(post.faq) ? post.faq : [];

  try { relatedPosts = await getRelatedPosts(post.category, post.slug, 4); } catch {}

  const url        = `${siteConfig.siteUrl}/${post.slug}`;
  const catLabel   = categoryLabel(post.category);
  const tags       = Array.isArray(post.tags) ? post.tags : [];
  const img        = post.cover_image || null;
  const imgAlt     = post.cover_image_alt || post.title;
  const authorName  = post.author_name  || siteConfig.author.name;
  const authorTitle = post.author_title || siteConfig.author.title;
  const date        = post.published_at || post.created_at;

  // Schema JSON-LD
  const newsArticleSchema = {
    '@context': 'https://schema.org',
    '@type':    'NewsArticle',
    headline:   post.title,
    description: post.meta_description || post.excerpt,
    image:       img ? [img] : [],
    datePublished: date,
    dateModified:  post.updated_at || date,
    author: {
      '@type':   'Person',
      name:      authorName,
      jobTitle:  authorTitle,
      url:       `${siteConfig.siteUrl}/about`,
    },
    publisher: {
      '@type': 'Organization',
      name:    siteConfig.siteName,
      url:     siteConfig.siteUrl,
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    articleSection:   catLabel,
    keywords:         tags.join(', '),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type':    'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',    item: siteConfig.siteUrl },
      { '@type': 'ListItem', position: 2, name: catLabel,  item: `${siteConfig.siteUrl}/category/${post.category}` },
      { '@type': 'ListItem', position: 3, name: post.title, item: url },
    ],
  };

  const faqSchema = faqItems.length > 0 ? {
    '@context': 'https://schema.org',
    '@type':    'FAQPage',
    mainEntity: faqItems.map((f) => ({
      '@type': 'Question',
      name:    f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  } : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(newsArticleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}

      <div className="reading-progress" id="reading-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} />

      <div className="page-wrapper">
        <article>
          {/* Breadcrumb */}
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span className="sep">›</span>
            <Link href={`/category/${post.category}`}>{catLabel}</Link>
            <span className="sep">›</span>
            <span className="current">{post.title.slice(0, 55)}{post.title.length > 55 ? '...' : ''}</span>
          </nav>

          {/* Article Header */}
          <header className="article-header">
            <Link href={`/category/${post.category}`} className="article-cat-label">{catLabel}</Link>
            <h1 className="article-title">{post.title}</h1>
            <div className="article-meta">
              <span>✍️ <strong>{authorName}</strong>{authorTitle ? ` — ${authorTitle}` : ''}</span>
              <span>📅 {formatDate(date)}</span>
              {post.reading_time && <span>⏱️ {post.reading_time} min read</span>}
              {post.updated_at && post.updated_at !== date && (
                <span>🔄 Updated: {formatDate(post.updated_at)}</span>
              )}
            </div>
          </header>

          {/* Feature Image — NO image_credit reference */}
          {img && (
            <img
              src={img}
              alt={imgAlt}
              className="article-feature-img"
              width={800}
              height={450}
              loading="eager"
            />
          )}

          {/* Article Content */}
          {renderContent(post)}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="tags-section">
              <span className="tags-label">Tags:</span>
              {tags.map((tag) => (
                <Link key={tag} href={`/search?q=${encodeURIComponent(tag)}`} className="tag-pill">{tag}</Link>
              ))}
            </div>
          )}

          {/* Share */}
          <div className="share-section">
            <span className="share-label">📢 Share:</span>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(post.title + ' ' + url)}`}
              target="_blank" rel="noopener noreferrer"
              className="share-btn whatsapp"
            >📱 WhatsApp</a>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(url)}`}
              target="_blank" rel="noopener noreferrer"
              className="share-btn twitter"
            >🐦 Twitter</a>
            <button className="share-btn copy" id="copy-link-btn">🔗 Copy Link</button>
          </div>

          {/* FAQ — from post.faq (top-level JSONB column) */}
          {faqItems.length > 0 && (
            <section className="faq-section" aria-label="Frequently Asked Questions">
              <div className="faq-title">❓ Frequently Asked Questions</div>
              {faqItems.map((faq, i) => (
                <div key={i} className="faq-item">
                  <div className="faq-question">{faq.question}</div>
                  <div className="faq-answer">{faq.answer}</div>
                </div>
              ))}
            </section>
          )}

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <section style={{ marginTop: 40 }}>
              <div className="section-heading"><span>📌</span> Related <span>Schemes</span></div>
              <div className="related-grid">
                {relatedPosts.map((rp) => (
                  <Link key={rp.id} href={`/${rp.slug}`} className="related-card">
                    {rp.cover_image ? (
                      <img src={rp.cover_image} alt={rp.cover_image_alt || rp.title} className="related-card-img" loading="lazy" width={220} height={130} />
                    ) : (
                      <div className="related-card-img related-card-placeholder">🏛️</div>
                    )}
                    <div className="related-card-body">
                      <p className="related-card-title">{rp.title}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>

        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-widget">
            <div className="widget-title">About the Author</div>
            <div className="widget-body">
              <div className="author-widget">
                <div className="author-avatar">{authorName.charAt(0)}</div>
                <div className="author-name">{authorName}</div>
                <div className="author-title">{authorTitle}</div>
                <p className="author-bio">{siteConfig.author.bio}</p>
              </div>
            </div>
          </div>

          <div className="sidebar-widget">
            <div className="widget-title">Browse Categories</div>
            <div className="widget-body">
              <ul className="sidebar-cat-list">
                {siteConfig.categories.map((cat) => (
                  <li key={cat.slug}>
                    <Link href={`/category/${cat.slug}`} className="sidebar-cat-link">
                      <span>▶ {cat.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="sidebar-widget">
            <div className="widget-title">Official Links</div>
            <div className="widget-body">
              <ul className="official-links">
                {[
                  { label: 'MyScheme Portal', url: 'https://www.myscheme.gov.in/' },
                  { label: 'PM Kisan Portal', url: 'https://pmkisan.gov.in/' },
                  { label: 'Jan Dhan Yojana', url: 'https://pmjdy.gov.in/' },
                  { label: 'DigiLocker',      url: 'https://www.digilocker.gov.in/' },
                ].map((link) => (
                  <li key={link.url}>
                    <a href={link.url} target="_blank" rel="noopener noreferrer">🔗 {link.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>
      </div>

      <script dangerouslySetInnerHTML={{ __html: `
        (function(){
          var bar = document.getElementById('reading-progress');
          if(bar){
            function upd(){
              var st=window.scrollY, dh=document.documentElement.scrollHeight-window.innerHeight;
              bar.style.width=(dh>0?Math.min(100,(st/dh)*100):0)+'%';
            }
            window.addEventListener('scroll',upd,{passive:true});
            upd();
          }
          var cb=document.getElementById('copy-link-btn');
          if(cb){
            cb.addEventListener('click',function(){
              navigator.clipboard.writeText(window.location.href).then(function(){
                cb.textContent='✅ Copied!';
                setTimeout(function(){cb.textContent='🔗 Copy Link';},2000);
              });
            });
          }
        })();
      `}} />
    </>
  );
}
