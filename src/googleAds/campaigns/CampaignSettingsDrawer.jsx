import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  editGoogleAdsCampaign,
  getGoogleAdsCampaignSettings,
  setGoogleAdsCampaignDelivery,
} from '../../api/googleAdsCampaignApi';
import { toast } from '../../utils/toast';
import { formatScore } from './campaignFormat';

const BIDDING_OPTIONS = [
  { id: 'MAXIMIZE_CONVERSIONS', label: 'Maximize conversions' },
  { id: 'TARGET_CPA', label: 'Target CPA' },
  { id: 'MAXIMIZE_CONVERSION_VALUE', label: 'Maximize conversion value' },
  { id: 'TARGET_ROAS', label: 'Target ROAS' },
  { id: 'CLICKS', label: 'Maximize clicks' },
];

const messageOf = (error, fallback = 'Could not update the campaign on Google Ads.') => {
  const status = error?.response?.status;
  const data = error?.response?.data;
  if (status === 429 || /429|rate.?limit|RESOURCE_EXHAUSTED/i.test(String(data?.message || error?.message || ''))) {
    return 'Google Ads is rate limiting right now. Wait a moment and try again.';
  }
  if (status === 401 || status === 403) {
    return 'You do not have permission to change this campaign on Google Ads.';
  }
  if (status === 404 || data?.code === 'NOT_FOUND') {
    return 'That campaign was not found on Google Ads.';
  }
  if (data?.code === 'GOOGLE_CAMPAIGN_REMOVED') {
    return 'This campaign is removed on Google Ads and cannot be changed.';
  }
  if (!error?.response && /network|failed to fetch|ECONNREFUSED/i.test(String(error?.message || ''))) {
    return 'Could not reach the server. Check your connection and try again.';
  }
  const details = Array.isArray(data?.details) ? data.details.filter(Boolean) : [];
  const detail = details.find((item) => typeof item === 'string') || '';
  const message = detail || data?.message || error?.message || fallback;
  if (/Google Ads API 429/i.test(message)) {
    return 'Google Ads is rate limiting right now. Wait a moment and try again.';
  }
  return message;
};

function Chevron({ open }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={`h-4 w-4 shrink-0 text-[var(--ga-muted)] transition-transform duration-150 motion-reduce:transition-none ${open ? 'rotate-180' : ''}`}
      aria-hidden="true"
    >
      <path fill="currentColor" d="M5.3 7.3a1 1 0 0 1 1.4 0L10 10.6l3.3-3.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 0-1.4Z" />
    </svg>
  );
}

function StatusDot({ status }) {
  const tone = status === 'ENABLED' || status === 'ELIGIBLE'
    ? 'bg-[#188038]'
    : status === 'REMOVED'
      ? 'bg-[#d93025]'
      : 'bg-[#80868b]';
  return <span className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${tone}`} aria-hidden="true" />;
}

function SettingsRow({ label, value, open, onToggle, children, badge }) {
  return (
    <div className="border-b border-[var(--ga-border)] last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start gap-3 px-4 py-3.5 text-left hover:bg-[var(--ga-hover)]"
      >
        <span className="w-44 shrink-0 text-sm text-[var(--ga-muted)]">
          {label}
          {badge ? (
            <span className="ml-2 rounded bg-[#e8f0fe] px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--ga-blue)]">
              {badge}
            </span>
          ) : null}
        </span>
        <span className="min-w-0 flex-1 text-sm text-[var(--ga-ink)]">{value}</span>
        <Chevron open={open} />
      </button>
      {open ? <div className="border-t border-[var(--ga-border)] bg-[var(--ga-surface)] px-4 py-3">{children}</div> : null}
    </div>
  );
}

function FieldLabel({ htmlFor, children }) {
  return <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-medium text-[var(--ga-muted)]">{children}</label>;
}

function TextInput(props) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border border-[var(--ga-border)] bg-white px-3 py-2 text-sm text-[var(--ga-ink)] outline-none focus:border-[var(--ga-blue)] ${props.className || ''}`}
    />
  );
}

function TextSelect(props) {
  return (
    <select
      {...props}
      className={`w-full rounded-lg border border-[var(--ga-border)] bg-white px-3 py-2 text-sm text-[var(--ga-ink)] outline-none focus:border-[var(--ga-blue)] ${props.className || ''}`}
    />
  );
}

