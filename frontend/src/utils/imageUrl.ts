export function resolveImageUrl(url?: string): string {
  const base = import.meta.env.BASE_URL || './';
  const prefix = base.endsWith('/') ? base : `${base}/`;
  if (!url) {
    return `${prefix}images/mamidi_pachadi.jpg`;
  }
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const clean = url.startsWith('/') ? url.slice(1) : url;
  return `${prefix}${clean}`;
}

