import { useEffect, useState } from 'react';
import { fetchCounsellors } from '../api/lookupApi';
import {
  EMPTY_EVENT_FILTERS,
  EVENT_FILTER_PRIORITY_OPTIONS,
  EVENT_FILTER_STATUS_OPTIONS,
  EVENT_FILTER_TYPE_OPTIONS,
} from './eventFilterOptions';

const fieldClassName =
  'w-full rounded-xl border border-brand-yellow/40 bg-white px-4 py-2.5 text-sm text-brand-navy outline-none transition focus:border-brand-navy';

const labelClassName = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-brand-navy';

const EventFilters = ({
  filters,
  onChange,
  onReset,
  searchPlaceholder = 'Title, student, or location',
  openDescription = 'Search and narrow results by type, status, priority, or counsellor.',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [counsellors, setCounsellors] = useState([]);
  const [counsellorsLoading, setCounsellorsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadCounsellors = async () => {
      try {
        setCounsellorsLoading(true);
        const counsellorList = await fetchCounsellors();

        if (!isMounted) return;

        setCounsellors(counsellorList);
      } catch {
        if (isMounted) {
          setCounsellors([]);
        }
      } finally {
        if (isMounted) {
          setCounsellorsLoading(false);
        }
      }
    };

    loadCounsellors();

    return () => {
      isMounted = false;
    };
  }, []);

  const hasActiveFilters = Object.values(filters).some((value) => Boolean(value));
  const activeFilterCount = Object.values(filters).filter((value) => Boolean(value)).length;

  const handleFieldChange = (field) => (event) => {
    onChange({
      ...filters,
      [field]: event.target.value,
    });
  };

  return (
    <div className="mb-5 rounded-2xl border border-brand-yellow/40 bg-white shadow-sm">
      <div
        className={`flex flex-wrap items-center justify-between gap-3 ${
          isOpen ? 'border-b border-brand-yellow/30 p-5 pb-4' : 'p-4'
        }`}
      >
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-sm font-semibold text-brand-navy">Filter events</h2>
            <p className="text-xs text-brand-muted">
              {isOpen
                ? openDescription
                : hasActiveFilters
                  ? `${activeFilterCount} filter${activeFilterCount === 1 ? '' : 's'} applied`
                  : 'Filters are hidden'}
            </p>
          </div>

          {!isOpen && hasActiveFilters && (
            <span className="rounded-full bg-brand-yellow/30 px-2.5 py-0.5 text-xs font-semibold text-brand-navy">
              {activeFilterCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isOpen && hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              className="rounded-lg border border-brand-yellow/40 px-3 py-1.5 text-sm font-medium text-brand-navy transition hover:bg-brand-yellow/20"
            >
              Clear filters
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsOpen((current) => !current)}
            className="rounded-lg border border-brand-yellow/40 bg-brand-cream px-3 py-1.5 text-sm font-medium text-brand-navy transition hover:bg-brand-yellow/20"
          >
            {isOpen ? 'Hide filters' : 'Show filters'}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="grid gap-4 p-5 pt-4 md:grid-cols-2 xl:grid-cols-5">
          <label className="block">
            <span className={labelClassName}>Search</span>
            <input
              type="search"
              value={filters.search}
              onChange={handleFieldChange('search')}
              placeholder={searchPlaceholder}
              className={fieldClassName}
            />
          </label>

          <label className="block">
            <span className={labelClassName}>Type</span>
            <select
              value={filters.type}
              onChange={handleFieldChange('type')}
              className={fieldClassName}
            >
              {EVENT_FILTER_TYPE_OPTIONS.map((option) => (
                <option key={option.value || option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className={labelClassName}>Status</span>
            <select
              value={filters.status}
              onChange={handleFieldChange('status')}
              className={fieldClassName}
            >
              {EVENT_FILTER_STATUS_OPTIONS.map((option) => (
                <option key={option.value || option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className={labelClassName}>Priority</span>
            <select
              value={filters.priority}
              onChange={handleFieldChange('priority')}
              className={fieldClassName}
            >
              {EVENT_FILTER_PRIORITY_OPTIONS.map((option) => (
                <option key={option.value || option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className={labelClassName}>Counsellor</span>
            <select
              value={filters.salesuser}
              onChange={handleFieldChange('salesuser')}
              disabled={counsellorsLoading}
              className={fieldClassName}
            >
              <option value="">
                {counsellorsLoading ? 'Loading counsellors...' : 'All counsellors'}
              </option>
              {counsellors.map((counsellor, index) => (
                <option key={counsellor.id || index} value={counsellor.id}>
                  {counsellor.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
    </div>
  );
};

export { EMPTY_EVENT_FILTERS };
export default EventFilters;
