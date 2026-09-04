/**
 * Transforms audit / history data into chart-ready shapes.
 * Pages pass the output into Bklit chart components — no fake values here.
 */

function parseDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Cumulative opportunity counts across completed crawls (area / line trend). */
export function buildOpportunityTrend(auditHistory = []) {
  const points = auditHistory
    .map((item) => {
      const date = parseDate(item.completedAt || item.createdAt);
      if (!date) return null;
      return {
        date,
        opportunities: item.opportunityCount ?? 0,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.date - b.date);

  if (points.length === 0) return [];

  // Cumulative total helps the area chart communicate portfolio growth.
  let running = 0;
  return points.map((point) => {
    running += point.opportunities;
    return { date: point.date, opportunities: running };
  });
}

/** Top-scoring services for the current website (bar chart). */
export function buildOpportunitiesByService(opportunities = [], limit = 8) {
  return [...opportunities]
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, limit)
    .map((opp) => {
      const name = opp.serviceName || 'Unknown service';
      return {
        name: name.length > 28 ? `${name.slice(0, 26)}…` : name,
        score: opp.score ?? 0,
      };
    });
}

/** Average analysis confidence across opportunities (0–100). */
export function buildAverageConfidence(opportunities = []) {
  const withConfidence = opportunities.filter((o) => typeof o.confidence === 'number');
  if (withConfidence.length === 0) return null;
  const avg =
    withConfidence.reduce((sum, o) => sum + o.confidence, 0) / withConfidence.length;
  return Math.round(avg * 100);
}

/** Intelligence pipeline funnel for the loaded website. */
export function buildAnalysisFunnel(audit, emails = []) {
  if (!audit) return [];

  const crawl = audit.crawl || {};
  const pagesDiscovered = crawl.pagesDiscovered ?? crawl.pages?.length ?? 0;
  const pagesAnalyzed = crawl.pagesAnalyzed ?? 0;
  const servicesDetected = (audit.capabilities || []).filter((c) =>
    ['detected', 'likely'].includes(c.status)
  ).length;
  const opportunities = audit.opportunities?.length ?? 0;
  const emailsGenerated = emails.length;
  const emailsSent = emails.filter((e) => e.status === 'sent').length;

  return [
    { label: 'Website', value: 1 },
    { label: 'Pages discovered', value: pagesDiscovered },
    { label: 'Pages crawled', value: pagesAnalyzed },
    { label: 'Services detected', value: servicesDetected },
    { label: 'Opportunities', value: opportunities },
    { label: 'Emails generated', value: emailsGenerated },
    { label: 'Emails sent', value: emailsSent },
  ];
}
