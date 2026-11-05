import { useEffect, useState } from 'react';
import { suggestPlaces } from '../../../api/googleAdsGeoApi';
import { apiErrorMessage } from './locationSelection';

/** Debounced place-name search for radius targeting. */
export default function usePlaceSearch(query, enabled = true) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const name = String(query || '').trim();
    if (!enabled || name.length < 2) {
      setResults([]);
      setError(null);
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const data = await suggestPlaces(name);
        if (cancelled) return;
        setResults(data?.suggestions || []);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setResults([]);
        setError(apiErrorMessage(err, 'Place search failed'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, enabled]);

  return { results, loading, error };
}
