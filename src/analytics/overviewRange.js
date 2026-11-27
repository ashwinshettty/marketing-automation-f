/** Map Analytics date presets onto Google Ads overview windows. */
export function analyticsToGoogleRange({ preset, from, to } = {}) {
  if (preset === 'last_7') return { range: 'LAST_7_DAYS' };
  if (preset === 'last_30') return { range: 'LAST_30_DAYS' };
  if (preset === 'custom' && from && to) {
    return { range: 'CUSTOM', startDate: from, endDate: to };
  }

  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

  const shift = (iso, days) => {
    const [year, month, day] = iso.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day + days));
    return date.toISOString().slice(0, 10);
  };

  if (preset === 'today') return { range: 'CUSTOM', startDate: today, endDate: today };
  if (preset === 'yesterday') {
    const yesterday = shift(today, -1);
    return { range: 'CUSTOM', startDate: yesterday, endDate: yesterday };
  }
  if (preset === 'last_90') {
    const end = shift(today, -1);
    return { range: 'CUSTOM', startDate: shift(end, -89), endDate: end };
  }

  return { range: 'LAST_30_DAYS' };
}
