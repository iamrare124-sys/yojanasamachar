import siteConfig from '@/config/site.config';

export async function fetchImage(query) {
  // Try Pexels first
  if (process.env.PEXELS_API_KEY) {
    try {
      const res = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape`,
        { headers: { Authorization: process.env.PEXELS_API_KEY } }
      );
      if (res.ok) {
        const data = await res.json();
        const photo = data.photos?.[0];
        if (photo) {
          return {
            url: photo.src.large2x || photo.src.large,
            alt: photo.alt || query,
            credit: `Photo by ${photo.photographer} on Pexels`,
          };
        }
      }
    } catch (e) {
      console.error('Pexels error:', e.message);
    }
  }

  // Try Unsplash
  if (process.env.UNSPLASH_ACCESS_KEY) {
    try {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape`,
        { headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` } }
      );
      if (res.ok) {
        const data = await res.json();
        const photo = data.results?.[0];
        if (photo) {
          return {
            url: photo.urls.regular,
            alt: photo.alt_description || query,
            credit: `Photo by ${photo.user.name} on Unsplash`,
          };
        }
      }
    } catch (e) {
      console.error('Unsplash error:', e.message);
    }
  }

  // Fallback to a placeholder
  return {
    url: `https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=1200&q=80`,
    alt: 'Government scheme India',
    credit: '',
  };
}

export function getImageKeyword(title) {
  const keywords = siteConfig.imageKeywords || ['government scheme india'];
  const idx = Math.floor(Math.random() * keywords.length);
  return keywords[idx];
}
