import siteConfig from '@/config/site.config';

const MAX_AGE = 48 * 60 * 60 * 1000; // 48 hours in ms

// ─── XML Parser ──────────────────────────────────────────────
function parseRSSXML(xml, sourceName) {
  const items = [];
  const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g);
  for (const match of itemMatches) {
    const block = match[1];
    const title =
      block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/s)?.[1] ||
      block.match(/<title>(.*?)<\/title>/s)?.[1] || '';
    const link =
      block.match(/<link>(.*?)<\/link>/s)?.[1] ||
      block.match(/<guid[^>]*isPermaLink="true"[^>]*>(.*?)<\/guid>/s)?.[1] ||
      block.match(/<guid[^>]*>(.*?)<\/guid>/s)?.[1] || '';
    const pubDate =
      block.match(/<pubDate>(.*?)<\/pubDate>/s)?.[1] || '';
    const description =
      block.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/s)?.[1] ||
      block.match(/<description>([\s\S]*?)<\/description>/s)?.[1] || '';

    if (!title.trim() || !link.trim()) continue;

    // Age gate at parse time
    if (pubDate) {
      const age = Date.now() - new Date(pubDate).getTime();
      if (age > MAX_AGE || age < 0) continue;
    }

    items.push({
      title: title.trim(),
      link: link.trim(),
      pubDate: pubDate.trim(),
      description: description.replace(/<[^>]+>/g, '').trim().slice(0, 500),
      source: sourceName || 'rss',
    });
  }
  return items;
}

// ─── Source 1: Google News RSS ───────────────────────────────
async function fetchGoogleNews(urls) {
  const results = [];
  for (const url of (urls || [])) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SyndicateHub/1.0; +https://yojanasamachar.in)',
          'Accept': 'application/rss+xml, application/xml, text/xml',
        },
        next: { revalidate: 0 },
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) {
        console.warn(`Google News RSS ${url} → ${res.status}`);
        continue;
      }
      const xml = await res.text();
      const items = parseRSSXML(xml, 'google-news');
      results.push(...items);
    } catch (err) {
      console.error('Google News RSS error:', url, err.message);
    }
  }
  return results;
}

// ─── Source 2: Bing News RSS ─────────────────────────────────
async function fetchBingNews(keywords) {
  const items = [];
  const queries = Array.isArray(keywords)
    ? keywords.slice(0, 2)
    : [String(keywords)];

  for (const q of queries) {
    try {
      const url = `https://www.bing.com/news/search?q=${encodeURIComponent(q)}&format=rss`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SyndicateHub/1.0)',
          'Accept': 'application/rss+xml, application/xml, text/xml',
        },
        next: { revalidate: 0 },
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) {
        console.warn(`Bing News RSS "${q}" → ${res.status}`);
        continue;
      }
      const xml = await res.text();
      items.push(...parseRSSXML(xml, 'bing-news'));
    } catch (err) {
      console.error('Bing News RSS error:', q, err.message);
    }
  }
  return items;
}

// ─── Source 3: Reddit JSON ───────────────────────────────────
async function fetchReddit(subreddits) {
  const items = [];
  for (const sub of (subreddits || []).slice(0, 3)) {
    try {
      const url = `https://www.reddit.com/r/${sub}/hot.json?limit=15`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'SyndicateHub/1.0 news aggregator' },
        next: { revalidate: 0 },
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) {
        console.warn(`Reddit r/${sub} → ${res.status}`);
        continue;
      }
      const json = await res.json();
      const posts = json?.data?.children || [];

      const fresh = posts.filter((p) => {
        if (p.data.stickied) return false;
        const age = Date.now() - p.data.created_utc * 1000;
        return age < 24 * 60 * 60 * 1000 && age > 0;
      });

      items.push(
        ...fresh.slice(0, 4).map((p) => ({
          title: p.data.title,
          link: `https://reddit.com${p.data.permalink}`,
          pubDate: new Date(p.data.created_utc * 1000).toUTCString(),
          description: (p.data.selftext || p.data.title).slice(0, 400),
          source: `r/${sub}`,
        }))
      );
    } catch (err) {
      console.error(`Reddit r/${sub} error:`, err.message);
    }
  }
  return items;
}

