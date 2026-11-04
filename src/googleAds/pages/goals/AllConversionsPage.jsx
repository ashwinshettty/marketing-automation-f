import { Fragment, useMemo } from 'react';
import PageHeader from '../../components/PageHeader';
import useGoogleAdsGoals from '../../goals/useGoogleAdsGoals';
import {
  countingLabel,
  groupActionsByCategory,
  includedInAccountGoals,
  originLabel,
} from '../../goals/goalsViewHelpers';

const trackingLabel = (action) => {
  const status = String(action?.remote?.status || '').toUpperCase();
  if (action?.deletedAt || status === 'REMOVED') return { label: 'Removed', tone: 'muted' };
  if (status === 'HIDDEN') return { label: 'Hidden', tone: 'muted' };
  if (status === 'ENABLED') return { label: 'Active', tone: 'ok' };
  return { label: status || 'Unknown', tone: 'warn' };
};

const ToneDot = ({ tone }) => {
  const color = {
    ok: 'bg-[#34a853]',
    warn: 'bg-[#f9ab00]',
    error: 'bg-[#ea4335]',
    muted: 'bg-[#9aa0a6]',
  }[tone] || 'bg-[#9aa0a6]';
  return <span className={`inline-block h-2 w-2 rounded-full ${color}`} aria-hidden="true" />;
};

export default function AllConversionsPage() {
  const { goals, lastSyncedAt, loading, syncing, error, syncNow } = useGoogleAdsGoals({
    includeDeleted: true,
    ifStale: true,
  });

  const standards = useMemo(
    () => goals.filter((d) => d.docType === 'STANDARD_GOAL'),
    [goals],
  );
  const groups = useMemo(() => groupActionsByCategory(goals), [goals]);
  const totalActions = groups.reduce((n, g) => n + g.actions.length, 0);

  const dateLabel = lastSyncedAt
    ? `Synced ${new Date(lastSyncedAt).toLocaleString()}`
    : 'Not synced yet';

  return (
    <div className="px-6 py-5">
      <PageHeader
        title="All conversions"
        dateLabel={dateLabel}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={syncNow}
              disabled={syncing || loading}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--ga-border)] bg-white px-3 py-1.5 text-sm text-[var(--ga-ink)] hover:bg-[var(--ga-hover)] disabled:opacity-60"
            >
              {syncing ? 'Syncing…' : 'Refresh from Google'}
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--ga-blue)] px-4 py-2 text-sm font-medium text-white shadow-sm hover:brightness-95"
            >
              <span aria-hidden="true">+</span>
              New conversion
            </button>
          </div>
        }
      />

      {error ? (
        <div className="mb-4 rounded-xl border border-[#fce8e6] bg-[#fce8e6]/80 px-4 py-3 text-sm text-[#c5221f]">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-[var(--ga-border)] bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--ga-border)] bg-[var(--ga-surface)] text-xs font-medium text-[var(--ga-muted)]">
                <th className="px-4 py-3 font-medium">Conversion action</th>
                <th className="px-3 py-3 font-medium">Conversion source</th>
                <th className="px-3 py-3 font-medium">Tracking status</th>
                <th className="px-3 py-3 font-medium">Action optimization</th>
                <th className="px-3 py-3 font-medium">Count</th>
                <th className="px-3 py-3 font-medium">Click-through conversion window</th>
                <th className="px-3 py-3 font-medium">Included in account-level goals</th>
              </tr>
            </thead>
            <tbody>
              {loading && !groups.length ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-[var(--ga-muted)]">
                    Loading conversion actions…
                  </td>
                </tr>
              ) : null}

              {!loading && !groups.length ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-[var(--ga-muted)]">
                    No conversion actions synced yet.
                  </td>
                </tr>
              ) : null}

              {groups.map((group) => (
                <Fragment key={group.category}>
                  <tr className="bg-[#f1f3f4]">
                    <td colSpan={7} className="px-4 py-2.5">
                      <div className="text-sm font-medium text-[var(--ga-ink)]">{group.label}</div>
                      <div className="text-xs text-[var(--ga-muted)]">{group.subtitle}</div>
                    </td>
                  </tr>
                  {group.actions.map((action) => {
                    const track = trackingLabel(action);
                    const source = originLabel(
                      action.origin,
                      action.action?.mobileAppVendor,
                    );
                    const included = includedInAccountGoals(action, standards);
                    const days = action.action?.clickThroughLookbackWindowDays;
                    return (
                      <tr
                        key={action._id || action.remote?.id}
                        className="border-b border-[var(--ga-border)] last:border-b-0 hover:bg-[var(--ga-hover)]"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <ToneDot tone={track.tone} />
                            <span className="font-medium text-[var(--ga-blue)]">{action.name}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-[var(--ga-ink)]">{source}</td>
                        <td className="px-3 py-3 text-[var(--ga-ink)]">{track.label}</td>
                        <td className="px-3 py-3 text-[var(--ga-ink)]">
                          {action.action?.primaryForGoal ? 'Primary' : 'Secondary'}
                        </td>
                        <td className="px-3 py-3 text-[var(--ga-ink)]">
                          {countingLabel(action.action?.countingType)}
                        </td>
                        <td className="px-3 py-3 text-[var(--ga-ink)]">
                          {days != null ? `${days} day${days === 1 ? '' : 's'}` : '—'}
                        </td>
                        <td className="px-3 py-3 text-[var(--ga-ink)]">
                          {included ? 'Yes' : 'No'}
                        </td>
                      </tr>
                    );
                  })}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-[var(--ga-border)] px-4 py-2.5 text-xs text-[var(--ga-muted)]">
          <span>
            {totalActions} conversion action{totalActions === 1 ? '' : 's'}
          </span>
          <span>Metrics columns (All conv.) are not stored in this sync — Google Ads UI only.</span>
        </div>
      </div>
    </div>
  );
}
