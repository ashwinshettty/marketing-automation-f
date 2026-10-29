import { useState } from 'react';
import CampaignDemographicsChart from './CampaignDemographicsChart';
import CampaignPlatformChart from './CampaignPlatformChart';
import PerformanceCustomiseModal from './PerformanceCustomiseModal';
import PerformanceOverview from './PerformanceOverview';
import useCampaignPerformance from './useCampaignPerformance';

export default function CampaignPerformance({ campaignId, campaignName, onBack }) {
  const [customiseOpen, setCustomiseOpen] = useState(false);
  const performance = useCampaignPerformance(campaignId);

  const title =
    campaignName ||
    performance.overview?.name ||
    performance.demographics?.name ||
    performance.platform?.name ||
    'Campaign performance';

  const status =
    performance.overview?.status ||
    performance.demographics?.status ||
    performance.platform?.status ||
    '';

  return (
    <div className="min-h-full bg-[#eef2f7]">
      <div className="mx-auto max-w-6xl px-3 py-4 sm:px-5 sm:py-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <button
              type="button"
              onClick={onBack}
              className="mb-2 text-sm font-medium text-blue-700 hover:underline"
            >
              ← Back to campaigns
            </button>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-xl font-semibold text-brand-navy sm:text-2xl">
                {title}
              </h1>
              {status ? (
                <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-medium capitalize text-slate-600 ring-1 ring-slate-200">
                  {status}
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Performance
              {performance.overview?.remoteCampaignId
                ? ` · Meta ID ${performance.overview.remoteCampaignId}`
                : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={performance.refresh}
            className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-brand-navy hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>

        <div className="space-y-4">
          <PerformanceOverview
            rangePreset={performance.rangePreset}
            startDate={performance.startDate}
            endDate={performance.endDate}
            interval={performance.interval}
            activityHistory={performance.activityHistory}
            selectedMetrics={performance.selectedMetrics}
            overview={performance.overview}
            overviewPoints={performance.overviewPoints}
            loading={performance.loadingOverview}
            error={performance.overviewError}
            onPreset={performance.applyRangePreset}
            onCustomDates={(start, end) => {
              performance.setRangePreset('custom');
              performance.setStartDate(start);
              performance.setEndDate(end);
            }}
            onInterval={performance.setInterval}
            onActivityHistory={performance.setActivityHistory}
            onCustomise={() => setCustomiseOpen(true)}
            onRetry={performance.refresh}
          />

          <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4 inline-flex rounded-lg bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => performance.setBreakdownTab('demographics')}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium ${
                  performance.breakdownTab === 'demographics'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-brand-navy hover:bg-white'
                }`}
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                </svg>
                Demographics
              </button>
              <button
                type="button"
                onClick={() => performance.setBreakdownTab('platform')}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium ${
                  performance.breakdownTab === 'platform'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-brand-navy hover:bg-white'
                }`}
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z" />
                </svg>
                Platform
              </button>
            </div>

            {performance.breakdownTab === 'demographics' ? (
              <CampaignDemographicsChart
                data={performance.demographics}
                loading={performance.loadingBreakdown}
                error={performance.breakdownError}
                onRetry={performance.refresh}
              />
            ) : (
              <CampaignPlatformChart
                data={performance.platform}
                loading={performance.loadingBreakdown}
                error={performance.breakdownError}
                onRetry={performance.refresh}
              />
            )}
          </section>
        </div>
      </div>

      <PerformanceCustomiseModal
        open={customiseOpen}
        onClose={() => setCustomiseOpen(false)}
        selectedMetrics={performance.selectedMetrics}
        preferences={performance.preferences}
        resultLabel={
          performance.overview?.resultLabel ||
          performance.demographics?.resultLabel ||
          'Results'
        }
        benchmarksAvailable={Boolean(performance.overview?.benchmarksAvailable)}
        onApply={({ metrics, preferences }) => {
          performance.setSelectedMetrics(metrics);
          performance.setPreferences(preferences);
        }}
      />
    </div>
  );
}
