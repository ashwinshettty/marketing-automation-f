const PRIORITY_PATTERNS = [
  { pattern: /^\/$|\/home|\/index/i, label: 'homepage', score: 100 },
  { pattern: /\/services?/i, label: 'services', score: 95 },
  { pattern: /\/pricing/i, label: 'pricing', score: 80 },
  { pattern: /\/contact/i, label: 'contact', score: 85 },
  { pattern: /\/about/i, label: 'about', score: 70 },
  { pattern: /\/faq/i, label: 'faq', score: 65 },
  { pattern: /\/blog|\/news/i, label: 'blog', score: 30 },
  { pattern: /\/privacy|\/terms|\/legal/i, label: 'legal', score: 5 },
];

export function getPagePriority(url) {
  try {
    const pathname = new URL(url).pathname;
    for (const { pattern, label, score } of PRIORITY_PATTERNS) {
      if (pattern.test(pathname)) return { label, score };
    }
    return { label: 'other', score: 50 };
  } catch {
    return { label: 'unknown', score: 0 };
  }
}

export function formatPagePath(url) {
  try {
    const parsed = new URL(url);
    return `${parsed.hostname}${parsed.pathname}${parsed.search}`;
  } catch {
    return url;
  }
}
