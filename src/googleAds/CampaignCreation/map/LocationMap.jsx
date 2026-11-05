import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const INDIA = [22.5, 79];
const START_ZOOM = 4;

const radiusMeters = (area) => {
  const distance = Number(area?.radius);
  if (!Number.isFinite(distance) || distance <= 0) return 0;
  return area.radiusUnits === 'MILES' ? distance * 1609.34 : distance * 1000;
};

const pointsOf = (radii) => {
  const seen = new Set();
  const points = [];
  (radii || []).forEach((area) => {
    const lat = Number(area.latitude);
    const lng = Number(area.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    const meters = radiusMeters(area);
    const excluded = area.action === 'exclude';
    const key = `${lat}|${lng}|${meters}|${excluded}`;
    if (seen.has(key)) return;
    seen.add(key);
    points.push({ lat, lng, meters, excluded });
  });
  return points;
};

/**
 * Google Ads location map. Draws a circle for each radius that has a center.
 */
export default function LocationMap({ radii = [], preview = null }) {
  const hostRef = useRef(null);
  const mapRef = useRef(null);
  const shapesRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    const map = L.map(host, {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView(INDIA, START_ZOOM);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;
    const resize = () => map.invalidateSize();
    const frame = requestAnimationFrame(resize);
    const observer = new ResizeObserver(resize);
    observer.observe(host);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      map.remove();
      mapRef.current = null;
      shapesRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return undefined;

    if (shapesRef.current) {
      shapesRef.current.remove();
      shapesRef.current = null;
    }

    const points = pointsOf(preview ? [preview, ...(radii || [])] : radii);
    if (!points.length) {
      map.setView(INDIA, START_ZOOM);
      map.invalidateSize();
      return undefined;
    }

    const group = L.featureGroup().addTo(map);
    points.forEach((point) => {
      const color = point.excluded ? '#d93025' : '#1a73e8';
      if (point.meters > 0) {
        L.circle([point.lat, point.lng], {
          radius: point.meters,
          color,
          weight: 2,
          fillColor: color,
          fillOpacity: 0.18,
        }).addTo(group);
      }
      L.circleMarker([point.lat, point.lng], {
        radius: 6,
        color: '#ffffff',
        weight: 2,
        fillColor: color,
        fillOpacity: 1,
      }).addTo(group);
    });
    shapesRef.current = group;
    map.invalidateSize();
    const frame = requestAnimationFrame(() => {
      if (!mapRef.current || !shapesRef.current) return;
      const bounds = shapesRef.current.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [36, 36], maxZoom: 13 });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [radii, preview]);

  return <div ref={hostRef} className="h-full min-h-[340px] w-full md:min-h-[440px]" />;
}
