import { useEffect, useId, useMemo, useRef, useState } from 'react';

const MODES = [
  { value: 'ref-to-video', label: 'Ref-to-video' },
  { value: 'video-edit', label: 'Video edit' },
  { value: 'video-extend', label: 'Video extend' },
  { value: 'first-last-frame', label: 'First/last frame' },
  { value: 'ip-effects', label: 'IP effects' },
];

const ASPECT_RATIOS = ['21:9', '16:9', '4:3', '1:1', '3:4', '9:16', 'Smart'];
const RESOLUTIONS = ['480P', '720P', '1080P'];
const FORMATS = ['MP4', 'MOV'];
const DURATIONS = [
  { value: 'smart', label: 'smart time' },
  { value: '5', label: '5s' },
  { value: '10', label: '10s' },
  { value: '15', label: '15s' },
];
const QUANTITIES = [1, 2, 3, 4, 5, 6, 7, 8];

const USD_PER_1K_TOKENS = 0.0107;

const RESOLUTION_TOKEN_WEIGHT = {
  '480P': 0.7,
  '720P': 1,
  '1080P': 1.55,
};

const DURATION_SECONDS = {
  smart: 8,
  '5': 5,
  '10': 10,
  '15': 15,
};

const estimateTokens = ({
  prompt,
  mode,
  resolution,
  duration,
  quantity,
  referenceCount,
  soundOn,
  draftMode,
}) => {
  const promptTokens = Math.max(24, Math.ceil(prompt.trim().length / 3.2));
  const seconds = DURATION_SECONDS[duration] ?? 8;
  const resWeight = RESOLUTION_TOKEN_WEIGHT[resolution] ?? 1;
  const videoBase = Math.round(seconds * 420 * resWeight);
  const refTokens =
    referenceCount * (mode === 'ref-to-video' || mode === 'first-last-frame' ? 1800 : 600);
  const audioTokens = soundOn ? Math.round(seconds * 90) : 0;
  const draftFactor = draftMode ? 0.55 : 1;
  const perVideo = Math.round(
    (promptTokens + videoBase + refTokens + audioTokens) * draftFactor,
  );
  return Math.max(0, perVideo * quantity);
};

const formatTokens = (value) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Math.round(value));

const formatUsd = (tokens) => {
  const usd = (tokens / 1000) * USD_PER_1K_TOKENS;
  if (usd <= 0) return '0.00';
  if (usd < 0.01) return usd.toFixed(4);
  return usd.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
};

const buildReferenceTag = (type, index) =>
  type === 'video' ? `Video ${index}` : `Picture ${index}`;

