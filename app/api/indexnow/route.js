import { verifyCronSecret } from '@/lib/security';

export const dynamic = 'force-dynamic';

const siteConfig = require('@/config/site.config');

export async function POST(request) {
  if (!verifyCronSecret(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return Response.json({ error: 'URL required' }, { status: 400 });
    }

    const key = process.env.INDEX_NOW_KEY;
    if (!key) {
      return Response.json({ error: 'INDEX_NOW_KEY not set' }, { status: 500 });
    }

    const pingUrl = `https://api.indexnow.org/indexnow?url=${encodeURIComponent(url)}&key=${key}&keyLocation=${encodeURIComponent(siteConfig.siteUrl + '/' + key + '.txt')}`;
    const res = await fetch(pingUrl);
    return Response.json({ success: res.ok, status: res.status, url });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
