import { useEffect, useMemo, useRef, useState } from 'react';
import { reverseGeocode } from './places';

const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
const LEAFLET_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';

/** Meta-style: include = navy fill, exclude = rose (official Ads Manager map). */
const INCLUDE_STYLE = {
  color: '#000080',
  fillColor: '#000080',
  fillOpacity: 0.18,
  weight: 2,
};
const EXCLUDE_STYLE = {
  color: '#e11d48',
  fillColor: '#e11d48',
  fillOpacity: 0.16,
  weight: 2,
};

let leafletLoadPromise = null;

function loadLeaflet() {
  if (typeof window === 'undefined') return Promise.reject(new Error('No window'));
  if (window.L) return Promise.resolve(window.L);
  if (leafletLoadPromise) return leafletLoadPromise;

  leafletLoadPromise = new Promise((resolve, reject) => {
    if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = LEAFLET_CSS;
      document.head.appendChild(link);
    }
    const existing = document.querySelector(`script[src="${LEAFLET_JS}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(window.L));
      existing.addEventListener('error', reject);
      if (window.L) resolve(window.L);
      return;
    }
    const script = document.createElement('script');
    script.src = LEAFLET_JS;
    script.async = true;
    script.onload = () => resolve(window.L);
    script.onerror = reject;
    document.body.appendChild(script);
  });
  return leafletLoadPromise;
}

/** Haversine distance between two WGS84 points, in kilometres */
export function distanceKmBetween(lat1, lng1, lat2, lng2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function parseCoord(value) {
  const n = Number(value);
  return Number.isFinite(n) && value !== '' && value != null ? n : null;
}

function defaultRadiusForType(type) {
  if (type === 'City' || type === 'Region') return 25;
  return 10;
}

/**
 * Meta Ads Manager–style map:
 * - Each selected city/region with coords → its own shaded radius circle only
 * - Include = navy, Exclude = red (Meta official)
 * - Drop Pin adds another location (same as a selected city), not a 3rd orphan circle
 * - Map fits bounds to show all selected locations
 */
export default function LocationMapPanel({
  userLatitude = '',
  userLongitude = '',
  userLocationLabel = '',
  /** @type {{ id: string, label: string, lat: number, lng: number, radiusKm?: number|string, excluded?: boolean, type?: string, selected?: boolean }[]} */
  mapLocations = [],
  selectedLocationId = '',
  onSelectLocation,
  dropPinMode = false,
  onDropPinModeChange,
  /** Called when user drops a pin — parent should append a location tag */
  onAddMapLocation,
  onUserLocationChange,
  centerLabel = 'India',
}) {
  const mapElRef = useRef(null);
  const mapRef = useRef(null);
  const userMarkerRef = useRef(null);
  const locationLayersRef = useRef(new Map()); // id → { marker, circle }
  const dropPinModeRef = useRef(dropPinMode);
  const onAddMapLocationRef = useRef(onAddMapLocation);
  const onDropPinModeChangeRef = useRef(onDropPinModeChange);
  const onUserLocationChangeRef = useRef(onUserLocationChange);
  const onSelectLocationRef = useRef(onSelectLocation);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [geoBusy, setGeoBusy] = useState(false);
  const [geoHint, setGeoHint] = useState('');
  const lastUserKeyRef = useRef('');
  const lastBoundsKeyRef = useRef('');

  dropPinModeRef.current = dropPinMode;
  onAddMapLocationRef.current = onAddMapLocation;
  onDropPinModeChangeRef.current = onDropPinModeChange;
  onUserLocationChangeRef.current = onUserLocationChange;
  onSelectLocationRef.current = onSelectLocation;

  const userLat = parseCoord(userLatitude);
  const userLng = parseCoord(userLongitude);
  const hasUser = userLat != null && userLng != null;

  const normalizedLocations = useMemo(() => {
    const list = Array.isArray(mapLocations) ? mapLocations : [];
    return list
      .map((item) => {
        const itemLat = parseCoord(item.lat);
        const itemLng = parseCoord(item.lng);
        if (itemLat == null || itemLng == null) return null;
        const r = Math.max(
          1,
          Number(item.radiusKm) || defaultRadiusForType(item.type) || 25
        );
        const id = String(item.id || item.value || `${itemLat},${itemLng}`);
        return {
          id,
          label: item.label || 'Location',
          lat: itemLat,
          lng: itemLng,
          radiusKm: r,
          excluded: Boolean(item.excluded),
          selected: Boolean(item.selected) || id === selectedLocationId,
          type: item.type || 'City',
        };
      })
      .filter(Boolean);
  }, [mapLocations, selectedLocationId]);

  const locationDistances = useMemo(() => {
    if (!hasUser || !normalizedLocations.length) return [];
    return normalizedLocations
      .map((item) => {
        const km = distanceKmBetween(userLat, userLng, item.lat, item.lng);
        return {
          ...item,
          distanceKm: km,
          withinRadius: km <= item.radiusKm,
        };
      })
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [hasUser, userLat, userLng, normalizedLocations]);

  const totalDistanceKm = useMemo(
    () => locationDistances.reduce((sum, item) => sum + item.distanceKm, 0),
    [locationDistances]
  );

  const bannerLabel = useMemo(() => {
    if (normalizedLocations.length > 1) {
      return normalizedLocations.map((l) => l.label).join(', ');
    }
    return normalizedLocations[0]?.label || centerLabel || 'India';
  }, [normalizedLocations, centerLabel]);

  useEffect(() => {
    let cancelled = false;
    loadLeaflet()
      .then((L) => {
        if (cancelled || !mapElRef.current || mapRef.current) return;
        const map = L.map(mapElRef.current, {
          center: [22.3511, 78.6677],
          zoom: 5,
          zoomControl: false,
          attributionControl: true,
        });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 18,
          attribution: '&copy; OpenStreetMap',
        }).addTo(map);
        L.control.zoom({ position: 'topright' }).addTo(map);
        mapRef.current = map;
        setReady(true);
        setTimeout(() => map.invalidateSize(), 50);

        map.on('click', async (e) => {
          if (!dropPinModeRef.current) return;
          const nextLat = e.latlng.lat;
          const nextLng = e.latlng.lng;
          onDropPinModeChangeRef.current?.(false);
          let label = `Near ${nextLat.toFixed(4)}, ${nextLng.toFixed(4)}`;
          try {
            const name = await reverseGeocode(nextLat, nextLng);
            if (name) label = name;
          } catch {
            /* keep fallback label */
          }
          onAddMapLocationRef.current?.({
            lat: nextLat,
            lng: nextLng,
            label,
            radiusKm: 10,
          });
        });
      })
      .catch(() => {
        if (!cancelled) setLoadError('Map could not load. Check your network connection.');
      });

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        userMarkerRef.current = null;
        locationLayersRef.current.clear();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    map.getContainer().style.cursor = dropPinMode ? 'crosshair' : '';
  }, [dropPinMode, ready]);

  // Meta-style: one circle per selected city/region (include navy / exclude red)
  useEffect(() => {
    const map = mapRef.current;
    const L = window.L;
    if (!map || !L || !ready) return;

    const nextIds = new Set(normalizedLocations.map((item) => item.id));

    locationLayersRef.current.forEach((layers, id) => {
      if (!nextIds.has(id)) {
        if (layers.marker) map.removeLayer(layers.marker);
        if (layers.circle) map.removeLayer(layers.circle);
        locationLayersRef.current.delete(id);
      }
    });

    normalizedLocations.forEach((item) => {
      const base = item.excluded ? EXCLUDE_STYLE : INCLUDE_STYLE;
      const style = {
        ...base,
        weight: item.selected ? 3 : 2,
        fillOpacity: item.selected ? 0.28 : base.fillOpacity,
      };
      let layers = locationLayersRef.current.get(item.id);
      if (!layers) {
        const marker = L.circleMarker([item.lat, item.lng], {
          radius: item.selected ? 8 : 6,
          color: style.color,
          fillColor: style.color,
          fillOpacity: 1,
          weight: 2,
        }).addTo(map);
        marker.bindTooltip(`${item.label} · +${item.radiusKm} km`, {
          direction: 'top',
          opacity: 0.9,
        });
        marker.on('click', () => onSelectLocationRef.current?.(item.id));
        const circle = L.circle([item.lat, item.lng], {
          radius: item.radiusKm * 1000,
          ...style,
        }).addTo(map);
        circle.on('click', () => onSelectLocationRef.current?.(item.id));
        layers = { marker, circle };
        locationLayersRef.current.set(item.id, layers);
      } else {
        layers.marker.setLatLng([item.lat, item.lng]);
        layers.marker.setStyle({
          color: style.color,
          fillColor: style.color,
          radius: item.selected ? 8 : 6,
        });
        const tip = layers.marker.getTooltip?.();
        const tipText = `${item.label} · +${item.radiusKm} km`;
        if (tip) tip.setContent(tipText);
        else layers.marker.bindTooltip(tipText, { direction: 'top', opacity: 0.9 });
        layers.circle.setLatLng([item.lat, item.lng]);
        layers.circle.setRadius(item.radiusKm * 1000);
        layers.circle.setStyle(style);
      }
    });
  }, [normalizedLocations, ready]);

  // Fit map to all selected locations only (no orphan drop-pin circle)
  useEffect(() => {
    const map = mapRef.current;
    const L = window.L;
    if (!map || !L || !ready) return;

    const points = [];
    normalizedLocations.forEach((item) => {
      points.push([item.lat, item.lng]);
    });
    if (hasUser) points.push([userLat, userLng]);

    const boundsKey = points.map((p) => `${p[0].toFixed(4)},${p[1].toFixed(4)}`).join('|');
    if (!points.length || boundsKey === lastBoundsKeyRef.current) return;
    lastBoundsKeyRef.current = boundsKey;

    if (points.length === 1) {
      map.setView(points[0], 11);
      return;
    }
    map.fitBounds(L.latLngBounds(points), {
      padding: [48, 48],
      maxZoom: 11,
    });
  }, [normalizedLocations, hasUser, userLat, userLng, ready]);

  // User current-location marker (green)
  useEffect(() => {
    const map = mapRef.current;
    const L = window.L;
    if (!map || !L || !ready) return;

    if (!hasUser) {
      if (userMarkerRef.current) {
        map.removeLayer(userMarkerRef.current);
        userMarkerRef.current = null;
      }
      return;
    }

    const icon = L.divIcon({
      className: '',
      html: `<span style="display:block;width:14px;height:14px;border-radius:9999px;background:#059669;border:2px solid #fff;box-shadow:0 0 0 2px #059669;"></span>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });

    if (!userMarkerRef.current) {
      userMarkerRef.current = L.marker([userLat, userLng], { icon, draggable: true }).addTo(map);
      userMarkerRef.current.on('dragend', () => {
        const p = userMarkerRef.current.getLatLng();
        onUserLocationChangeRef.current?.({
          userLatitude: String(p.lat.toFixed(6)),
          userLongitude: String(p.lng.toFixed(6)),
          userLocationLabel: '',
        });
      });
    } else {
      userMarkerRef.current.setLatLng([userLat, userLng]);
      userMarkerRef.current.setIcon(icon);
    }
  }, [userLat, userLng, hasUser, ready]);

  // Keep optional reverse-geocode label for current location (coords shown in UI)
  useEffect(() => {
    if (!hasUser) {
      lastUserKeyRef.current = '';
      return undefined;
    }
    const key = `${userLat.toFixed(5)},${userLng.toFixed(5)}`;
    if (lastUserKeyRef.current === key) return undefined;
    if (userLocationLabel) {
      lastUserKeyRef.current = key;
      return undefined;
    }

    let cancelled = false;
    reverseGeocode(userLat, userLng)
      .then((name) => {
        if (cancelled) return;
        lastUserKeyRef.current = key;
        onUserLocationChangeRef.current?.({
          userLatitude: String(userLat),
          userLongitude: String(userLng),
          userLocationLabel: name || `Near ${userLat.toFixed(4)}, ${userLng.toFixed(4)}`,
        });
      });
    return () => {
      cancelled = true;
    };
  }, [hasUser, userLat, userLng, userLocationLabel]);

  const detectCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoHint('Location is not supported in this browser.');
      return;
    }
    setGeoBusy(true);
    setGeoHint('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onUserLocationChange?.({
          userLatitude: String(pos.coords.latitude.toFixed(6)),
          userLongitude: String(pos.coords.longitude.toFixed(6)),
          userLocationLabel: '',
        });
        setGeoBusy(false);
        setGeoHint('Current location updated.');
      },
      () => {
        setGeoBusy(false);
        setGeoHint('Could not read your location. Allow access or use Detect again.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const useMyLocationAsPin = () => {
    if (!navigator.geolocation) {
      setLoadError('Location is not supported in this browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const nextLat = pos.coords.latitude;
        const nextLng = pos.coords.longitude;
        lastUserKeyRef.current = '';
        lastBoundsKeyRef.current = '';
        onUserLocationChange?.({
          userLatitude: String(nextLat.toFixed(6)),
          userLongitude: String(nextLng.toFixed(6)),
          userLocationLabel: '',
        });
        let label = `Near ${nextLat.toFixed(4)}, ${nextLng.toFixed(4)}`;
        try {
          const name = await reverseGeocode(nextLat, nextLng);
          if (name) label = name;
        } catch {
          /* keep fallback */
        }
        onAddMapLocation?.({
          lat: nextLat,
          lng: nextLng,
          label,
          radiusKm: 10,
        });
        onDropPinModeChange?.(false);
      },
      () => {
        setLoadError('Could not read your location. Allow location access, or use Drop Pin.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-sky-100 bg-brand-yellow-soft px-3.5 py-2.5">
        <p className="text-xs leading-relaxed text-slate-700">
          We are unable to highlight the border of {bannerLabel} on the map, but{' '}
          {normalizedLocations.length > 1 ? 'they have' : 'it has'} been successfully added.
        </p>
      </div>

      <div className="space-y-2 border-b border-slate-200 px-3.5 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-slate-800">Your current location</p>
          <button
            type="button"
            onClick={detectCurrentLocation}
            disabled={geoBusy}
            className="rounded-md border border-brand-yellow/50 bg-white px-2.5 py-1 text-xs font-semibold text-brand-navy hover:bg-brand-cream disabled:opacity-50"
          >
            {geoBusy ? 'Detecting…' : 'Detect my location'}
          </button>
        </div>
        <p className="text-xs text-slate-500">
          Separate from the map pin. Used to calculate distance to the selected location.
        </p>
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
            Latitude / Longitude
          </p>
          <p className="mt-0.5 text-sm font-semibold text-brand-navy">
            {hasUser
              ? `${userLat.toFixed(6)}, ${userLng.toFixed(6)}`
              : 'Not set — tap Detect my location'}
          </p>
        </div>
        {geoHint ? <p className="text-xs text-brand-muted">{geoHint}</p> : null}
      </div>

      <div className="relative">
        {loadError ? (
          <div className="flex h-[220px] items-center justify-center bg-slate-100 px-4 text-center text-sm text-slate-600 sm:h-[280px]">
            {loadError}
          </div>
        ) : (
          <div ref={mapElRef} className="h-[220px] w-full bg-slate-100 sm:h-[280px]" />
        )}

        {dropPinMode ? (
          <div className="pointer-events-none absolute top-3 left-3 z-[1000] rounded-lg bg-slate-900/85 px-3 py-1.5 text-xs font-medium text-white">
            Click the map to drop a pin
          </div>
        ) : normalizedLocations.length > 0 ? (
          <div className="pointer-events-none absolute top-3 left-3 z-[1000] rounded-lg bg-white/95 px-2.5 py-1.5 text-[11px] font-medium text-slate-700 shadow">
            {normalizedLocations.length} location
            {normalizedLocations.length === 1 ? '' : 's'} on map
            {normalizedLocations.some((l) => l.excluded) ? ' · red = excluded' : ''}
          </div>
        ) : null}

        <div className="pointer-events-none absolute top-3 right-3 z-[1000] flex flex-col gap-1">
          <button
            type="button"
            onClick={useMyLocationAsPin}
            className="pointer-events-auto inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 shadow hover:bg-slate-50"
            title="Use my location as targeting pin"
            aria-label="Use my location as targeting pin"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
            </svg>
          </button>
        </div>

        <div className="absolute right-3 bottom-3 z-[1000]">
          <button
            type="button"
            onClick={() => onDropPinModeChange?.(!dropPinMode)}
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold shadow ${
              dropPinMode
                ? 'border-brand-navy bg-brand-navy text-white'
                : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
            }`}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7zm0 9.5A2.5 2.5 0 1114.5 9 2.5 2.5 0 0112 11.5z" />
            </svg>
            Drop Pin
          </button>
        </div>
      </div>

      <div className="border-t border-slate-200 bg-brand-cream/50 px-3.5 py-3">
        <p className="text-sm font-semibold text-slate-800">Distance</p>
        {!locationDistances.length ? (
          <p className="mt-1 text-xs text-slate-500">
            Detect your current location and select cities to see distance for every targeting
            circle.
          </p>
        ) : (
          <div className="mt-1.5 space-y-2">
            <p className="text-sm text-brand-navy">
              Total distance (all {locationDistances.length} location
              {locationDistances.length === 1 ? '' : 's'}):{' '}
              <span className="font-semibold">{totalDistanceKm.toFixed(2)} km</span>
            </p>
            <ul className="space-y-1.5">
              {locationDistances.map((item) => (
                <li key={item.id} className="text-xs text-slate-600">
                  <span className="font-medium text-slate-800">{item.label}</span>
                  {': '}
                  <span className="font-semibold text-brand-navy">{item.distanceKm.toFixed(2)} km</span>
                  <span
                    className={`ml-1.5 ${item.withinRadius ? 'text-emerald-700' : 'text-amber-700'}`}
                  >
                    {item.withinRadius
                      ? `(inside +${item.radiusKm} km)`
                      : `(outside +${item.radiusKm} km · ${(item.distanceKm - item.radiusKm).toFixed(2)} km beyond)`}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
