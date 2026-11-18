import { GaIcon } from '../icons/GoogleAdsIcons';
import { chartMetricById, seriesValue } from './chartMetrics';

const WIDTH = 640;
const HEIGHT = 220;
const PAD = { top: 16, right: 36, bottom: 28, left: 36 };

const hourLabel = (hour) => {
  if (hour === 0 || hour === 24) return '12 AM';
  if (hour === 12) return '12 PM';
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
};

const dayLabel = (iso) => {
  const match = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return '';
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(date);
};

const pointsFor = (values) => {
  const max = Math.max(...values, 0);
  const span = max === 0 ? 1 : max;
  const innerW = WIDTH - PAD.left - PAD.right;
  const innerH = HEIGHT - PAD.top - PAD.bottom;
  return values.map((value, index) => {
    const x = values.length === 1
      ? PAD.left + innerW / 2
      : PAD.left + (index / (values.length - 1)) * innerW;
    const y = PAD.top + innerH - (value / span) * innerH;
    return { x, y };
  });
};

const pathOf = (points) => points
  .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
  .join(' ');

const axisLabels = (series, grain) => {
  if (!series.length) return [];
  if (grain === 'hour') {
    return [0, 4, 8, 12, 16, 20, 23]
      .filter((hour) => hour < series.length)
      .map((hour) => ({ index: hour, label: hourLabel(series[hour]?.hour ?? hour) }));
  }
  if (series.length <= 7) {
    return series.map((point, index) => ({ index, label: dayLabel(point.date) }));
  }
  const middle = Math.floor((series.length - 1) / 2);
  return [0, middle, series.length - 1].map((index) => ({ index, label: dayLabel(series[index]?.date) }));
};

const compact = (value) => {
  const amount = Number(value) || 0;
  if (amount >= 1000) return `${Math.round(amount / 100) / 10}k`;
  if (amount >= 10) return String(Math.round(amount));
  return amount.toFixed(amount >= 1 ? 0 : 1);
};

export default function OverviewChart({
  series = [],
  grain = 'day',
  primaryId = 'clicks',
  secondaryId = 'impressions',
}) {
  const primary = chartMetricById(primaryId);
  const secondary = chartMetricById(secondaryId);
  const primaryValues = series.map((point) => seriesValue(point, primaryId));
  const secondaryValues = series.map((point) => seriesValue(point, secondaryId));
  const primaryPoints = pointsFor(primaryValues);
  const secondaryPoints = pointsFor(secondaryValues);
  const labels = axisLabels(series, grain);
  const primaryMax = Math.max(...primaryValues, 0);
  const secondaryMax = Math.max(...secondaryValues, 0);
  const primaryPath = pathOf(primaryPoints);
  const secondaryPath = pathOf(secondaryPoints);
  const area = primaryPoints.length
    ? `${primaryPath} L ${primaryPoints.at(-1).x.toFixed(1)} ${HEIGHT - PAD.bottom} L ${primaryPoints[0].x.toFixed(1)} ${HEIGHT - PAD.bottom} Z`
    : '';

  return (
    <div className="rounded-2xl border border-[var(--ga-border)] bg-white p-5 shadow-[0_1px_2px_rgba(60,64,67,0.08)]">
      <div className="mb-2 flex items-center justify-end text-[var(--ga-muted)]">
        <button type="button" className="rounded-full p-1.5 hover:bg-[var(--ga-hover)]" aria-label="Download">
          <GaIcon name="download" className="h-4 w-4" />
        </button>
      </div>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-52 w-full" role="img" aria-label={`${primary?.label} and ${secondary?.label}`}>
        <defs>
          <linearGradient id="gaBlueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a73e8" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#1a73e8" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map((step) => {
          const y = PAD.top + ((HEIGHT - PAD.top - PAD.bottom) / 3) * step;
          return <line key={step} x1={PAD.left} x2={WIDTH - PAD.right} y1={y} y2={y} stroke="#e8eaed" strokeWidth="1" />;
        })}
        <text x="4" y={PAD.top + 8} fill="#1a73e8" fontSize="11">{compact(primaryMax)}</text>
        <text x={WIDTH - 32} y={PAD.top + 8} fill="#ea4335" fontSize="11">{compact(secondaryMax)}</text>
        <text x="8" y={HEIGHT - PAD.bottom} fill="#5f6368" fontSize="11">0</text>
        {area ? <path d={area} fill="url(#gaBlueFill)" /> : null}
        {secondaryPath ? <path d={secondaryPath} fill="none" stroke="#ea4335" strokeWidth="2.5" /> : null}
        {primaryPath ? <path d={primaryPath} fill="none" stroke="#1a73e8" strokeWidth="2.5" /> : null}
        {labels.map((item) => {
          const point = primaryPoints[item.index];
          if (!point) return null;
          return (
            <text key={`${item.label}-${item.index}`} x={point.x} y={HEIGHT - 6} fill="#5f6368" fontSize="11" textAnchor="middle">
              {item.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
