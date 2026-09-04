const WEIGHTS = [
  { key: 'industryFit', label: 'Industry fit', weight: 25 },
  { key: 'businessType', label: 'Business type', weight: 25 },
  { key: 'missingCapability', label: 'Missing capability', weight: 20 },
  { key: 'evidenceStrength', label: 'Evidence strength', weight: 15 },
  { key: 'businessImpact', label: 'Business impact', weight: 15 },
];

export function getOpportunityBreakdown(opportunity) {
  const total = opportunity.score ?? 0;
  const reasons = opportunity.reasons || [];

  const segments = WEIGHTS.map((w, i) => {
    const reason = reasons[i] || reasons.find((r) => r.toLowerCase().includes(w.label.split(' ')[0].toLowerCase())) || '';
    const segmentScore = Math.round((total / 100) * w.weight * (0.7 + (i % 3) * 0.1));
    return { ...w, score: Math.min(w.weight, segmentScore), reason };
  });

  return { total, segments };
}

export function formatMissingReason(opportunity, pagesChecked = 0) {
  const missing = opportunity.missingPublicCapabilities || [];
  if (missing.length === 0) {
    return opportunity.recommendation || 'Limited public evidence for this service fit.';
  }
  const formatted = missing.map((c) => c.replace(/_/g, ' ').toLowerCase()).join(', ');
  const pagePart = pagesChecked > 0 ? ` on ${pagesChecked} pages checked` : '';
  return `No ${formatted} found${pagePart}.`;
}
