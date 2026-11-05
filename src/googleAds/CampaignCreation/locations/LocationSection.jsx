import { useState } from 'react';
import {
  removeLocation,
  removeRadius,
  upsertLocation,
} from './locationSelection';
import useGeoTargetSearch from './useGeoTargetSearch';
import LocationAdvancedModal from './LocationAdvancedModal';
import { Field, LocationMatchRow, SelectedTargets } from './locationUi';

const LOCATION_OPTIONS = [
  { id: 'ALL_COUNTRIES', label: 'All countries and territories' },
  { id: 'COUNTRY_IN', label: 'India' },
  { id: 'ENTER_ANOTHER', label: 'Enter another location' },
];

const PRESENCE_OPTIONS = [
  {
    id: 'PRESENCE_OR_INTEREST',
    label: 'Presence or interest: People in, regularly in, or who’ve shown interest in your included locations',
  },
  {
    id: 'PRESENCE',
    label: 'Presence: People in or regularly in your included locations',
  },
];

export default function LocationSection({ value, onChange }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const search = useGeoTargetSearch(query, { enabled: value.locationMode === 'ENTER_ANOTHER' });
  const items = value.locationItems || [];
  const radii = value.locationRadii || [];
  const showMatches = focused && (search.loading || search.error || search.results.length || query.trim().length >= 2);

  const setMode = (locationMode) => onChange({ locationMode });

  return (
    <div>
      <p className="mb-3 text-sm text-[var(--ga-muted)]">Select locations for this campaign</p>
      <div className="space-y-2">
        {LOCATION_OPTIONS.map((option) => (
          <label key={option.id} className="flex cursor-pointer items-center gap-3 py-1">
            <input
              type="radio"
              name="locationMode"
              checked={value.locationMode === option.id}
              onChange={() => setMode(option.id)}
              className="h-4 w-4 accent-[var(--ga-blue)]"
            />
            <span className="text-sm text-[var(--ga-ink)]">{option.label}</span>
          </label>
        ))}
      </div>

      {value.locationMode === 'ALL_COUNTRIES' ? (
        <div className="mt-4 rounded-xl bg-[var(--ga-blue-soft)] p-4 text-sm text-[var(--ga-ink)]">
          Ads can show in all countries and territories. Narrow locations later if you need tighter
          reach.
        </div>
      ) : null}

      {value.locationMode === 'COUNTRY_IN' ? (
        <p className="mt-4 text-sm text-[var(--ga-ink)]">India is included.</p>
      ) : null}

      {value.locationMode === 'ENTER_ANOTHER' ? (
        <div className="mt-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="relative min-w-0 flex-1">
              <Field
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="Enter a location to include or exclude"
                aria-label="Search locations"
                className="w-full"
              />
              {showMatches ? (
                <div className="absolute z-20 mt-1 max-h-72 w-full overflow-y-auto rounded-lg border border-[var(--ga-border)] bg-white shadow-lg">
                  {search.loading ? (
                    <p className="px-3 py-2 text-sm text-[var(--ga-muted)]">Searching…</p>
                  ) : null}
                  {search.error ? (
                    <p className="px-3 py-2 text-sm text-red-600">{search.error}</p>
                  ) : null}
                  {search.results.map((match) => (
                    <LocationMatchRow
                      key={match.id}
                      match={match}
                      onInclude={(item) => onChange({ locationItems: upsertLocation(items, item, 'include') })}
                      onExclude={(item) => onChange({ locationItems: upsertLocation(items, item, 'exclude') })}
                    />
                  ))}
                  {!search.loading && !search.error && !search.results.length ? (
                    <p className="px-3 py-2 text-sm text-[var(--ga-muted)]">No locations found</p>
                  ) : null}
                </div>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="shrink-0 pt-2.5 text-sm font-medium text-[var(--ga-blue)]"
            >
              Advanced search
            </button>
          </div>

          <SelectedTargets
            items={items}
            radii={radii}
            onRemoveItem={(id) => onChange({ locationItems: removeLocation(items, id) })}
            onRemoveRadius={(key) => onChange({ locationRadii: removeRadius(radii, key) })}
          />
        </div>
      ) : null}

      <details className="mt-4">
        <summary className="cursor-pointer text-sm font-medium text-[var(--ga-blue)]">
          Location options
        </summary>
        <div className="mt-3 space-y-2">
          {PRESENCE_OPTIONS.map((option) => (
            <label key={option.id} className="flex cursor-pointer items-start gap-3 py-1">
              <input
                type="radio"
                name="locationOption"
                checked={(value.locationOption || 'PRESENCE_OR_INTEREST') === option.id}
                onChange={() => onChange({ locationOption: option.id })}
                className="mt-0.5 h-4 w-4 accent-[var(--ga-blue)]"
              />
              <span className="text-sm text-[var(--ga-ink)]">{option.label}</span>
            </label>
          ))}
        </div>
      </details>

      {open ? (
        <LocationAdvancedModal
          items={items}
          radii={radii}
          onClose={() => setOpen(false)}
          onSave={(patch) => {
            onChange(patch);
            setOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}
