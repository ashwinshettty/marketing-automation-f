import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { fetchEvents } from '../../api/eventApi';
import EventFilters, { EMPTY_EVENT_FILTERS } from '../../events/EventFilters';
import EventTable from '../../events/EventTable';

const DEFAULT_PAGE_SIZE = 10;
const FILTER_DEBOUNCE_MS = 400;

const LeadEventsPanel = ({ lead, refreshKey = 0 }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState(EMPTY_EVENT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_EVENT_FILTERS);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const loadIdRef = useRef(0);
  const appliedFiltersRef = useRef(appliedFilters);

  useEffect(() => {
    appliedFiltersRef.current = appliedFilters;
  }, [appliedFilters]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setAppliedFilters((current) => {
        if (current.search === filters.search) {
          return current;
        }

        return {
          ...current,
          search: filters.search,
        };
      });
      setPage(1);
    }, FILTER_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [filters.search]);

  useEffect(() => {
    setAppliedFilters((current) => {
      if (
        current.type === filters.type &&
        current.status === filters.status &&
        current.priority === filters.priority &&
        current.salesuser === filters.salesuser
      ) {
        return current;
      }

      return {
        ...current,
        type: filters.type,
        status: filters.status,
        priority: filters.priority,
        salesuser: filters.salesuser,
      };
    });
    setPage(1);
  }, [filters.type, filters.status, filters.priority, filters.salesuser]);

  const loadEvents = useCallback(async (pageToLoad = 1, { filters: filtersOverride } = {}) => {
    if (!lead?.id) {
      setEvents([]);
      setLoading(false);
      return;
    }

    const loadId = ++loadIdRef.current;
    const activeFilters = filtersOverride ?? appliedFiltersRef.current;

    try {
      setLoading(true);
      setError('');

      const data = await fetchEvents({
        studentId: lead.id,
        page: pageToLoad,
        limit: DEFAULT_PAGE_SIZE,
        ...activeFilters,
      });

      if (loadId !== loadIdRef.current) {
        return;
      }

      const eventList = Array.isArray(data?.events) ? data.events : [];

      setEvents(eventList);
      setPage(data?.pagination?.page || pageToLoad);
      setPagination({
        page: data?.pagination?.page || pageToLoad,
        limit: data?.pagination?.limit || DEFAULT_PAGE_SIZE,
        total: data?.pagination?.total ?? eventList.length,
        totalPages: data?.pagination?.totalPages || 0,
        hasNextPage: Boolean(data?.pagination?.hasNextPage),
        hasPrevPage: Boolean(data?.pagination?.hasPrevPage),
      });
    } catch (err) {
      if (
        axios.isCancel(err) ||
        err?.code === 'ERR_CANCELED' ||
        loadId !== loadIdRef.current
      ) {
        return;
      }

      setError(err.message || 'Failed to load events');
      setEvents([]);
    } finally {
      if (loadId === loadIdRef.current) {
        setLoading(false);
      }
    }
  }, [lead?.id]);

  useEffect(() => {
    loadEvents(page, { filters: appliedFilters });
  }, [lead?.id, appliedFilters, page, refreshKey, loadEvents]);

  const goToPage = (nextPage) => {
    if (nextPage < 1 || nextPage > pagination.totalPages) {
      return;
    }

    setPage(nextPage);
  };

  const handleResetFilters = () => {
    setFilters(EMPTY_EVENT_FILTERS);
    setAppliedFilters(EMPTY_EVENT_FILTERS);
    setPage(1);
  };

  return (
    <div className="flex min-h-0 flex-col gap-5">
      <EventFilters
        filters={filters}
        onChange={setFilters}
        onReset={handleResetFilters}
        searchPlaceholder="Title or location"
        openDescription="Search and narrow this lead's events by type, status, priority, or counsellor."
      />
      <EventTable
        events={events}
        loading={loading}
        error={error}
        pagination={pagination}
        onPageChange={goToPage}
        onReload={() => loadEvents(page, { filters: appliedFilters })}
        hideStudentColumn
      />
    </div>
  );
};

export default LeadEventsPanel;
