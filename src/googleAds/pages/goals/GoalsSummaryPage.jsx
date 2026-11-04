import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import { GaIcon } from '../../icons/GoogleAdsIcons';
import { GOOGLE_ADS_BASE } from '../../nav/googleAdsNavConfig';
import { buildSummaryGoalCards } from '../../goals/goalsViewHelpers';
import useGoogleAdsGoals from '../../goals/useGoogleAdsGoals';

const StatusBadge = ({ tone, label }) => {
  const styles = {
    error: 'text-[#c5221f]',
    warn: 'text-[#b06000]',
    ok: 'text-[#137333]',
  };
  const icons = {
    error: '●',
    warn: '▲',
    ok: '●',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 text-sm ${styles[tone] || styles.warn}`}>
      <span aria-hidden="true" className="text-[10px]">{icons[tone] || icons.warn}</span>
      {label}
    </span>
  );
};

const GoalRow = ({ card, expanded, onToggle }) => (
  <div className="rounded-xl border border-[var(--ga-border)] bg-white">
    <div className="grid grid-cols-[minmax(200px,1.4fr)_120px_160px_minmax(140px,1fr)_auto] items-center gap-3 px-4 py-3.5">
      <div className="min-w-0">
        {card.isAccountDefault ? (
          <div className="mb-0.5 text-[11px] text-[var(--ga-muted)]">Account-default</div>
        ) : null}
        <div className="truncate text-sm font-medium text-[var(--ga-ink)]">{card.label}</div>
        <div className="truncate text-xs text-[var(--ga-muted)]">{card.subtitle}</div>
      </div>
      <div className="text-sm text-[var(--ga-muted)]">—</div>
      <div className="text-sm text-[var(--ga-ink)]">{card.primaryCount}</div>
      <div>
        <StatusBadge tone={card.statusTone} label={card.status} />
      </div>
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          className="text-sm font-medium text-[var(--ga-blue)] hover:underline"
        >
          Edit goal
        </button>
        <button
          type="button"
          onClick={onToggle}
          className="rounded-full p-1.5 text-[var(--ga-muted)] hover:bg-[var(--ga-hover)]"
          aria-label={expanded ? 'Collapse' : 'Expand'}
        >
          <GaIcon
            name="chevron"
            className={`h-4 w-4 transition ${expanded ? 'rotate-180' : ''}`}
          />
        </button>
      </div>
    </div>
    {expanded ? (
      <div className="border-t border-[var(--ga-border)] bg-[var(--ga-surface)] px-4 py-3">
        <div className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--ga-muted)]">
          Primary conversion actions
        </div>
        {card.actions.length === 0 ? (
          <p className="text-sm text-[var(--ga-muted)]">No conversion actions in this goal yet.</p>
        ) : (
          <ul className="space-y-1.5">
            {card.actions.map((action) => (
              <li
                key={action._id || action.remote?.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white px-3 py-2 text-sm"
              >
                <span className="font-medium text-[var(--ga-blue)]">{action.name}</span>
                <span className="text-xs text-[var(--ga-muted)]">
                  {action.action?.primaryForGoal ? 'Primary' : 'Secondary'}
                  {' · '}
                  {action.origin}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    ) : null}
  </div>
);

export default function GoalsSummaryPage() {
  const { goals, lastSyncedAt, loading, syncing, error, syncNow } = useGoogleAdsGoals({
    includeDeleted: false,
    ifStale: true,
  });
  const [tab, setTab] = useState('goals');
  const [expanded, setExpanded] = useState({});

  const { cards, customs } = useMemo(() => buildSummaryGoalCards(goals), [goals]);

  const dateLabel = lastSyncedAt
    ? `Synced ${new Date(lastSyncedAt).toLocaleString()}`
    : 'Not synced yet';

  return (
    <div className="px-6 py-5">
      <PageHeader
        title="Summary"
        dateLabel={dateLabel}
        actions={
          <button
            type="button"
            onClick={syncNow}
            disabled={syncing || loading}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--ga-border)] bg-white px-3 py-1.5 text-sm text-[var(--ga-ink)] hover:bg-[var(--ga-hover)] disabled:opacity-60"
          >
            {syncing ? 'Syncing…' : 'Refresh from Google'}
          </button>
        }
      />

      <div className="mb-4 flex items-center gap-1 border-b border-[var(--ga-border)]">
        {[
          { id: 'goals', label: 'Goals' },
          { id: 'diagnostics', label: 'Diagnostics' },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`border-b-2 px-3 py-2 text-sm font-medium ${
              tab === item.id
                ? 'border-[var(--ga-blue)] text-[var(--ga-blue)]'
                : 'border-transparent text-[var(--ga-muted)] hover:text-[var(--ga-ink)]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {error ? (
        <div className="mb-4 rounded-xl border border-[#fce8e6] bg-[#fce8e6]/80 px-4 py-3 text-sm text-[#c5221f]">
          {error}
        </div>
      ) : null}

      {tab === 'diagnostics' ? (
        <div className="rounded-xl border border-[var(--ga-border)] bg-white px-5 py-8 text-sm text-[var(--ga-muted)]">
          Diagnostics for conversion tracking will appear here. Use All conversions to review
          individual action health.
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-base font-medium text-[var(--ga-ink)]">All your goals</h2>
              <p className="mt-0.5 text-sm text-[var(--ga-muted)]">
                Account-default goals and custom goals synced from Google Ads.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to={`${GOOGLE_ADS_BASE}/goals/all-conversions`}
                className="text-sm font-medium text-[var(--ga-blue)] hover:underline"
              >
                View all conversion actions
              </Link>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--ga-blue)] px-4 py-2 text-sm font-medium text-white shadow-sm hover:brightness-95"
              >
                <span aria-hidden="true">+</span>
                Create conversion action
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--ga-border)] bg-white px-4 py-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-[var(--ga-ink)]">
                  Customer lifecycle optimization
                </div>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex flex-wrap gap-x-8 gap-y-1">
                    <span className="text-[var(--ga-muted)]">New customers</span>
                    <span className="text-[var(--ga-ink)]">Incremental conversion value · configure in Google Ads</span>
                  </div>
                  <div className="flex flex-wrap gap-x-8 gap-y-1">
                    <span className="text-[var(--ga-muted)]">Audience segments</span>
                    <span className="text-[var(--ga-ink)]">Managed in Google Ads</span>
                  </div>
                </div>
              </div>
              <button type="button" className="text-sm font-medium text-[var(--ga-blue)] hover:underline">
                Edit goal
              </button>
            </div>
            <div className="mt-3 rounded-lg border border-[#feefc3] bg-[#fef7e0] px-3 py-2 text-sm text-[#5f6368]">
              To use customer acquisition, include an audience segment with at least 100 active
              members in at least one network.
            </div>
          </div>

          {loading && !cards.length ? (
            <div className="rounded-xl border border-[var(--ga-border)] bg-white px-5 py-10 text-center text-sm text-[var(--ga-muted)]">
              Loading goals from Google Ads…
            </div>
          ) : null}

          {!loading && cards.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--ga-border)] bg-white px-5 py-10 text-center text-sm text-[var(--ga-muted)]">
              No goals synced yet. Click “Refresh from Google”.
            </div>
          ) : null}

          {cards.length > 0 ? (
            <div className="space-y-2">
              <div className="hidden grid-cols-[minmax(200px,1.4fr)_120px_160px_minmax(140px,1fr)_auto] gap-3 px-4 text-xs font-medium text-[var(--ga-muted)] md:grid">
                <span>Goal</span>
                <span>Campaigns</span>
                <span>Primary conversion actions</span>
                <span>Status</span>
                <span />
              </div>
              {cards.map((card) => (
                <GoalRow
                  key={card.category}
                  card={card}
                  expanded={Boolean(expanded[card.category])}
                  onToggle={() => setExpanded((prev) => ({
                    ...prev,
                    [card.category]: !prev[card.category],
                  }))}
                />
              ))}
            </div>
          ) : null}

          {customs.length > 0 ? (
            <div className="space-y-2">
              <h3 className="pt-2 text-sm font-medium text-[var(--ga-ink)]">Custom goals</h3>
              {customs.map((goal) => (
                <div
                  key={goal._id || goal.remote?.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--ga-border)] bg-white px-4 py-3.5"
                >
                  <div>
                    <div className="text-sm font-medium text-[var(--ga-ink)]">{goal.name}</div>
                    <div className="text-xs text-[var(--ga-muted)]">
                      {(goal.actionRemoteIds || []).length} conversion action
                      {(goal.actionRemoteIds || []).length === 1 ? '' : 's'}
                    </div>
                  </div>
                  <button type="button" className="text-sm font-medium text-[var(--ga-blue)] hover:underline">
                    Edit goal
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          <div className="flex justify-start pt-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--ga-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--ga-ink)] hover:bg-[var(--ga-hover)]"
            >
              <span aria-hidden="true" className="text-[var(--ga-blue)]">+</span>
              Create goal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
