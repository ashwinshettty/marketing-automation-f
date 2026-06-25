import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { fetchLeadManagerStudents } from '../api/studentApi';
import { mapStudentToLead } from '../utils/mapStudentToLead';

const DEFAULT_PAGE_SIZE = 10;

const LeadContext = createContext(null);

export const LeadProvider = ({ children }) => {
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const loadLeads = useCallback(async (pageToLoad = 1) => {
    try {
      setLoading(true);
      setError('');

      const data = await fetchLeadManagerStudents({
        page: pageToLoad,
        limit: DEFAULT_PAGE_SIZE,
      });
      const students = Array.isArray(data?.students) ? data.students : [];
      const mappedLeads = students.map(mapStudentToLead);

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
      setError(err.message || 'Failed to load leads');
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLeads(1);
  }, [loadLeads]);

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
