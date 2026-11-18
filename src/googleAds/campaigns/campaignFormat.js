const moneyFormat = (currencyCode) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: currencyCode || 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const countFormat = new Intl.NumberFormat('en-US');

export function formatMoney(amount, currencyCode) {
  if (amount == null || !Number.isFinite(Number(amount))) return '—';
  return moneyFormat(currencyCode).format(Number(amount));
}

export function formatCount(value) {
  if (value == null || !Number.isFinite(Number(value))) return '—';
  return countFormat.format(Number(value));
}

export function formatDecimal(value) {
  if (value == null || !Number.isFinite(Number(value))) return '—';
  return Number(value).toFixed(2);
}

export function formatPercent(ratio) {
  if (ratio == null || !Number.isFinite(Number(ratio))) return '—';
  return `${(Number(ratio) * 100).toFixed(2)}%`;
}

export function formatDay(iso) {
  const match = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return '';
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export function formatBudget(budget, currencyCode) {
  if (!budget) return '—';
  if (budget.period === 'CUSTOM_PERIOD') {
    if (budget.totalAmount == null) return '—';
    const dates = [formatDay(budget.startDate), formatDay(budget.endDate)].filter(Boolean);
    const span = dates.length ? dates.join(' – ') : '';
    return {
      primary: `${formatMoney(budget.totalAmount, currencyCode)} (total)`,
      secondary: span,
    };
  }
  if (budget.dailyAmount == null) return '—';
  return { primary: `${formatMoney(budget.dailyAmount, currencyCode)}/day`, secondary: '' };
}

export function formatScore(score) {
  if (score == null || !Number.isFinite(Number(score))) return null;
  return Math.round(Number(score) * 1000) / 10;
}
