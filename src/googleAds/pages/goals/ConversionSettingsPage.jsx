import { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import { GaIcon } from '../../icons/GoogleAdsIcons';

/**
 * Conversion settings UI (Google Ads → Goals → Settings).
 * Layout matches Google; values are local until a settings API exists.
 */
const INITIAL_ROWS = [
  {
    id: 'call-conversion',
    label: 'Call conversion action',
    value: 'Calls from ads',
    type: 'select',
    options: ['Calls from ads', 'Calls from Smart Campaign Ads', 'None'],
  },
  {
    id: 'lapse-window',
    label: 'Customer lapse window',
    description: 'Select how long after their last store visit a customer is again new.',
    value: '180 days',
    type: 'select',
    options: ['30 days', '60 days', '90 days', '180 days', '365 days'],
  },
  {
    id: 'customer-data-terms',
    label: 'Customer data terms',
    value: 'Accepted',
    type: 'readonly',
  },
  {
    id: 'enhanced-leads',
    label: 'Enhanced conversions for leads',
    value: 'Managed through Google tag',
    type: 'readonly',
  },
  {
    id: 'enhanced-conversions',
    label: 'Enhanced conversions',
    value: 'Managed through Google Tag. Recording Enhanced Conversions.',
    type: 'readonly',
  },
  {
    id: 'engaged-view',
    label: 'Engaged-view conversions',
    value: 'Non-skippable video ad formats included',
    type: 'readonly',
  },
  {
    id: 'app-attribution',
    label: 'App attribution sharing',
    value: 'App campaigns share conversion attribution across app campaign subtypes',
    type: 'readonly',
  },
];

export default function ConversionSettingsPage() {
  const [rows, setRows] = useState(INITIAL_ROWS);
  const [openId, setOpenId] = useState('lapse-window');
  const [draft, setDraft] = useState(null);

  const openRow = (row) => {
    setOpenId((prev) => (prev === row.id ? null : row.id));
    setDraft(row.value);
  };

  const saveRow = (id) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, value: draft } : row)));
    setOpenId(null);
  };

  return (
    <div className="px-6 py-5">
      <PageHeader title="Conversion settings" />

      <div className="mx-auto max-w-4xl space-y-2">
        {rows.map((row) => {
          const open = openId === row.id;
          return (
            <div
              key={row.id}
              className="overflow-hidden rounded-xl border border-[var(--ga-border)] bg-white"
            >
              <button
                type="button"
                onClick={() => openRow(row)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left hover:bg-[var(--ga-hover)]"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium text-[var(--ga-ink)]">{row.label}</div>
                  {!open ? (
                    <div className="mt-0.5 truncate text-sm text-[var(--ga-muted)]">{row.value}</div>
                  ) : null}
                </div>
                <GaIcon
                  name="chevron"
                  className={`h-4 w-4 shrink-0 text-[var(--ga-muted)] transition ${open ? 'rotate-180' : ''}`}
                />
              </button>

              {open ? (
                <div className="border-t border-[var(--ga-border)] px-5 py-4">
                  {row.description ? (
                    <p className="mb-3 text-sm text-[var(--ga-muted)]">{row.description}</p>
                  ) : null}

                  {row.type === 'select' ? (
                    <label className="block max-w-xs text-sm">
                      <span className="sr-only">{row.label}</span>
                      <select
                        value={draft ?? row.value}
                        onChange={(e) => setDraft(e.target.value)}
                        className="w-full rounded-lg border border-[var(--ga-border)] bg-white px-3 py-2 text-sm text-[var(--ga-ink)] outline-none focus:border-[var(--ga-blue)]"
                      >
                        {row.options.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </label>
                  ) : (
                    <p className="text-sm text-[var(--ga-ink)]">{row.value}</p>
                  )}

                  {row.type === 'select' ? (
                    <div className="mt-4 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setOpenId(null)}
                        className="text-sm font-medium text-[var(--ga-blue)] hover:underline"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => saveRow(row.id)}
                        disabled={draft === row.value}
                        className="rounded-full bg-[var(--ga-blue)] px-4 py-1.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Save
                      </button>
                    </div>
                  ) : null}

                  {row.type === 'readonly' ? (
                    <p className="mt-2 text-xs text-[var(--ga-muted)]">
                      Managed in Google Ads. Read-only in this app for now.
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
