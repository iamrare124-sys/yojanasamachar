import siteConfig from '@/config/site.config';

export async function getLiveData() {
  const provider = siteConfig.liveData?.provider || 'static';

  if (provider === 'static') {
    return siteConfig.liveData?.staticValues || {};
  }

  return {};
}

export function formatTickerData(data) {
  return Object.entries(data).map(([label, value]) => ({
    label,
    value: String(value),
  }));
}
