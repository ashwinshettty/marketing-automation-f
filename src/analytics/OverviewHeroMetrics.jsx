import { motion, useReducedMotion } from 'motion/react';
import { formatMoney, formatNumber, formatPercent } from './format';

const Card = ({ label, value, footnote, delay = 0 }) => {
  const reduceMotion = useReducedMotion();

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reduceMotion ? 0 : delay, duration: 0.3, ease: 'easeOut' }}
      className="rounded-2xl border border-brand-yellow/40 bg-gradient-to-br from-white to-brand-cream/50 p-4 shadow-sm"
    >
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-brand-muted">{label}</h3>
      <p className="my-2 text-2xl font-semibold tracking-tight text-brand-navy sm:text-3xl">{value}</p>
      <p className="text-xs text-brand-muted">{footnote || '—'}</p>
    </motion.article>
  );
};

const pct = (value) => {
  if (value == null || !Number.isFinite(Number(value))) return '—';
  const amount = Number(value);
  return formatPercent(amount <= 1 ? amount * 100 : amount);
};

const decimal = (value) => {
  if (value == null || !Number.isFinite(Number(value))) return '—';
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 1 }).format(value);
};

/** Google Ads–only KPI strip for Analytics Overview. */
export default function OverviewHeroMetrics({
  loading,
  adsTotals,
  campaignCount = 0,
  leadFormCount = null,
  scopeLabel = 'All campaigns',
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="h-[7.25rem] animate-pulse rounded-2xl bg-white" />
        ))}
      </div>
    );
  }

  const ads = adsTotals || {};
  const currency = ads.currencyCode || 'INR';
  const cards = [
    {
      label: 'Campaigns',
      value: formatNumber(campaignCount),
      footnote: scopeLabel,
    },
    {
      label: 'Ads spend',
      value: ads.cost != null ? formatMoney(ads.cost, currency) : '—',
      footnote: 'Google Ads delivery',
    },
    {
      label: 'Impressions',
      value: ads.impressions != null ? formatNumber(ads.impressions) : '—',
      footnote: ads.clicks != null ? `${formatNumber(ads.clicks)} clicks` : '—',
    },
    {
      label: 'Clicks',
      value: ads.clicks != null ? formatNumber(ads.clicks) : '—',
      footnote: ads.averageCpc != null ? `Avg CPC ${formatMoney(ads.averageCpc, currency)}` : '—',
    },
    {
      label: 'CTR',
      value: pct(ads.ctr),
      footnote: 'Click-through rate',
    },
    {
      label: 'Conversions',
      value: decimal(ads.conversions),
      footnote: ads.costPerConversion != null
        ? `CPA ${formatMoney(ads.costPerConversion, currency)}`
        : 'Google conversion actions',
    },
    {
      label: 'Conv. rate',
      value: pct(ads.conversionRate),
      footnote: 'Conversions / clicks',
    },
    {
      label: 'Lead forms',
      value: leadFormCount == null ? '—' : formatNumber(leadFormCount),
      footnote: leadFormCount == null
        ? 'Google lead-form submissions'
        : 'Live lead_form_submission_data',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((card, index) => (
        <Card key={card.label} {...card} delay={index * 0.03} />
      ))}
    </div>
  );
}
