import { getSupabaseAdmin } from '@/lib/supabase';
import { verifyCronSecret } from '@/lib/security';

export const dynamic = 'force-dynamic';

const siteConfig = require('@/config/site.config');
const siteName   = process.env.SITE_NAME || 'yojanasamachar';

export async function GET(request) {
  if (!verifyCronSecret(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = getSupabaseAdmin();
    const { data: posts, error } = await db
      .from('posts')
      .select('id, title, excerpt, content, meta_description')
      .eq('site_name', siteName)
      .or('excerpt.is.null,excerpt.eq.');

    if (error) throw error;

    let fixed = 0;
    for (const post of posts || []) {
      let excerpt = '';

      // 1. meta_description
      if (post.meta_description && post.meta_description.length > 30) {
        excerpt = post.meta_description.slice(0, 200);
      } else {
        // 2. content.hook or sections[0].body
        let content = post.content;
        if (typeof content === 'string') {
          try { content = JSON.parse(content); } catch {}
        }
        if (content?.hook) {
          const plain = content.hook.replace(/<[^>]+>/g, '').trim();
          if (plain.length > 30) excerpt = plain.slice(0, 200);
        } else if (content?.sections?.[0]?.body) {
          const plain = content.sections[0].body.replace(/<[^>]+>/g, '').trim();
          if (plain.length > 30) excerpt = plain.slice(0, 200);
        }
      }

      // 4. title + tagline fallback
      if (!excerpt) {
        excerpt = `${post.title} — ${siteConfig.tagline}`.slice(0, 200);
      }

      await db.from('posts').update({ excerpt }).eq('id', post.id).eq('site_name', siteName);
      fixed++;
    }

    return Response.json({ success: true, fixed, total: posts?.length || 0, site: siteName });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
