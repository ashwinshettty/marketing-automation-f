import { BUDGET_PRESETS } from './searchWizardDefaults';

function SectionCard({ title, badge = null, children, collapsible = false, defaultOpen = true }) {
  if (!collapsible) {
    return (
      <section className="rounded-2xl border border-[var(--ga-border)] bg-white shadow-[0_1px_2px_rgba(60,64,67,0.08)]">
        <div className="border-b border-[var(--ga-border)] px-6 py-4">
          <h2 className="flex items-center gap-2 text-base font-medium text-[var(--ga-ink)]">
            {title}
            {badge}
          </h2>
        </div>
        <div className="px-6 py-5">{children}</div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-[var(--ga-border)] bg-white shadow-[0_1px_2px_rgba(60,64,67,0.08)]">
      <details open={defaultOpen} className="group">
        <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-4 marker:content-none [&::-webkit-details-marker]:hidden">
          <h2 className="flex items-center gap-2 text-base font-medium text-[var(--ga-ink)]">
            {title}
            {badge}
          </h2>
          <span className="text-[var(--ga-muted)] transition group-open:rotate-180">▾</span>
        </summary>
        <div className="border-t border-[var(--ga-border)] px-6 py-5">{children}</div>
      </details>
    </section>
  );
}

function InfoBanner({ children }) {
  return (
    <div className="flex gap-2 rounded-xl bg-[var(--ga-blue-soft)] px-4 py-3 text-sm text-[var(--ga-ink)]">
      <span
        className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[var(--ga-blue)] text-[10px] text-white"
        aria-hidden="true"
      >
        i
      </span>
      <div className="leading-5">{children}</div>
    </div>
  );
}

function formatRupee(amount) {
  const num = Number(amount);
  if (!Number.isFinite(num)) return `₹ ${amount}`;
  return `₹ ${num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function SearchBiddingBudgetStep({ value, onChange }) {
  const set = (patch) => onChange({ ...value, ...patch });
  const canUsePromotion = value.biddingFocus === 'TARGET_ROAS';

  const selectPreset = (preset) => {
    set({
      budgetMode: preset.id,
      dailyBudget: preset.amount,
    });
  };

  const selectCustom = () => {
    set({ budgetMode: 'CUSTOM' });
  };

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-[var(--ga-border)] bg-white shadow-[0_1px_2px_rgba(60,64,67,0.08)]">
        <div className="px-6 pt-6">
          <h1 className="text-[28px] font-normal tracking-tight text-[var(--ga-ink)]">Budget</h1>
          <p className="mt-1 text-sm text-[var(--ga-muted)]">Decide how much you want to spend.</p>
        </div>

        <div className="space-y-5 px-6 py-5">
          <InfoBanner>
            Your budget type (daily or campaign total) can’t be changed once this campaign has
            started. You can change your budget amount at any time.
          </InfoBanner>

          <div>
            <h3 className="mb-3 text-sm font-medium text-[var(--ga-ink)]">Select budget type</h3>
            <div className="space-y-3">
              <label className="flex cursor-pointer gap-3">
                <input
                  type="radio"
                  name="budgetType"
                  checked={value.budgetType === 'DAILY'}
                  onChange={() => set({ budgetType: 'DAILY' })}
                  className="mt-1 h-4 w-4 accent-[var(--ga-blue)]"
                />
                <span>
                  <span className="block text-sm font-medium text-[var(--ga-ink)]">
                    Average daily budget
                  </span>
                  <span className="mt-0.5 block text-xs text-[var(--ga-muted)]">
                    Set your average daily budget for this campaign.
                  </span>
                </span>
              </label>
              <label className="flex cursor-pointer gap-3">
                <input
                  type="radio"
                  name="budgetType"
                  checked={value.budgetType === 'TOTAL'}
                  onChange={() => set({ budgetType: 'TOTAL' })}
                  className="mt-1 h-4 w-4 accent-[var(--ga-blue)]"
                />
                <span>
                  <span className="block text-sm font-medium text-[var(--ga-ink)]">
                    Campaign total budget
                  </span>
                  <span className="mt-0.5 block text-xs text-[var(--ga-muted)]">
                    Set a budget for the duration of your campaign.
                  </span>
                </span>
              </label>
            </div>
          </div>

          {value.budgetType === 'DAILY' ? (
            <div className="space-y-2">
              {BUDGET_PRESETS.map((preset) => {
                const selected = value.budgetMode === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => selectPreset(preset)}
                    className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                      selected
                        ? 'border-[var(--ga-blue)] bg-white shadow-sm'
                        : 'border-[var(--ga-border)] hover:bg-[var(--ga-hover)]'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                          selected ? 'border-[var(--ga-blue)]' : 'border-[#5f6368]'
                        }`}
                      >
                        {selected ? (
                          <span className="h-2 w-2 rounded-full bg-[var(--ga-blue)]" />
                        ) : null}
                      </span>
                      <span className="text-sm font-medium text-[var(--ga-ink)]">
                        {formatRupee(preset.amount)}
                      </span>
                      {preset.recommended ? (
                        <span className="rounded bg-[var(--ga-blue-soft)] px-2 py-0.5 text-[11px] font-medium text-[var(--ga-blue)]">
                          Recommended
                        </span>
                      ) : null}
                    </span>
                    <span className="text-[var(--ga-muted)]">▾</span>
                  </button>
                );
              })}

              <div
                className={`rounded-xl border px-4 py-3 ${
                  value.budgetMode === 'CUSTOM'
                    ? 'border-[var(--ga-blue)] bg-white shadow-sm'
                    : 'border-[var(--ga-border)]'
                }`}
              >
                <button
                  type="button"
                  onClick={selectCustom}
                  className="flex w-full items-center gap-3 text-left"
                >
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                      value.budgetMode === 'CUSTOM' ? 'border-[var(--ga-blue)]' : 'border-[#5f6368]'
                    }`}
                  >
                    {value.budgetMode === 'CUSTOM' ? (
                      <span className="h-2 w-2 rounded-full bg-[var(--ga-blue)]" />
                    ) : null}
                  </span>
                  <span className="text-sm font-medium text-[var(--ga-ink)]">Set custom budget</span>
                </button>

                {value.budgetMode === 'CUSTOM' ? (
                  <div className="mt-3 border-t border-[var(--ga-border)] pt-3 pl-7">
                    <p className="mb-2 text-sm text-[var(--ga-muted)]">
                      Set your average daily budget for this campaign.
                    </p>
                    <div className="relative max-w-xs">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--ga-muted)]">
                        ₹
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={value.dailyBudget}
                        onChange={(event) => set({ dailyBudget: event.target.value })}
                        className="w-full rounded-lg border border-[var(--ga-border)] py-2.5 pl-7 pr-3 text-sm outline-none focus:border-[var(--ga-blue)]"
                      />
                    </div>
                  </div>
                ) : null}
              </div>

              <InfoBanner>
                New budgets are shown based on changes made to your campaign.
              </InfoBanner>

              <p className="text-xs leading-5 text-[var(--ga-muted)]">
                On days when you&apos;re more likely to get conversions, you may spend more. Over a
                month, average daily spend will stay at the amount you set.{' '}
                <button type="button" className="text-[var(--ga-blue)] hover:underline">
                  Learn more
                </button>
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="max-w-xs">
                <label className="mb-2 block text-sm font-medium text-[var(--ga-ink)]">
                  Campaign total budget
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--ga-muted)]">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={value.totalBudget}
                    onChange={(event) => set({ totalBudget: event.target.value })}
                    className="w-full rounded-lg border border-[var(--ga-border)] py-2.5 pl-7 pr-3 text-sm outline-none focus:border-[var(--ga-blue)]"
                  />
                </div>
              </div>
              <div className="flex max-w-lg flex-wrap gap-3">
                <div className="min-w-[160px] flex-1">
                  <label className="mb-2 block text-sm font-medium text-[var(--ga-ink)]">
                    Start date
                  </label>
                  <input
                    type="date"
                    value={value.budgetStartDate}
                    onChange={(event) => set({ budgetStartDate: event.target.value })}
                    className="w-full rounded-lg border border-[var(--ga-border)] px-3 py-2.5 text-sm outline-none focus:border-[var(--ga-blue)]"
                  />
                </div>
                <div className="min-w-[160px] flex-1">
                  <label className="mb-2 block text-sm font-medium text-[var(--ga-ink)]">
                    End date
                  </label>
                  <input
                    type="date"
                    value={value.budgetEndDate}
                    onChange={(event) => set({ budgetEndDate: event.target.value })}
                    className="w-full rounded-lg border border-[var(--ga-border)] px-3 py-2.5 text-sm outline-none focus:border-[var(--ga-blue)]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <SectionCard
        title="Promotion mode"
        badge={
          <span className="rounded bg-[#e6f4ea] px-2 py-0.5 text-[11px] font-medium text-[#137333]">
            BETA
          </span>
        }
        collapsible
      >
        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <label
              className={`flex gap-3 ${canUsePromotion ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
            >
              <input
                type="checkbox"
                checked={Boolean(value.promotionMode)}
                disabled={!canUsePromotion}
                onChange={(event) => set({ promotionMode: event.target.checked })}
                className="mt-1 h-4 w-4 accent-[var(--ga-blue)]"
              />
              <span>
                <span className="block text-sm font-medium text-[var(--ga-ink)]">
                  Ramp up spend quicker on promotion dates
                </span>
                <span className="mt-1 block text-xs leading-5 text-[var(--ga-muted)]">
                  Prioritize driving more sales over reaching your target ROAS on these dates.
                </span>
              </span>
            </label>
            {!canUsePromotion ? (
              <div className="mt-3">
                <InfoBanner>
                  To turn on promotion mode, change your bid strategy to{' '}
                  <span className="font-medium">Target ROAS</span>.
                </InfoBanner>
              </div>
            ) : null}
          </div>
          <div className="border-t border-[var(--ga-border)] pt-4 text-xs leading-5 text-[var(--ga-muted)] lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
            Promotion mode will maximize the reach of your ads on promotion dates. It uses Smart
            Bidding Exploration to identify valuable traffic. Your campaign will still use your
            chosen budget type. After promotion mode ends, your campaign will return to the target
            ROAS and budget you set.
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
