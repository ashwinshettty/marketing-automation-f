import {
  buildAnalysisFunnel,
  buildAverageConfidence,
  buildOpportunitiesByService,
  buildOpportunityTrend,
} from '@/lib/dashboardCharts';
import OpportunityTrendChart from './OpportunityTrendChart';
import OpportunityServiceChart from './OpportunityServiceChart';
import OpportunityConfidenceGauge from './OpportunityConfidenceGauge';
import AnalysisFunnel from './AnalysisFunnel';

/**
 * Dashboard analytics section — receives data from the page, renders Bklit charts.
 */
export default function DashboardCharts({ audit, auditHistory = [], emails = [] }) {
  const opportunityTrend = buildOpportunityTrend(auditHistory);
  const opportunitiesByService = buildOpportunitiesByService(audit?.opportunities);
  const averageConfidence = buildAverageConfidence(audit?.opportunities);
  const analysisFunnel = buildAnalysisFunnel(audit, emails);

  const hasAnyChart =
    opportunityTrend.length > 0 ||
    opportunitiesByService.length > 0 ||
    averageConfidence != null ||
    analysisFunnel.length > 1;

  if (!hasAnyChart) return null;

  return (
    <section aria-label="Intelligence analytics" className="space-y-3">
      <div>
        <h2 className="section-title">Intelligence analytics</h2>
        <p className="body-text mt-0.5">
          Trends and pipeline health for the loaded website and your crawl history.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <OpportunityTrendChart data={opportunityTrend} />
        </div>
        <OpportunityConfidenceGauge value={averageConfidence} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <OpportunityServiceChart data={opportunitiesByService} />
        <AnalysisFunnel data={analysisFunnel} />
      </div>
    </section>
  );
}
