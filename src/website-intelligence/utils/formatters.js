export function formatDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export function formatPath(url) {
  try {
    const parsed = new URL(url);
    return parsed.pathname + parsed.search || '/';
  } catch {
    return url;
  }
}

export function resolveEvidenceUrl(url, websiteBase) {
  if (!url) return null;
  try {
    return new URL(url).href;
  } catch {
    if (!websiteBase) return url;
    try {
      return new URL(url, websiteBase).href;
    } catch {
      return url;
    }
  }
}

export function formatEvidenceUrl(url, websiteBase) {
  return resolveEvidenceUrl(url, websiteBase) || url;
}

export function formatCapabilityName(id) {
  if (!id) return '';
  return String(id)
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function priorityLabel(fit) {
  switch (fit) {
    case 'very_high':
      return 'Very high priority';
    case 'high':
      return 'High priority';
    case 'medium':
      return 'Medium priority';
    case 'low':
      return 'Low priority';
    default:
      return 'Opportunity';
  }
}

export function topOpportunityScore(opportunities = []) {
  if (!opportunities.length) return 0;
  return Math.max(...opportunities.map((o) => o.score ?? 0));
}

export function highPriorityCount(opportunities = []) {
  return opportunities.filter((o) => o.fit === 'very_high' || o.fit === 'high').length;
}

/** Mirrors GAP_CONFIDENCE_FLOOR in the backend. */
export const GAP_CONFIDENCE_FLOOR = 0.6;

/**
 * A gap is only safe to pitch when the crawl actively checked the pages where
 * the capability would live and still found nothing.
 */
export function isConfirmedGap(cap) {
  if (!cap || cap.status !== 'not_detected') return false;
  if (cap.verification && cap.verification.verified === false) return false;
  return (cap.confidence ?? 0) >= GAP_CONFIDENCE_FLOOR;
}

export function capabilityGroups(capabilities = []) {
  const detected = capabilities.filter((c) => c.status === 'detected');
  const likely = capabilities.filter((c) => c.status === 'likely');
  const confirmedMissing = capabilities.filter(isConfirmedGap);
  const confirmedIds = new Set(confirmedMissing.map((c) => c.id || c.capability));

  const unverified = capabilities.filter(
    (c) =>
      !['detected', 'likely'].includes(c.status) &&
      c.status !== 'not_observable' &&
      !confirmedIds.has(c.id || c.capability)
  );

  const notObservable = capabilities.filter((c) => c.status === 'not_observable');

  return {
    detected,
    likely,
    confirmedMissing,
    unverified,
    notObservable,
    // Retained for existing callers.
    notDetected: confirmedMissing,
    unknown: unverified,
  };
}

export function capabilityVerificationNote(cap) {
  const verification = cap?.verification;
  if (!verification) return null;

  if (cap.status === 'not_observable') {
    return 'Runs behind the scenes — cannot be confirmed or ruled out from a public website.';
  }

  if (verification.verified === false) {
    return verification.reason || 'Not enough crawl coverage to confirm.';
  }

  const pages = verification.pagesChecked ?? 0;
  const seen = verification.requiredPageTypesSeen || [];
  return `Checked ${pages} page${pages === 1 ? '' : 's'}${seen.length ? ` including ${seen.join(', ')}` : ''}.`;
}
