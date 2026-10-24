import { useEffect, useMemo, useRef, useState } from 'react';
import {
  META_ASPECT_RATIOS,
  META_CROP_GROUPS,
  createDefaultMediaCrops,
} from './metaMediaSpecs';

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function CropStage({ mediaUrl, mediaType, aspectId, panX, panY, zoom, onPanChange }) {
  const stageRef = useRef(null);
  const dragRef = useRef(null);
  const spec = META_ASPECT_RATIOS[aspectId] || META_ASPECT_RATIOS['1:1'];
  const ratio = spec.ratio;

  // Stage max size while preserving aspect
  const stageStyle = useMemo(() => {
    const maxW = 420;
    const maxH = 360;
    let w = maxW;
    let h = w / ratio;
    if (h > maxH) {
      h = maxH;
      w = h * ratio;
    }
    return { width: w, height: h, aspectRatio: `${spec.label.replace(':', ' / ')}` };
  }, [ratio, spec.label]);

  const objectPosition = `${panX}% ${panY}%`;

  const onPointerDown = (e) => {
    e.preventDefault();
    const el = stageRef.current;
    if (!el) return;
    el.setPointerCapture?.(e.pointerId);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      panX,
      panY,
    };
  };

  const onPointerMove = (e) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    // Drag moves the media under the crop window
    const nextX = clamp(dragRef.current.panX - dx * 0.25, 0, 100);
    const nextY = clamp(dragRef.current.panY - dy * 0.25, 0, 100);
    onPanChange({ panX: nextX, panY: nextY });
  };

  const onPointerUp = (e) => {
    dragRef.current = null;
    stageRef.current?.releasePointerCapture?.(e.pointerId);
  };

  return (
    <div className="flex flex-col items-center">
      <div
        ref={stageRef}
        className="relative touch-none overflow-hidden rounded-lg bg-black shadow-inner ring-1 ring-slate-300"
        style={stageStyle}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {mediaType === 'video' ? (
          <video
            src={mediaUrl}
            muted
            playsInline
            loop
            autoPlay
            className="pointer-events-none h-full w-full select-none object-cover"
            style={{ objectPosition, transform: `scale(${zoom})`, transformOrigin: objectPosition }}
          />
        ) : (
          <img
            src={mediaUrl}
            alt="Crop preview"
            draggable={false}
            className="pointer-events-none h-full w-full select-none object-cover"
            style={{ objectPosition, transform: `scale(${zoom})`, transformOrigin: objectPosition }}
          />
        )}
        {/* Crop grid overlay (Meta-style rule of thirds) */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-y-0 left-1/3 w-px bg-white/35" />
          <div className="absolute inset-y-0 left-2/3 w-px bg-white/35" />
          <div className="absolute inset-x-0 top-1/3 h-px bg-white/35" />
          <div className="absolute inset-x-0 top-2/3 h-px bg-white/35" />
          <div className="absolute inset-2 rounded border border-white/80" />
        </div>
      </div>
      <p className="mt-2 text-center text-[11px] text-slate-500">
        Drag to reposition · {spec.label} ({spec.recommendedPx.w}×{spec.recommendedPx.h} px recommended)
      </p>
    </div>
  );
}

/**
 * Meta Ads Manager–style crop modal after Add image / Add video.
 * Crop for each placement group, or use one size for all.
 */
