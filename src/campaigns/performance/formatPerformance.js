const currencySymbol = (currency) => {
  const code = String(currency || 'INR').toUpperCase();
  if (code === 'INR') return '₹';
  if (code === 'USD') return '$';
  if (code === 'EUR') return '€';
  if (code === 'GBP') return '£';
  return `${code} `;
};

export const formatMetricValue = (value, format, currency = 'INR') => {
  if (value == null || Number.isNaN(Number(value))) return '—';
  const amount = Number(value);
  if (format === 'currency') {
    return `${currencySymbol(currency)}${amount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  if (format === 'percent') {
    return `${amount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}%`;
  }
  return amount.toLocaleString('en-IN');
};

export const formatDisplayDate = (isoOrDate) => {
  if (!isoOrDate) return '';
  const date = isoOrDate instanceof Date ? isoOrDate : new Date(`${isoOrDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return String(isoOrDate);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const formatRangeLabel = (startDate, endDate) => {
  if (!startDate || !endDate) return '';
  return `${formatDisplayDate(startDate)} – ${formatDisplayDate(endDate)}`;
};

export const toDateInputValue = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const shiftDays = (base, days) => {
  const date = new Date(base);
  date.setDate(date.getDate() + days);
  return date;
};

export const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);
export const endOfMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);

export const resolvePresetDates = (preset, now = new Date()) => {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  switch (preset) {
    case 'today':
      return { startDate: toDateInputValue(today), endDate: toDateInputValue(today) };
    case 'yesterday': {
      const day = shiftDays(today, -1);
      return { startDate: toDateInputValue(day), endDate: toDateInputValue(day) };
    }
    case '7-days':
      return {
        startDate: toDateInputValue(shiftDays(today, -6)),
        endDate: toDateInputValue(today),
      };
    case 'this-month':
      return {
        startDate: toDateInputValue(startOfMonth(today)),
        endDate: toDateInputValue(today),
      };
    case 'last-month': {
      const first = startOfMonth(new Date(today.getFullYear(), today.getMonth() - 1, 1));
      const last = endOfMonth(first);
      return {
        startDate: toDateInputValue(first),
        endDate: toDateInputValue(last),
      };
    }
    case '30-days':
    default:
      return {
        startDate: toDateInputValue(shiftDays(today, -29)),
        endDate: toDateInputValue(today),
      };
  }
};

export const withCumulative = (rows, key) => {
  let running = 0;
  return rows.map((row) => {
    const value = row[key];
    if (value != null) running += Number(value) || 0;
    return { ...row, [`${key}Cumulative`]: value == null ? null : running };
  });
};
