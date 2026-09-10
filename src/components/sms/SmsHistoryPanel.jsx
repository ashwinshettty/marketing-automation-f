import { useCallback, useEffect, useState } from 'react';
import { getSmsHistory, refreshSmsDelivery, refreshSmsDeliveryBatch } from '../../api/smsApi';

const statusClass = (status) => {
  if (status === 'delivered') return 'bg-emerald-100 text-emerald-800';
  if (status === 'dnd_blocked') return 'bg-orange-100 text-orange-900';
  if (status === 'sent' || status === 'queued') return 'bg-amber-100 text-amber-900';
  if (status === 'failed') return 'bg-red-100 text-red-800';
  if (status === 'skipped') return 'bg-slate-100 text-slate-700';
  return 'bg-slate-100 text-slate-700';
};

const statusLabel = (status) => {
  if (status === 'delivered') return 'Delivered';
  if (status === 'dnd_blocked') return 'DND blocked';
  if (status === 'sent' || status === 'queued') return 'Pending';
  if (status === 'failed') return 'Failed';
  return String(status || '');
};

const SmsHistoryPanel = ({ leadId = null, compact = false }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshingId, setRefreshingId] = useState('');
  const [refreshingAll, setRefreshingAll] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getSmsHistory({
        leadId: leadId || undefined,
        limit: compact ? 20 : 50,
      });
      setItems(Array.isArray(data?.data) ? data.data : []);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  }, [leadId, compact]);

  useEffect(() => {
    load();
  }, [load]);

  const handleRefreshDelivery = async (id) => {
    setRefreshingId(id);
    try {
      const data = await refreshSmsDelivery(id);
      if (data?.data) {
        setItems((prev) =>
          prev.map((item) => (String(item._id) === String(id) ? { ...item, ...data.data } : item)),
        );
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to refresh delivery');
    } finally {
      setRefreshingId('');
    }
  };

  const handleRefreshPending = async () => {
    const ids = items
      .filter((item) => item.providerRequestId && ['sent', 'queued'].includes(item.status))
      .map((item) => item._id);
    if (!ids.length) return;
    setRefreshingAll(true);
    try {
      const data = await refreshSmsDeliveryBatch({ messageIds: ids });
      const refreshed = Array.isArray(data?.data) ? data.data : [];
      const byId = new Map(refreshed.map((row) => [String(row._id || row.id), row]));
      setItems((prev) =>
        prev.map((item) => {
          const match = byId.get(String(item._id));
          return match ? { ...item, ...match } : item;
        }),
      );
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to refresh delivery');
    } finally {
      setRefreshingAll(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-brand-muted">Loading SMS history…</p>;
  }

  if (error && items.length === 0) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (items.length === 0) {
    return <p className="text-sm text-brand-muted">No SMS sent yet.</p>;
  }

  const hasPending = items.some(
    (item) => item.providerRequestId && ['sent', 'queued'].includes(item.status),
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        {error ? <p className="text-sm text-red-600">{error}</p> : <span />}
        {hasPending ? (
          <button
            type="button"
            onClick={handleRefreshPending}
            disabled={refreshingAll}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-brand-navy hover:bg-slate-50 disabled:opacity-50"
          >
            {refreshingAll ? 'Checking…' : 'Refresh pending delivery'}
          </button>
        ) : null}
      </div>
      {items.map((item) => (
        <article
          key={item._id}
          className="rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-sm"
        >
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-brand-navy">
                {item.templateName || item.templateKey || 'Template'}
              </p>
              <p className="text-xs text-brand-muted">
                {item.phone || '—'}
                {!leadId && item.leadName ? ` · ${item.leadName}` : ''}
                {' · '}
                {item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}
                {item.providerRequestId ? ` · Req: ${item.providerRequestId}` : ''}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusClass(
                  item.status,
                )}`}
              >
                {statusLabel(item.status)}
              </span>
              {item.providerRequestId && ['sent', 'queued'].includes(item.status) ? (
                <button
                  type="button"
                  onClick={() => handleRefreshDelivery(item._id)}
                  disabled={refreshingId === item._id}
                  className="rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-medium text-brand-navy hover:bg-slate-50 disabled:opacity-50"
                >
                  {refreshingId === item._id ? 'Checking…' : 'Check delivery'}
                </button>
              ) : null}
            </div>
          </div>
          <pre className="whitespace-pre-wrap font-sans text-xs text-brand-muted">{item.body}</pre>
          {item.errorMessage ? (
            <p className="mt-2 text-xs text-red-600">{item.errorMessage}</p>
          ) : null}
        </article>
      ))}
    </div>
  );
};

export default SmsHistoryPanel;
