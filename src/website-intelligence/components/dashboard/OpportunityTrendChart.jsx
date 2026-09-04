import { AreaChart, Area } from '@/components/charts/area-chart';
import { Grid } from '@/components/charts/grid';
import { XAxis } from '@/components/charts/x-axis';
import { ChartTooltip } from '@/components/charts/tooltip';
import ChartCard from './ChartCard';

export default function OpportunityTrendChart({ data = [] }) {
  const hasData = data.length > 0;

  return (
    <ChartCard
      title="Opportunity trend"
      description="Cumulative opportunities discovered across your crawls."
      empty={!hasData ? 'Run more analyses to see how opportunity volume changes over time.' : null}
    >
      {hasData && (
        <AreaChart data={data} aspectRatio="2.2 / 1" className="w-full">
          <Grid horizontal />
          <Area
            dataKey="opportunities"
            fill="var(--chart-line-primary)"
            stroke="var(--chart-line-primary)"
            fillOpacity={0.25}
          />
          <XAxis />
          <ChartTooltip />
        </AreaChart>
      )}
    </ChartCard>
  );
}
