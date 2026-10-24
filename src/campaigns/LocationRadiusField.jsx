import { useEffect, useId, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { radiusOptions } from './metaCatalog';
import { searchPlaces } from './places';

const newId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `place-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const zoomForRadius = (radiusKm) => {
  if (radiusKm <= 2) return 14;
  if (radiusKm <= 5) return 13;
  if (radiusKm <= 15) return 12;
  if (radiusKm <= 30) return 11;
  if (radiusKm <= 50) return 10;
  return 9;
};

const LocationMap = ({ lat, lng, radiusKm }) => {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;
    const map = L.map(host, {
      zoomControl: true,
      scrollWheelZoom: false,
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 18,
    }).addTo(map);
    const marker = L.circleMarker([lat, lng], {
      radius: 8,
      color: '#000080',
      weight: 2,
      fillColor: '#ffd300',
      fillOpacity: 1,
    }).addTo(map);
    const circle = L.circle([lat, lng], {
      radius: Number(radiusKm) * 1000,
      color: '#000080',
      weight: 2,
      fillColor: '#ffd300',
      fillOpacity: 0.22,
    }).addTo(map);
    const zoom = zoomForRadius(Number(radiusKm));
    map.setView([lat, lng], zoom);
    const fit = () => {
      try {
        map.invalidateSize();
        if (circle._map) map.fitBounds(circle.getBounds(), { padding: [18, 18], animate: false });
      } catch {
        map.setView([lat, lng], zoom);
      }
    };
    map.whenReady(fit);
    const timer = window.setTimeout(fit, 150);
    return () => {
      window.clearTimeout(timer);
      marker.remove();
      circle.remove();
      map.remove();
    };
  }, [lat, lng, radiusKm]);

  return <div ref={hostRef} className="campaign-map" />;
};

const LocationRadiusField = ({ targets, onChange }) => {
  const listId = useId();
  const boxRef = useRef(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [radiusOpenId, setRadiusOpenId] = useState('');

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      const places = await searchPlaces(query);
      if (!cancelled) setResults(places);
    }, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query, open]);

  useEffect(() => {
    const close = (event) => {
      if (!boxRef.current?.contains(event.target)) {
        setOpen(false);
        setRadiusOpenId('');
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const addPlace = (place) => {
    const exists = targets.some((item) => item.name === place.name);
    if (exists) {
      setOpen(false);
      setQuery('');
      return;
    }
    onChange([
      ...targets,
      { id: newId(), name: place.name, lat: place.lat, lng: place.lng, radiusKm: 17 },
    ]);
    setQuery('');
    setOpen(false);
  };

  const setRadius = (id, radiusKm) => {
    onChange(targets.map((item) => (item.id === id ? { ...item, radiusKm } : item)));
    setRadiusOpenId('');
  };

  return (
    <div ref={boxRef} className="space-y-3">
      <div className="relative">
        <label className="space-y-2" htmlFor={listId}>
          <span className="block text-sm font-medium text-brand-navy">Locations</span>
          <input
            id={listId}
            role="combobox"
            aria-expanded={open}
            aria-controls={`${listId}-list`}
            value={query}
            placeholder="Search a city, area, or address"
            onFocus={() => setOpen(true)}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            className="w-full rounded-xl border border-brand-yellow/40 bg-white px-4 py-2.5 text-sm text-brand-navy outline-none placeholder:text-brand-muted/70 focus:border-brand-navy"
          />
        </label>
        {open ? (
          <ul id={`${listId}-list`} role="listbox" className="absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-brand-yellow/40 bg-white py-1 shadow-lg">
            {results.length ? results.map((place) => (
              <li key={`${place.name}-${place.lat}`}>
                <button
                  type="button"
                  role="option"
                  className="block w-full px-4 py-2 text-left text-sm text-brand-navy hover:bg-brand-cream"
                  onClick={() => addPlace(place)}
                >
                  {place.name}
                </button>
              </li>
            )) : (
              <li className="px-4 py-2 text-sm text-brand-muted">No matching location.</li>
            )}
          </ul>
        ) : null}
        <p className="mt-1 text-xs text-brand-muted">Pick a place. The map pins it, and the kilometre menu limits delivery to that radius.</p>
      </div>

      {targets.map((target) => (
        <article key={target.id} className="overflow-hidden rounded-xl border border-brand-yellow/40 bg-white">
          <div className="relative z-20 flex items-center gap-2 border-b border-brand-yellow/30 bg-brand-cream px-3 py-2">
            <p className="min-w-0 flex-1 truncate text-sm font-semibold text-brand-navy">{target.name}</p>
            <div className="relative">
              <button
                type="button"
                aria-expanded={radiusOpenId === target.id}
                onClick={() => setRadiusOpenId(radiusOpenId === target.id ? '' : target.id)}
                className="rounded-lg border border-brand-navy bg-white px-3 py-1.5 text-sm font-semibold text-brand-navy"
              >
                + {target.radiusKm} km
              </button>
              {radiusOpenId === target.id ? (
                <ul className="absolute right-0 z-30 mt-1 max-h-56 w-32 overflow-auto rounded-xl border border-brand-yellow/40 bg-white py-1 shadow-lg">
                  {radiusOptions.map((km) => (
                    <li key={km}>
                      <button
                        type="button"
                        className={`block w-full px-3 py-1.5 text-left text-sm ${km === target.radiusKm ? 'bg-brand-cream font-semibold text-brand-navy' : 'text-brand-navy hover:bg-brand-cream'}`}
                        onClick={() => setRadius(target.id, km)}
                      >
                        + {km} km
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => onChange(targets.filter((item) => item.id !== target.id))}
              className="rounded-lg px-2 py-1.5 text-sm font-semibold text-brand-navy"
            >
              Remove
            </button>
          </div>
          <LocationMap lat={target.lat} lng={target.lng} radiusKm={target.radiusKm} />
          <p className="border-t border-brand-yellow/30 px-3 py-2 text-xs text-brand-muted">
            Delivery is limited to people within {target.radiusKm} km of this pin.
          </p>
        </article>
      ))}
    </div>
  );
};

export default LocationRadiusField;
