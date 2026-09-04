import { BarChart } from '@/components/charts/bar-chart';
import { Bar } from '@/components/charts/bar';
import { BarXAxis } from '@/components/charts/bar-x-axis';
import { BarYAxis } from '@/components/charts/bar-y-axis';
import { ChartTooltip } from '@/components/charts/tooltip';
import ChartCard from './ChartCard';

export default function OpportunityServiceChart({ data = [] }) {
  const hasData = data.length > 0;

  return (
    <ChartCard
      title="Opportunities by service"
      description="Highest-scoring services not publicly detected on the current website."
      empty={!hasData ? 'No opportunities were scored for this website yet.' : null}
    >
      {hasData && (
        <BarChart
          data={data}
          xDataKey="name"
          orientation="horizontal"
          aspectRatio="1.4 / 1"
          className="w-full"
          margin={{ top: 8, right: 16, bottom: 8, left: 8 }}
        >
          <Bar dataKey="score" fill="var(--chart-line-primary)" stroke="var(--chart-line-primary)" />
          <BarYAxis />
          <BarXAxis />
          <ChartTooltip />
        </BarChart>
      )}
    </ChartCard>
  );
}
