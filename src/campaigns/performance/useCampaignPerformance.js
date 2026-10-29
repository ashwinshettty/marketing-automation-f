import { useCallback, useEffect, useMemo, useState } from 'react';
import { getCampaignInsights } from '../../api/campaignApi';
import { DEFAULT_METRIC_KEYS } from './metricCatalog';
import { resolvePresetDates, withCumulative } from './formatPerformance';

const initialRange = resolvePresetDates('30-days');

export default function useCampaignPerformance(campaignId) {
  const [rangePreset, setRangePreset] = useState('30-days');
  const [startDate, setStartDate] = useState(initialRange.startDate);
  const [endDate, setEndDate] = useState(initialRange.endDate);
  const [interval, setInterval] = useState('day');
  const [activityHistory, setActivityHistory] = useState('All');
  const [selectedMetrics, setSelectedMetrics] = useState(DEFAULT_METRIC_KEYS);
  const [preferences, setPreferences] = useState({
    similarAdSets: true,
    businessesLikeYours: true,
  });
  const [breakdownTab, setBreakdownTab] = useState('demographics');
  const [overview, setOverview] = useState(null);
  const [demographics, setDemographics] = useState(null);
  const [platform, setPlatform] = useState(null);
  const [loadingOverview, setLoadingOverview] = useState(false);
  const [loadingBreakdown, setLoadingBreakdown] = useState(false);
  const [overviewError, setOverviewError] = useState('');
  const [breakdownError, setBreakdownError] = useState('');

  const sharedParams = useMemo(
    () => ({
      startDate,
      endDate,
      interval,
    }),
    [startDate, endDate, interval],
  );

  const loadOverview = useCallback(async () => {
    if (!campaignId) return;
    setLoadingOverview(true);
    setOverviewError('');
    try {
      const data = await getCampaignInsights(campaignId, {
        ...sharedParams,
        section: 'overview',
      });
      setOverview(data);
    } catch (error) {
      setOverview(null);
      setOverviewError(
        error?.response?.data?.message || error.message || 'Unable to load campaign performance',
      );
    } finally {
      setLoadingOverview(false);
    }
  }, [campaignId, sharedParams]);

  const loadBreakdown = useCallback(async () => {
    if (!campaignId) return;
    setLoadingBreakdown(true);
    setBreakdownError('');
    try {
      const section = breakdownTab === 'platform' ? 'platform' : 'demographics';
      const data = await getCampaignInsights(campaignId, {
        ...sharedParams,
        section,
      });
      if (section === 'platform') setPlatform(data);
      else setDemographics(data);
    } catch (error) {
      if (breakdownTab === 'platform') setPlatform(null);
      else setDemographics(null);
      setBreakdownError(
        error?.response?.data?.message || error.message || 'Unable to load breakdown',
      );
    } finally {
      setLoadingBreakdown(false);
    }
  }, [breakdownTab, campaignId, sharedParams]);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  useEffect(() => {
    void loadBreakdown();
  }, [loadBreakdown]);

  const applyRangePreset = (preset) => {
    setRangePreset(preset);
    if (preset === 'custom') return;
    const next = resolvePresetDates(preset);
    setStartDate(next.startDate);
    setEndDate(next.endDate);
  };

  const overviewPoints = useMemo(() => {
    const rows = overview?.rows || [];
    const withResults = withCumulative(rows, 'results');
    const withReach = withCumulative(withResults, 'reach');
    const withSpend = withCumulative(withReach, 'spend');
    return withSpend.map((row, index) => ({
      key: row.dateStart || row.dateStop || `row-${index}`,
      label: (row.dateStart || '').slice(5) || '—',
      results: row.results,
      spend: row.spend,
      costPerResult: row.costPerResult,
      reach: row.reach,
      impressions: row.impressions,
      clicks: row.clicks,
      resultsCumulative: row.resultsCumulative,
      reachCumulative: row.reachCumulative,
      spendCumulative: row.spendCumulative,
    }));
  }, [overview]);

  return {
    rangePreset,
    startDate,
    endDate,
    interval,
    activityHistory,
    selectedMetrics,
    preferences,
    breakdownTab,
    overview,
    demographics,
    platform,
    overviewPoints,
    loadingOverview,
    loadingBreakdown,
    overviewError,
    breakdownError,
    setInterval,
    setActivityHistory,
    setSelectedMetrics,
    setPreferences,
    setBreakdownTab,
    setStartDate,
    setEndDate,
    applyRangePreset,
    setRangePreset,
    refresh: () => {
      void loadOverview();
      void loadBreakdown();
    },
  };
}
