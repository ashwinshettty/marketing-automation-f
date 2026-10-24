export const PRESETS = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last_7', label: 'Last 7 days' },
  { value: 'last_30', label: 'Last 30 days' },
  { value: 'last_90', label: 'Last 90 days' },
  { value: 'custom', label: 'Custom range' },
];

export const STAGE_LABELS = {
  new: 'New',
  contacted: 'Contacted',
  engaged: 'Engaged',
  qualified: 'Qualified',
  converted: 'Converted',
  lost: 'Lost',
  disqualified: 'Disqualified',
};

export const stageClass = (stage) => {
  if (stage === 'converted') return 'bg-emerald-700 text-white';
  if (stage === 'qualified') return 'bg-emerald-100 text-emerald-800';
  if (stage === 'engaged') return 'bg-indigo-100 text-indigo-800';
  if (stage === 'contacted') return 'bg-brand-yellow/40 text-brand-navy';
  if (stage === 'lost') return 'bg-slate-200 text-slate-700';
  if (stage === 'disqualified') return 'bg-red-100 text-red-800';
  return 'bg-sky-100 text-sky-800';
};

export const formatNumber = (value) =>
  new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(value || 0);

export const formatPercent = (value) => {
  if (value == null || Number.isNaN(value)) return '—';
  return `${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 1 }).format(value)}%`;
};

export const formatMoney = (value, currency) => {
  if (value == null) return '—';
  if (!currency || currency === 'UNSPECIFIED') return formatNumber(value);
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${formatNumber(value)} ${currency}`;
  }
};

export const formatWhen = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDay = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const metricValue = (metric) => {
  if (!metric || metric.state === 'unavailable' || metric.state === 'not_applicable') return '—';
  if (metric.state === 'mixed') return 'Mixed';
  if (metric.value == null) return '—';
  if (metric.unit === 'percent') return formatPercent(metric.value);
  if (metric.unit === 'currency') return formatMoney(metric.value, metric.currency);
  if (metric.unit === 'ratio') return `${metric.value.toFixed(2)}x`;
  return formatNumber(metric.value);
};

export const metricChange = (metric) => {
  if (!metric || metric.value == null || metric.state === 'unavailable' || metric.state === 'mixed') {
    return metric?.percentNote || metric?.reason || '';
  }
  if (metric.absoluteChange == null) return metric.percentNote || '';

  const sign = metric.absoluteChange > 0 ? '+' : '';
  const absolute =
    metric.unit === 'percent'
      ? `${sign}${metric.absoluteChange.toFixed(1)} pp`
      : metric.unit === 'currency'
        ? `${sign}${formatMoney(metric.absoluteChange, metric.currency)}`
        : `${sign}${formatNumber(metric.absoluteChange)}`;
  const percent =
    metric.percentChange == null
      ? metric.percentNote
      : `${metric.percentChange > 0 ? '+' : ''}${metric.percentChange.toFixed(1)}%`;
  return [absolute, percent].filter(Boolean).join(' · ');
};

export const changeTone = (metric) => {
  if (!metric || metric.absoluteChange == null) return 'text-brand-muted';
  if (metric.absoluteChange > 0) return 'text-emerald-700';
  if (metric.absoluteChange < 0) return 'text-red-700';
  return 'text-brand-muted';
};
