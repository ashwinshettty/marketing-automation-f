import { useEffect, useRef } from 'react';
import { CHART_METRICS } from './chartMetrics';

export default function MetricSelectMenu({
  metricId,
  anchor,
  onChoose,
  onClose,
  metrics = CHART_METRICS,
}) {
  const panelRef = useRef(null);

  useEffect(() => {
    const onPointer = (event) => {
      if (!panelRef.current?.contains(event.target)) onClose();
    };
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div
      ref={panelRef}
      role="menu"
      style={{ top: anchor.top, left: anchor.left, maxHeight: anchor.maxHeight }}
      className="fixed z-50 w-56 overflow-y-auto rounded-lg border border-[var(--ga-border)] bg-white py-1 text-left text-sm shadow-lg"
    >
      <p className="px-3 py-2 text-xs text-[var(--ga-muted)]">Performance</p>
      {metrics.map((item) => (
        <button
          key={item.id}
          type="button"
          role="menuitem"
          onClick={() => onChoose(item.id)}
          className={`block w-full px-3 py-2 text-left hover:bg-[var(--ga-blue-soft)] ${item.id === metricId ? 'bg-[var(--ga-blue-soft)] text-[var(--ga-blue)]' : 'text-[var(--ga-ink)]'}`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
