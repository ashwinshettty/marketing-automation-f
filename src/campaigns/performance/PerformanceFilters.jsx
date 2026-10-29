import { useEffect, useRef, useState } from 'react';
import {
  ACTIVITY_HISTORY_OPTIONS,
  DATE_RANGE_PRESETS,
  INTERVAL_OPTIONS,
} from './metricCatalog';
import { formatRangeLabel } from './formatPerformance';

function Dropdown({ label, open, onToggle, children, align = 'left' }) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-sm text-brand-navy transition ${
          open ? 'border-slate-300 bg-slate-100' : 'border-slate-200 bg-white hover:bg-slate-50'
        }`}
      >
        {label}
        <svg className="h-3.5 w-3.5 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
          <path d="M5.25 7.5L10 12.25 14.75 7.5" />
        </svg>
      </button>
      {open ? (
        <div
          className={`absolute z-30 mt-1 min-w-[11rem] rounded-md border border-slate-200 bg-white py-1 shadow-lg ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

function MenuItem({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full px-3 py-1.5 text-left text-sm ${
        active ? 'bg-blue-50 font-medium text-blue-700' : 'text-brand-navy hover:bg-slate-50'
      }`}
    >
      {children}
    </button>
  );
}

export default function PerformanceFilters({
  rangePreset,
  startDate,
  endDate,
  interval,
  activityHistory,
  onPreset,
  onCustomDates,
  onInterval,
  onActivityHistory,
  onCustomise,
  activityHistoryAvailable = false,
}) {
  const [open, setOpen] = useState(null);
  const [draftStart, setDraftStart] = useState(startDate);
  const [draftEnd, setDraftEnd] = useState(endDate);
  const [customError, setCustomError] = useState('');
  const rootRef = useRef(null);

  useEffect(() => {
    setDraftStart(startDate);
    setDraftEnd(endDate);
  }, [startDate, endDate]);

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (event) => {
      if (rootRef.current?.contains(event.target)) return;
      setOpen(null);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const intervalLabel =
    INTERVAL_OPTIONS.find((item) => item.value === interval)?.label || 'Day';
  const rangeLabel =
    DATE_RANGE_PRESETS.find((item) => item.value === rangePreset)?.label || 'Custom';

  const applyCustom = () => {
    if (!draftStart || !draftEnd) {
      setCustomError('Choose both start and end dates');
      return;
    }
    if (draftEnd < draftStart) {
      setCustomError('End date cannot be earlier than start date');
      return;
    }
    setCustomError('');
    onCustomDates(draftStart, draftEnd);
    setOpen(null);
  };

  return (
    <div ref={rootRef} className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Dropdown
          label={intervalLabel}
          open={open === 'interval'}
          onToggle={() => setOpen((cur) => (cur === 'interval' ? null : 'interval'))}
        >
          {INTERVAL_OPTIONS.map((item) => (
            <MenuItem
              key={item.value}
              active={interval === item.value}
              onClick={() => {
                onInterval(item.value);
                setOpen(null);
              }}
            >
              {item.label}
            </MenuItem>
          ))}
        </Dropdown>

        <Dropdown
          label={`Activity history: ${activityHistory}`}
          open={open === 'activity'}
          onToggle={() => setOpen((cur) => (cur === 'activity' ? null : 'activity'))}
        >
          {ACTIVITY_HISTORY_OPTIONS.map((option) => (
            <MenuItem
              key={option}
              active={activityHistory === option}
              onClick={() => {
                onActivityHistory(option);
                setOpen(null);
              }}
            >
              {option}
            </MenuItem>
          ))}
          {!activityHistoryAvailable ? (
            <p className="border-t border-slate-100 px-3 py-2 text-[11px] leading-snug text-slate-500">
              Activity markers are unavailable until a Meta activity-history feed is integrated.
            </p>
          ) : null}
        </Dropdown>

        <button
          type="button"
          onClick={onCustomise}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-brand-navy hover:bg-slate-50"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96a7.2 7.2 0 00-1.62-.94l-.36-2.54A.48.48 0 0014 2h-4a.48.48 0 00-.48.41l-.36 2.54c-.59.24-1.13.55-1.62.94l-2.39-.96a.49.49 0 00-.59.22L2.64 8.87a.49.49 0 00.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94L2.76 14.5a.49.49 0 00-.12.61l1.92 3.32c.12.22.38.3.59.22l2.39-.96c.5.39 1.03.71 1.62.94l.36 2.54c.05.24.25.41.48.41h4c.24 0 .44-.17.48-.41l.36-2.54c.59-.23 1.13-.55 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.49.49 0 00-.12-.61l-2.03-1.58zM12 15.6A3.6 3.6 0 1112 8.4a3.6 3.6 0 010 7.2z" />
          </svg>
          Customise
        </button>
      </div>

      <Dropdown
        label={
          <span className="inline-flex items-center gap-2">
            <svg className="h-3.5 w-3.5 text-slate-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 2h2v2h6V2h2v2h3v18H4V4h3V2zm13 8H6v10h14V10zM6 8h14V6H6v2z" />
            </svg>
            {rangeLabel}: {formatRangeLabel(startDate, endDate)}
          </span>
        }
        open={open === 'range'}
        onToggle={() => setOpen((cur) => (cur === 'range' ? null : 'range'))}
        align="right"
      >
        {DATE_RANGE_PRESETS.map((item) => (
          <MenuItem
            key={item.value}
            active={rangePreset === item.value}
            onClick={() => {
              if (item.value === 'custom') {
                onPreset('custom');
                return;
              }
              onPreset(item.value);
              setOpen(null);
            }}
          >
            {item.label}
          </MenuItem>
        ))}
        {rangePreset === 'custom' || open === 'range' ? (
          <div className="border-t border-slate-100 px-3 py-2">
            <label className="mb-1 block text-[11px] font-medium text-slate-500">Start</label>
            <input
              type="date"
              value={draftStart}
              onChange={(event) => setDraftStart(event.target.value)}
              className="mb-2 w-full rounded border border-slate-200 px-2 py-1 text-sm"
            />
            <label className="mb-1 block text-[11px] font-medium text-slate-500">End</label>
            <input
              type="date"
              value={draftEnd}
              onChange={(event) => setDraftEnd(event.target.value)}
              className="mb-2 w-full rounded border border-slate-200 px-2 py-1 text-sm"
            />
            {customError ? <p className="mb-2 text-[11px] text-rose-600">{customError}</p> : null}
            <button
              type="button"
              onClick={applyCustom}
              className="w-full rounded-md bg-blue-600 px-2 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              Apply custom range
            </button>
          </div>
        ) : null}
      </Dropdown>
    </div>
  );
}
