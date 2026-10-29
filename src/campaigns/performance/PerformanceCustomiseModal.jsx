import { useEffect, useState } from 'react';
import { METRIC_CATALOG, labelForMetric } from './metricCatalog';

export default function PerformanceCustomiseModal({
  open,
  onClose,
  selectedMetrics,
  preferences,
  resultLabel,
  benchmarksAvailable = false,
  onApply,
}) {
  const [tab, setTab] = useState('metrics');
  const [draftMetrics, setDraftMetrics] = useState(selectedMetrics);
  const [draftPrefs, setDraftPrefs] = useState(preferences);

  useEffect(() => {
    if (!open) return;
    setTab('metrics');
    setDraftMetrics(selectedMetrics);
    setDraftPrefs(preferences);
  }, [open, preferences, selectedMetrics]);

  if (!open) return null;

  const overviewMetrics = METRIC_CATALOG.filter((item) => item.overview);
  const atLimit = draftMetrics.length >= 3;

  const toggleMetric = (key) => {
    setDraftMetrics((current) => {
      if (current.includes(key)) return current.filter((item) => item !== key);
      if (current.length >= 3) return current;
      return [...current, key];
    });
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-4">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Close" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-lg font-semibold text-brand-navy">Customise chart</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-brand-navy"
            aria-label="Close customise chart"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.3 5.71L12 12l6.3 6.29-1.41 1.42L10.59 13.4 4.3 19.71 2.89 18.3 9.17 12 2.89 5.71 4.3 4.29l6.29 6.3 6.29-6.3z" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-1 px-5 pt-3">
          {['metrics', 'preferences'].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value)}
              className={`rounded-md px-3 py-2 text-sm font-medium capitalize ${
                tab === value
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-brand-navy hover:bg-slate-50'
              }`}
            >
              {value}
            </button>
          ))}
        </div>

        <div className="px-5 py-4">
          {tab === 'metrics' ? (
            <div>
              <p className="text-sm text-brand-navy">
                Select up to 3 metrics at a time
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {draftMetrics.length} of 3 selected
              </p>
              <ul className="mt-3 space-y-2">
                {overviewMetrics.map((item) => {
                  const checked = draftMetrics.includes(item.key);
                  const disabled = !checked && atLimit;
                  return (
                    <li key={item.key}>
                      <label
                        className={`flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 ${
                          disabled ? 'opacity-50' : 'hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={disabled}
                          onChange={() => toggleMetric(item.key)}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-brand-navy">
                          {labelForMetric(item.key, resultLabel)}
                          {item.defaultSelected ? (
                            <span className="ml-1 text-xs text-slate-400">(Default)</span>
                          ) : null}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-brand-navy">Your similar ad sets</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Compare current performance to an average of your other ad sets with the same objective.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={draftPrefs.similarAdSets}
                  onClick={() =>
                    setDraftPrefs((cur) => ({ ...cur, similarAdSets: !cur.similarAdSets }))
                  }
                  className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                    draftPrefs.similarAdSets ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
                      draftPrefs.similarAdSets ? 'left-5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-brand-navy">Businesses like yours</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Compare current performance to that of similar advertisers.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={draftPrefs.businessesLikeYours}
                  onClick={() =>
                    setDraftPrefs((cur) => ({
                      ...cur,
                      businessesLikeYours: !cur.businessesLikeYours,
                    }))
                  }
                  className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                    draftPrefs.businessesLikeYours ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
                      draftPrefs.businessesLikeYours ? 'left-5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>
              {!benchmarksAvailable ? (
                <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  Benchmark comparison is unavailable until a supported data source is integrated.
                  Preferences are saved for this session only.
                </p>
              ) : null}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-brand-navy hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={draftMetrics.length === 0}
            onClick={() => {
              onApply({ metrics: draftMetrics, preferences: draftPrefs });
              onClose();
            }}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
