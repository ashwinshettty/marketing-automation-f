import { useEffect, useMemo, useRef, useState } from 'react';
import {
  getSmsTemplates,
  refreshSmsDeliveryBatch,
  sendBulkSms,
  sendSmsToLead,
} from '../../api/smsApi';

const PENDING = new Set(['sent', 'queued', 'pending']);
const TERMINAL = new Set(['delivered', 'failed', 'dnd_blocked']);

const ModalShell = ({ title, onClose, children, footer, wide = false }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <div
      className={`flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl bg-white shadow-xl ${
        wide ? 'max-w-3xl' : 'max-w-lg'
      }`}
    >
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <h2 className="text-base font-semibold text-brand-navy">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-brand-muted hover:bg-slate-100"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
      {footer ? <div className="border-t border-slate-100 px-5 py-4">{footer}</div> : null}
    </div>
  </div>
);

const statusBadge = (status) => {
  if (status === 'delivered') return 'bg-emerald-100 text-emerald-800';
  if (status === 'dnd_blocked') return 'bg-orange-100 text-orange-900';
  if (status === 'sent' || status === 'queued') return 'bg-amber-100 text-amber-900';
  if (status === 'failed') return 'bg-red-100 text-red-800';
  if (status === 'already_sent') return 'bg-sky-100 text-sky-800';
  return 'bg-slate-100 text-slate-700';
};

const statusLabel = (status) => {
  if (status === 'delivered') return 'Delivered';
  if (status === 'dnd_blocked') return 'DND blocked';
  if (status === 'sent' || status === 'queued') return 'Pending';
  if (status === 'already_sent') return 'Already sent';
  if (status === 'failed') return 'Failed';
  return String(status || '').replace(/_/g, ' ');
};

const summarizeResults = (results = [], template, batchId, note) => {
  const list = Array.isArray(results) ? results : [];
  return {
    batchId: batchId || '',
    template,
    note:
      note ||
      'Live Fast2SMS delivery: Delivered, DND blocked, Failed, or Pending (waiting on carrier).',
    results: list,
    total: list.length,
    delivered: list.filter((r) => r.status === 'delivered').length,
    dndBlocked: list.filter((r) => r.status === 'dnd_blocked').length,
    failed: list.filter((r) => r.status === 'failed').length,
    pending: list.filter((r) => PENDING.has(r.status)).length,
    skipped: list.filter((r) => r.status === 'already_sent' || r.status === 'skipped').length,
    alreadySentSkipped: list.filter((r) => r.status === 'already_sent').length,
    sent: list.filter((r) => r.status === 'delivered' || PENDING.has(r.status)).length,
  };
};

/**
 * mode: 'single' | 'bulk-selected' | 'bulk-limit'
 */
