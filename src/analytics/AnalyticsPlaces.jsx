import { useEffect, useMemo, useState } from 'react';
import { listGoogleAdsCampaignLocations } from '../api/googleAdsCampaignApi';
import CampaignPickerDropdown from '../googleAds/campaigns/CampaignPickerDropdown';
import { formatCount, formatDay, formatMoney, formatPercent } from '../googleAds/campaigns/campaignFormat';
import OverviewDateFilter from '../googleAds/overview/OverviewDateFilter';
import { placeLabel, sumLocationMetrics } from '../googleAds/overview/locationModel';
import '../googleAds/googleAds.css';

const messageOf = (error) => error?.response?.data?.message || error?.message || 'Could not load locations';

const COLUMNS = ['Location', 'Clicks', 'Impr.', 'CTR', 'Avg. CPC', 'Cost', 'Conv.'];

/**
 * Analytics → Places: Google Ads location performance for a selected campaign.
 * Replaces the old CRM city share table with live location_view metrics.
 */
export default function AnalyticsPlaces() {
  const [campaignId, setCampaignId] = useState('');
  const [campaignName, setCampaignName] = useState('');
  const [range, setRange] = useState('LAST_7_DAYS');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [applied, setApplied] = useState({
    campaignId: '',
    campaignName: '',
    range: 'LAST_7_DAYS',
  });

  const [tab, setTab] = useState('targeted');
  const [targeted, setTargeted] = useState([]);
  const [excluded, setExcluded] = useState([]);
  const [currencyCode, setCurrencyCode] = useState('INR');
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!applied.campaignId || !/^\d+$/.test(applied.campaignId)) {
      setTargeted([]);
      setExcluded([]);
      setCampaign(null);
      setLoading(false);
      setError('');
      return undefined;
    }
    let cancelled = false;
    setLoading(true);
    setError('');
    listGoogleAdsCampaignLocations({
      campaignId: applied.campaignId,
      range: applied.range,
      startDate: applied.startDate,
      endDate: applied.endDate,
    })
      .then((data) => {
        if (cancelled) return;
        setTargeted(data?.targeted || []);
        setExcluded(data?.excluded || []);
        setCurrencyCode(data?.currencyCode || 'INR');
        setCampaign(data?.campaign || null);
      })
      .catch((err) => {
        if (cancelled) return;
        setTargeted([]);
        setExcluded([]);
        setCampaign(null);
        setError(messageOf(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [applied]);

  const rows = tab === 'excluded' ? excluded : targeted;
  const totals = useMemo(() => sumLocationMetrics(rows), [rows]);
  const titleName = campaign?.name || applied.campaignName;
  const dateLabel = applied.range === 'CUSTOM' && applied.startDate
    ? `${formatDay(applied.startDate)} – ${formatDay(applied.endDate)}`
    : null;

  const chooseCampaign = (id, row) => {
    const nextId = id || '';
    const nextName = row?.name || '';
    setCampaignId(nextId);
    setCampaignName(nextName);
    setApplied((current) => ({
      ...current,
      campaignId: nextId,
      campaignName: nextName,
    }));
  };

  const chooseRange = (value) => {
    setRange(value);
    if (value !== 'CUSTOM') {
      setStartDate('');
      setEndDate('');
      setApplied((current) => ({
        ...current,
        range: value,
        startDate: undefined,
        endDate: undefined,
      }));
    }
  };

  const applyCustom = () => {
    if (!startDate || !endDate || startDate > endDate) return;
    setApplied((current) => ({
      ...current,
      range: 'CUSTOM',
      startDate,
      endDate,
    }));
  };

  return (
    <section className="google-ads-shell min-w-0 max-w-full rounded-2xl border border-brand-yellow/40 bg-white p-4 shadow-sm sm:p-5">
      <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-brand-navy">Locations</h2>
          <p className="mt-1 text-sm text-brand-muted">
            {!applied.campaignId
              ? 'Select a Google Ads campaign to view location performance'
              : loading
                ? 'Loading locations…'
                : `${rows.length} locations${titleName ? ` · ${titleName}` : ''}`}
            {dateLabel ? ` · ${dateLabel}` : null}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <CampaignPickerDropdown
            campaignId={campaignId}
            campaignName={campaignName || titleName}
            allowAll
            allLabel="Select campaign"
            onChange={chooseCampaign}
          />
          <OverviewDateFilter
            range={range}
            startDate={startDate}
            endDate={endDate}
            onRange={chooseRange}
            onStart={setStartDate}
            onEnd={setEndDate}
            onApply={applyCustom}
          />
        </div>
      </header>

      {!applied.campaignId ? (
        <div className="rounded-xl border border-brand-yellow/30 bg-brand-cream px-6 py-12 text-center text-sm text-brand-muted">
          Pick a campaign above to load targeted and excluded location metrics from Google Ads.
        </div>
      ) : (
        <>
          <div className="mb-4 flex gap-1 border-b border-brand-yellow/30">
            {[
              { id: 'targeted', label: 'Locations' },
              { id: 'excluded', label: 'Location exclusions' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`rounded-t-lg px-3 py-2 text-sm ${
                  tab === item.id
                    ? 'border-b-2 border-brand-navy font-semibold text-brand-navy'
                    : 'text-brand-muted'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}

          <div className="overflow-hidden rounded-xl border border-brand-yellow/30 bg-white">
            <div className="max-h-[min(70vh,40rem)] overflow-auto">
              <table className="w-max min-w-full border-separate border-spacing-0 text-left text-[13px]">
                <thead className="text-brand-muted">
                  <tr>
                    {COLUMNS.map((label) => (
                      <th
                        key={label}
                        className="sticky top-0 z-10 bg-white px-3 py-2.5 text-xs font-medium uppercase tracking-wider"
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border-t border-brand-yellow/20 bg-brand-cream px-3 py-2.5 text-xs font-semibold text-brand-navy">
                      Total
                    </td>
                    <td className="border-t border-brand-yellow/20 bg-brand-cream px-3 py-2.5 tabular-nums text-brand-muted">
                      {formatCount(totals.clicks)}
                    </td>
                    <td className="border-t border-brand-yellow/20 bg-brand-cream px-3 py-2.5 tabular-nums text-brand-muted">
                      {formatCount(totals.impressions)}
                    </td>
                    <td className="border-t border-brand-yellow/20 bg-brand-cream px-3 py-2.5 tabular-nums text-brand-muted">
                      {formatPercent(totals.ctr)}
                    </td>
                    <td className="border-t border-brand-yellow/20 bg-brand-cream px-3 py-2.5 tabular-nums text-brand-muted">
                      {formatMoney(totals.averageCpc, currencyCode)}
                    </td>
                    <td className="border-t border-brand-yellow/20 bg-brand-cream px-3 py-2.5 tabular-nums text-brand-muted">
                      {formatMoney(totals.cost, currencyCode)}
                    </td>
                    <td className="border-t border-brand-yellow/20 bg-brand-cream px-3 py-2.5 tabular-nums text-brand-muted">
                      {formatCount(totals.conversions)}
                    </td>
                  </tr>
                  {loading ? (
                    <tr>
                      <td colSpan={COLUMNS.length} className="px-3 py-8 text-sm text-brand-muted">
                        Loading locations…
                      </td>
                    </tr>
                  ) : null}
                  {!loading && !error && !rows.length ? (
                    <tr>
                      <td colSpan={COLUMNS.length} className="px-3 py-8 text-sm text-brand-muted">
                        No locations in this view for the selected date range.
                      </td>
                    </tr>
                  ) : null}
                  {!loading && !error
                    ? rows.map((row) => (
                      <tr key={`${row.id}-${row.campaignId}-${row.kind}`} className="hover:bg-brand-cream/60">
                        <td className="border-t border-brand-yellow/20 px-3 py-2.5 font-medium text-[var(--ga-blue)]">
                          {placeLabel(row)}
                        </td>
                        <td className="border-t border-brand-yellow/20 px-3 py-2.5 tabular-nums">
                          {formatCount(row.metrics?.clicks)}
                        </td>
                        <td className="border-t border-brand-yellow/20 px-3 py-2.5 tabular-nums">
                          {formatCount(row.metrics?.impressions)}
                        </td>
                        <td className="border-t border-brand-yellow/20 px-3 py-2.5 tabular-nums">
                          {formatPercent(row.metrics?.ctr)}
                        </td>
                        <td className="border-t border-brand-yellow/20 px-3 py-2.5 tabular-nums">
                          {formatMoney(row.metrics?.averageCpc, currencyCode)}
                        </td>
                        <td className="border-t border-brand-yellow/20 px-3 py-2.5 tabular-nums">
                          {formatMoney(row.metrics?.cost, currencyCode)}
                        </td>
                        <td className="border-t border-brand-yellow/20 px-3 py-2.5 tabular-nums">
                          {formatCount(row.metrics?.conversions)}
                        </td>
                      </tr>
                    ))
                    : null}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
