import { formatEvidenceUrl, formatPath } from './formatters';

function normalizeUrlKey(url) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '').toLowerCase();
    const path = parsed.pathname.replace(/\/$/, '') || '/';
    return `${host}${path}`;
  } catch {
    return String(url).toLowerCase();
  }
}

export function extractCapabilityEvidenceUrls(capability, websiteBase) {
  return [...new Set(
    (capability.evidence || [])
      .map((item) => {
        if (typeof item === 'string') return formatEvidenceUrl(item, websiteBase);
        if (item?.pageUrl) return formatEvidenceUrl(item.pageUrl, websiteBase);
        if (item?.url) return formatEvidenceUrl(item.url, websiteBase);
        if (Array.isArray(item?.evidence) && item.evidence[0]) {
          return formatEvidenceUrl(item.evidence[0], websiteBase);
        }
        return null;
      })
      .filter(Boolean)
  )];
}

export function findPageByEvidenceUrl(pages, evidenceUrl) {
  const targetKey = normalizeUrlKey(evidenceUrl);
  return pages.find((page) => normalizeUrlKey(page.url) === targetKey) || null;
}

export function resolveCapabilityEvidencePages(capability, audit) {
  const pages = audit?.crawl?.pages || [];
  const websiteBase = audit?.website;
  const evidenceUrls = extractCapabilityEvidenceUrls(capability, websiteBase);

  const matches = [];
  const seenPageIds = new Set();

  for (const url of evidenceUrls) {
    const page = findPageByEvidenceUrl(pages, url);
    if (!page || seenPageIds.has(page.id)) continue;
    seenPageIds.add(page.id);
    matches.push({ url, page });
  }

  return matches;
}

export function formatCapabilityEvidenceLabel(url) {
  return formatPath(url);
}