const getActiveMention = (text, caret) => {
  const before = text.slice(0, caret);
  const match = before.match(/(^|[\s([{])@([^\s@]*)$/);
  if (!match) return null;
  return {
    query: match[2].toLowerCase(),
    start: caret - match[2].length - 1,
  };
};

const SettingButton = ({ active, children, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={[
      'rounded-lg px-3 py-1.5 text-xs font-semibold transition',
      active
        ? 'bg-brand-navy text-white'
        : 'bg-slate-100 text-brand-navy hover:bg-brand-yellow/25',
    ].join(' ')}
  >
    {children}
  </button>
);

const VideoGeneratorPage = () => {
  const fileInputId = useId();
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const modeMenuRef = useRef(null);
  const settingsMenuRef = useRef(null);
  const mentionMenuRef = useRef(null);
  const burnRafRef = useRef(null);

  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState('ref-to-video');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [resolution, setResolution] = useState('720P');
  const [format, setFormat] = useState('MP4');
  const [duration, setDuration] = useState('smart');
  const [soundOn, setSoundOn] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [draftMode, setDraftMode] = useState(false);
  const [references, setReferences] = useState([]);
  const [modeOpen, setModeOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionStart, setMentionStart] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [isBurning, setIsBurning] = useState(false);
  const [burnedTokens, setBurnedTokens] = useState(0);
  const [sessionBurned, setSessionBurned] = useState(0);

  const estimatedTokens = useMemo(
    () =>
      estimateTokens({
        prompt,
        mode,
        resolution,
        duration,
        quantity,
        referenceCount: references.length,
        soundOn,
        draftMode,
      }),
    [prompt, mode, resolution, duration, quantity, references.length, soundOn, draftMode],
  );

  const modeLabel = MODES.find((item) => item.value === mode)?.label ?? mode;
  const durationLabel =
    DURATIONS.find((item) => item.value === duration)?.label ?? duration;

  const mentionOptions = useMemo(() => {
    if (!mentionOpen) return [];
    return references.filter((item) => {
      const tag = item.tag.toLowerCase();
      const name = item.name.toLowerCase();
      return !mentionQuery || tag.includes(mentionQuery) || name.includes(mentionQuery);
    });
  }, [mentionOpen, mentionQuery, references]);

  useEffect(() => {
    const onPointerDown = (event) => {
      if (modeMenuRef.current && !modeMenuRef.current.contains(event.target)) {
        setModeOpen(false);
      }
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target)) {
        setSettingsOpen(false);
      }
      if (mentionMenuRef.current && !mentionMenuRef.current.contains(event.target)) {
        const inTextarea = textareaRef.current?.contains(event.target);
        if (!inTextarea) setMentionOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  useEffect(() => {
    if (isBurning) return;
    setBurnedTokens(0);
  }, [estimatedTokens, isBurning]);

  useEffect(
    () => () => {
      if (burnRafRef.current) cancelAnimationFrame(burnRafRef.current);
    },
    [],
  );

  const stopBurn = () => {
    if (burnRafRef.current) cancelAnimationFrame(burnRafRef.current);
    burnRafRef.current = null;
    setIsBurning(false);
  };

  const startBurnSimulation = (targetTokens) => {
    stopBurn();
    setIsBurning(true);
    setBurnedTokens(0);
    const startedAt = performance.now();
    const durationMs = Math.min(14000, Math.max(2800, targetTokens / 18));

    const tick = (now) => {
      const elapsed = now - startedAt;
      const t = Math.min(1, elapsed / durationMs);
      const eased = 1 - (1 - t) ** 2.2;
      setBurnedTokens(targetTokens * eased);

      if (t < 1) {
        burnRafRef.current = requestAnimationFrame(tick);
        return;
      }

      setBurnedTokens(targetTokens);
      setSessionBurned((total) => total + targetTokens);
      setIsBurning(false);
      burnRafRef.current = null;
      setStatusMessage(
        'Simulated burn finished. Connect Seedance 2.5 to stream live usage here.',
      );
    };

    burnRafRef.current = requestAnimationFrame(tick);
  };

  const syncMentionState = (text, caret) => {
    const active = getActiveMention(text, caret);
    if (!active) {
      setMentionOpen(false);
      setMentionQuery('');
      setMentionStart(null);
      return;
    }
    setMentionOpen(true);
    setMentionQuery(active.query);
    setMentionStart(active.start);
  };

  const insertMention = (tag) => {
    const textarea = textareaRef.current;
    const caret = textarea?.selectionStart ?? prompt.length;
    const start = mentionStart ?? caret;
    const before = prompt.slice(0, start);
    const after = prompt.slice(caret);
    const next = `${before}@${tag} ${after}`;
    setPrompt(next);
    setMentionOpen(false);
    setMentionQuery('');
    setMentionStart(null);

    requestAnimationFrame(() => {
      if (!textarea) return;
      const nextCaret = before.length + tag.length + 2;
      textarea.focus();
      textarea.setSelectionRange(nextCaret, nextCaret);
    });
  };

  const handlePromptChange = (event) => {
    const value = event.target.value;
    const caret = event.target.selectionStart ?? value.length;
    setPrompt(value);
    if (statusMessage) setStatusMessage('');
    syncMentionState(value, caret);
  };

  const handlePromptKeyUp = (event) => {
    const caret = event.currentTarget.selectionStart ?? prompt.length;
    syncMentionState(event.currentTarget.value, caret);
  };

  const handlePromptKeyDown = (event) => {
    if (!mentionOpen || mentionOptions.length === 0) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      setMentionOpen(false);
      return;
    }
    if (event.key === 'Enter' || event.key === 'Tab') {
      event.preventDefault();
      insertMention(mentionOptions[0].tag);
    }
  };

  const handleReferencePick = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    setReferences((current) => {
      let pictureCount = current.filter((item) => item.type === 'image').length;
      let videoCount = current.filter((item) => item.type === 'video').length;

      const next = files.map((file, index) => {
        const type = file.type.startsWith('video/') ? 'video' : 'image';
        if (type === 'video') videoCount += 1;
        else pictureCount += 1;
        const order = type === 'video' ? videoCount : pictureCount;
        return {
          id: `${file.name}-${file.lastModified}-${index}`,
          name: file.name,
          type,
          tag: buildReferenceTag(type, order),
          previewUrl: URL.createObjectURL(file),
          file,
        };
      });

      return [...current, ...next].slice(0, 6);
    });
    event.target.value = '';
  };

  const removeReference = (id) => {
    setReferences((current) => {
      const target = current.find((item) => item.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return current.filter((item) => item.id !== id);
    });
  };

  const handleGenerate = (event) => {
    event.preventDefault();
    if (!prompt.trim()) {
      setStatusMessage('Add a prompt before generating.');
      return;
    }
    if (isBurning) return;
    setModeOpen(false);
    setSettingsOpen(false);
    setMentionOpen(false);
    setStatusMessage('Burning tokens… Seedance API not connected yet.');
    startBurnSimulation(estimatedTokens);
  };

  const burnProgress =
    estimatedTokens > 0 ? Math.min(100, (burnedTokens / estimatedTokens) * 100) : 0;

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(254,204,0,0.16),_transparent_55%)]"
        aria-hidden="true"
      />

      <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-3 py-6 sm:px-5 sm:py-8 lg:px-8">
        <div className="w-full max-w-7xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-navy/55">
            Seedance 2.5
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-brand-navy sm:text-3xl lg:text-4xl">
            Experience video generation and let creativity shake
          </h1>
        </div>
      </div>

      <div className="relative shrink-0 border-t border-brand-navy/5 bg-brand-cream/90 px-3 pb-3 pt-3 backdrop-blur-sm sm:px-5 sm:pb-4 lg:px-8 lg:pb-5">
        <div className="mx-auto w-full max-w-7xl">
        <form
          onSubmit={handleGenerate}
          className="relative overflow-visible rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_24px_70px_-40px_rgba(15,40,80,0.45)] sm:rounded-[28px] sm:p-4 lg:p-5"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <div className="shrink-0">
              <input
                ref={fileInputRef}
                id={fileInputId}
                type="file"
                accept="image/*,video/*"
                multiple
                className="sr-only"
                onChange={handleReferencePick}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-16 w-full flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-brand-navy transition hover:border-brand-yellow hover:bg-brand-yellow/10 sm:h-[88px] sm:w-[88px]"
              >
                <span className="text-2xl leading-none">+</span>
                <span className="text-[11px] font-semibold">Reference</span>
              </button>
            </div>

            <div className="relative min-w-0 flex-1" ref={mentionMenuRef}>
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={handlePromptChange}
                onKeyUp={handlePromptKeyUp}
                onKeyDown={handlePromptKeyDown}
                onClick={handlePromptKeyUp}
                rows={3}
                placeholder="Use @ to quickly reference uploaded files, such as referring to actions in @Video 1 to generate videos of characters fighting in @Picture 2 and @Picture 3."
                className="max-h-40 w-full resize-none border-0 bg-transparent text-sm leading-relaxed text-brand-navy outline-none placeholder:text-slate-400"
              />

              {mentionOpen ? (
                <div className="absolute bottom-full left-0 right-0 z-30 mb-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                  {references.length === 0 ? (
                    <p className="px-3 py-2.5 text-sm text-brand-muted">
                      Upload a reference first, then type @ to insert it.
                    </p>
                  ) : mentionOptions.length === 0 ? (
                    <p className="px-3 py-2.5 text-sm text-brand-muted">
                      No references match “{mentionQuery}”.
                    </p>
                  ) : (
                    mentionOptions.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => insertMention(item.tag)}
                        className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-brand-navy hover:bg-brand-yellow/20"
                      >
                        {item.type === 'image' ? (
                          <img
                            src={item.previewUrl}
                            alt=""
                            className="h-8 w-8 rounded-lg object-cover"
                          />
                        ) : (
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-[10px] font-semibold">
                            VID
                          </span>
                        )}
                        <span>
                          <span className="font-semibold">@{item.tag}</span>
                          <span className="ml-2 text-xs text-brand-muted">{item.name}</span>
                        </span>
                      </button>
                    ))
                  )}
                </div>
              ) : null}

              {references.length > 0 ? (
                <ul className="mt-2 flex flex-wrap gap-2">
                  {references.map((item) => (
                    <li
                      key={item.id}
                      className="group relative overflow-hidden rounded-xl border border-slate-200"
                    >
                      <button
                        type="button"
                        title={`Insert @${item.tag}`}
                        onClick={() => {
                          const textarea = textareaRef.current;
                          const caret = textarea?.selectionStart ?? prompt.length;
                          const before = prompt.slice(0, caret);
                          const after = prompt.slice(caret);
                          const needsSpace = before.length > 0 && !/\s$/.test(before);
                          const next = `${before}${needsSpace ? ' ' : ''}@${item.tag} ${after}`;
                          setPrompt(next);
                          requestAnimationFrame(() => {
                            if (!textarea) return;
                            const nextCaret =
                              before.length + (needsSpace ? 1 : 0) + item.tag.length + 2;
                            textarea.focus();
                            textarea.setSelectionRange(nextCaret, nextCaret);
                          });
                        }}
                        className="block"
                      >
                        {item.type === 'image' ? (
                          <img
                            src={item.previewUrl}
                            alt={item.tag}
                            className="h-12 w-12 object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 flex-col items-center justify-center bg-slate-100 text-[9px] font-semibold uppercase leading-tight text-brand-navy">
                            <span>Vid</span>
                          </div>
                        )}
                      </button>
                      <span className="absolute left-0 right-0 top-0 bg-brand-navy/70 px-1 py-0.5 text-center text-[9px] font-semibold text-white">
                        @{item.tag}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeReference(item.id)}
                        className="absolute inset-x-0 bottom-0 bg-brand-navy/80 py-0.5 text-[10px] font-medium text-white opacity-0 transition group-hover:opacity-100"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>

          <div className="relative z-20 mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 sm:mt-4 sm:pt-4">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
              <div className="relative shrink-0" ref={modeMenuRef}>
                <button
                  type="button"
                  onClick={() => {
                    setModeOpen((open) => !open);
                    setSettingsOpen(false);
                    setMentionOpen(false);
                  }}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 text-xs font-semibold text-brand-navy"
                >
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="6" width="12" height="12" rx="2" />
                    <path d="m15 10 5-2v8l-5-2" strokeLinecap="round" />
                  </svg>
                  <span className="max-w-[9rem] truncate sm:max-w-none">{modeLabel}</span>
                  <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m6 9 6 6 6-6" strokeLinecap="round" />
                  </svg>
                </button>

                {modeOpen ? (
                  <div className="absolute bottom-[calc(100%+8px)] left-0 z-40 min-w-[190px] overflow-hidden rounded-2xl border border-slate-200 bg-white py-1 shadow-xl">
                    {MODES.map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => {
                          setMode(item.value);
                          setModeOpen(false);
                        }}
                        className={[
                          'flex w-full items-center px-3 py-2 text-left text-sm',
                          item.value === mode
                            ? 'bg-brand-yellow/25 font-semibold text-brand-navy'
                            : 'text-brand-navy hover:bg-slate-50',
                        ].join(' ')}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="relative min-w-0 max-w-full" ref={settingsMenuRef}>
                <button
                  type="button"
                  onClick={() => {
                    setSettingsOpen((open) => !open);
                    setModeOpen(false);
                    setMentionOpen(false);
                  }}
                  className="inline-flex h-9 max-w-full items-center gap-1.5 truncate rounded-full border border-slate-200 bg-slate-50 px-2.5 text-xs font-semibold text-brand-navy sm:gap-2 sm:px-3"
                >
                  <span>{aspectRatio}</span>
                  <span className="text-slate-300">|</span>
                  <span>{resolution}</span>
                  <span className="hidden text-slate-300 sm:inline">|</span>
                  <span className="hidden sm:inline">{format}</span>
                  <span className="hidden text-slate-300 md:inline">|</span>
                  <span className="hidden md:inline">{durationLabel}</span>
                  <span className="hidden text-slate-300 lg:inline">|</span>
                  <span className="hidden lg:inline">{soundOn ? 'sound' : 'muted'}</span>
                  <span className="hidden text-slate-300 lg:inline">|</span>
                  <span className="hidden lg:inline">
                    {quantity} video{quantity > 1 ? 's' : ''}
                  </span>
                </button>

                {settingsOpen ? (
                  <div className="absolute bottom-[calc(100%+8px)] left-0 z-40 w-[min(calc(100vw-1.5rem),360px)] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:w-[min(92vw,360px)]">
                    <div>
                      <p className="text-xs font-semibold text-brand-muted">Ratio</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {ASPECT_RATIOS.map((ratio) => (
                          <SettingButton
                            key={ratio}
                            active={aspectRatio === ratio}
                            onClick={() => setAspectRatio(ratio)}
                          >
                            {ratio}
                          </SettingButton>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-xs font-semibold text-brand-muted">Resolution</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {RESOLUTIONS.map((item) => (
                          <SettingButton
                            key={item}
                            active={resolution === item}
                            onClick={() => setResolution(item)}
                          >
                            {item}
                          </SettingButton>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-xs font-semibold text-brand-muted">Video format</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {FORMATS.map((item) => (
                          <SettingButton
                            key={item}
                            active={format === item}
                            onClick={() => setFormat(item)}
                          >
                            {item}
                          </SettingButton>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-xs font-semibold text-brand-muted">Duration</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {DURATIONS.map((item) => (
                          <SettingButton
                            key={item.value}
                            active={duration === item.value}
                            onClick={() => setDuration(item.value)}
                          >
                            {item.label}
                          </SettingButton>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-xs font-semibold text-brand-muted">Output sound</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <SettingButton active={soundOn} onClick={() => setSoundOn(true)}>
                          open
                        </SettingButton>
                        <SettingButton active={!soundOn} onClick={() => setSoundOn(false)}>
                          close
                        </SettingButton>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-xs font-semibold text-brand-muted">Select build quantity</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {QUANTITIES.map((count) => (
                          <SettingButton
                            key={count}
                            active={quantity === count}
                            onClick={() => setQuantity(count)}
                          >
                            {count}
                          </SettingButton>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
              <label className="inline-flex h-9 cursor-pointer items-center gap-2 text-xs font-medium text-brand-muted">
                <span className="hidden sm:inline">Draft mode</span>
                <span className="sm:hidden">Draft</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={draftMode}
                  onClick={() => setDraftMode((value) => !value)}
                  className={[
                    'relative h-5 w-9 rounded-full transition',
                    draftMode ? 'bg-brand-navy' : 'bg-slate-300',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'absolute top-0.5 h-4 w-4 rounded-full bg-white transition',
                      draftMode ? 'left-4' : 'left-0.5',
                    ].join(' ')}
                  />
                </button>
              </label>

              <div className="hidden text-right md:block">
                <p className="font-mono text-[11px] leading-tight tabular-nums text-brand-muted">
                  {USD_PER_1K_TOKENS} USD/K tokens
                </p>
                <p className="font-mono text-[11px] leading-tight tabular-nums text-brand-navy">
                  {isBurning
                    ? `${formatTokens(burnedTokens)} · $${formatUsd(burnedTokens)}`
                    : `~${formatTokens(estimatedTokens)} · $${formatUsd(estimatedTokens)}`}
                  {isBurning ? (
                    <span className="ml-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-brand-yellow align-middle" />
                  ) : null}
                </p>
              </div>

              <button
                type="submit"
                disabled={isBurning}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#7aa2ff] text-white shadow-md transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Generate video"
                title="Generate video"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>

          {(isBurning || burnedTokens > 0) && (
            <div className="mt-3">
              <div className="mb-1 flex items-center justify-between text-[11px] text-brand-muted">
                <span>{isBurning ? 'Burning tokens' : 'Last burn'}</span>
                <span className="font-mono tabular-nums">
                  {burnProgress.toFixed(0)}% · session {formatTokens(sessionBurned)}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-brand-yellow transition-[width] duration-100"
                  style={{ width: `${burnProgress}%` }}
                />
              </div>
            </div>
          )}
        </form>

        {statusMessage ? (
          <p className="mt-3 rounded-2xl border border-brand-yellow/40 bg-white px-4 py-3 text-center text-sm text-brand-navy">
            {statusMessage}
          </p>
        ) : null}
        </div>
      </div>
    </div>
  );
};

export default VideoGeneratorPage;
