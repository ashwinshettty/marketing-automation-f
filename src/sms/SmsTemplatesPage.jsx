import { useCallback, useEffect, useState } from 'react';
import { getSmsTemplates, updateSmsTemplate } from '../api/smsApi';

const SmsTemplatesPage = () => {
  const [templates, setTemplates] = useState([]);
  const [providerConfigured, setProviderConfigured] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState('');
  const [drafts, setDrafts] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getSmsTemplates({ active: false });
      const list = Array.isArray(data?.data) ? data.data : [];
      setTemplates(list);
      setProviderConfigured(data?.providerConfigured !== false);
      const next = {};
      list.forEach((t) => {
        next[t.id] = {
          dltTemplateId: t.dltTemplateId || '',
          fast2smsMessageId: t.fast2smsMessageId || '',
        };
      });
      setDrafts(next);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async (template) => {
    const draft = drafts[template.id] || {};
    setSavingId(template.id);
    setError('');
    try {
      const data = await updateSmsTemplate(template.id, {
        dltTemplateId: draft.dltTemplateId?.trim() || '',
        fast2smsMessageId: draft.fast2smsMessageId?.trim() || '',
      });
      setTemplates((prev) =>
        prev.map((t) => (t.id === template.id ? data.data : t)),
      );
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to save');
    } finally {
      setSavingId('');
    }
  };

  return (
    <div className="px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-brand-navy">SMS Templates (DLT)</h1>
        <p className="mt-1 text-sm text-brand-muted">
          Promotional templates approved on JioTrueConnect (header INKSTL). Prefer the{' '}
          <strong>Fast2SMS Message ID</strong> from DLT Manager (same as fee/OTP SMS). Or paste
          the Jio Content Template ID for manual send.
        </p>
      </div>

      {!providerConfigured && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Set <code className="font-mono">DLT_SMS_AUTH_KEY</code>,{' '}
          <code className="font-mono">DLT_SMS_SENDER</code>, and{' '}
          <code className="font-mono">DLT_SMS_ENTITY_ID</code> in marketing-automation-b
          .env (same as Inkstall OTP/fee SMS), then restart the backend.
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-brand-muted">Loading…</p>
      ) : (
        <div className="space-y-4">
          {templates.map((template) => {
            const draft = drafts[template.id] || {};
            return (
              <article
                key={template.id}
                className="rounded-2xl border border-brand-yellow/40 bg-white p-5 shadow-sm"
              >
                <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-brand-navy">{template.name}</h2>
                    <p className="text-xs text-brand-muted">
                      {template.key} · {template.category} · sender {template.senderId}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      template.readyToSend
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {template.readyToSend ? 'Ready' : 'Needs DLT ID'}
                  </span>
                </div>

                <pre className="mb-4 whitespace-pre-wrap rounded-xl bg-brand-cream/70 px-4 py-3 font-sans text-sm text-brand-navy">
                  {template.body}
                </pre>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-brand-muted">
                    Fast2SMS Message ID (preferred)
                    <input
                      value={draft.fast2smsMessageId || ''}
                      onChange={(e) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [template.id]: {
                            ...prev[template.id],
                            fast2smsMessageId: e.target.value,
                          },
                        }))
                      }
                      placeholder="From Fast2SMS → DLT Manager (e.g. 224437)"
                      className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-brand-navy"
                    />
                  </label>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-brand-muted">
                    Jio DLT Template ID (fallback)
                    <input
                      value={draft.dltTemplateId || ''}
                      onChange={(e) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [template.id]: { ...prev[template.id], dltTemplateId: e.target.value },
                        }))
                      }
                      placeholder="JioTrueConnect Content Template ID"
                      className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-brand-navy"
                    />
                  </label>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    disabled={savingId === template.id}
                    onClick={() => handleSave(template)}
                    className="rounded-xl bg-brand-navy px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {savingId === template.id ? 'Saving…' : 'Save IDs'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SmsTemplatesPage;
