import { FaTimes } from 'react-icons/fa';

const MESSAGE_TYPE_OPTIONS = [
  { value: 'all', label: 'All messages' },
  { value: 'text', label: 'Text only' },
  { value: 'template', label: 'Template only' },
];

const selectClassName =
  'h-9 min-w-0 rounded-lg border border-brand-yellow/40 bg-white px-2.5 text-sm text-brand-navy outline-none transition focus:border-brand-navy disabled:opacity-60';

const GlobalFilter = ({
  filters,
  onChange,
  onReset,
  templates = [],
  templatesLoading = false,
}) => {
  const update = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  const hasActiveFilters =
    (filters.messageType && filters.messageType !== 'all') ||
    Boolean(filters.templateName);

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-2 rounded-xl border border-brand-yellow/40 bg-white px-3 py-2 shadow-sm">
      <span className="text-xs font-semibold uppercase tracking-wide text-brand-muted">
        Filters
      </span>

      <label className="flex min-w-[140px] flex-1 items-center gap-2 sm:max-w-[220px]">
        <span className="sr-only">Message type</span>
        <select
          value={filters.messageType || 'all'}
          onChange={(event) => update('messageType', event.target.value)}
          className={`${selectClassName} w-full`}
          aria-label="Message type"
        >
          {MESSAGE_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex min-w-[140px] flex-1 items-center gap-2 sm:max-w-[260px]">
        <span className="sr-only">Template</span>
        <select
          value={filters.templateName || ''}
          onChange={(event) => update('templateName', event.target.value)}
          disabled={templatesLoading}
          className={`${selectClassName} w-full`}
          aria-label="Template"
        >
          <option value="">All templates</option>
          {templates.map((template) => (
            <option key={template._id || template.id || template.name} value={template.name}>
              {template.name}
            </option>
          ))}
        </select>
      </label>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={onReset}
          className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-brand-muted transition hover:bg-brand-cream hover:text-brand-navy"
        >
          <FaTimes className="h-3 w-3" />
          Clear
        </button>
      )}
    </div>
  );
};

export default GlobalFilter;
