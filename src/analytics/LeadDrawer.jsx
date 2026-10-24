import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchAnalyticsLead, updateAnalyticsLead } from '../api/analyticsApi';
import { toast } from '../utils/toast';

import { STAGE_LABELS, formatWhen, stageClass } from './format';

const fieldClass =
  'mt-1 w-full rounded-xl border border-brand-yellow/40 px-3 py-2 text-sm text-brand-navy outline-none focus:border-brand-navy';

const Confirm = ({ title, body, confirmLabel, onConfirm, onClose, busy }) => (
  <div className="fixed inset-0 z-[80] flex items-end justify-center bg-brand-navy/40 p-4 sm:items-center">
    <div role="dialog" aria-modal="true" aria-labelledby="confirm-title" className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
      <h3 id="confirm-title" className="text-base font-semibold text-brand-navy">{title}</h3>
      <p className="mt-2 text-sm text-brand-muted">{body}</p>
      <div className="mt-4 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="rounded-xl border border-brand-yellow/40 px-3 py-2 text-sm">
          Cancel
        </button>
        <button type="button" onClick={onConfirm} disabled={busy} className="rounded-xl bg-brand-navy px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
          {busy ? 'Saving…' : confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

const LeadDrawer = ({ lead, owners, onClose, onSaved, embedded = false }) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [status, setStatus] = useState('contacted');
  const [ownerId, setOwnerId] = useState('');
  const [note, setNote] = useState('');
  const [contactNote, setContactNote] = useState('');
  const [name, setName] = useState('');
  const [source, setSource] = useState('');
  const [campaignName, setCampaignName] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [conversionDate, setConversionDate] = useState('');
  const [lostReason, setLostReason] = useState('');
  const [followDate, setFollowDate] = useState('');
  const [followTime, setFollowTime] = useState('10:00');
  const [followType, setFollowType] = useState('calls');

  const load = () => {
    let ignore = false;
    setLoading(true);
    setError('');
    fetchAnalyticsLead(lead.id, lead.type)
      .then((data) => {
        if (ignore) return;
        setDetail(data);
        setStatus(['new', 'contacted', 'engaged', 'qualified'].includes(data.lead.stage) ? data.lead.stage : 'contacted');
        setOwnerId(data.lead.ownerId || '');
        setName(data.lead.name || '');
        setSource(data.lead.source || '');
        setCampaignName(data.lead.campaign || '');
      })
      .catch((err) => {
        if (!ignore) setError(err.message || 'Could not load this lead');
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  };

  useEffect(() => load(), [lead.id, lead.type]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape' && !confirm) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, confirm]);

  const run = async (body, success) => {
    setBusy(true);
    try {
      await updateAnalyticsLead(lead.id, lead.type, body);
      toast.success(success);
      setConfirm(null);
      setNote('');
      setContactNote('');
      load();
      onSaved();
    } catch (err) {
      toast.error(err.message || 'Could not save the lead');
    } finally {
      setBusy(false);
    }
  };

  const record = detail?.lead;

  const panel = (
      <aside role="dialog" aria-modal={!embedded} aria-label="Lead details" className={`flex flex-col overflow-y-auto bg-white ${embedded ? 'max-h-[760px] rounded-2xl border border-brand-yellow/40' : 'h-[88vh] w-full rounded-t-2xl bg-white shadow-xl sm:h-full sm:max-w-xl sm:rounded-none sm:bg-brand-cream'}`}>
        <div className="sticky top-0 z-10 border-b border-brand-yellow/30 bg-white px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              {embedded && (
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-navy text-sm font-bold text-white">
                  {(lead.name || '?').split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase()}
                </span>
              )}
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold text-brand-navy">{lead.name}</h2>
                  {record && (
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${stageClass(record.stage)}`}>
                      {STAGE_LABELS[record.stage] || record.stage}
                    </span>
                  )}
                </div>
                <p className="text-sm text-brand-muted">{record?.ownerName || 'Unassigned'}</p>
              </div>
            </div>
            <button type="button" onClick={onClose} className="min-h-11 shrink-0 rounded-lg border border-brand-yellow/40 px-3 text-sm font-semibold text-brand-navy">
              Close
            </button>
          </div>
          {embedded && (
            <div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
              {[
                ['lead-assign', 'Assign'],
                ['lead-contact', 'Contact'],
                ['lead-qualify', 'Qualify'],
                ['lead-convert', 'Convert'],
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                  className={`min-h-11 rounded-lg px-2 py-1.5 text-xs font-semibold ${
                    label === 'Convert' ? 'bg-brand-yellow text-brand-navy' : 'border border-brand-yellow/40 text-brand-navy'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {loading && <div className="m-5 h-40 animate-pulse rounded-2xl bg-white" />}
        {!loading && error && <p className="m-5 text-sm text-red-700">{error}</p>}

        {!loading && record && (
          <div className="space-y-4 p-5">
            <section className="rounded-2xl border border-brand-yellow/40 bg-white p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${stageClass(record.stage)}`}>
                  {STAGE_LABELS[record.stage] || record.stage}
                </span>
                <span className="text-xs text-brand-muted">{record.ownerName || 'Unassigned'}</span>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div><dt className="text-xs text-brand-muted">Email</dt><dd>{record.email || '—'}</dd></div>
                <div><dt className="text-xs text-brand-muted">Phone</dt><dd>{record.phone || '—'}</dd></div>
                <div><dt className="text-xs text-brand-muted">Created</dt><dd>{formatWhen(record.createdAt)}</dd></div>
                <div><dt className="text-xs text-brand-muted">Platform</dt><dd>{record.platformLabel}</dd></div>
                <div><dt className="text-xs text-brand-muted">Campaign</dt><dd>{record.campaign || '—'}</dd></div>
                <div><dt className="text-xs text-brand-muted">Ad / form</dt><dd>{record.adName || '—'}</dd></div>
              </dl>
              <p className="mt-3 text-xs text-brand-muted">{detail.attributionNote}</p>
              <dl className="mt-2 grid grid-cols-2 gap-2 text-xs text-brand-muted">
                <div>Source: {record.source || '—'}</div>
                <div>UTM source: {record.utmSource || '—'}</div>
                <div>UTM medium: {record.utmMedium || '—'}</div>
                <div>UTM campaign: {record.utmCampaign || '—'}</div>
                <div>Campaign ID: {record.campaignId || '—'}</div>
                <div>Ad set: {record.adSetId || '—'}</div>
                <div>Ad ID: {record.adId || '—'}</div>
                <div>Landing page: {record.landingPage || '—'}</div>
                <div>Click ID: {record.fbclid || record.gclid || '—'}</div>
                <div>Method: CRM record</div>
              </dl>
              <Link to={`/leads/${record.id}?type=${record.type}`} className="mt-3 inline-block text-sm font-semibold text-brand-navy underline">
                Open full lead record
              </Link>
            </section>

            <section className="rounded-2xl border border-brand-yellow/40 bg-white p-4">
              <h3 className="text-sm font-semibold text-brand-navy">Timeline</h3>
              <ol className="mt-3 space-y-3">
                {detail.timeline.length === 0 && <li className="text-sm text-brand-muted">No activity yet.</li>}
                {detail.timeline.map((item) => (
                  <li key={item.id} className="border-l-2 border-brand-yellow pl-3">
                    <p className="text-xs text-brand-muted">{formatWhen(item.at)}</p>
                    <p className="text-sm font-medium text-brand-navy">{item.title}</p>
                    {item.detail && <p className="text-sm text-brand-muted">{item.detail}</p>}
                  </li>
                ))}
              </ol>
            </section>

            <section className="space-y-4 rounded-2xl border border-brand-yellow/40 bg-white p-4">
              <h3 className="text-sm font-semibold text-brand-navy">Actions</h3>

              <label className="block text-xs font-semibold uppercase tracking-wide text-brand-navy">
                Status
                <select className={fieldClass} value={status} onChange={(event) => setStatus(event.target.value)}>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="engaged">Engaged</option>
                  <option value="qualified">Qualified</option>
                </select>
              </label>
              <button type="button" disabled={busy} onClick={() => run({ type: 'status', stage: status }, 'Status saved')} className="rounded-xl bg-brand-navy px-3 py-2 text-sm font-semibold text-white">
                Save status
              </button>

              <label id="lead-assign" className="block text-xs font-semibold uppercase tracking-wide text-brand-navy">
                Owner
                <select className={fieldClass} value={ownerId} onChange={(event) => setOwnerId(event.target.value)}>
                  <option value="">Select an owner</option>
                  {owners.map((owner) => (
                    <option key={owner.id} value={owner.id}>{owner.name}</option>
                  ))}
                </select>
              </label>
              <button type="button" disabled={busy || !ownerId} onClick={() => run({ type: 'assign', ownerId }, 'Owner assigned')} className="rounded-xl border border-brand-navy px-3 py-2 text-sm font-semibold text-brand-navy disabled:opacity-40">
                Assign owner
              </button>

              <label id="lead-note" className="block text-xs font-semibold uppercase tracking-wide text-brand-navy">
                Note
                <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} className={fieldClass} />
              </label>
              <button type="button" disabled={busy} onClick={() => run({ type: 'note', text: note }, 'Note added')} className="rounded-xl border border-brand-yellow/50 px-3 py-2 text-sm font-semibold text-brand-navy">
                Add note
              </button>

              <label id="lead-contact" className="block text-xs font-semibold uppercase tracking-wide text-brand-navy">
                Contact attempt
                <textarea value={contactNote} onChange={(event) => setContactNote(event.target.value)} rows={2} placeholder="Optional note" className={fieldClass} />
              </label>
              <button type="button" disabled={busy} onClick={() => run({ type: 'contact', note: contactNote, channel: 'call' }, 'Contact recorded')} className="rounded-xl border border-brand-yellow/50 px-3 py-2 text-sm font-semibold text-brand-navy">
                Record contact
              </button>

              <div id="lead-qualify" className="grid gap-2 sm:grid-cols-2">
                <button type="button" disabled={busy} onClick={() => run({ type: 'qualify', qualified: true }, 'Marked qualified')} className="rounded-xl bg-emerald-700 px-3 py-2 text-sm font-semibold text-white">
                  Mark qualified
                </button>
                <button
                  type="button"
                  onClick={() => setConfirm({
                    title: 'Disqualify this lead?',
                    body: 'The lead leaves the open queue. You can still find it in analytics.',
                    confirmLabel: 'Disqualify',
                    bodyAction: { type: 'qualify', qualified: false, reason: lostReason },
                    success: 'Marked disqualified',
                  })}
                  className="rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-700"
                >
                  Disqualify
                </button>
              </div>

              <div className="grid gap-2 sm:grid-cols-3">
                <label className="text-xs font-semibold uppercase tracking-wide text-brand-navy">
                  Conversion date
                  <input type="date" value={conversionDate} onChange={(event) => setConversionDate(event.target.value)} className={fieldClass} />
                </label>
                <label className="text-xs font-semibold uppercase tracking-wide text-brand-navy">
                  Amount
                  <input value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="decimal" placeholder="Optional" className={fieldClass} />
                </label>
                <label className="text-xs font-semibold uppercase tracking-wide text-brand-navy">
                  Currency
                  <select value={currency} onChange={(event) => setCurrency(event.target.value)} className={fieldClass}>
                    {['INR', 'USD', 'EUR', 'GBP'].map((code) => <option key={code}>{code}</option>)}
                  </select>
                </label>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!conversionDate) {
                    toast.error('Enter the conversion date.');
                    return;
                  }
                  setConfirm({
                  title: 'Mark this lead converted?',
                  body: record.type === 'enquiry'
                    ? 'The enquiry leaves the open Leads queue. The amount is stored as recorded revenue.'
                    : 'The student admission status is left unchanged. This records a marketing conversion.',
                  confirmLabel: 'Mark converted',
                  bodyAction: { type: 'convert', date: conversionDate, amount: amount === '' ? null : Number(amount), currency },
                  success: 'Conversion recorded',
                });
                }}
                id="lead-convert"
                className="rounded-xl bg-brand-navy px-3 py-2 text-sm font-semibold text-white"
              >
                Mark converted
              </button>

              <label className="block text-xs font-semibold uppercase tracking-wide text-brand-navy">
                Lost reason
                <input value={lostReason} onChange={(event) => setLostReason(event.target.value)} className={fieldClass} />
              </label>
              <button
                type="button"
                onClick={() => setConfirm({
                  title: 'Mark this lead lost?',
                  body: 'Lost leads are not counted as conversions.',
                  confirmLabel: 'Mark lost',
                  bodyAction: { type: 'lost', outcome: 'lost', reason: lostReason },
                  success: 'Marked lost',
                })}
                className="rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-700"
              >
                Mark lost
              </button>

              <div className="grid gap-2 sm:grid-cols-3">
                <label className="text-xs font-semibold uppercase tracking-wide text-brand-navy">
                  Follow-up date
                  <input type="date" value={followDate} onChange={(event) => setFollowDate(event.target.value)} className={fieldClass} />
                </label>
                <label className="text-xs font-semibold uppercase tracking-wide text-brand-navy">
                  Time
                  <input type="time" value={followTime} onChange={(event) => setFollowTime(event.target.value)} className={fieldClass} />
                </label>
                <label className="text-xs font-semibold uppercase tracking-wide text-brand-navy">
                  Type
                  <select value={followType} onChange={(event) => setFollowType(event.target.value)} className={fieldClass}>
                    <option value="calls">Call</option>
                    <option value="meeting">Meeting</option>
                    <option value="counselling">Counselling</option>
                    <option value="other">Other</option>
                  </select>
                </label>
              </div>
              <button type="button" disabled={busy} onClick={() => {
                if (!followDate || !followTime) {
                  toast.error('Enter a follow-up date and time.');
                  return;
                }
                run({ type: 'follow_up', date: followDate, time: followTime, eventType: followType }, 'Follow-up scheduled');
              }} className="rounded-xl border border-brand-navy px-3 py-2 text-sm font-semibold text-brand-navy">
                Schedule follow-up
              </button>

              <label className="block text-xs font-semibold uppercase tracking-wide text-brand-navy">
                Name
                <input value={name} onChange={(event) => setName(event.target.value)} className={fieldClass} />
              </label>
              <label className="block text-xs font-semibold uppercase tracking-wide text-brand-navy">
                Source
                <input value={source} onChange={(event) => setSource(event.target.value)} className={fieldClass} />
              </label>
              <label className="block text-xs font-semibold uppercase tracking-wide text-brand-navy">
                Campaign name
                <input value={campaignName} onChange={(event) => setCampaignName(event.target.value)} className={fieldClass} />
              </label>
              <button type="button" disabled={busy} onClick={() => run({ type: 'edit', name, source, campaignName }, 'Lead details saved')} className="rounded-xl border border-brand-yellow/50 px-3 py-2 text-sm font-semibold text-brand-navy">
                Save details
              </button>
            </section>
          </div>
        )}
      </aside>
  );

  return (
    <>
      {embedded ? panel : (
        <div className="fixed inset-0 z-[70] flex items-end justify-end bg-brand-navy/30 sm:items-stretch">
          <button type="button" aria-label="Close lead details" className="absolute inset-0" onClick={onClose} />
          {panel}
        </div>
      )}
      {confirm && (
        <Confirm
          title={confirm.title}
          body={confirm.body}
          confirmLabel={confirm.confirmLabel}
          busy={busy}
          onClose={() => setConfirm(null)}
          onConfirm={() => run(confirm.bodyAction, confirm.success)}
        />
      )}
    </>
  );
};

export default LeadDrawer;
