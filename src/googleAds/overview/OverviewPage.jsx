import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getGoogleAdsOverview } from '../../api/googleAdsCampaignApi';
import PageHeader from '../components/PageHeader';
import { GOOGLE_ADS_BASE } from '../nav/googleAdsNavConfig';
import AssetPerformanceCard from './AssetPerformanceCard';
import MetricCards from './MetricCards';
import LocationsCard from './LocationsCard';
import OptimizationScoreCard from './OptimizationScoreCard';
import OverviewCampaignFilter from './OverviewCampaignFilter';
import OverviewChart from './OverviewChart';
import OverviewDateFilter from './OverviewDateFilter';

const messageOf = (error) => error?.response?.data?.message || error?.message || 'Could not load the overview';

export default function OverviewPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialRange = searchParams.get('range') || 'LAST_7_DAYS';
  const urlCampaign = searchParams.get('campaign') || 'all';
  const urlCampaignId = searchParams.get('campaignId') || '';
  const initialStart = searchParams.get('startDate') || '';
  const initialEnd = searchParams.get('endDate') || '';
  const [overview, setOverview] = useState(null);
  const [primaryId, setPrimaryId] = useState('clicks');
  const [secondaryId, setSecondaryId] = useState('impressions');
  const [error, setError] = useState(null);
  const [range, setRange] = useState(initialRange);
  const [startDate, setStartDate] = useState(initialStart);
  const [endDate, setEndDate] = useState(initialEnd);
  const [applied, setApplied] = useState({
    range: initialRange,
    campaign: urlCampaign,
    ...(initialStart && initialEnd ? { startDate: initialStart, endDate: initialEnd } : {}),
  });
  const [selectedCampaign, setSelectedCampaign] = useState(() => (
    urlCampaign && urlCampaign !== 'all'
      ? { id: urlCampaignId, name: urlCampaign }
      : { id: '', name: '' }
  ));

  useEffect(() => {
    const nextName = urlCampaign && urlCampaign !== 'all' ? urlCampaign : 'all';
    setSelectedCampaign(
      nextName === 'all'
        ? { id: '', name: '' }
        : { id: urlCampaignId, name: nextName },
    );
    setApplied((prev) => (prev.campaign === nextName ? prev : { ...prev, campaign: nextName }));
  }, [urlCampaign, urlCampaignId]);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    getGoogleAdsOverview(applied)
      .then((data) => {
        if (cancelled) return;
        setOverview(data);
        if (data?.campaignId && data?.campaign && data.campaign !== 'all') {
          setSelectedCampaign({ id: String(data.campaignId), name: data.campaign });
        } else if (applied.campaign === 'all') {
          setSelectedCampaign({ id: '', name: '' });
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setOverview(null);
          setError(messageOf(err));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [applied]);

  const chooseRange = (value) => {
    setRange(value);
    if (value !== 'CUSTOM') {
      setApplied((prev) => ({
        range: value,
        campaign: prev.campaign || 'all',
      }));
    }
  };

  const applyCustom = () => {
    if (!startDate || !endDate || startDate > endDate) return;
    setApplied((prev) => ({
      range: 'CUSTOM',
      startDate,
      endDate,
      campaign: prev.campaign || 'all',
    }));
  };

  const chooseCampaign = (campaignId, campaign) => {
    const name = campaign?.name || '';
    setSelectedCampaign(campaignId && name ? { id: campaignId, name } : { id: '', name: '' });
    setApplied((prev) => ({ ...prev, campaign: name || 'all' }));
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (!campaignId) {
        next.delete('campaignId');
        next.delete('campaign');
      } else {
        next.set('campaignId', campaignId);
        next.set('campaign', name);
      }
      return next;
    }, { replace: true });
  };

  const choosePrimary = (metricId) => {
    if (metricId === secondaryId) setSecondaryId(primaryId);
    setPrimaryId(metricId);
  };

  const chooseSecondary = (metricId) => {
    if (metricId === primaryId) setPrimaryId(secondaryId);
    setSecondaryId(metricId);
  };

  return (
    <div className="px-6 py-5">
      <PageHeader
        title="Overview"
        filters={
          <>
            <OverviewCampaignFilter
              campaignId={selectedCampaign.id}
              campaignName={selectedCampaign.name}
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
          </>
        }
        actions={
          <Link
            to={`${GOOGLE_ADS_BASE}/create/objective`}
            className="inline-flex items-center gap-2 rounded-full bg-[var(--ga-blue)] px-4 py-2 text-sm font-medium text-white shadow-sm hover:brightness-95"
          >
            <span aria-hidden="true">+</span>
            New campaign
          </Link>
        }
      />

      <div className="mb-3 flex items-center gap-2 border-b border-[var(--ga-border)] pb-2">
        <button
          type="button"
          className="rounded-t-lg border-b-2 border-[var(--ga-blue)] px-3 py-2 text-sm font-medium text-[var(--ga-blue)]"
        >
          Home
        </button>
        <button
          type="button"
          className="rounded-t-lg px-3 py-2 text-sm text-[var(--ga-muted)] hover:text-[var(--ga-ink)]"
        >
          + Add custom view
        </button>
      </div>

      <div className="space-y-4">
        {error ? <p className="text-sm text-[#d93025]">{error}</p> : null}
        <MetricCards
          totals={overview?.totals}
          currencyCode={overview?.currencyCode}
          primaryId={primaryId}
          secondaryId={secondaryId}
          onPrimary={choosePrimary}
          onSecondary={chooseSecondary}
        />
        <OverviewChart
          series={overview?.series || []}
          grain={overview?.grain}
          primaryId={primaryId}
          secondaryId={secondaryId}
        />
        <div className="grid items-start gap-4 xl:grid-cols-2">
          <div className="space-y-4">
            <OptimizationScoreCard
              score={overview?.optimization?.score}
              campaigns={overview?.optimization?.campaigns || []}
            />
            <LocationsCard
              locations={overview?.locations}
              currencyCode={overview?.currencyCode}
              campaignId={overview?.campaignId || 'all'}
              campaignName={applied.campaign || 'all'}
              range={applied.range}
              startDate={applied.startDate}
              endDate={applied.endDate}
              loading={!overview && !error}
            />
          </div>
          <AssetPerformanceCard
            performance={overview?.assetPerformance}
            campaignId={overview?.campaignId || 'all'}
            campaignName={applied.campaign || 'all'}
            range={applied.range}
            startDate={applied.startDate}
            endDate={applied.endDate}
            loading={!overview && !error}
          />
        </div>
      </div>
    </div>
  );
}