export default function MetaMediaCropModal({
  open,
  mediaUrl,
  mediaType,
  mediaName,
  initialCrops,
  onCancel,
  onDone,
}) {
  const [mode, setMode] = useState('per_placement'); // 'per_placement' | 'one_size'
  const [crops, setCrops] = useState(() => initialCrops || createDefaultMediaCrops());
  const [activeGroupId, setActiveGroupId] = useState(META_CROP_GROUPS[0].id);
  const [oneAspect, setOneAspect] = useState('4:5');

  useEffect(() => {
    if (!open) return;
    setCrops(initialCrops || createDefaultMediaCrops());
    setActiveGroupId(META_CROP_GROUPS[0].id);
    setMode('per_placement');
    setOneAspect('4:5');
  }, [open, initialCrops, mediaUrl]);

  if (!open || !mediaUrl) return null;

  const activeGroup = META_CROP_GROUPS.find((g) => g.id === activeGroupId) || META_CROP_GROUPS[0];
  const activeCrop = crops[activeGroup.id] || {
    enabled: true,
    aspect: activeGroup.defaultAspect,
    panX: 50,
    panY: 50,
    zoom: 1,
  };

  const updateActive = (patch) => {
    setCrops((prev) => ({
      ...prev,
      [activeGroup.id]: { ...prev[activeGroup.id], ...patch, enabled: true },
    }));
  };

  const toggleGroup = (id) => {
    setCrops((prev) => ({
      ...prev,
      [id]: { ...prev[id], enabled: !prev[id]?.enabled },
    }));
  };

  const handleDone = () => {
    let next = { ...crops };
    if (mode === 'one_size') {
      const shared = {
        enabled: true,
        aspect: oneAspect,
        panX: activeCrop.panX,
        panY: activeCrop.panY,
        zoom: activeCrop.zoom,
      };
      META_CROP_GROUPS.forEach((g) => {
        next[g.id] = { ...shared };
      });
    }
    onDone?.(next);
  };

  const aspectForStage =
    mode === 'one_size' ? oneAspect : activeCrop.aspect || activeGroup.defaultAspect;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-4">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Close" onClick={onCancel} />
      <div className="relative z-10 flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-slate-900">Crop media</h2>
            <p className="mt-0.5 truncate text-xs text-slate-500">
              {mediaName || (mediaType === 'video' ? 'Video' : 'Image')} · Match Meta placement aspect ratios
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md px-2 py-1 text-slate-500 hover:bg-slate-100"
            aria-label="Close"
          >
            ✕
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setMode('per_placement')}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                mode === 'per_placement'
                  ? 'bg-[#E7F3FF] text-[#1877F2]'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Ideal size for each placement
            </button>
            <button
              type="button"
              onClick={() => setMode('one_size')}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                mode === 'one_size'
                  ? 'bg-[#E7F3FF] text-[#1877F2]'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              One size for all placements
            </button>
          </div>

          <p className="mt-2 text-xs leading-relaxed text-slate-500">
            Meta supports <strong>1.91:1</strong>, <strong>16:9</strong>, <strong>1:1</strong>,{' '}
            <strong>4:5</strong>, <strong>2:3</strong>, and <strong>9:16</strong>. Feed recommends{' '}
            <strong>4:5</strong>; Stories &amp; Reels recommend <strong>9:16</strong>.
          </p>

          {mode === 'per_placement' ? (
            <div className="mt-4 grid gap-4 lg:grid-cols-[220px_1fr]">
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Placement groups
                </p>
                {META_CROP_GROUPS.map((g) => {
                  const enabled = crops[g.id]?.enabled !== false;
                  const active = activeGroupId === g.id;
                  return (
                    <div
                      key={g.id}
                      className={`rounded-xl border p-2.5 transition ${
                        active ? 'border-[#1877F2] bg-[#E7F3FF]/40' : 'border-slate-200 bg-white'
                      }`}
                    >
                      <label className="flex cursor-pointer items-start gap-2">
                        <input
                          type="checkbox"
                          checked={enabled}
                          onChange={() => toggleGroup(g.id)}
                          className="mt-0.5"
                        />
                        <button
                          type="button"
                          className="min-w-0 flex-1 text-left"
                          onClick={() => setActiveGroupId(g.id)}
                        >
                          <span className="block text-sm font-semibold text-slate-900">{g.label}</span>
                          <span className="mt-0.5 block text-[11px] leading-snug text-slate-500">
                            {g.description}
                          </span>
                          <span className="mt-1 inline-flex rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                            Rec. {g.defaultAspect}
                          </span>
                        </button>
                      </label>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
                {!activeCrop.enabled ? (
                  <p className="py-10 text-center text-sm text-slate-500">
                    Enable this placement group to crop for it.
                  </p>
                ) : (
                  <>
                    <div className="mb-3 flex flex-wrap gap-1.5">
                      {activeGroup.aspects.map((a) => {
                        const selected = (activeCrop.aspect || activeGroup.defaultAspect) === a;
                        const isRec = a === activeGroup.defaultAspect;
                        return (
                          <button
                            key={a}
                            type="button"
                            onClick={() => updateActive({ aspect: a })}
                            className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${
                              selected
                                ? 'border-[#1877F2] bg-[#1877F2] text-white'
                                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {a}
                            {isRec ? ' · Rec' : ''}
                          </button>
                        );
                      })}
                    </div>

                    <CropStage
                      mediaUrl={mediaUrl}
                      mediaType={mediaType}
                      aspectId={aspectForStage}
                      panX={activeCrop.panX ?? 50}
                      panY={activeCrop.panY ?? 50}
                      zoom={activeCrop.zoom ?? 1}
                      onPanChange={(p) => updateActive(p)}
                    />

                    <div className="mt-3">
                      <label className="flex items-center justify-between gap-3 text-xs text-slate-600">
                        <span className="font-medium">Zoom</span>
                        <span>{Number(activeCrop.zoom || 1).toFixed(2)}×</span>
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="2"
                        step="0.01"
                        value={activeCrop.zoom || 1}
                        onChange={(e) => updateActive({ zoom: Number(e.target.value) })}
                        className="mt-1 w-full accent-[#1877F2]"
                      />
                    </div>

                    <ul className="mt-3 space-y-1 border-t border-slate-200 pt-3">
                      {activeGroup.placements.map((p) => (
                        <li key={p.name} className="flex items-start justify-between gap-2 text-[11px]">
                          <span className="text-slate-700">{p.name}</span>
                          <span className="shrink-0 font-medium text-slate-500">
                            Rec. {p.recommended}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
              <p className="mb-2 text-sm font-semibold text-slate-800">Choose one aspect ratio</p>
              <div className="mb-3 flex flex-wrap gap-1.5">
                {['4:5', '1:1', '9:16', '1.91:1', '16:9', '2:3'].map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setOneAspect(a)}
                    className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${
                      oneAspect === a
                        ? 'border-[#1877F2] bg-[#1877F2] text-white'
                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
              <CropStage
                mediaUrl={mediaUrl}
                mediaType={mediaType}
                aspectId={oneAspect}
                panX={activeCrop.panX ?? 50}
                panY={activeCrop.panY ?? 50}
                zoom={activeCrop.zoom ?? 1}
                onPanChange={(p) => updateActive(p)}
              />
              <div className="mt-3">
                <label className="flex items-center justify-between gap-3 text-xs text-slate-600">
                  <span className="font-medium">Zoom</span>
                  <span>{Number(activeCrop.zoom || 1).toFixed(2)}×</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="2"
                  step="0.01"
                  value={activeCrop.zoom || 1}
                  onChange={(e) => updateActive({ zoom: Number(e.target.value) })}
                  className="mt-1 w-full accent-[#1877F2]"
                />
              </div>
            </div>
          )}
        </div>

        <footer className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-slate-200 bg-white px-4 py-3 sm:px-5">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDone}
            className="rounded-lg bg-[#1877F2] px-5 py-2 text-sm font-semibold text-white hover:bg-[#166FE5]"
          >
            Done
          </button>
        </footer>
      </div>
    </div>
  );
}

/** Renders media with a saved Meta crop applied */
export function CroppedMediaPreview({
  mediaUrl,
  mediaType,
  crop,
  aspectId,
  className = '',
  controls = false,
}) {
  const aspect = aspectId || crop?.aspect || '4:5';
  const spec = META_ASPECT_RATIOS[aspect] || META_ASPECT_RATIOS['4:5'];
  const panX = crop?.panX ?? 50;
  const panY = crop?.panY ?? 50;
  const zoom = crop?.zoom ?? 1;
  const objectPosition = `${panX}% ${panY}%`;

  return (
    <div
      className={`relative overflow-hidden bg-slate-900 ${className}`}
      style={{ aspectRatio: `${spec.ratio}` }}
    >
      {mediaType === 'video' ? (
        <video
          src={mediaUrl}
          controls={controls}
          muted={!controls}
          playsInline
          loop={!controls}
          autoPlay={!controls}
          className="h-full w-full object-cover"
          style={{ objectPosition, transform: `scale(${zoom})`, transformOrigin: objectPosition }}
        />
      ) : (
        <img
          src={mediaUrl}
          alt=""
          className="h-full w-full object-cover"
          style={{ objectPosition, transform: `scale(${zoom})`, transformOrigin: objectPosition }}
        />
      )}
    </div>
  );
}
