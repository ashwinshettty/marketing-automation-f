import { useEffect, useState } from 'react';
import { fetchAllCampaigns, filterCampaigns } from '../api/campaignApi';

const RANGES = [
  ['', 'All time'],
  ['today', 'Today'],
  ['yesterday', 'Yesterday'],
  ['last_7', 'Last 7 days'],
  ['last_30', 'Last 30 days'],
  ['last_90', 'Last 90 days'],
  ['custom', 'Custom range'],
];

const dayStamp = (date) => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

const shiftDays = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return dayStamp(date);
};

const rangeDates = (range, from, to) => {
  const today = dayStamp(new Date());
  if (range === 'today') return { from: today, to: today };
  if (range === 'yesterday') return { from: shiftDays(-1), to: shiftDays(-1) };
  if (range === 'last_7') return { from: shiftDays(-6), to: today };
  if (range === 'last_30') return { from: shiftDays(-29), to: today };
  if (range === 'last_90') return { from: shiftDays(-89), to: today };
  if (range === 'custom' && from && to) return { from, to };
  return null;
};

const STATUSES = [
  ['', 'All statuses'],
  ['draft', 'Draft'],
  ['active', 'Active'],
  ['paused', 'Paused'],
  ['created', 'Created'],
  ['failed', 'Failed'],
];

const OBJECTIVES = {
  OUTCOME_AWARENESS: 'Awareness',
  OUTCOME_TRAFFIC: 'Traffic',
  OUTCOME_ENGAGEMENT: 'Engagement',
  OUTCOME_LEADS: 'Leads',
  OUTCOME_APP_PROMOTION: 'App promotion',
  OUTCOME_SALES: 'Sales',
};

const labelStatus = (status) => (status ? status.charAt(0).toUpperCase() + status.slice(1) : '—');

const CampaignRecords = ({ platform = 'all' }) => {
  const [allCampaigns, setAllCampaigns] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState('');
  const [range, setRange] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [platformFilter, setPlatformFilter] = useState(platform === 'google' || platform === 'meta' ? platform : 'all');

  useEffect(() => {
    setPlatformFilter(platform === 'google' || platform === 'meta' ? platform : 'all');
  }, [platform]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    fetchAllCampaigns()
      .then((data) => {
        if (cancelled) return;
        const rows = data.campaigns || [];
        setAllCampaigns(rows);
        setCampaigns(rows);
      })
      .catch((loadError) => {
        if (!cancelled) setError(loadError.message || 'Could not load campaigns');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const trimmed = name.trim();
    const dates = rangeDates(range, from, to);
    const waitingForCustom = range === 'custom' && !dates;
    const unfiltered = platformFilter === 'all' && !status && !trimmed && !dates;
    if (unfiltered || waitingForCustom) {
      setCampaigns(allCampaigns);
      return undefined;
    }

    let cancelled = false;
    const timer = window.setTimeout(() => {
      const params = {};
      if (platformFilter !== 'all') params.platform = platformFilter;
      if (status) params.status = status;
      if (trimmed) params.name = trimmed;
      if (dates) {
        params.from = dates.from;
        params.to = dates.to;
      }
      filterCampaigns(params)
        .then((data) => {
          if (!cancelled) setCampaigns(data.campaigns || []);
        })
        .catch((filterError) => {
          if (!cancelled) setError(filterError.message || 'Could not filter campaigns');
        });
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [allCampaigns, from, name, platformFilter, range, status, to]);

  return (
    <section className="min-w-0 max-w-full overflow-hidden rounded-2xl border border-brand-yellow/40 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-brand-yellow/40 p-4">
        <h2 className="text-base font-semibold text-brand-navy">Campaigns</h2>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Search by campaign name"
            aria-label="Campaign name"
            className="h-11 min-w-0 flex-1 rounded-lg border border-brand-yellow/40 px-3 text-sm text-brand-navy outline-none focus:border-brand-navy md:max-w-xs"
          />
          <select
            aria-label="Date range"
            value={range}
            onChange={(event) => setRange(event.target.value)}
            className="h-11 rounded-lg border border-brand-yellow/40 bg-white px-3 text-sm text-brand-navy"
          >
            {RANGES.map(([value, label]) => (
              <option key={label} value={value}>{label}</option>
            ))}
          </select>
          {range === 'custom' && (
            <>
              <input aria-label="From" type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="h-11 rounded-lg border border-brand-yellow/40 px-3 text-sm text-brand-navy" />
              <input aria-label="To" type="date" value={to} onChange={(event) => setTo(event.target.value)} className="h-11 rounded-lg border border-brand-yellow/40 px-3 text-sm text-brand-navy" />
            </>
          )}
          <select
            aria-label="Status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="h-11 rounded-lg border border-brand-yellow/40 bg-white px-3 text-sm text-brand-navy"
          >
            {STATUSES.map(([value, label]) => (
              <option key={label} value={value}>{label}</option>
            ))}
          </select>
          {[['all', 'All'], ['meta', 'Meta Ads'], ['google', 'Google Ads']].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setPlatformFilter(value)}
              className={`h-11 rounded-lg px-3 text-sm font-semibold ${
                platformFilter === value ? 'bg-brand-navy text-white' : 'border border-brand-yellow/40 text-brand-muted'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading && <p className="px-4 py-8 text-sm text-brand-muted">Loading campaigns…</p>}
      {!loading && error && <p className="px-4 py-8 text-sm text-red-700">{error}</p>}
      {!loading && !error && campaigns.length === 0 && (
        <p className="px-4 py-8 text-center text-sm text-brand-muted">No campaigns match these filters.</p>
      )}

      {!loading && !error && campaigns.length > 0 && (
        <>
          <div className="space-y-2 p-3 md:hidden">
            {campaigns.map((row) => (
              <article key={row.id} className="rounded-xl border border-brand-yellow/30 p-3">
                <h3 className="text-sm font-semibold text-brand-navy">{row.name}</h3>
                <p className="mt-1 text-xs text-brand-muted">{row.platformLabel} · {labelStatus(row.status)}</p>
                <p className="mt-1 text-sm text-brand-navy">{OBJECTIVES[row.objective] || '—'}</p>
              </article>
            ))}
          </div>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-brand-cream text-xs uppercase tracking-wide text-brand-navy">
                <tr>
                  {['Campaign', 'Platform', 'Status', 'Objective'].map((label) => (
                    <th key={label} className="px-4 py-3 font-semibold">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {campaigns.map((row) => (
                  <tr key={row.id} className="border-t border-brand-yellow/20">
                    <td className="px-4 py-3 font-semibold text-brand-navy">{row.name}</td>
                    <td className="px-4 py-3">{row.platformLabel}</td>
                    <td className="px-4 py-3">{labelStatus(row.status)}</td>
                    <td className="px-4 py-3">{OBJECTIVES[row.objective] || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
};

export default CampaignRecords;
