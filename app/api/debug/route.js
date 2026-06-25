// DEBUG ROUTE — Vercel pe deploy karo, browser mein open karo
// /api/debug?secret=YOUR_CRON_SECRET
// Ye route DB mein kya hai exactly dikhayega
// PRODUCTION MEIN DELETE KARO baad mein

import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const url    = new URL(request.url);
  const secret = url.searchParams.get('secret');

  if (secret !== process.env.CRON_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = getSupabaseAdmin();

    // 1. Total posts in DB (no filters)
    const { count: totalCount } = await db
      .from('posts')
      .select('*', { count: 'exact', head: true });

    // 2. All distinct site_name values in DB
    const { data: siteNames } = await db
      .from('posts')
      .select('site_name')
      .limit(200);

    const distinctSites = [...new Set((siteNames || []).map(r => r.site_name))];

    // 3. Posts per site_name
    const siteCounts = {};
    for (const site of distinctSites) {
      const { count } = await db
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('site_name', site);
      siteCounts[site || 'NULL'] = count;
    }

    // 4. Sample 5 posts — show slug + site_name + published
    const { data: sample } = await db
      .from('posts')
      .select('id, slug, title, site_name, published, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    // 5. What SITE_NAME env var is set to right now
    const currentSiteName = process.env.SITE_NAME || '(not set — using default: yojanasamachar)';

    // 6. Posts matching current SITE_NAME
    const { count: matchCount } = await db
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('site_name', process.env.SITE_NAME || 'yojanasamachar')
      .eq('published', true);

    return Response.json({
      env_SITE_NAME:          currentSiteName,
      total_posts_in_db:      totalCount,
      posts_matching_filter:  matchCount,
      distinct_site_names:    distinctSites,
      posts_per_site:         siteCounts,
      latest_5_posts:         sample,
      diagnosis: matchCount === 0
        ? '❌ PROBLEM: site_name mismatch — DB mein alag site_name se save hua, filter alag dhundh raha hai'
        : '✅ OK: posts mil rahe hain — aur problem hai',
    });

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
