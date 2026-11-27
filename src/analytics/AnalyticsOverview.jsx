import { useEffect, useMemo, useState } from 'react';
import {
  getGoogleAdsOverview,
  listGoogleAdsLeads,
} from '../api/googleAdsCampaignApi';
import { BlurFade } from '../components/magicui/blur-fade';
import CampaignPickerDropdown from '../googleAds/campaigns/CampaignPickerDropdown';
import OverviewAdsFunnel from './OverviewAdsFunnel';
import OverviewCampaignLedger from './OverviewCampaignLedger';
import OverviewHeroMetrics from './OverviewHeroMetrics';
import OverviewPulseChart from './OverviewPulseChart';
import { analyticsToGoogleRange } from './overviewRange';

/**
 * Analytics → Overview: Google Ads only.
 * Campaign dropdown scopes KPIs, chart, ledger, and delivery funnel.
 */
export default function AnalyticsOverview({
  preset = 'last_30',
  from = '',
  to = '',
}) {
  const [campaignId, setCampaignId] = useState('');
  const [campaignName, setCampaignName] = useState('');
  const [adsOverview, setAdsOverview] = useState(null);
  const [adsLoading, setAdsLoading] = useState(true);
  const [adsError, setAdsError] = useState('');
  const [leadFormCount, setLeadFormCount] = useState(null);

  const googleRange = useMemo(
    () => analyticsToGoogleRange({ preset, from, to }),
    [preset, from, to],
  );

  const scopeLabel = campaignId ? (campaignName || 'Selected campaign') : 'All campaigns';

  useEffect(() => {
    const controller = new AbortController();
    setAdsLoading(true);
    setAdsError('');

    getGoogleAdsOverview({
      ...googleRange,
      campaign: campaignId ? undefined : 'all',
      campaignId: campaignId || undefined,
    })
      .then((data) => {
        if (controller.signal.aborted) return;
        setAdsOverview(data);
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        setAdsOverview(null);
        setAdsError(error.message || 'Could not load Google Ads overview');
      })
      .finally(() => {
        if (!controller.signal.aborted) setAdsLoading(false);
      });

    return () => controller.abort();
  }, [googleRange, campaignId]);

  useEffect(() => {
    const controller = new AbortController();
    setLeadFormCount(null);

    listGoogleAdsLeads({
      campaignId: campaignId || undefined,
      limit: 200,
      signal: controller.signal,
    })
      .then((data) => {
        if (controller.signal.aborted) return;
        const total = Number(data?.total);
        setLeadFormCount(Number.isFinite(total) ? total : (data?.leads?.length || 0));
      })
      .catch(() => {
        if (!controller.signal.aborted) setLeadFormCount(null);
      });

    return () => controller.abort();
  }, [campaignId, googleRange]);

  const chooseCampaign = (id = '', row = null) => {
    setCampaignId(id || '');
    setCampaignName(row?.name || '');
  };

  const adsTotals = adsOverview?.totals
    ? { ...adsOverview.totals, currencyCode: adsOverview.currencyCode }
    : null;

  const ledgerCampaigns = useMemo(() => {
    if (Array.isArray(adsOverview?.summary) && adsOverview.summary.length) {
      return adsOverview.summary;
    }
    return [];
  }, [adsOverview]);

  const campaignCount = useMemo(() => {
    if (campaignId) return 1;
    const fromPicker = adsOverview?.campaigns?.filter((row) => row.source !== 'local') || [];
    if (fromPicker.length) return fromPicker.length;
    return ledgerCampaigns.filter((row) => row.source !== 'local').length;
  }, [adsOverview, campaignId, ledgerCampaigns]);

  return (
    <div className="min-w-0 max-w-full space-y-6">
      <BlurFade>
        <section className="rounded-2xl border border-brand-yellow/40 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-muted">
                Google Ads overview
              </p>
              <h2 className="mt-1 text-lg font-semibold text-brand-navy">Campaign performance</h2>
              <p className="mt-0.5 text-sm text-brand-muted">
                Live account data only — pick a campaign to focus KPIs and the chart.
              </p>
            </div>
            <CampaignPickerDropdown
              campaignId={campaignId}
              campaignName={campaignName}
              allowAll
              allLabel="All campaigns"
              onChange={chooseCampaign}
            />
          </div>
        </section>
      </BlurFade>

      {adsError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {adsError}
        </p>
      ) : null}

      <BlurFade delay={0.04}>
        <OverviewHeroMetrics
          loading={adsLoading}
          adsTotals={adsTotals}
          campaignCount={campaignCount}
          leadFormCount={leadFormCount}
          scopeLabel={scopeLabel}
        />
      </BlurFade>

      <BlurFade delay={0.08}>
        <OverviewPulseChart
          adsOverview={adsOverview}
          adsLoading={adsLoading}
          scopeLabel={scopeLabel}
        />
      </BlurFade>

      <BlurFade delay={0.1}>
        <OverviewCampaignLedger
          campaigns={ledgerCampaigns}
          currencyCode={adsOverview?.currencyCode || 'INR'}
          selectedId={campaignId}
          onSelect={chooseCampaign}
        />
      </BlurFade>

      <BlurFade delay={0.12}>
        <OverviewAdsFunnel totals={adsTotals} loading={adsLoading} />
      </BlurFade>
    </div>
  );
}
