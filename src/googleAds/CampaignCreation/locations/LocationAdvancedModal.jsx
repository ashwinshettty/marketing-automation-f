import { useEffect, useMemo, useState } from 'react';
import { geocodePlace, suggestGeoTargets } from '../../../api/googleAdsGeoApi';
import usePlaceSearch from './usePlaceSearch';
import {
  BULK_LOCATION_LIMIT,
  addRadius,
  apiErrorMessage,
  applyActionToAll,
  parseBulkLines,
  removeLocation,
  removeRadius,
  unmatchedQueries,
  upsertLocation,
} from './locationSelection';
import useGeoTargetSearch from './useGeoTargetSearch';
import { Field, LocationMatchRow, SelectedTargets } from './locationUi';
import LocationMap from '../map/LocationMap';

export default function LocationAdvancedModal({
  items,
  radii,
  onClose,
  onSave,
}) {
  const [draftItems, setDraftItems] = useState(items);
  const [draftRadii, setDraftRadii] = useState(radii);
  const [panel, setPanel] = useState('location');
  const [bulk, setBulk] = useState(false);
  const [query, setQuery] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [bulkResults, setBulkResults] = useState([]);
  const [bulkMisses, setBulkMisses] = useState([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkError, setBulkError] = useState(null);
  const [place, setPlace] = useState('');
  const [placeId, setPlaceId] = useState('');
  const [placeChosen, setPlaceChosen] = useState(false);
  const [placeFocused, setPlaceFocused] = useState(false);
  const [center, setCenter] = useState(null);
  const [radius, setRadius] = useState('20');
  const [radiusUnits, setRadiusUnits] = useState('KILOMETERS');
  const [radiusError, setRadiusError] = useState(null);
  const [radiusLoading, setRadiusLoading] = useState(false);

  const search = useGeoTargetSearch(query, {
    countryCode,
    enabled: panel === 'location' && !bulk,
  });
  const placeSearch = usePlaceSearch(place, panel === 'radius' && !placeChosen);
  const distance = Number(radius);
  const preview = useMemo(() => {
    if (!center || !(distance >= 1)) return null;
    return {
      label: center.label,
      latitude: center.latitude,
      longitude: center.longitude,
      radius: distance,
      radiusUnits,
      action: 'include',
    };
  }, [center, distance, radiusUnits]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const include = (match) => setDraftItems((prev) => upsertLocation(prev, match, 'include'));
  const exclude = (match) => setDraftItems((prev) => upsertLocation(prev, match, 'exclude'));

  const runBulkSearch = async () => {
    const names = parseBulkLines(bulkText);
    if (!names.length) {
      setBulkError('Enter one location per line');
      setBulkResults([]);
      setBulkMisses([]);
      return;
    }
    setBulkLoading(true);
    setBulkError(null);
    try {
      const data = await suggestGeoTargets({
        names,
        countryCode: countryCode.trim() || undefined,
      });
      const suggestions = data?.suggestions || [];
      setBulkResults(suggestions);
      setBulkMisses(unmatchedQueries(names, suggestions));
    } catch (error) {
      setBulkResults([]);
      setBulkMisses([]);
      setBulkError(apiErrorMessage(error, 'Location search failed'));
    } finally {
      setBulkLoading(false);
    }
  };

  const clearPlace = () => {
    setPlace('');
    setPlaceId('');
    setPlaceChosen(false);
    setCenter(null);
  };

  const choosePlace = async (match) => {
    const label = match.label;
    setPlace(label);
    setPlaceId(match.placeId || '');
    setPlaceChosen(true);
    setPlaceFocused(false);
    setRadiusError(null);
    const latitude = Number(match.latitude);
    const longitude = Number(match.longitude);
    if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
      setCenter({ label, latitude, longitude });
      return;
    }
    setRadiusLoading(true);
    try {
      const data = await geocodePlace({ query: label, placeId: match.placeId });
      const resolved = data?.place;
      if (!resolved) throw new Error('No place matched that name');
      setCenter({
        label: resolved.label || label,
        latitude: resolved.latitude,
        longitude: resolved.longitude,
      });
    } catch (error) {
      setCenter(null);
      setRadiusError(apiErrorMessage(error, 'Could not look up that place'));
    } finally {
      setRadiusLoading(false);
    }
  };

  const addRadiusTarget = async () => {
    const label = place.trim();
    if (!label) {
      setRadiusError('Enter a place name, address, or coordinates');
      return;
    }
    if (!(distance >= 1)) {
      setRadiusError('Radius must be at least 1');
      return;
    }
    if (placeChosen && center) {
      setDraftRadii((prev) => addRadius(prev, {
        label: center.label || label,
        latitude: center.latitude,
        longitude: center.longitude,
        radius: distance,
        radiusUnits,
      }));
      clearPlace();
      setRadiusError(null);
      return;
    }
    setRadiusLoading(true);
    setRadiusError(null);
    try {
      const data = await geocodePlace({ query: label, placeId });
      const resolved = data?.place;
      if (!resolved) throw new Error('No place matched that name');
      setDraftRadii((prev) => addRadius(prev, {
        label: resolved.label || label,
        latitude: resolved.latitude,
        longitude: resolved.longitude,
        radius: distance,
        radiusUnits,
      }));
      clearPlace();
    } catch (error) {
      setRadiusError(apiErrorMessage(error, 'Could not look up that place'));
    } finally {
      setRadiusLoading(false);
    }
  };

  const lineCount = parseBulkLines(bulkText).length;
  const results = bulk ? bulkResults : search.results;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="location-advanced-title"
        className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
      >
        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <div className="flex min-h-0 w-full shrink-0 flex-col md:w-[46%]">
            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
              <h2 id="location-advanced-title" className="sr-only">Advanced location search</h2>
              <div className="flex gap-5 text-sm">
                {['location', 'radius'].map((id) => (
                  <label key={id} className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="locationPanel"
                      checked={panel === id}
                      onChange={() => setPanel(id)}
                      className="h-4 w-4 accent-[var(--ga-blue)]"
                    />
                    <span className="capitalize text-[var(--ga-ink)]">{id === 'location' ? 'Location' : 'Radius'}</span>
                  </label>
                ))}
              </div>

              {panel === 'location' ? (
                <>
                  <label className="flex items-center gap-2 text-sm text-[var(--ga-ink)]">
                    <input
                      type="checkbox"
                      checked={bulk}
                      onChange={(event) => setBulk(event.target.checked)}
                      className="h-4 w-4 accent-[var(--ga-blue)]"
                    />
                    Add locations in bulk
                  </label>

                  {bulk ? (
                    <>
                      <textarea
                        value={bulkText}
                        onChange={(event) => setBulkText(event.target.value)}
                        placeholder={'Locations can be cities, postal codes, countries, etc.\nEnter one location per line.'}
                        rows={5}
                        className="w-full rounded-lg border border-[var(--ga-border)] px-3 py-2.5 text-sm outline-none focus:border-[var(--ga-blue)]"
                      />
                      <div className="text-right text-xs text-[var(--ga-muted)]">
                        {lineCount} / {BULK_LOCATION_LIMIT}
                      </div>
                      <div className="flex gap-2">
                        <Field
                          value={countryCode}
                          onChange={(event) => setCountryCode(event.target.value.toUpperCase())}
                          placeholder="Restrict locations within a country (optional)"
                          maxLength={2}
                          className="w-full"
                        />
                        <button
                          type="button"
                          onClick={runBulkSearch}
                          disabled={bulkLoading || !lineCount}
                          className="shrink-0 rounded-lg bg-[var(--ga-blue)] px-4 py-2 text-sm font-medium text-white disabled:bg-[#a8c7fa]"
                        >
                          {bulkLoading ? 'Searching…' : 'Search'}
                        </button>
                      </div>
                    </>
                  ) : (
                    <Field
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Enter a location to include or exclude"
                      autoFocus
                      className="w-full"
                    />
                  )}

                  {(bulk ? bulkError : search.error) ? (
                    <p className="text-sm text-red-600">{bulk ? bulkError : search.error}</p>
                  ) : null}
                  {!bulk && search.loading ? (
                    <p className="text-sm text-[var(--ga-muted)]">Searching…</p>
                  ) : null}

                  {results.length ? (
                    <div className="overflow-hidden rounded-lg border border-[var(--ga-border)]">
                      <div className="flex items-center justify-between border-b border-[var(--ga-border)] px-3 py-2 text-xs text-[var(--ga-muted)]">
                        <span>Matches</span>
                        <span className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => setDraftItems((prev) => applyActionToAll(prev, results, 'include'))}
                            className="font-medium text-[var(--ga-blue)]"
                          >
                            Target all
                          </button>
                          <button
                            type="button"
                            onClick={() => setDraftItems((prev) => applyActionToAll(prev, results, 'exclude'))}
                            className="font-medium text-[var(--ga-blue)]"
                          >
                            Exclude all
                          </button>
                        </span>
                      </div>
                      <div className="max-h-52 divide-y divide-[var(--ga-border)] overflow-y-auto">
                        {results.map((match) => (
                          <LocationMatchRow
                            key={`${match.id}-${match.searchTerm}`}
                            match={match}
                            onInclude={include}
                            onExclude={exclude}
                          />
                        ))}
                      </div>
                      {bulkMisses.length ? (
                        <p className="border-t border-[var(--ga-border)] px-3 py-2 text-xs text-[var(--ga-muted)]">
                          No match: {bulkMisses.join(', ')}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </>
              ) : (
                <>
                  <div className="relative">
                    <label className="mb-1.5 block text-sm text-[var(--ga-muted)]" htmlFor="radius-place">
                      Place or address
                    </label>
                    <input
                      id="radius-place"
                      value={place}
                      onChange={(event) => {
                        setPlace(event.target.value);
                        setPlaceId('');
                        setPlaceChosen(false);
                        setCenter(null);
                      }}
                      onFocus={() => setPlaceFocused(true)}
                      onBlur={() => setPlaceFocused(false)}
                      placeholder="Enter a place name, address, or coordinates"
                      autoFocus
                      className="w-full rounded-lg border border-[var(--ga-border)] bg-white px-3 py-2.5 text-sm text-[var(--ga-ink)] outline-none focus:border-[var(--ga-blue)]"
                    />
                    {placeFocused && (placeSearch.loading || placeSearch.error || placeSearch.results.length) ? (
                      <div className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-[var(--ga-border)] bg-white shadow-lg">
                        <p className="px-3 py-2 text-xs text-[var(--ga-muted)]">
                          Locations that match: {place.trim()}
                        </p>
                        {placeSearch.loading ? (
                          <p className="px-3 py-2 text-sm text-[var(--ga-muted)]">Searching…</p>
                        ) : null}
                        {placeSearch.error ? (
                          <p className="px-3 py-2 text-sm text-red-600">{placeSearch.error}</p>
                        ) : null}
                        {placeSearch.results.map((match) => (
                          <button
                            key={`${match.placeId || match.geoTargetId}-${match.label}`}
                            type="button"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => choosePlace(match)}
                            className="block w-full truncate px-3 py-2 text-left text-sm text-[var(--ga-ink)] hover:bg-[var(--ga-hover)]"
                          >
                            {match.label}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <Field
                      value={radius}
                      onChange={(event) => setRadius(event.target.value)}
                      inputMode="decimal"
                      className="w-20"
                      aria-label="Radius"
                    />
                    <select
                      value={radiusUnits}
                      onChange={(event) => setRadiusUnits(event.target.value)}
                      className="rounded-lg border border-[var(--ga-border)] bg-white px-2 py-2.5 text-sm"
                      aria-label="Radius unit"
                    >
                      <option value="KILOMETERS">km</option>
                      <option value="MILES">mi</option>
                    </select>
                    <button
                      type="button"
                      onClick={addRadiusTarget}
                      disabled={radiusLoading}
                      className="rounded-lg bg-[var(--ga-blue)] px-4 py-2 text-sm font-medium text-white disabled:bg-[#a8c7fa]"
                    >
                      {radiusLoading ? 'Looking up…' : 'Add radius'}
                    </button>
                  </div>
                  {radiusError ? <p className="text-sm text-red-600">{radiusError}</p> : null}
                </>
              )}

              <SelectedTargets
                items={draftItems}
                radii={draftRadii}
                onRemoveItem={(id) => setDraftItems((prev) => removeLocation(prev, id))}
                onRemoveRadius={(key) => setDraftRadii((prev) => removeRadius(prev, key))}
              />
            </div>
          </div>
          <div className="relative h-[340px] w-full shrink-0 overflow-hidden border-t border-[var(--ga-border)] md:h-auto md:min-h-[440px] md:w-[54%] md:border-l md:border-t-0">
            <LocationMap radii={draftRadii} preview={preview} />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-[var(--ga-border)] px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-2 text-sm font-medium text-[var(--ga-blue)]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave({ locationItems: draftItems, locationRadii: draftRadii })}
            className="rounded-full bg-[var(--ga-blue)] px-5 py-2 text-sm font-medium text-white"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
