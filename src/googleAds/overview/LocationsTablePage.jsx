import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getGoogleAdsOverview } from '../../api/googleAdsCampaignApi';
import { GOOGLE_ADS_BASE } from '../nav/googleAdsNavConfig';
import { chartMetricById, formatChartMetric } from './chartMetrics';
import { placeLabel, sumLocationMetrics } from './locationModel';

const COLUMNS = [
  { id: 'clicks', label: 'Clicks' },
  { id: 'impressions', label: 'Impr.' },
  { id: 'ctr', label: 'CTR' },
  { id: 'averageCpc', label: 'Avg. CPC' },
  { id: 'cost', label: 'Cost' },
  { id: 'conversionRate', label: 'Conv. rate' },
  { id: 'conversions', label: 'Conversions' },
  { id: 'costPerConversion', label: 'Cost / conv.' },
];

const messageOf = (error) => error?.response?.data?.message || error?.message || 'Could not load locations';

export default function LocationsTablePage({ campaignId = 'all', mode = 'targeted' }) {
  const [params] = useSearchParams();
  const [rows, setRows] = useState([]);
  const [currencyCode, setCurrencyCode] = useState('INR');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const excluded = mode === 'excluded';
  const range = params.get('range') || 'LAST_7_DAYS';
  const startDate = params.get('startDate') || '';
  const endDate = params.get('endDate') || '';
  const campaign = params.get('campaign') || 'all';

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const request = campaignId === 'all'
      ? { campaign: 'all', range, startDate, endDate }
      : { campaignId, range, startDate, endDate };
    getGoogleAdsOverview(request)
      .then((data) => {
        if (cancelled) return;
        const list = excluded ? data?.locations?.excluded : data?.locations?.targeted;
        setRows(Array.isArray(list) ? list : []);
        setCurrencyCode(data?.currencyCode || 'INR');
      })
      .catch((err) => {
        if (!cancelled) {
          setRows([]);
          setError(messageOf(err));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [campaignId, endDate, excluded, range, startDate]);

  const backQuery = new URLSearchParams();
  backQuery.set('range', range);
  backQuery.set('campaign', campaign);
  if (startDate) backQuery.set('startDate', startDate);
  if (endDate) backQuery.set('endDate', endDate);
  const severalCampaigns = new Set(rows.map((row) => row.campaignId)).size > 1;
  const totals = sumLocationMetrics(rows);

  return (
    <div className="px-6 py-5">
      <Link
        to={`${GOOGLE_ADS_BASE}/campaigns/overview?${backQuery}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-[var(--ga-blue)]"
      >
        <span aria-hidden="true">←</span>
        Back
      </Link>
      <h1 className="mt-3 text-[28px] font-normal tracking-tight text-[var(--ga-ink)]">
        {excluded ? 'Excluded locations' : 'Targeted locations'}
      </h1>
      {error ? <p className="mt-4 text-sm text-[#d93025]">{error}</p> : null}
      <div className="mt-4 overflow-x-auto rounded-2xl border border-[var(--ga-border)] bg-white">
        <table className="w-full min-w-[860px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--ga-border)] text-[var(--ga-muted)]">
              <th className="px-4 py-3 font-medium">{excluded ? 'Excluded location' : 'Targeted location'}</th>
              {COLUMNS.map((column) => (
                <th key={column.id} className="px-4 py-3 text-right font-medium">{column.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={COLUMNS.length + 1} className="px-4 py-8 text-[var(--ga-muted)]">Loading locations</td>
              </tr>
            ) : null}
            {!loading && rows.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length + 1} className="px-4 py-8 text-[var(--ga-muted)]">
                  {excluded ? 'No excluded locations.' : 'No targeted locations.'}
                </td>
              </tr>
            ) : null}
            {!loading && rows.map((row) => (
              <tr key={`${row.campaignId}-${row.id}`} className="border-b border-[var(--ga-border)]">
                <td className="px-4 py-3">
                  <p className="font-medium text-[var(--ga-blue)]">{placeLabel(row)}</p>
                  {severalCampaigns ? (
                    <p className="text-xs text-[var(--ga-muted)]">{row.campaignName}</p>
                  ) : null}
                </td>
                {COLUMNS.map((column) => (
                  <td key={column.id} className="px-4 py-3 text-right tabular-nums text-[var(--ga-ink)]">
                    {formatChartMetric(chartMetricById(column.id), row.metrics?.[column.id], currencyCode)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          {!loading && rows.length > 0 ? (
            <tfoot>
              <tr className="text-[var(--ga-ink)]">
                <td className="px-4 py-3 font-medium">Total: Locations</td>
                {COLUMNS.map((column) => (
                  <td key={column.id} className="px-4 py-3 text-right font-medium tabular-nums">
                    {formatChartMetric(chartMetricById(column.id), totals[column.id], currencyCode)}
                  </td>
                ))}
              </tr>
            </tfoot>
          ) : null}
        </table>
      </div>
    </div>
  );
}