function SaveBar({ disabled, saving, onCancel, onSave }) {
  return (
    <div className="mt-3 flex items-center justify-end gap-2">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-full px-3 py-1.5 text-sm text-[var(--ga-muted)] hover:bg-white"
      >
        Cancel
      </button>
      <button
        type="button"
        disabled={disabled || saving}
        onClick={onSave}
        className="rounded-full bg-[var(--ga-blue)] px-4 py-1.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {saving ? 'Saving…' : 'Save'}
      </button>
    </div>
  );
}

export default function CampaignSettingsDrawer({
  campaignId = '',
  open = false,
  onClose,
  onSaved,
}) {
  const reduceMotion = useReducedMotion();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [openRow, setOpenRow] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState('ENABLED');
  const [searchPartners, setSearchPartners] = useState(true);
  const [displayNetwork, setDisplayNetwork] = useState(false);
  const [budgetAmount, setBudgetAmount] = useState('');
  const [biddingFocus, setBiddingFocus] = useState('MAXIMIZE_CONVERSIONS');
  const [targetCpa, setTargetCpa] = useState('');
  const [targetRoas, setTargetRoas] = useState('');
  const [maxCpcLimit, setMaxCpcLimit] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [trackingUrlTemplate, setTrackingUrlTemplate] = useState('');
  const [finalUrlSuffix, setFinalUrlSuffix] = useState('');

  useEffect(() => {
    if (!open || !campaignId) return undefined;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setOpenRow('');
    getGoogleAdsCampaignSettings(campaignId)
      .then((data) => {
        if (cancelled) return;
        const next = data?.settings || null;
        setSettings(next);
        setName(next?.name || '');
        setStatus(next?.status === 'PAUSED' ? 'PAUSED' : 'ENABLED');
        setSearchPartners(next?.networks?.searchPartners !== false);
        setDisplayNetwork(Boolean(next?.networks?.displayNetwork));
        setBudgetAmount(next?.budget?.amount != null ? String(next.budget.amount) : '');
        setBiddingFocus(next?.bidding?.focus || 'MAXIMIZE_CONVERSIONS');
        setTargetCpa(next?.bidding?.targetCpa != null ? String(next.bidding.targetCpa) : '');
        setTargetRoas(next?.bidding?.targetRoas != null ? String(next.bidding.targetRoas) : '');
        setMaxCpcLimit(next?.bidding?.maxCpcLimit != null ? String(next.bidding.maxCpcLimit) : '');
        setStartDate(next?.startDate || '');
        setEndDate(next?.endDate || '');
        setTrackingUrlTemplate(next?.trackingUrlTemplate || '');
        setFinalUrlSuffix(next?.finalUrlSuffix || '');
      })
      .catch((err) => {
        if (!cancelled) {
          setSettings(null);
          const message = messageOf(err, 'Could not load campaign settings from Google Ads.');
          setError(message);
          toast.error(message);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [campaignId, open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const toggleRow = (id) => setOpenRow((prev) => (prev === id ? '' : id));

  const savePatch = async (patch, { successMessage, after } = {}) => {
    setSaving(true);
    setError(null);
    try {
      const result = await editGoogleAdsCampaign(campaignId, patch);
      const refreshed = await getGoogleAdsCampaignSettings(campaignId);
      setSettings(refreshed?.settings || null);
      after?.();
      toast.success(
        result?.sharedBudget
          ? `${successMessage} Shared budget campaigns were updated too.`
          : (successMessage || result?.message || 'Campaign updated on Google Ads.'),
      );
      onSaved?.(result);
    } catch (err) {
      const message = messageOf(err);
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const saveName = () => savePatch(
    { name: name.trim() },
    { successMessage: 'Campaign name updated on Google Ads.', after: () => setOpenRow('') },
  );
  const saveNetworks = () => savePatch(
    { networks: { searchPartners, displayNetwork } },
    { successMessage: 'Networks updated on Google Ads.', after: () => setOpenRow('') },
  );
  const saveBudget = () => {
    if (!(Number(budgetAmount) > 0)) {
      toast.error('Enter a budget greater than 0.');
      return undefined;
    }
    return savePatch(
      { budgetAmount: Number(budgetAmount) },
      { successMessage: 'Budget updated on Google Ads.', after: () => setOpenRow('') },
    );
  };
  const saveBidding = () => {
    const bidding = { focus: biddingFocus };
    if (biddingFocus === 'TARGET_CPA' || biddingFocus === 'MAXIMIZE_CONVERSIONS') {
      if (targetCpa !== '') bidding.targetCpa = Number(targetCpa);
    }
    if (biddingFocus === 'TARGET_ROAS' || biddingFocus === 'MAXIMIZE_CONVERSION_VALUE') {
      if (targetRoas !== '') bidding.targetRoas = Number(targetRoas);
    }
    if (biddingFocus === 'CLICKS' && maxCpcLimit !== '') {
      bidding.maxCpcLimit = Number(maxCpcLimit);
    }
    return savePatch(
      { bidding },
      { successMessage: 'Bidding strategy updated on Google Ads.', after: () => setOpenRow('') },
    );
  };
  const saveDates = () => {
    const patch = {};
    if (startDate) patch.startDate = startDate;
    if (endDate) patch.endDate = endDate;
    if (!Object.keys(patch).length) {
      toast.error('Choose a start date or an end date before saving.');
      return undefined;
    }
    if (startDate && endDate && startDate > endDate) {
      toast.error('The end date must be on or after the start date.');
      return undefined;
    }
    return savePatch(
      patch,
      { successMessage: 'Campaign dates updated on Google Ads.', after: () => setOpenRow('') },
    );
  };
  const saveTracking = () => savePatch(
    { trackingUrlTemplate, finalUrlSuffix },
    { successMessage: 'Tracking settings updated on Google Ads.', after: () => setOpenRow('') },
  );

  const saveStatus = async () => {
    if (!settings || status === settings.status) {
      setOpenRow('');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await setGoogleAdsCampaignDelivery({ campaignId, status });
      const refreshed = await getGoogleAdsCampaignSettings(campaignId);
      setSettings(refreshed?.settings || null);
      setOpenRow('');
      toast.success(
        status === 'PAUSED'
          ? 'Campaign paused on Google Ads.'
          : 'Campaign enabled on Google Ads.',
      );
      onSaved?.({ status });
    } catch (err) {
      const message = messageOf(err, 'Campaign status could not be updated on Google Ads.');
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const score = formatScore(settings?.optimizationScore);
  const removed = settings?.status === 'REMOVED';
  const locationSummary = settings?.locations?.items?.length
    ? settings.locations.items
      .filter((item) => item.action === 'include')
      .map((item) => item.name)
      .slice(0, 3)
      .join(', ')
      + (settings.locations.items.filter((item) => item.action === 'include').length > 3
        ? ` + ${settings.locations.items.filter((item) => item.action === 'include').length - 3} more`
        : '')
    : 'All countries and territories';

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="Close settings"
            className="fixed inset-0 z-40 bg-black/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.18 }}
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Campaign settings"
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[560px] flex-col border-l border-[var(--ga-border)] bg-white shadow-[-8px_0_24px_rgba(32,33,36,0.12)]"
            initial={reduceMotion ? false : { x: '100%' }}
            animate={{ x: 0 }}
            exit={reduceMotion ? undefined : { x: '100%' }}
            transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 38 }}
          >
            <header className="border-b border-[var(--ga-border)] px-5 py-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[var(--ga-muted)] hover:bg-[var(--ga-hover)]"
                >
                  ✕
                </button>
                <h2 className="text-xl font-normal text-[var(--ga-ink)]">Settings</h2>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-[var(--ga-muted)]">
                <span className="inline-flex items-center gap-1.5">
                  Status
                  <StatusDot status={settings?.status} />
                  <span className="text-[var(--ga-ink)]">{settings?.statusLabel || '—'}</span>
                </span>
                <span>Type <span className="text-[var(--ga-ink)]">{settings?.channelLabel || '—'}</span></span>
                <span>
                  Optimization score{' '}
                  <span className="text-[var(--ga-ink)]">{score == null ? '—' : `${score.toFixed(1)}%`}</span>
                </span>
              </div>
            </header>

            <div className="ga-scroll flex-1 overflow-y-auto px-5 py-4">
              {loading ? <p className="text-sm text-[var(--ga-muted)]">Loading campaign settings…</p> : null}
              {error ? <p className="mb-3 text-sm text-[#d93025]">{error}</p> : null}
              {!loading && settings ? (
                <div className="space-y-4">
                  <section className="overflow-hidden rounded-xl border border-[var(--ga-border)] bg-white">
                    <SettingsRow
                      label="Campaign name"
                      value={settings.name}
                      open={openRow === 'name'}
                      onToggle={() => toggleRow('name')}
                    >
                      <FieldLabel htmlFor="campaign-edit-name">Name</FieldLabel>
                      <TextInput
                        id="campaign-edit-name"
                        value={name}
                        disabled={removed}
                        maxLength={255}
                        onChange={(event) => setName(event.target.value)}
                      />
                      <SaveBar
                        disabled={removed || !name.trim() || name.trim() === settings.name}
                        saving={saving}
                        onCancel={() => {
                          setName(settings.name || '');
                          setOpenRow('');
                        }}
                        onSave={saveName}
                      />
                    </SettingsRow>

                    <SettingsRow
                      label="Campaign status"
                      value={(
                        <span className="inline-flex items-center gap-2">
                          <StatusDot status={settings.status} />
                          {settings.statusLabel}
                        </span>
                      )}
                      open={openRow === 'status'}
                      onToggle={() => toggleRow('status')}
                    >
                      <FieldLabel htmlFor="campaign-edit-status">Status</FieldLabel>
                      <TextSelect
                        id="campaign-edit-status"
                        value={status}
                        disabled={removed}
                        onChange={(event) => setStatus(event.target.value)}
                      >
                        <option value="ENABLED">Enabled</option>
                        <option value="PAUSED">Paused</option>
                      </TextSelect>
                      {removed ? (
                        <p className="mt-2 text-xs text-[var(--ga-muted)]">A removed campaign cannot be turned back on.</p>
                      ) : null}
                      <SaveBar
                        disabled={removed || status === settings.status}
                        saving={saving}
                        onCancel={() => {
                          setStatus(settings.status === 'PAUSED' ? 'PAUSED' : 'ENABLED');
                          setOpenRow('');
                        }}
                        onSave={saveStatus}
                      />
                    </SettingsRow>

                    {settings.channelType === 'SEARCH' ? (
                      <SettingsRow
                        label="Networks"
                        value={settings.networks?.summary || '—'}
                        open={openRow === 'networks'}
                        onToggle={() => toggleRow('networks')}
                      >
                        <label className="mb-2 flex items-center gap-2 text-sm text-[var(--ga-ink)]">
                          <input
                            type="checkbox"
                            checked={searchPartners}
                            disabled={removed}
                            onChange={(event) => setSearchPartners(event.target.checked)}
                            className="accent-[var(--ga-blue)]"
                          />
                          Include Google search partners
                        </label>
                        <label className="flex items-center gap-2 text-sm text-[var(--ga-ink)]">
                          <input
                            type="checkbox"
                            checked={displayNetwork}
                            disabled={removed}
                            onChange={(event) => setDisplayNetwork(event.target.checked)}
                            className="accent-[var(--ga-blue)]"
                          />
                          Include Google Display Network
                        </label>
                        <SaveBar
                          disabled={removed}
                          saving={saving}
                          onCancel={() => {
                            setSearchPartners(settings.networks?.searchPartners !== false);
                            setDisplayNetwork(Boolean(settings.networks?.displayNetwork));
                            setOpenRow('');
                          }}
                          onSave={saveNetworks}
                        />
                      </SettingsRow>
                    ) : null}
                  </section>

                  <section className="overflow-hidden rounded-xl border border-[var(--ga-border)] bg-white">
                    <div className="border-b border-[var(--ga-border)] bg-[var(--ga-surface)] px-4 py-3">
                      <h3 className="text-sm font-medium text-[var(--ga-ink)]">Budget and bidding optimization</h3>
                      <div className="mt-2 space-y-1 text-sm text-[var(--ga-muted)]">
                        <p>
                          Your {settings.summary?.channel || 'campaign'} bidding strategy is{' '}
                          <span className="font-medium text-[var(--ga-ink)]">{settings.summary?.bidding}</span>.
                        </p>
                        <p>
                          Your budget is{' '}
                          <span className="font-medium text-[var(--ga-ink)]">{settings.summary?.budget}</span>.
                        </p>
                      </div>
                    </div>

                    <SettingsRow
                      label="Budget"
                      value={settings.budget?.summary || '—'}
                      open={openRow === 'budget'}
                      onToggle={() => toggleRow('budget')}
                    >
                      <FieldLabel htmlFor="campaign-edit-budget">
                        {settings.budget?.period === 'CUSTOM_PERIOD' ? 'Total budget' : 'Average daily budget'}
                      </FieldLabel>
                      <div className="relative">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--ga-muted)]">₹</span>
                        <TextInput
                          id="campaign-edit-budget"
                          type="number"
                          min="1"
                          step="0.01"
                          value={budgetAmount}
                          disabled={removed}
                          onChange={(event) => setBudgetAmount(event.target.value)}
                          className="pl-7"
                        />
                      </div>
                      {settings.budget?.shared ? (
                        <p className="mt-2 text-xs text-[var(--ga-muted)]">
                          This budget is shared. Changing it updates every campaign that uses it.
                        </p>
                      ) : null}
                      <SaveBar
                        disabled={removed || !budgetAmount || Number(budgetAmount) <= 0}
                        saving={saving}
                        onCancel={() => {
                          setBudgetAmount(settings.budget?.amount != null ? String(settings.budget.amount) : '');
                          setOpenRow('');
                        }}
                        onSave={saveBudget}
                      />
                    </SettingsRow>

                    <SettingsRow
                      label="Bidding"
                      value={settings.bidding?.label || '—'}
                      open={openRow === 'bidding'}
                      onToggle={() => toggleRow('bidding')}
                    >
                      <FieldLabel htmlFor="campaign-edit-bidding">Bidding strategy</FieldLabel>
                      <TextSelect
                        id="campaign-edit-bidding"
                        value={biddingFocus}
                        disabled={removed}
                        onChange={(event) => setBiddingFocus(event.target.value)}
                      >
                        {BIDDING_OPTIONS
                          .filter((option) => (
                            settings.channelType !== 'PERFORMANCE_MAX'
                            || !['CLICKS', 'IMPRESSION_SHARE'].includes(option.id)
                          ))
                          .map((option) => (
                            <option key={option.id} value={option.id}>{option.label}</option>
                          ))}
                      </TextSelect>
                      {biddingFocus === 'TARGET_CPA' || biddingFocus === 'MAXIMIZE_CONVERSIONS' ? (
                        <div className="mt-3">
                          <FieldLabel htmlFor="campaign-edit-cpa">Target CPA (optional for Maximize conversions)</FieldLabel>
                          <TextInput
                            id="campaign-edit-cpa"
                            type="number"
                            min="0"
                            step="0.01"
                            value={targetCpa}
                            disabled={removed}
                            onChange={(event) => setTargetCpa(event.target.value)}
                          />
                        </div>
                      ) : null}
                      {biddingFocus === 'TARGET_ROAS' || biddingFocus === 'MAXIMIZE_CONVERSION_VALUE' ? (
                        <div className="mt-3">
                          <FieldLabel htmlFor="campaign-edit-roas">Target ROAS</FieldLabel>
                          <TextInput
                            id="campaign-edit-roas"
                            type="number"
                            min="0"
                            step="0.01"
                            value={targetRoas}
                            disabled={removed}
                            onChange={(event) => setTargetRoas(event.target.value)}
                          />
                        </div>
                      ) : null}
                      {biddingFocus === 'CLICKS' ? (
                        <div className="mt-3">
                          <FieldLabel htmlFor="campaign-edit-maxcpc">Max CPC limit (optional)</FieldLabel>
                          <TextInput
                            id="campaign-edit-maxcpc"
                            type="number"
                            min="0"
                            step="0.01"
                            value={maxCpcLimit}
                            disabled={removed}
                            onChange={(event) => setMaxCpcLimit(event.target.value)}
                          />
                        </div>
                      ) : null}
                      <SaveBar
                        disabled={removed}
                        saving={saving}
                        onCancel={() => {
                          setBiddingFocus(settings.bidding?.focus || 'MAXIMIZE_CONVERSIONS');
                          setTargetCpa(settings.bidding?.targetCpa != null ? String(settings.bidding.targetCpa) : '');
                          setTargetRoas(settings.bidding?.targetRoas != null ? String(settings.bidding.targetRoas) : '');
                          setMaxCpcLimit(settings.bidding?.maxCpcLimit != null ? String(settings.bidding.maxCpcLimit) : '');
                          setOpenRow('');
                        }}
                        onSave={saveBidding}
                      />
                    </SettingsRow>

                    <SettingsRow
                      label="Locations"
                      value={locationSummary}
                      open={openRow === 'locations'}
                      onToggle={() => toggleRow('locations')}
                    >
                      <ul className="space-y-1.5 text-sm text-[var(--ga-ink)]">
                        {(settings.locations?.items || []).map((item) => (
                          <li key={`${item.action}-${item.id}`}>
                            <span className="text-[var(--ga-muted)]">{item.action === 'exclude' ? 'Exclude' : 'Include'}:</span>{' '}
                            {item.name}
                          </li>
                        ))}
                        {(settings.locations?.proximities || []).map((item, index) => (
                          <li key={`radius-${index}`}>
                            <span className="text-[var(--ga-muted)]">Radius:</span>{' '}
                            {item.radius} {item.radiusUnits === 'MILES' ? 'mi' : 'km'} around {item.latitude}, {item.longitude}
                          </li>
                        ))}
                        {!settings.locations?.items?.length && !settings.locations?.proximities?.length ? (
                          <li className="text-[var(--ga-muted)]">No specific locations set.</li>
                        ) : null}
                      </ul>
                      <p className="mt-2 text-xs text-[var(--ga-muted)]">
                        Location targeting changes use the locations API fields. Use overview location tools for search and radius edits.
                      </p>
                    </SettingsRow>
                  </section>

                  <section className="overflow-hidden rounded-xl border border-[var(--ga-border)] bg-white">
                    <SettingsRow
                      label="Start and end dates"
                      value={[settings.startDate || '—', settings.endDate || 'No end date'].join(' → ')}
                      open={openRow === 'dates'}
                      onToggle={() => toggleRow('dates')}
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <FieldLabel htmlFor="campaign-edit-start">Start date</FieldLabel>
                          <TextInput
                            id="campaign-edit-start"
                            type="date"
                            value={startDate}
                            disabled={removed}
                            onChange={(event) => setStartDate(event.target.value)}
                          />
                        </div>
                        <div>
                          <FieldLabel htmlFor="campaign-edit-end">End date</FieldLabel>
                          <TextInput
                            id="campaign-edit-end"
                            type="date"
                            value={endDate}
                            disabled={removed}
                            onChange={(event) => setEndDate(event.target.value)}
                          />
                        </div>
                      </div>
                      <SaveBar
                        disabled={removed}
                        saving={saving}
                        onCancel={() => {
                          setStartDate(settings.startDate || '');
                          setEndDate(settings.endDate || '');
                          setOpenRow('');
                        }}
                        onSave={saveDates}
                      />
                    </SettingsRow>

                    <SettingsRow
                      label="Tracking"
                      value={settings.trackingUrlTemplate || settings.finalUrlSuffix || 'Not set'}
                      open={openRow === 'tracking'}
                      onToggle={() => toggleRow('tracking')}
                    >
                      <FieldLabel htmlFor="campaign-edit-tracking">Tracking template</FieldLabel>
                      <TextInput
                        id="campaign-edit-tracking"
                        value={trackingUrlTemplate}
                        disabled={removed}
                        onChange={(event) => setTrackingUrlTemplate(event.target.value)}
                      />
                      <div className="mt-3">
                        <FieldLabel htmlFor="campaign-edit-suffix">Final URL suffix</FieldLabel>
                        <TextInput
                          id="campaign-edit-suffix"
                          value={finalUrlSuffix}
                          disabled={removed}
                          onChange={(event) => setFinalUrlSuffix(event.target.value)}
                        />
                      </div>
                      <SaveBar
                        disabled={removed}
                        saving={saving}
                        onCancel={() => {
                          setTrackingUrlTemplate(settings.trackingUrlTemplate || '');
                          setFinalUrlSuffix(settings.finalUrlSuffix || '');
                          setOpenRow('');
                        }}
                        onSave={saveTracking}
                      />
                    </SettingsRow>
                  </section>
                </div>
              ) : null}
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
