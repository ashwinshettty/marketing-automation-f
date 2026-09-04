import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';

const STORAGE_KEY = 'wi_current_audit';

const AuditContext = createContext(null);

async function loadAuditById(auditId) {
  return api.getAudit(auditId);
}

export function AuditProvider({ children }) {
  const [audit, setAudit] = useState(null);
  const [auditHistory, setAuditHistory] = useState([]);
  const [persistenceMode, setPersistenceMode] = useState(null);
  const [catalogs, setCatalogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(null);

  const refreshHistory = useCallback(async () => {
    try {
      const { audits, persistence } = await api.listAudits({ limit: 20 });
      setAuditHistory(audits || []);
      if (persistence) setPersistenceMode(persistence);
      return audits || [];
    } catch {
      return [];
    }
  }, []);

  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        const health = await api.health();
        setPersistenceMode(health.persistence || null);
      } catch {
        // API unavailable
      }

      const savedId = localStorage.getItem(STORAGE_KEY);
      if (savedId) {
        try {
          const savedAudit = await loadAuditById(savedId);
          setAudit(savedAudit);
          await refreshHistory();
          return;
        } catch {
          localStorage.removeItem(STORAGE_KEY);
        }
      }

      const history = await refreshHistory();
      if (history.length > 0) {
        try {
          const latest = await loadAuditById(history[0].auditId);
          setAudit(latest);
          localStorage.setItem(STORAGE_KEY, latest.auditId);
        } catch {
          // ignore
        }
      }

      api.listCatalogs().then((r) => setCatalogs(r.catalogs || [])).catch(() => {});
    }

    init().finally(() => setLoading(false));
  }, [refreshHistory]);

  const persistAudit = useCallback((data) => {
    setAudit(data);
    if (data?.auditId) localStorage.setItem(STORAGE_KEY, data.auditId);
    refreshHistory();
  }, [refreshHistory]);

  const loadAudit = useCallback(async (auditId) => {
    const data = await loadAuditById(auditId);
    persistAudit(data);
    return data;
  }, [persistAudit]);

  const startAnalysis = useCallback(async ({ website, catalogId, maxPages = null }) => {
    setError(null);
    setAnalyzing(true);
    setProgress({ stage: 'queued', percentage: 0 });
    try {
      const { auditId } = await api.createAudit({
        website,
        catalog: { id: catalogId },
        options: maxPages != null ? { maxPages } : { maxPages: null },
      });
      const result = await api.pollAuditUntilComplete(auditId, {
        onProgress: (status) => setProgress(status.progress ?? status),
      });
      persistAudit(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setAnalyzing(false);
    }
  }, [persistAudit]);

  const clearAudit = useCallback(() => {
    setAudit(null);
    setProgress(null);
    setError(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const deleteAudit = useCallback(
    async (auditId) => {
      await api.deleteAudit(auditId);

      if (audit?.auditId === auditId) {
        clearAudit();
      } else if (localStorage.getItem(STORAGE_KEY) === auditId) {
        localStorage.removeItem(STORAGE_KEY);
      }

      const history = await refreshHistory();

      if (audit?.auditId === auditId && history.length > 0) {
        try {
          const next = await loadAuditById(history[0].auditId);
          setAudit(next);
          localStorage.setItem(STORAGE_KEY, next.auditId);
        } catch {
          // no-op
        }
      }
    },
    [audit?.auditId, clearAudit, refreshHistory]
  );

  const value = useMemo(
    () => ({
      audit,
      auditHistory,
      persistenceMode,
      catalogs,
      loading,
      analyzing,
      progress,
      error,
      startAnalysis,
      loadAudit,
      refreshHistory,
      clearAudit,
      deleteAudit,
      setLoading,
    }),
    [
      audit,
      auditHistory,
      persistenceMode,
      catalogs,
      loading,
      analyzing,
      progress,
      error,
      startAnalysis,
      loadAudit,
      refreshHistory,
      clearAudit,
      deleteAudit,
    ]
  );

  return <AuditContext.Provider value={value}>{children}</AuditContext.Provider>;
}

export function useAudit() {
  const ctx = useContext(AuditContext);
  if (!ctx) throw new Error('useAudit must be used within AuditProvider');
  return ctx;
}
