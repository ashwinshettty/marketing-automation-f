import { useCallback, useEffect, useState } from 'react';
import {
  listGoogleAdsGoals,
  syncGoogleAdsGoals,
} from '../../api/googleAdsGoalsApi';

/**
 * Load goals from Mongo; sync from Google first (stale-aware by default).
 */
export default function useGoogleAdsGoals({
  includeDeleted = false,
  syncOnMount = true,
  ifStale = true,
} = {}) {
  const [goals, setGoals] = useState([]);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);

  const refresh = useCallback(async ({ forceSync = false } = {}) => {
    setError(null);
    setLoading(true);
    try {
      if (syncOnMount || forceSync) {
        setSyncing(true);
        try {
          const syncRes = await syncGoogleAdsGoals({
            ifStale: forceSync ? false : ifStale,
          });
          setSummary(syncRes?.summary || null);
        } finally {
          setSyncing(false);
        }
      }
      const listRes = await listGoogleAdsGoals({ includeDeleted });
      setGoals(Array.isArray(listRes?.goals) ? listRes.goals : []);
      setLastSyncedAt(listRes?.lastSyncedAt || null);
    } catch (err) {
      setError(err?.message || 'Failed to load Google Ads goals');
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }, [includeDeleted, ifStale, syncOnMount]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    goals,
    lastSyncedAt,
    loading,
    syncing,
    error,
    summary,
    refresh,
    syncNow: () => refresh({ forceSync: true }),
  };
}
