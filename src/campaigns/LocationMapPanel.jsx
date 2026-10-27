import { useEffect, useMemo, useRef, useState } from 'react';

const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
const LEAFLET_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';

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

/**
 * Meta Ads Manager–style map: Drop Pin + radius (km).
 * Also supports separate "your current location" fields and distance display.
 */
export default function LocationMapPanel({
  latitude = '',
  longitude = '',
  radiusKm = '10',
  userLatitude = '',
  userLongitude = '',
  dropPinMode = false,
  onDropPinModeChange,
  onPinChange,
  onRadiusChange,
  onUserLocationChange,
  centerLabel = 'India',
}) {
  const mapElRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const userMarkerRef = useRef(null);
  const circleRef = useRef(null);
  const dropPinModeRef = useRef(dropPinMode);
  const onPinChangeRef = useRef(onPinChange);
  const onDropPinModeChangeRef = useRef(onDropPinModeChange);
  const onUserLocationChangeRef = useRef(onUserLocationChange);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [geoBusy, setGeoBusy] = useState(false);
  const [geoHint, setGeoHint] = useState('');

  dropPinModeRef.current = dropPinMode;
  onPinChangeRef.current = onPinChange;
  onDropPinModeChangeRef.current = onDropPinModeChange;
  onUserLocationChangeRef.current = onUserLocationChange;

  const lat = parseCoord(latitude);
  const lng = parseCoord(longitude);
  const userLat = parseCoord(userLatitude);
  const userLng = parseCoord(userLongitude);
  const hasPin = lat != null && lng != null;
  const hasUser = userLat != null && userLng != null;
  const radius = Math.max(1, Number(radiusKm) || 10);

  const distanceKm = useMemo(() => {
    if (!hasPin || !hasUser) return null;
    return distanceKmBetween(userLat, userLng, lat, lng);
  }, [hasPin, hasUser, userLat, userLng, lat, lng]);

  const withinRadius = distanceKm != null && distanceKm <= radius;

  const defaultCenter = [22.3511, 78.6677];
  const center = hasPin ? [lat, lng] : hasUser ? [userLat, userLng] : defaultCenter;
  const zoom = hasPin || hasUser ? 11 : 5;

  useEffect(() => {
    let cancelled = false;
    loadLeaflet()
      .then((L) => {
        if (cancelled || !mapElRef.current || mapRef.current) return;
        const map = L.map(mapElRef.current, {
          center,
          zoom,
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

        map.on('click', (e) => {
          if (!dropPinModeRef.current) return;
          onPinChangeRef.current?.({
            latitude: String(e.latlng.lat.toFixed(6)),
            longitude: String(e.latlng.lng.toFixed(6)),
          });
          onDropPinModeChangeRef.current?.(false);
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
        markerRef.current = null;
        userMarkerRef.current = null;
        circleRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    map.getContainer().style.cursor = dropPinMode ? 'crosshair' : '';
  }, [dropPinMode, ready]);

  // Selected pin + radius circle
  useEffect(() => {
    const map = mapRef.current;
    const L = window.L;
    if (!map || !L || !ready) return;

    if (!hasPin) {
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
        markerRef.current = null;
      }
      if (circleRef.current) {
        map.removeLayer(circleRef.current);
        circleRef.current = null;
      }
      return;
    }

    if (!markerRef.current) {
      markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(map);
      markerRef.current.on('dragend', () => {
        const p = markerRef.current.getLatLng();
        onPinChangeRef.current?.({
          latitude: String(p.lat.toFixed(6)),
          longitude: String(p.lng.toFixed(6)),
        });
      });
    } else {
      markerRef.current.setLatLng([lat, lng]);
    }

    if (!circleRef.current) {
      circleRef.current = L.circle([lat, lng], {
        radius: radius * 1000,
        color: '#000080',
        fillColor: '#000080',
        fillOpacity: 0.15,
        weight: 2,
      }).addTo(map);
    } else {
      circleRef.current.setLatLng([lat, lng]);
      circleRef.current.setRadius(radius * 1000);
    }

    map.setView([lat, lng], Math.max(map.getZoom(), 10));
  }, [lat, lng, radius, hasPin, ready]);

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
        });
      });
    } else {
      userMarkerRef.current.setLatLng([userLat, userLng]);
      userMarkerRef.current.setIcon(icon);
    }
  }, [userLat, userLng, hasUser, ready]);

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
        });
        setGeoBusy(false);
        setGeoHint('Current location updated.');
      },
      () => {
        setGeoBusy(false);
        setGeoHint('Could not read your location. Allow access or type coordinates manually.');
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
      (pos) => {
        const nextLat = String(pos.coords.latitude.toFixed(6));
        const nextLng = String(pos.coords.longitude.toFixed(6));
        onPinChange?.({ latitude: nextLat, longitude: nextLng });
        onUserLocationChange?.({ userLatitude: nextLat, userLongitude: nextLng });
        if (!radiusKm) onRadiusChange?.('10');
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
          We are unable to highlight the border of {centerLabel} on the map, but it has been successfully
          added.
        </p>
      </div>

      {/* Your current location — separate from the targeting pin */}
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
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <label className="block text-xs font-medium text-slate-600">
            Latitude
            <input
              type="number"
              step="any"
              value={userLatitude}
              onChange={(e) =>
                onUserLocationChange?.({
                  userLatitude: e.target.value,
                  userLongitude,
                })
              }
              placeholder="e.g. 19.0760"
              className="mt-1 w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm text-slate-800 outline-none focus:border-brand-navy"
            />
          </label>
          <label className="block text-xs font-medium text-slate-600">
            Longitude
            <input
              type="number"
              step="any"
              value={userLongitude}
              onChange={(e) =>
                onUserLocationChange?.({
                  userLatitude,
                  userLongitude: e.target.value,
                })
              }
              placeholder="e.g. 72.8777"
              className="mt-1 w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm text-slate-800 outline-none focus:border-brand-navy"
            />
          </label>
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

        {dropPinMode ? (
          <div className="pointer-events-none absolute top-3 left-3 z-[1000] rounded-lg bg-slate-900/85 px-3 py-1.5 text-xs font-medium text-white">
            Click the map to drop a pin
          </div>
        ) : null}
      </div>

      {hasPin ? (
        <div className="space-y-2 border-t border-slate-200 px-3.5 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-slate-800">Selected location (pin)</p>
            <button
              type="button"
              onClick={() =>
                onPinChange?.({
                  latitude: '',
                  longitude: '',
                })
              }
              className="text-xs font-semibold text-rose-600 hover:underline"
            >
              Remove pin
            </button>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <label className="block text-xs font-medium text-slate-600">
              Latitude
              <input
                type="number"
                step="any"
                value={latitude}
                onChange={(e) =>
                  onPinChange?.({
                    latitude: e.target.value,
                    longitude,
                  })
                }
                className="mt-1 w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm text-slate-800 outline-none focus:border-brand-navy"
              />
            </label>
            <label className="block text-xs font-medium text-slate-600">
              Longitude
              <input
                type="number"
                step="any"
                value={longitude}
                onChange={(e) =>
                  onPinChange?.({
                    latitude,
                    longitude: e.target.value,
                  })
                }
                className="mt-1 w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm text-slate-800 outline-none focus:border-brand-navy"
              />
            </label>
          </div>

          <p className="pt-1 text-sm font-semibold text-slate-800">Radius around pin</p>
          <p className="text-xs text-slate-500">
            People within this distance of the pin can see your ads.
          </p>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="1"
              max="80"
              step="1"
              value={radius}
              onChange={(e) => onRadiusChange?.(e.target.value)}
              className="h-2 flex-1 accent-brand-navy"
            />
            <div className="flex w-24 items-center gap-1">
              <input
                type="number"
                min="1"
                max="80"
                value={radius}
                onChange={(e) => onRadiusChange?.(e.target.value)}
                className="w-14 rounded-md border border-slate-300 px-2 py-1 text-sm"
              />
              <span className="text-xs text-slate-500">km</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="border-t border-slate-100 px-3.5 py-2.5 text-xs text-slate-500">
          Use <span className="font-semibold text-slate-700">Drop Pin</span> to choose a selected location,
          then set a radius in km.
        </div>
      )}

      {/* Distance result */}
      <div className="border-t border-slate-200 bg-brand-cream/50 px-3.5 py-3">
        <p className="text-sm font-semibold text-slate-800">Distance</p>
        {distanceKm == null ? (
          <p className="mt-1 text-xs text-slate-500">
            Enter your current location and drop a selected pin to calculate distance in kilometres.
          </p>
        ) : (
          <div className="mt-1.5 space-y-1">
            <p className="text-sm text-brand-navy">
              Distance from your location to the selected pin:{' '}
              <span className="font-semibold">{distanceKm.toFixed(2)} km</span>
            </p>
            <p className={`text-xs font-medium ${withinRadius ? 'text-emerald-700' : 'text-amber-700'}`}>
              {withinRadius
                ? `Inside the ${radius} km radius — you would be eligible to see ads.`
                : `Outside the ${radius} km radius (${(distanceKm - radius).toFixed(2)} km beyond).`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
