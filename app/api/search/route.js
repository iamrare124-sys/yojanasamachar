import { searchPosts } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const url = new URL(request.url);
  const q = (url.searchParams.get('q') || '').trim();

  if (!q || q.length < 2) {
    return Response.json({ results: [], error: 'Query must be at least 2 characters' }, { status: 400 });
  }

  try {
    const results = await searchPosts(q, 20);
    return Response.json({ results, count: results.length });
  } catch (err) {
    return Response.json({ results: [], error: err.message }, { status: 500 });
  }
}
