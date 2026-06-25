import Groq from 'groq-sdk';
import siteConfig from '@/config/site.config';

// ─── Lazy Groq init ──────────────────────────────────────────
let _groq = null;
function getGroq() {
  if (!_groq) _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return _groq;
}

// ─── Banned phrases ──────────────────────────────────────────
const BANNED_PHRASES = [
  'Furthermore',
  'Moreover',
  'In this article',
  'It is important to note',
  'It is worth noting',
  'It should be noted',
  'One must consider',
  'In light of',
  'With regard to',
  'It is important to',
  'Needless to say',
  'As previously mentioned',
  'It goes without saying',
  'In terms of',
  'Delve into',
  'In conclusion',
  'In summary',
  'To summarize',
  'Robust',
  'Comprehensive',
  'Firstly',
  'Secondly',
  'Thirdly',
];

// AI pattern detection for quality check
const AI_PATTERNS = [
  'it is worth noting',
  'it should be noted',
  'one must consider',
  'in light of',
  'with regard to',
  'it is important to',
  'needless to say',
  'as previously mentioned',
  'it goes without saying',
  'in terms of',
];

// ─── System prompt ───────────────────────────────────────────
const SYSTEM_PROMPT = `${siteConfig.aiPersonality}

BANNED PHRASES — never use any of these:
${BANNED_PHRASES.map((p) => `- ${p}`).join('\n')}

ANTI-AI-DETECTION RULES (follow strictly):
1. VARY sentence length aggressively: 4 words. Then a longer sentence that builds the point with specific detail. Then medium. Never 3 sentences the same length in a row.
2. USE contractions always: it's, don't, won't, here's, that's, they're, you'll
3. START 2–3 sentences with "And" or "But" — real journalists do this
4. ADD one personal aside per section: "And honestly?", "Here's the thing —", "Look,", "Real talk:"
5. INCLUDE one rhetorical question per article
6. USE em-dashes for interruptions — like this — instead of commas where natural
7. NUMBERS in first paragraph always — specific, not vague
8. ONE opinion stated as fact: e.g. "This is the most important announcement in months."
9. ACTIVE voice always. Never passive.
10. NEVER start with "Are you" or "Have you ever" — overused AI openers

Output format (EXACTLY — no text before TITLE:):
TITLE: [compelling article title]
META_TITLE: [max 60 chars, SEO-optimised]
META_DESC: [max 155 chars, includes primary keyword]
TAGS: [tag1, tag2, tag3, tag4, tag5]
CATEGORY: [one of: scheme-news, pm-yojana, state-schemes, how-to-apply]
CONTENT:
[Full article in HTML. Use <h2> and <h3> for headings. Use <p> for paragraphs. Use <ul><li> for lists. Use <strong> for key terms. Minimum 800 words. Must include: overview, eligibility criteria, required documents (Aadhaar, ration card, Jan Dhan etc.), step-by-step application process, benefit amounts, official portal links.]
FAQ:
Q: [question 1]
A: [answer 1]

Q: [question 2]
A: [answer 2]

Q: [question 3]
A: [answer 3]

Q: [question 4]
A: [answer 4]
END`;

// ─── Humanize pass (second Groq call) ────────────────────────
async function humanizeContent(rawContent) {
  try {
    const completion = await getGroq().chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 2000,
      temperature: 0.9,
      messages: [
        {
          role: 'user',
          content: `Rewrite this article to sound like a real human journalist wrote it.

RULES:
1. Break long sentences into 2–3 shorter ones
2. Add 1–2 conversational asides like "And honestly?" or "Here's the thing —"
3. Use contractions: "it's", "don't", "here's", "that's"
4. Start 2–3 sentences with "And" or "But" (humans do this, AI avoids it)
5. Add one slightly informal phrase per section
6. Remove any remaining formal or academic phrasing
7. Keep all facts, numbers, and quotes EXACTLY the same
8. Keep the same HTML structure and headings
9. Output ONLY the rewritten HTML — no preamble, no explanation

ARTICLE:
${rawContent}`,
        },
      ],
    });
    return completion.choices[0]?.message?.content?.trim() || rawContent;
  } catch (err) {
    console.warn('humanizeContent failed, using original:', err.message);
    return rawContent;
  }
}

// ─── Parsers ─────────────────────────────────────────────────
function parseSections(content) {
  if (!content) return [];

  const h2Splits = content.split(/(?=<h2[\s>])/i);
  if (h2Splits.length > 1) {
    return h2Splits
      .map((block) => {
        const headingMatch = block.match(/<h2[^>]*>(.*?)<\/h2>/i);
        const body = block.replace(/<h2[^>]*>.*?<\/h2>/i, '').trim();
        return {
          heading: headingMatch ? headingMatch[1].replace(/<[^>]+>/g, '').trim() : null,
          body,
          type: 'section',
        };
      })
      .filter((s) => s.body || s.heading);
  }

  const paragraphs = content.split(/\n\n+/);
  if (paragraphs.length > 1) {
    return paragraphs
      .filter((p) => p.trim())
      .map((p) => ({ heading: null, body: p.trim(), type: 'paragraph' }));
  }

  return [{ heading: null, body: content, type: 'paragraph' }];
}

function parseFAQ(faqText) {
  if (!faqText) return [];
  const faqs = [];
  const matches = faqText.matchAll(/Q:\s*(.*?)\nA:\s*([\s\S]*?)(?=\nQ:|$)/g);
  for (const m of matches) {
    const q = m[1].trim();
    const a = m[2].trim();
    if (q && a) faqs.push({ question: q, answer: a });
  }
  return faqs;
}

