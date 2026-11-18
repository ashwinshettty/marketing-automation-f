import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { chartMetricById, formatChartMetric } from './chartMetrics';

const FILL = '#f9ab00';
const START = [22.5, 79];

export default function LocationsMap({ areas = [], metricId = 'cost', currencyCode = 'INR' }) {
  const hostRef = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const tipRef = useRef(null);
  const shownId = useRef('');
  const hideTimer = useRef(0);
  const frame = useRef(0);
  const pending = useRef(null);
  const [tip, setTip] = useState(null);
  const metric = chartMetricById(metricId);

  const placeTip = (point) => {
    pending.current = point;
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      const card = tipRef.current;
      const host = hostRef.current;
      const next = pending.current;
      if (!card || !host || !next) return;
      const width = card.offsetWidth || 184;
      const height = card.offsetHeight || 88;
      let x = next.x + 18;
      let y = next.y - height - 14;
      if (x + width > host.clientWidth - 8) x = next.x - width - 18;
      if (y < 8) y = Math.min(next.y + 18, host.clientHeight - height - 8);
      x = Math.max(8, Math.min(x, host.clientWidth - width - 8));
      y = Math.max(8, Math.min(y, host.clientHeight - height - 8));
      card.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });
  };

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;
    const map = L.map(host, {
      zoomControl: true,
      scrollWheelZoom: false,
      attributionControl: true,
    }).setView(START, 4);
    map.zoomControl.setPosition('topright');
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 18,
    }).addTo(map);
    mapRef.current = map;
    const resize = () => map.invalidateSize();
    const paint = requestAnimationFrame(resize);
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    return () => {
      cancelAnimationFrame(paint);
      cancelAnimationFrame(frame.current);
      window.clearTimeout(hideTimer.current);
      observer.disconnect();
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return undefined;
    if (layerRef.current) {
      layerRef.current.remove();
      layerRef.current = null;
    }
    shownId.current = '';
    setTip(null);
    tipRef.current?.classList.remove('is-visible');
    const layer = L.layerGroup().addTo(map);
    layerRef.current = layer;
    const bounds = [];

    const pointOf = (event) => event.containerPoint || map.latLngToContainerPoint(event.latlng);

    areas.forEach((area) => {
      const lat = Number(area.latitude);
      const lng = Number(area.longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
      bounds.push([lat, lng]);
      const circle = L.circle([lat, lng], {
        radius: area.radiusMeters || 150000,
        color: FILL,
        weight: 1,
        fillColor: FILL,
        fillOpacity: 0.45,
      });
      const dot = L.circleMarker([lat, lng], {
        radius: 6,
        color: '#e37400',
        weight: 1,
        fillColor: FILL,
        fillOpacity: 1,
      });
      const show = (event) => {
        window.clearTimeout(hideTimer.current);
        if (shownId.current !== area.id) {
          shownId.current = area.id;
          setTip({
            name: area.name,
            label: metric?.label || 'Cost',
            value: formatChartMetric(metric, area.metrics?.[metricId], currencyCode),
          });
        }
        tipRef.current?.classList.add('is-visible');
        circle.setStyle({ fillOpacity: 0.62, weight: 2 });
        circle.bringToFront();
        dot.bringToFront();
        placeTip(pointOf(event));
      };
      const hide = () => {
        window.clearTimeout(hideTimer.current);
        hideTimer.current = window.setTimeout(() => {
          if (shownId.current !== area.id) return;
          shownId.current = '';
          circle.setStyle({ fillOpacity: 0.45, weight: 1 });
          tipRef.current?.classList.remove('is-visible');
        }, 90);
      };
      circle.on('mouseover', show);
      dot.on('mouseover', show);
      circle.on('mousemove', show);
      dot.on('mousemove', show);
      circle.on('mouseout', hide);
      dot.on('mouseout', hide);
      circle.addTo(layer);
      dot.addTo(layer);
    });

    if (bounds.length === 1) map.setView(bounds[0], 6);
    else if (bounds.length > 1) map.fitBounds(bounds, { padding: [36, 36], maxZoom: 7 });
    else map.setView(START, 4);
    map.invalidateSize();
    return undefined;
  }, [areas, currencyCode, metric, metricId]);

  useEffect(() => {
    if (!tip || !pending.current) return undefined;
    placeTip(pending.current);
    return undefined;
  }, [tip]);

  return (
    <div className="ga-location-map relative h-[320px] overflow-hidden bg-[#d6e6f2]">
      <div ref={hostRef} className="h-full w-full" />
      <div ref={tipRef} className="ga-location-tip" role="tooltip">
        <p className="text-base leading-5 text-[var(--ga-ink)]">{tip?.name}</p>
        <p className="mt-2 text-xs text-[var(--ga-muted)]">{tip?.label}</p>
        <p className="mt-1 flex items-center gap-2 text-lg leading-6 text-[var(--ga-ink)]">
          <span className="inline-block h-3 w-3 shrink-0 bg-[#f9ab00]" aria-hidden="true" />
          {tip?.value}
        </p>
      </div>
    </div>
  );
}
