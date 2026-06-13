import { fetchAllSources } from '@/lib/rss-fetcher';
import { generateBlogPost, slugify, slugifyUnique } from '@/lib/blog-generator';
import { postExists, postExistsBySlug, savePost } from '@/lib/supabase';
import { fetchImage, getImageKeyword } from '@/lib/image-fetcher';
import { verifyCronSecret } from '@/lib/security';

export const dynamic     = 'force-dynamic';
export const maxDuration = 300;

const siteConfig = require('@/config/site.config');

// ─── Excerpt fallback chain ──────────────────────────────────
function buildExcerpt(generated, story) {
  if (generated.metaDesc && generated.metaDesc.length > 30)
    return generated.metaDesc.slice(0, 200);
  if (generated.content?.hook) {
    const plain = generated.content.hook.replace(/<[^>]+>/g, '').trim();
    if (plain.length > 30) return plain.slice(0, 200);
  }
  if (generated.content?.sections?.[0]?.body) {
    const plain = generated.content.sections[0].body.replace(/<[^>]+>/g, '').trim();
    if (plain.length > 30) return plain.slice(0, 200);
  }
  return `${story.title} — ${siteConfig.tagline}`.slice(0, 200);
}

// ─── IndexNow ping ───────────────────────────────────────────
async function pingIndexNow(articleUrl) {
  try {
    const key = process.env.INDEX_NOW_KEY;
    if (!key) return;
    await fetch(
      `https://api.indexnow.org/indexnow?url=${encodeURIComponent(articleUrl)}&key=${key}&keyLocation=${encodeURIComponent(siteConfig.siteUrl + '/' + key + '.txt')}`,
      { signal: AbortSignal.timeout(5000) }
    );
  } catch {}
}

export async function GET(request) {
  const start = Date.now();

  if (!verifyCronSecret(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results = { requested: 0, published: 0, skipped: 0, posts: [], errors: [] };

  try {
    const stories = await fetchAllSources();
    results.requested = stories.length;

    if (stories.length === 0) {
      return Response.json({
        success: false,
        message: 'No stories found from any source',
        site: process.env.SITE_NAME || 'yojanasamachar',
        ...results,
        duration_seconds: ((Date.now() - start) / 1000).toFixed(2),
      });
    }

    let processed = 0;
    for (const story of stories) {
      if (processed >= 3) break;

      try {
        const alreadyPublished = await postExists(story.link);
        if (alreadyPublished) { results.skipped++; continue; }

        const generated = await generateBlogPost(story);
        if (!generated || !generated.title) {
          results.errors.push({ story: story.title, error: 'Generation returned empty' });
          continue;
        }

        // Check slug collision — if taken, generate unique slug instead of skipping
        let slug = slugify(generated.title);
        const slugTaken = await postExistsBySlug(slug);
        if (slugTaken) {
          slug = slugifyUnique(generated.title);
          console.log(`Slug collision resolved: ${slug}`);
        }

        // Fetch cover image
        let coverImage    = null;
        let coverImageAlt = generated.title;
        try {
          const img  = await fetchImage(getImageKeyword(generated.title));
          coverImage    = img.url;
          coverImageAlt = img.alt || generated.title;
        } catch {}

        const excerpt     = buildExcerpt(generated, story);
        const wordCount   = generated.rawContent
          ? generated.rawContent.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length
          : 800;
        const readingTime = Math.max(3, Math.ceil(wordCount / 200));

        // ── content → JSON.stringify (DB column is TEXT) ──────
        const contentObj = {
          hook:       generated.content?.hook     || '',
          sections:   generated.content?.sections || [],
          rawContent: generated.rawContent        || '',
        };

        const post = {
          slug,
          title:            generated.title,
          excerpt,
          content:          JSON.stringify(contentObj),   // TEXT column

          category:         generated.category  || 'scheme-news',
          tags:             generated.tags       || [],
          cover_image:      coverImage,
          cover_image_alt:  coverImageAlt,
          faq:              generated.faq || [],           // JSONB column in DB
          author_name:      siteConfig.author?.name  || 'Editorial Team',
          author_title:     siteConfig.author?.title || '',
          meta_title:       generated.metaTitle  || generated.title,
          meta_description: generated.metaDesc   || excerpt,
          reading_time:     readingTime,
          word_count:       wordCount,
          ai_score:         7,
          published:        true,
          source_url:       story.link  || null,
          source_headline:  story.title,
          published_at:     new Date().toISOString(),
        };

        // savePost() injects site_name automatically
        await savePost(post);

        results.published++;
        processed++;
        results.posts.push({ slug, title: generated.title, category: generated.category });
        pingIndexNow(`${siteConfig.siteUrl}/${slug}`).catch(() => {});

      } catch (err) {
        results.errors.push({ story: story.title, error: err.message });
      }
    }

    return Response.json({
      success: results.published > 0,
      site:    process.env.SITE_NAME || 'yojanasamachar',
      ...results,
      duration_seconds: ((Date.now() - start) / 1000).toFixed(2),
    });

  } catch (err) {
    return Response.json({
      success: false, error: err.message,
      site: process.env.SITE_NAME || 'yojanasamachar',
      ...results,
      duration_seconds: ((Date.now() - start) / 1000).toFixed(2),
    }, { status: 500 });
  }
}
