import { Gauge } from '@/components/charts/gauge';
import ChartCard from './ChartCard';

export default function OpportunityConfidenceGauge({ value, label = 'Analysis confidence' }) {
  const hasValue = value != null && value > 0;

  return (
    <ChartCard
      title="Opportunity confidence"
      description="Average confidence across scored opportunities on this website."
      empty={!hasValue ? 'Confidence scores appear once opportunities are scored.' : null}
      className="flex flex-col"
    >
      {hasValue && (
        <div className="flex flex-1 items-center justify-center py-2">
          <Gauge
            value={value}
            centerValue={value}
            suffix="%"
            defaultLabel={label}
            spacing={22}
            className="w-full max-w-[240px]"
          />
        </div>
      )}
    </ChartCard>
  );
}
