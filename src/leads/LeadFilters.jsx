import { useEffect, useState } from 'react';
import { useLead } from '../context/LeadContext';
import { fetchBoards, fetchGrades } from '../api/lookupApi';

const fieldClassName =
  'w-full rounded-xl border border-brand-yellow/40 bg-white px-4 py-2.5 text-sm text-brand-navy outline-none transition focus:border-brand-navy';

const labelClassName = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-brand-navy';

const LeadFilters = () => {
  const { filters, setFilters, resetFilters } = useLead();
  const [isOpen, setIsOpen] = useState(false);
  const [grades, setGrades] = useState([]);
  const [boards, setBoards] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadOptions = async () => {
      try {
        const [gradesData, boardsData] = await Promise.all([
          fetchGrades(),
          fetchBoards(),
        ]);

        if (!isMounted) return;

        setGrades(gradesData);
        setBoards(boardsData);
      } catch {
        if (isMounted) {
          setGrades([]);
          setBoards([]);
        }
      } finally {
        if (isMounted) {
          setOptionsLoading(false);
        }
      }
    };

    loadOptions();

    return () => {
      isMounted = false;
    };
  }, []);

  const hasActiveFilters = Object.values(filters).some((value) => Boolean(value));
  const activeFilterCount = Object.values(filters).filter((value) => Boolean(value)).length;

  const handleFieldChange = (field) => (event) => {
    setFilters({
      ...filters,
      [field]: event.target.value,
    });
  };

  return (
    <div className="mb-5 rounded-2xl border border-brand-yellow/40 bg-white shadow-sm">
      <div className={`flex flex-wrap items-center justify-between gap-3 ${isOpen ? 'border-b border-brand-yellow/30 p-5 pb-4' : 'p-4'}`}>
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-sm font-semibold text-brand-navy">Filter leads</h2>
            <p className="text-xs text-brand-muted">
              {isOpen
                ? 'Search and narrow results by grade, board, or source.'
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
              onClick={resetFilters}
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
      <div className="grid gap-4 p-5 pt-4 md:grid-cols-2 xl:grid-cols-4">
        <label className="block">
          <span className={labelClassName}>Search</span>
          <input
            type="search"
            value={filters.search}
            onChange={handleFieldChange('search')}
            placeholder="Name or contact number"
            className={fieldClassName}
          />
        </label>

        <label className="block">
          <span className={labelClassName}>Grade</span>
          <select
            value={filters.grade}
            onChange={handleFieldChange('grade')}
            disabled={optionsLoading}
            className={fieldClassName}
          >
            <option value="">All grades</option>
            {grades.map((grade) => (
              <option key={grade} value={grade}>
                {grade}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className={labelClassName}>Board</span>
          <select
            value={filters.board}
            onChange={handleFieldChange('board')}
            disabled={optionsLoading}
            className={fieldClassName}
          >
            <option value="">All boards</option>
            {boards.map((board) => {
              const boardName = board?.name || board;

              return (
                <option key={board?._id || boardName} value={boardName}>
                  {boardName}
                </option>
              );
            })}
          </select>
        </label>

        <label className="block">
          <span className={labelClassName}>Source</span>
          <input
            type="text"
            value={filters.source}
            onChange={handleFieldChange('source')}
            placeholder="e.g. Walk in, Referral"
            className={fieldClassName}
          />
        </label>
      </div>
      )}
    </div>
  );
};

export default LeadFilters;
