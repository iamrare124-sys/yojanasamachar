import { getSupabaseAdmin } from '@/lib/supabase';
import { verifyCronSecret } from '@/lib/security';

export const dynamic = 'force-dynamic';

const siteConfig = require('@/config/site.config');
const siteName   = process.env.SITE_NAME || 'yojanasamachar';

function cleanText(raw) {
  if (!raw) return '';
  return raw
    .replace(/<[^>]+>/g, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildCleanExcerpt(post) {
  // 1. meta_description — clean it
  if (post.meta_description) {
    const clean = cleanText(post.meta_description);
    // Reject if it contains markdown/html or is too long (content dump)
    if (clean.length > 30 && clean.length < 300 && !clean.includes('##')) {
      return clean.slice(0, 200);
    }
  }

  // 2. content.hook or sections[0].body
  let c = post.content;
  if (typeof c === 'string') {
    try { c = JSON.parse(c); } catch {}
  }
  if (c?.hook) {
    const plain = cleanText(c.hook);
    if (plain.length > 30) return plain.slice(0, 200);
  }
  if (c?.sections?.[0]?.body) {
    const plain = cleanText(c.sections[0].body);
    const firstSentence = plain.split(/[.!?]/)[0];
    if (firstSentence && firstSentence.length > 30) return (firstSentence + '.').slice(0, 200);
    if (plain.length > 30) return plain.slice(0, 200);
  }
  if (c?.rawContent) {
    const plain = cleanText(c.rawContent);
    const firstSentence = plain.split(/[.!?]/)[0];
    if (firstSentence && firstSentence.length > 30) return (firstSentence + '.').slice(0, 200);
  }

  // 3. fallback
  return `${post.title} — ${siteConfig.tagline}`.slice(0, 200);
}

export async function GET(request) {
  if (!verifyCronSecret(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = getSupabaseAdmin();

    // Get ALL posts — fix both empty AND corrupted excerpts (those with ## or <)
    const { data: posts, error } = await db
      .from('posts')
      .select('id, title, excerpt, content, meta_description')
      .eq('site_name', siteName);

    if (error) throw error;

    let fixed = 0;
    for (const post of posts || []) {
      const needsFix = !post.excerpt ||
        post.excerpt.length < 20 ||
        post.excerpt.includes('##') ||
        post.excerpt.includes('<h') ||
        post.excerpt.includes('<p') ||
        post.excerpt.length > 300;

      if (!needsFix) continue;

      const excerpt = buildCleanExcerpt(post);
      await db.from('posts').update({ excerpt }).eq('id', post.id).eq('site_name', siteName);
      fixed++;
    }

    return Response.json({ success: true, fixed, total: posts?.length || 0, site: siteName });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
