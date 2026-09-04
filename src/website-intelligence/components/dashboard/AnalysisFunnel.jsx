import { FunnelChart } from '@/components/charts/funnel-chart';
import ChartCard from './ChartCard';

export default function AnalysisFunnel({ data = [] }) {
  const hasData = data.length > 1;

  return (
    <ChartCard
      title="Analysis pipeline"
      description="How the crawl progressed from pages to outreach."
      empty={!hasData ? 'Load a completed analysis to see the intelligence pipeline.' : null}
    >
      {hasData && (
        <FunnelChart
          data={data}
          orientation="horizontal"
          color="var(--chart-line-primary)"
          className="w-full min-h-[220px]"
          showLabels
          showValues
          showPercentage
          gap={6}
        />
      )}
    </ChartCard>
  );
}