function parseResponse(text) {
  // Line-by-line parser for single-line fields — avoids regex grabbing multi-line content
  const getLine = (key) => {
    const lines = text.split('\n');
    const line = lines.find(l => l.trim().startsWith(key + ':'));
    if (!line) return '';
    return line.replace(new RegExp('^' + key + ':\\s*'), '').trim().slice(0, 300);
  };

  const title      = getLine('TITLE');
  const metaTitle  = getLine('META_TITLE');
  // META_DESC must be single line, max 160 chars — never grab content below it
  const metaDesc   = getLine('META_DESC').slice(0, 160);
  const tagsRaw    = getLine('TAGS');
  const category   = getLine('CATEGORY');

  // Multi-line fields: use section markers
  const contentRaw = (() => {
    const start = text.indexOf('CONTENT:');
    const end   = text.indexOf('\nFAQ:');
    const endB  = text.indexOf('\nEND');
    if (start === -1) return '';
    const to = end !== -1 ? end : endB !== -1 ? endB : text.length;
    return text.slice(start + 8, to).trim();
  })();

  const faqRaw = text.includes('FAQ:')
    ? (text.split('FAQ:')[1]?.split('END')[0] || '')
    : '';

  const tags = tagsRaw.split(',').map((t) => t.trim()).filter(Boolean);
  const sections = parseSections(contentRaw);
  const faq = parseFAQ(faqRaw);

  return {
    title,
    metaTitle: metaTitle || title,
    metaDesc,
    tags,
    category: category || 'scheme-news',
    content: { hook: sections[0]?.body || '', sections },
    faq,
    rawContent: contentRaw,
  };
}

// ─── Quality check ───────────────────────────────────────────
function qualityCheck(parsed, attempt) {
  let score = 10;
  const text = parsed.rawContent || '';
  const lower = text.toLowerCase();

  // Banned phrases
  for (const phrase of BANNED_PHRASES) {
    if (text.includes(phrase)) {
      console.warn(`Attempt ${attempt}: banned phrase detected — "${phrase}"`);
      score -= 1;
    }
  }

  // AI pattern check
  for (const pattern of AI_PATTERNS) {
    if (lower.includes(pattern)) {
      console.warn(`Attempt ${attempt}: AI pattern detected — "${pattern}"`);
      score -= 1;
    }
  }

  if (!parsed.title || parsed.title.length < 10)           score -= 3;
  if (!parsed.rawContent || parsed.rawContent.length < 400) score -= 3;
  if (!parsed.metaDesc || parsed.metaDesc.length < 50)      score -= 1;
  if (!parsed.faq || parsed.faq.length < 2)                 score -= 1;

  return score;
}

// ─── Main generator ──────────────────────────────────────────
export async function generateBlogPost(story) {
  const groq = getGroq();

  const prompt = `Write a detailed, helpful article about this government scheme news for Indian citizens:

Title: ${story.title}
Description: ${story.description || ''}
Source: ${story.link || ''}

Focus on: who benefits, eligibility criteria, documents needed (Aadhaar, ration card, Jan Dhan account), step-by-step application process, benefit amounts, official portal links.
Primary keyword to include naturally: ${siteConfig.primaryKeyword}
Write at least 800 words.`;

  let lastParsed = null;
  let lastScore = 0;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.85,
        frequency_penalty: 0.4,
        presence_penalty: 0.3,
        max_tokens: 3000,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user',   content: prompt },
        ],
      });

      const text   = res.choices[0]?.message?.content || '';
      const parsed = parseResponse(text);
      const score  = qualityCheck(parsed, attempt);

      console.log(`Generation attempt ${attempt}: score=${score}`);

      if (score >= 7) {
        // Humanize pass — second Groq call
        parsed.rawContent = await humanizeContent(parsed.rawContent);
        // Re-parse sections from humanized content
        parsed.content.sections = parseSections(parsed.rawContent);
        parsed.content.hook = parsed.content.sections[0]?.body || '';
        return parsed;
      }

      if (score > lastScore) {
        lastScore  = score;
        lastParsed = parsed;
      }
    } catch (err) {
      console.error(`Generation attempt ${attempt} failed:`, err.message);
    }
  }

  // Best of 3 attempts — still humanize before returning
  if (lastParsed) {
    lastParsed.rawContent = await humanizeContent(lastParsed.rawContent);
    lastParsed.content.sections = parseSections(lastParsed.rawContent);
    lastParsed.content.hook = lastParsed.content.sections[0]?.body || '';
  }
  return lastParsed;
}

// ─── Slug generator ──────────────────────────────────────────
export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/₹/g, 'rs')           // ₹2,000 → rs2000
    .replace(/[^\w\s-]/g, ' ')     // remove special chars, keep spaces
    .replace(/\s+/g, '-')          // spaces to hyphens
    .replace(/-+/g, '-')           // collapse multiple hyphens
    .replace(/^-|-$/g, '')         // trim leading/trailing hyphens
    .trim()
    .slice(0, 70);                 // keep under 70 so suffix fits in 80
}

// Appends a short timestamp suffix to guarantee DB uniqueness
// Use when slug collision detected
export function slugifyUnique(text) {
  const base = slugify(text);
  const suffix = Date.now().toString(36).slice(-5); // e.g. "k3f2a"
  return `${base}-${suffix}`.slice(0, 80);
}

// ─── Multilingual stub ───────────────────────────────────────
export async function rewritePostInLanguage(post, language) {
  // Future: translate via Groq
  return post;
}
