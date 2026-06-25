const yojanasamacharConfig = {
  niche: 'yojanasamachar',
  siteName: 'YojanaSamachar',
  domain: 'yojanasamachar.in',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://yojanasamachar.in',
  tagline: 'Sarkari Yojana & Government Schemes Guide',
  description:
    'Latest government schemes, PM Yojana benefits, application process and eligibility for Indian citizens.',
  author: {
    name: 'Deepak Kumar',
    title: 'Government Policy Expert | 7 Years Experience',
    bio: 'Deepak Kumar has 7 years experience covering Indian government schemes and policy. He helps Indian citizens understand and access government benefits they are entitled to through YojanaSamachar.in',
  },
  primaryKeyword: 'government schemes india',
  secondaryKeywords: [
    'PM Kisan yojana',
    'sarkari yojana 2026',
    'government scheme eligibility',
    'pradhan mantri yojana',
  ],
  rssSources: [
    'https://news.google.com/rss/search?q=government+scheme+yojana+india+2026&hl=en-IN&gl=IN&ceid=IN:en',
    'https://news.google.com/rss/search?q=PM+pradhan+mantri+yojana+india&hl=en-IN&gl=IN&ceid=IN:en',
    'https://news.google.com/rss/search?q=sarkari+yojana+benefit+application+india&hl=en-IN&gl=IN&ceid=IN:en',
  ],
  reddit: ['india', 'IndiaSpeaks', 'indianews'],
  liveData: {
    provider: 'static',
    symbols: ['Active Schemes Count', 'New Schemes This Month'],
    staticValues: {
      'Active Schemes Count': '500+',
      'New Schemes This Month': '12',
    },
  },
  imageKeywords: [
    'indian government scheme village',
    'PM yojana rural india',
    'government welfare india',
  ],
  categories: [
    { slug: 'scheme-news', label: 'Scheme News' },
    { slug: 'pm-yojana', label: 'PM Yojana' },
    { slug: 'state-schemes', label: 'State Schemes' },
    { slug: 'how-to-apply', label: 'How To Apply' },
  ],
  cron: '0 8 * * *',
  aiPersonality: `You are Deepak Kumar, government policy expert at YojanaSamachar.in. Write like a helpful government insider who wants citizens to get their rights. Always mention eligibility criteria, documents needed, and application links. India-specific: ration card, Aadhaar, Jan Dhan account. Simple language, no jargon. End with exact steps to apply. Never say "Furthermore" or "In this article".`,
  theme: {
    primaryColor: '#c0392b',
    secondaryColor: '#e74c3c',
    accentColor: '#f39c12',
    textColor: '#1a1a1a',
    bgColor: '#ffffff',
  },
};

module.exports = yojanasamacharConfig;