// ─── Source 4: Yahoo Finance RSS ─────────────────────────────
async function fetchYahooFinance(keywords) {
  const items = [];
  const queries = Array.isArray(keywords)
    ? keywords.slice(0, 2)
    : [String(keywords)];

  for (const q of queries) {
    try {
      const url = `https://feeds.finance.yahoo.com/rss/2.0/headline?s=${encodeURIComponent(q)}&region=IN&lang=en-IN`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SyndicateHub/1.0)' },
        next: { revalidate: 0 },
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) {
        console.warn(`Yahoo Finance RSS "${q}" → ${res.status}`);
        continue;
      }
      const xml = await res.text();
      items.push(...parseRSSXML(xml, 'yahoo-finance'));
    } catch (err) {
      console.error('Yahoo Finance RSS error:', q, err.message);
    }
  }
  return items;
}

// ─── Dedup by first 60 chars of title ────────────────────────
function dedup(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = item.title.slice(0, 60).toLowerCase().trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ─── Sort newest first ────────────────────────────────────────
function sortByRecency(items) {
  return [...items].sort((a, b) => {
    const at = a.pubDate ? new Date(a.pubDate).getTime() : 0;
    const bt = b.pubDate ? new Date(b.pubDate).getTime() : 0;
    return bt - at;
  });
}

// ─── Main export: fetch all 4 sources ────────────────────────
export async function fetchAllSources() {
  const rssSources  = siteConfig.rssSources  || [];
  const redditSubs  = siteConfig.reddit      || [];
  const keywords    = siteConfig.secondaryKeywords || [siteConfig.primaryKeyword];

  // All 4 in parallel — Promise.allSettled so one failure never breaks the rest
  const [googleResult, bingResult, redditResult, yahooResult] =
    await Promise.allSettled([
      fetchGoogleNews(rssSources),
      fetchBingNews(keywords),
      fetchReddit(redditSubs),
      fetchYahooFinance(keywords),
    ]);

  const allItems = [
    ...(googleResult.status === 'fulfilled' ? googleResult.value : []),
    ...(bingResult.status   === 'fulfilled' ? bingResult.value   : []),
    ...(redditResult.status === 'fulfilled' ? redditResult.value : []),
    ...(yahooResult.status  === 'fulfilled' ? yahooResult.value  : []),
  ];

  if (allItems.length === 0) {
    console.warn('fetchAllSources: all 4 sources returned 0 items');
    return [];
  }

  const deduped = dedup(allItems);
  return sortByRecency(deduped);
}

// ─── Score + pick the best story ─────────────────────────────
export function selectBestStory(items) {
  if (!items || items.length === 0) return null;

  const keywords = [
    siteConfig.primaryKeyword || '',
    ...(siteConfig.secondaryKeywords || []),
  ].map((k) => k.toLowerCase()).filter(Boolean);

  const scored = items.map((item) => {
    const text = `${item.title} ${item.description}`.toLowerCase();
    let score = 0;

    for (const kw of keywords) {
      if (text.includes(kw)) score += 2;
    }

    // Recency bonus
    if (item.pubDate) {
      const ageHours = (Date.now() - new Date(item.pubDate).getTime()) / 3_600_000;
      if (ageHours < 6)       score += 5;
      else if (ageHours < 12) score += 3;
      else if (ageHours < 24) score += 2;
      else if (ageHours < 48) score += 1;
    }

    // Source diversity bonus — prefer google/bing over reddit for factual content
    if (item.source === 'google-news') score += 1;
    if (item.source === 'bing-news')   score += 1;

    return { ...item, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0];
}
