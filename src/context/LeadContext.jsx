import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import axios from 'axios';
import { fetchLeadManagerStudents } from '../api/studentApi';
import { mapStudentToLead } from '../utils/mapStudentToLead';

const DEFAULT_PAGE_SIZE = 10;
const FILTER_DEBOUNCE_MS = 400;

export const EMPTY_LEAD_FILTERS = {
  search: '',
  grade: '',
  board: '',
  source: '',
};

const LeadContext = createContext(null);

export const LeadProvider = ({ children }) => {
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState(EMPTY_LEAD_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_LEAD_FILTERS);
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

  const isCanceledRequest = (err) =>
    axios.isCancel(err) ||
    err?.code === 'ERR_CANCELED' ||
    err?.name === 'CanceledError';

  const loadLeads = useCallback(async (pageToLoad = 1, { signal, filters: filtersOverride } = {}) => {
    const loadId = ++loadIdRef.current;
    const activeFilters = filtersOverride ?? appliedFiltersRef.current;

    try {
      setLoading(true);
      setError('');

      const data = await fetchLeadManagerStudents({
        page: pageToLoad,
        limit: DEFAULT_PAGE_SIZE,
        signal,
        filters: activeFilters,
      });

      if (loadId !== loadIdRef.current) {
        return;
      }

      const sourceLeads = Array.isArray(data?.leads)
        ? data.leads
        : Array.isArray(data?.students)
          ? data.students
          : [];
      const mappedLeads = sourceLeads.map(mapStudentToLead).filter(Boolean);

      setLeads(mappedLeads);
      setPage(data?.pagination?.page || pageToLoad);
      setPagination({
        page: data?.pagination?.page || pageToLoad,
        limit: data?.pagination?.limit || DEFAULT_PAGE_SIZE,
        total: data?.pagination?.total ?? data?.total ?? mappedLeads.length,
        totalPages: data?.pagination?.totalPages || 0,
        hasNextPage: Boolean(data?.pagination?.hasNextPage),
        hasPrevPage: Boolean(data?.pagination?.hasPrevPage),
      });
    } catch (err) {
      if (isCanceledRequest(err) || loadId !== loadIdRef.current) {
        return;
      }

      setError(err.message || 'Failed to load leads');
      setLeads([]);
    } finally {
      if (loadId === loadIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setAppliedFilters((current) => {
        if (
          current.search === filters.search &&
          current.source === filters.source
        ) {
          return current;
        }

        return {
          ...current,
          search: filters.search,
          source: filters.source,
        };
      });
    }, FILTER_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [filters.search, filters.source]);

  useEffect(() => {
    setAppliedFilters((current) => {
      if (current.grade === filters.grade && current.board === filters.board) {
        return current;
      }

      return {
        ...current,
        grade: filters.grade,
        board: filters.board,
      };
    });
  }, [filters.grade, filters.board]);

  useEffect(() => {
    const abortController = new AbortController();

    loadLeads(1, { signal: abortController.signal, filters: appliedFilters });

    return () => abortController.abort();
  }, [appliedFilters, loadLeads]);

  const updateFilters = useCallback((nextFilters) => {
    setFilters(nextFilters);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(EMPTY_LEAD_FILTERS);
    setAppliedFilters(EMPTY_LEAD_FILTERS);
    setPage(1);
  }, []);

  const goToPage = useCallback(
    (nextPage) => {
      if (nextPage < 1 || (pagination.totalPages > 0 && nextPage > pagination.totalPages)) {
        return;
      }

      loadLeads(nextPage);
    },
    [loadLeads, pagination.totalPages],
  );

  const selectLead = useCallback((lead) => {
    setSelectedLead(lead);
  }, []);

  const selectLeadById = useCallback(
    (leadId) => {
      const lead = leads.find((item) => item.id === leadId) || null;
      setSelectedLead(lead);
      return lead;
    },
    [leads],
  );

  const clearSelectedLead = useCallback(() => {
    setSelectedLead(null);
  }, []);

  const updateLeadInList = useCallback((updatedLead) => {
    setLeads((current) =>
      current.map((item) => (item.id === updatedLead.id ? updatedLead : item)),
    );
    setSelectedLead((current) =>
      current?.id === updatedLead.id ? updatedLead : current,
    );
  }, []);

  const value = useMemo(
    () => ({
      leads,
      loading,
      error,
      page,
      pagination,
      filters,
      setFilters: updateFilters,
      resetFilters,
      loadLeads,
      goToPage,
      updateLeadInList,
      selectedLead,
      selectedLeadId: selectedLead?.id ?? null,
      selectLead,
      selectLeadById,
      clearSelectedLead,
    }),
    [
      leads,
      loading,
      error,
      page,
      pagination,
      filters,
      updateFilters,
      resetFilters,
      loadLeads,
      goToPage,
      updateLeadInList,
      selectedLead,
      selectLead,
      selectLeadById,
      clearSelectedLead,
    ],
  );

  return (
    <LeadContext.Provider value={value}>{children}</LeadContext.Provider>
  );
};

export const useLead = () => {
  const context = useContext(LeadContext);

  if (!context) {
    throw new Error('useLead must be used within a LeadProvider');
  }

  return context;
};