const SmsSendModal = ({
  isOpen,
  onClose,
  mode = 'single',
  lead = null,
  selectedLeads = [],
  initialLimit = 50,
  filters = {},
  onComplete,
}) => {
  const [templates, setTemplates] = useState([]);
  const [providerConfigured, setProviderConfigured] = useState(true);
  const [selectedId, setSelectedId] = useState('');
  const [bulkCount, setBulkCount] = useState(String(initialLimit || 50));
  const [excludeMode, setExcludeMode] = useState('template');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [checkingDelivery, setCheckingDelivery] = useState(false);
  const [error, setError] = useState('');
  const [resultSummary, setResultSummary] = useState(null);
  const pollRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError('');
      setResultSummary(null);
      setSelectedId('');
      setBulkCount(String(initialLimit || 50));
      setExcludeMode('template');
      try {
        const data = await getSmsTemplates({ active: true });
        if (cancelled) return;
        setTemplates(Array.isArray(data?.data) ? data.data : []);
        setProviderConfigured(data?.providerConfigured !== false);
      } catch (err) {
        if (!cancelled) {
          setTemplates([]);
          setError(err?.response?.data?.message || err.message || 'Failed to load templates');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [isOpen, initialLimit]);

  const selected = useMemo(
    () => templates.find((t) => t.id === selectedId) || null,
    [templates, selectedId],
  );

  const parsedCount = Math.min(500, Math.max(1, Number(bulkCount) || 0));

  const targetLabel = useMemo(() => {
    if (mode === 'single') return lead?.name || 'this lead';
    if (mode === 'bulk-selected') return `${selectedLeads.length} selected lead(s)`;
    return `first ${parsedCount || '—'} lead(s) matching current filters`;
  }, [mode, lead, selectedLeads.length, parsedCount]);

  const startDeliveryPolling = (summary) => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }

    const pendingIds = (summary?.results || [])
      .filter((r) => r.messageId && PENDING.has(r.status))
      .map((r) => r.messageId);

    if (!pendingIds.length && !summary?.batchId) return;

    let ticks = 0;
    setCheckingDelivery(true);

    const tick = async () => {
      ticks += 1;
      try {
        const payload = pendingIds.length
          ? { messageIds: pendingIds }
          : { batchId: summary.batchId };
        const data = await refreshSmsDeliveryBatch(payload);
        const refreshed = Array.isArray(data?.data) ? data.data : [];
        if (!refreshed.length) return;

        setResultSummary((prev) => {
          if (!prev) return prev;
          const byId = new Map(
            refreshed.map((row) => [String(row._id || row.id || row.messageId), row]),
          );
          const nextResults = (prev.results || []).map((row) => {
            const match = row.messageId ? byId.get(String(row.messageId)) : null;
            if (!match) return row;
            return {
              ...row,
              status: match.status || row.status,
              errorMessage: match.errorMessage || row.errorMessage || '',
              providerRequestId: match.providerRequestId || row.providerRequestId || '',
            };
          });
          return summarizeResults(nextResults, prev.template, prev.batchId, prev.note);
        });

        const stillPending = refreshed.some((r) => PENDING.has(r.status) && !TERMINAL.has(r.status));
        if (!stillPending || ticks >= 12) {
          if (pollRef.current) clearInterval(pollRef.current);
          pollRef.current = null;
          setCheckingDelivery(false);
        }
      } catch {
        // keep trying until max ticks
        if (ticks >= 12) {
          if (pollRef.current) clearInterval(pollRef.current);
          pollRef.current = null;
          setCheckingDelivery(false);
        }
      }
    };

    tick();
    pollRef.current = setInterval(tick, 4000);
  };

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!selected) {
      setError('Select a template');
      return;
    }
    if (!selected.readyToSend) {
      setError(
        'This template needs a Fast2SMS Message ID (or Jio DLT ID). Add it on SMS Templates.',
      );
      return;
    }
    if (mode === 'bulk-limit' && (!parsedCount || parsedCount < 1)) {
      setError('Enter how many leads to send to (1–500)');
      return;
    }

    setSending(true);
    setError('');
    setResultSummary(null);
    setCheckingDelivery(false);

    try {
      let summary = null;
      if (mode === 'single') {
        const data = await sendSmsToLead({
          leadId: lead.id,
          leadType: lead.type,
          templateId: selected.id,
        });
        const rec = data?.data || {};
        summary = summarizeResults(
          [
            {
              messageId: rec.id || rec._id || '',
              leadId: lead.id,
              leadName: lead.name,
              phone: rec.phone || lead.contactNo,
              status: rec.status || 'sent',
              templateName: selected.name,
              errorMessage: rec.errorMessage || '',
              providerRequestId: rec.providerRequestId || '',
            },
          ],
          selected,
          '',
        );
        setResultSummary(summary);
        onComplete?.(data);
      } else if (mode === 'bulk-selected') {
        const data = await sendBulkSms({
          templateId: selected.id,
          leadIds: selectedLeads.map((l) => ({ id: l.id, type: l.type })),
          excludeAlreadySent: excludeMode,
        });
        summary = summarizeResults(
          data?.data?.results || [],
          data?.data?.template || selected,
          data?.data?.batchId,
          data?.data?.note,
        );
        setResultSummary(summary);
        onComplete?.(data);
      } else {
        const data = await sendBulkSms({
          templateId: selected.id,
          limit: parsedCount,
          filters,
          type: 'all',
          excludeAlreadySent: excludeMode,
        });
        summary = summarizeResults(
          data?.data?.results || [],
          data?.data?.template || selected,
          data?.data?.batchId,
          data?.data?.note,
        );
        setResultSummary(summary);
        onComplete?.(data);
      }

      if (summary) startDeliveryPolling(summary);
    } catch (err) {
      // Single-send may 502 on DND/fail but still return useful data
      const rec = err?.response?.data?.data;
      if (rec && mode === 'single') {
        const summary = summarizeResults(
          [
            {
              messageId: rec.id || rec._id || '',
              leadId: lead.id,
              leadName: lead.name,
              phone: rec.phone || lead.contactNo,
              status: rec.status || 'failed',
              templateName: selected.name,
              errorMessage: rec.errorMessage || err?.response?.data?.message || '',
              providerRequestId: rec.providerRequestId || '',
            },
          ],
          selected,
          '',
        );
        setResultSummary(summary);
        onComplete?.(err.response.data);
      } else {
        setError(err?.response?.data?.message || err.message || 'Failed to send SMS');
      }
    } finally {
      setSending(false);
    }
  };

  const handleRefreshNow = async () => {
    if (!resultSummary) return;
    const ids = (resultSummary.results || [])
      .map((r) => r.messageId)
      .filter(Boolean);
    if (!ids.length && !resultSummary.batchId) return;
    setCheckingDelivery(true);
    try {
      const data = await refreshSmsDeliveryBatch(
        ids.length ? { messageIds: ids, force: true } : { batchId: resultSummary.batchId, force: true },
      );
      const refreshed = Array.isArray(data?.data) ? data.data : [];
      const byId = new Map(
        refreshed.map((row) => [String(row._id || row.id || row.messageId), row]),
      );
      const nextResults = (resultSummary.results || []).map((row) => {
        const match = row.messageId ? byId.get(String(row.messageId)) : null;
        if (!match) return row;
        return {
          ...row,
          status: match.status || row.status,
          errorMessage: match.errorMessage || row.errorMessage || '',
        };
      });
      setResultSummary(
        summarizeResults(
          nextResults,
          resultSummary.template,
          resultSummary.batchId,
          resultSummary.note,
        ),
      );
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to refresh delivery');
    } finally {
      setCheckingDelivery(false);
    }
  };

  return (
    <ModalShell
      title="Send promotional SMS"
      onClose={onClose}
      wide={Boolean(resultSummary?.results?.length)}
      footer={
        <div className="flex items-center justify-end gap-2">
          {resultSummary ? (
            <button
              type="button"
              onClick={handleRefreshNow}
              disabled={checkingDelivery}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-brand-navy hover:bg-slate-50 disabled:opacity-50"
            >
              {checkingDelivery ? 'Checking delivery…' : 'Refresh delivery'}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-brand-navy hover:bg-slate-50"
          >
            {resultSummary ? 'Close' : 'Cancel'}
          </button>
          {!resultSummary && (
            <button
              type="button"
              disabled={sending || loading || !selectedId}
              onClick={handleSend}
              className="rounded-xl bg-brand-navy px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {sending ? 'Sending & checking delivery…' : 'Send SMS'}
            </button>
          )}
        </div>
      }
    >
      <p className="mb-4 text-sm text-brand-muted">
        Sending to <span className="font-medium text-brand-navy">{targetLabel}</span>
      </p>

      {!providerConfigured && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Fast2SMS / DLT is not configured. Add <code>DLT_SMS_AUTH_KEY</code> to the backend .env.
        </div>
      )}

      {loading ? (
        <p className="text-sm text-brand-muted">Loading templates…</p>
      ) : !resultSummary ? (
        <div className="space-y-3">
          {mode === 'bulk-limit' && (
            <label className="block text-xs font-semibold uppercase tracking-wide text-brand-muted">
              How many leads?
              <input
                type="number"
                min={1}
                max={500}
                value={bulkCount}
                onChange={(e) => setBulkCount(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-brand-navy"
              />
              <span className="mt-1 block text-[11px] font-normal normal-case text-brand-muted">
                Uses current lead filters. Max 500 per run.
              </span>
            </label>
          )}

          {(mode === 'bulk-limit' || mode === 'bulk-selected') && (
            <label className="block text-xs font-semibold uppercase tracking-wide text-brand-muted">
              Already messaged
              <select
                value={excludeMode}
                onChange={(e) => setExcludeMode(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-brand-navy"
              >
                <option value="template">Skip if this template was already delivered/submitted</option>
                <option value="any">Skip if any SMS was already delivered/submitted</option>
                <option value="none">Send anyway (allow duplicates)</option>
              </select>
            </label>
          )}

          <label className="block text-xs font-semibold uppercase tracking-wide text-brand-muted">
            DLT template
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-brand-navy"
            >
              <option value="">Select template…</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                  {t.fast2smsMessageId ? ` (${t.fast2smsMessageId})` : ''}
                  {!t.readyToSend ? ' — needs ID' : ''}
                </option>
              ))}
            </select>
          </label>

          {selected && (
            <div className="rounded-xl border border-slate-100 bg-brand-cream/60 px-4 py-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-muted">
                Preview · Message ID {selected.fast2smsMessageId || '—'}
              </p>
              <pre className="whitespace-pre-wrap font-sans text-sm text-brand-navy">
                {selected.body}
              </pre>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-brand-navy">
            Template:{' '}
            <strong>{resultSummary.template?.name || selected?.name || '—'}</strong>
            {resultSummary.template?.fast2smsMessageId
              ? ` (${resultSummary.template.fast2smsMessageId})`
              : ''}
            <br />
            <span className="text-emerald-700">Delivered {resultSummary.delivered || 0}</span>
            {' · '}
            <span className="text-orange-700">DND {resultSummary.dndBlocked || 0}</span>
            {' · '}
            <span className="text-red-700">Failed {resultSummary.failed || 0}</span>
            {' · '}
            <span className="text-amber-700">Pending {resultSummary.pending || 0}</span>
            {' · '}
            Skipped {resultSummary.skipped || 0}
            {checkingDelivery ? (
              <>
                <br />
                <span className="text-xs text-brand-muted">
                  Checking Fast2SMS delivery reports…
                </span>
              </>
            ) : null}
            {resultSummary.batchId ? (
              <>
                <br />
                Batch: <code className="text-xs">{resultSummary.batchId}</code>
              </>
            ) : null}
          </div>

          {Array.isArray(resultSummary.results) && resultSummary.results.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-slate-100">
              <table className="w-full text-left text-xs">
                <thead className="bg-brand-cream text-brand-navy">
                  <tr>
                    <th className="px-3 py-2 font-semibold">Lead</th>
                    <th className="px-3 py-2 font-semibold">Phone</th>
                    <th className="px-3 py-2 font-semibold">Status</th>
                    <th className="px-3 py-2 font-semibold">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {resultSummary.results.map((row, idx) => (
                    <tr key={`${row.leadId}-${idx}`} className="border-t border-slate-100">
                      <td className="px-3 py-2 font-medium text-brand-navy">
                        {row.leadName || row.leadId}
                      </td>
                      <td className="px-3 py-2 text-brand-muted">{row.phone || '—'}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 font-semibold ${statusBadge(
                            row.status,
                          )}`}
                        >
                          {statusLabel(row.status)}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-brand-muted">
                        {row.errorMessage ||
                          row.previousTemplate ||
                          (row.providerRequestId ? `Req: ${row.providerRequestId}` : null) ||
                          row.templateName ||
                          '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
    </ModalShell>
  );
};

export default SmsSendModal;
