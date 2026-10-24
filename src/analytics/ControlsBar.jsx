import { PRESETS } from './format';

const fieldClass =
  'mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-brand-navy outline-none focus:border-brand-navy focus-visible:ring-2 focus-visible:ring-brand-yellow';

const labelClass = 'min-w-[9.5rem] flex-1 text-[11px] font-semibold uppercase tracking-wider text-brand-muted';

const ControlsBar = ({
  preset,
  from,
  to,
  platform,
  campaign,
  ownerId,
  location,
  grain,
  campaigns,
  locations,
  owners,
  generatedAt,
  reporting,
  sync,
  exporting,
  onChange,
  onRefresh,
  onExport,
  onReset,
}) => (
  <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
    <div className="flex flex-wrap items-end gap-3">
      <label className={labelClass}>
        Date range
        <select className={fieldClass} value={preset} onChange={(event) => onChange({ preset: event.target.value })}>
          {PRESETS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </label>

      {preset === 'custom' && (
        <>
          <label className={labelClass}>
            From
            <input type="date" value={from} onChange={(event) => onChange({ from: event.target.value })} className={fieldClass} />
          </label>
          <label className={labelClass}>
            To
            <input type="date" value={to} onChange={(event) => onChange({ to: event.target.value })} className={fieldClass} />
          </label>
        </>
      )}

      <label className={labelClass}>
        Platform
        <select
          className={fieldClass}
          value={platform}
          onChange={(event) => onChange({ platform: event.target.value, campaign: '' })}
        >
          <option value="all">All</option>
          <option value="meta">Meta Ads</option>
          <option value="google">Google Ads</option>
        </select>
      </label>

      <label className="min-w-[12rem] flex-[1.4] text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
        Campaign
        <select className={fieldClass} value={campaign} onChange={(event) => onChange({ campaign: event.target.value })}>
          <option value="">All campaigns</option>
          {campaigns.map((item) => (
            <option key={item.key} value={item.key}>
              {item.name} ({item.count})
            </option>
          ))}
        </select>
      </label>

      <label className={labelClass}>
        City
        <select className={fieldClass} value={location} onChange={(event) => onChange({ location: event.target.value })}>
          <option value="">All cities</option>
          {locations.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </label>

      <label className={labelClass}>
        Owner
        <select className={fieldClass} value={ownerId} onChange={(event) => onChange({ ownerId: event.target.value })}>
          <option value="">All owners</option>
          {owners.map((owner) => (
            <option key={owner.id} value={owner.id}>
              {owner.name}
            </option>
          ))}
        </select>
      </label>

      <label className="min-w-[8rem] text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
        Trend
        <select className={fieldClass} value={grain} onChange={(event) => onChange({ grain: event.target.value })}>
          <option value="">Automatic</option>
          <option value="day">Daily</option>
          <option value="week">Weekly</option>
          <option value="month">Monthly</option>
        </select>
      </label>

      <div className="ml-auto flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onReset}
          className="rounded-xl px-3 py-2 text-sm font-medium text-brand-navy underline decoration-brand-yellow underline-offset-4"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={onRefresh}
          className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-brand-navy hover:bg-brand-cream"
        >
          Refresh
        </button>
        <button
          type="button"
          onClick={() => onExport('leads')}
          disabled={exporting}
          className="rounded-xl bg-brand-navy px-3.5 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {exporting ? 'Exporting…' : 'Export'}
        </button>
        <button
          type="button"
          onClick={() => onExport('campaigns')}
          disabled={exporting}
          className="rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-semibold text-brand-navy disabled:opacity-60"
        >
          Campaigns
        </button>
      </div>
    </div>

    <p className="mt-3 flex items-start gap-2 text-xs text-brand-muted">
      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-yellow" aria-hidden="true" />
      <span>
        Timezone {reporting?.timezone || 'Asia/Kolkata'} · Currency {reporting?.currency || 'not connected'} · Meta Ads{' '}
        {sync?.meta?.connected ? 'connected' : 'not connected'} · Google Ads{' '}
        {sync?.google?.connected ? 'connected' : 'not connected'} · CRM loaded {generatedAt || '—'} ·{' '}
        {reporting?.comparison || 'Previous period'}
      </span>
    </p>
  </section>
);

export default ControlsBar;
