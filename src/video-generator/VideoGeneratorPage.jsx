import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { uploadStoryAsset } from '../api/storyApi';
import {
  approveStoryboard,
  confirmVideoGenerate,
  createVideoRequest,
  fetchVideoBlob,
  getAdsCampaign,
  getLatestSucceededVideoRequest,
  getRecentSucceededVideoRequests,
  pollVideoRequest,
} from '../api/videoApi';

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
const SERIES_STORAGE_KEY = 'story-series-id';
const CAMPAIGN_STORAGE_KEY = 'ads-campaign-id';
const LAST_VIDEO_REQUEST_KEY = 'video-generator-last-request-id';
const STORYBOARD_LOCK_KEY = 'ads-storyboard-locked';
/** Force ads path for Video Generator manual tests (intent router still records reason). */
const DEFAULT_WORKFLOW_HINT = 'ads';

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

const SpinnerIcon = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2.5" />
    <path
      d="M21 12a9 9 0 0 0-9-9"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
);

const PROCESSING_COPY = {
  uploading: {
    title: 'Uploading references…',
    detail: 'Attaching your character media before planning.',
  },
  planning: {
    title: 'Planning your video…',
    detail: 'Building the ads candidate. This usually takes a few seconds.',
  },
  confirming: {
    title: 'Starting Seedance…',
    detail: 'Confirming spend and queuing generation.',
  },
  generating: {
    title: 'Generating your video…',
    detail: 'Seedance is rendering. This can take a few minutes.',
  },
};

const VideoGeneratorPage = () => {
  const fileInputId = useId();
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const modeMenuRef = useRef(null);
  const settingsMenuRef = useRef(null);
  const mentionMenuRef = useRef(null);
  const seriesIdRef = useRef(sessionStorage.getItem(SERIES_STORAGE_KEY) || '');
  const campaignIdRef = useRef(sessionStorage.getItem(CAMPAIGN_STORAGE_KEY) || '');

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
  const [isBurning] = useState(false);
  const [burnedTokens, setBurnedTokens] = useState(0);
  const [sessionBurned] = useState(0);
  const [planning, setPlanning] = useState(false);
  const [processingPhase, setProcessingPhase] = useState('');
  const reduceMotion = useReducedMotion();
  const [generationStatus, setGenerationStatus] = useState('');
  const [storyboardLocked, setStoryboardLocked] = useState(() => {
    if (sessionStorage.getItem(STORYBOARD_LOCK_KEY) === '1') return true;
    // Migrate legacy storybook session flag.
    if (sessionStorage.getItem('ads-storybook-locked') === '1') {
      sessionStorage.setItem(STORYBOARD_LOCK_KEY, '1');
      return true;
    }
    return false;
  });
  const [lockedRefCount, setLockedRefCount] = useState(0);
  const [pendingRequestId, setPendingRequestId] = useState('');
  const [candidatePreview, setCandidatePreview] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [approvingStoryboard, setApprovingStoryboard] = useState(false);
  const [lastSucceededRequestId, setLastSucceededRequestId] = useState('');
  /** Up to 3 recent videos: { requestId, url } */
  const [galleryVideos, setGalleryVideos] = useState([]);
  const galleryVideosRef = useRef([]);
  const galleryVideoElsRef = useRef({});

  const applyStoryboardLock = (campaignOrFlag) => {
    const locked = Boolean(
      campaignOrFlag === true
      || campaignOrFlag?.continuityStoryboard?.locked
      || campaignOrFlag?.locked,
    );
    setStoryboardLocked(locked);
    sessionStorage.setItem(STORYBOARD_LOCK_KEY, locked ? '1' : '0');
    const refs = campaignOrFlag?.continuityStoryboard?.referenceAssetIds
      || campaignOrFlag?.referenceAssetIds
      || [];
    setLockedRefCount(Array.isArray(refs) ? refs.length : 0);
  };

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

  const replaceGallery = (nextItems) => {
    for (const item of galleryVideosRef.current) {
      if (item?.url) URL.revokeObjectURL(item.url);
    }
    const capped = (nextItems || []).slice(0, 3);
    galleryVideosRef.current = capped;
    setGalleryVideos(capped);
  };

  /** Newest clip goes to the right of existing boxes (one video → one box). */
  const appendGalleryVideo = (requestId, objectUrl) => {
    const withoutDup = galleryVideosRef.current.filter((item) => item.requestId !== requestId);
    const next = [...withoutDup, { requestId, url: objectUrl }];
    while (next.length > 3) {
      const dropped = next.shift();
      if (dropped?.url) URL.revokeObjectURL(dropped.url);
    }
    galleryVideosRef.current = next;
    setGalleryVideos(next);
  };

  const openVideoFullscreen = async (requestId) => {
    const el = galleryVideoElsRef.current[requestId];
    if (!el) return;
    try {
      if (el.requestFullscreen) await el.requestFullscreen();
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
      await el.play();
    } catch {
      // Fullscreen may be blocked; still try playback inline.
      try { await el.play(); } catch { /* ignore */ }
    }
  };

  useEffect(() => () => {
    for (const item of galleryVideosRef.current) {
      if (item?.url) URL.revokeObjectURL(item.url);
    }
  }, []);

  // Hydrate storyboard lock from the active ads campaign (first SUCCEEDED video).
  useEffect(() => {
    const campaignId = campaignIdRef.current;
    if (!campaignId) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const result = await getAdsCampaign(campaignId);
        if (cancelled) return;
        applyStoryboardLock(result?.data?.campaign || result?.campaign || null);
      } catch {
        // Campaign may not exist yet — first generate creates it.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Restore completed videos into the thumbnail strip (recent → latest → session).
  useEffect(() => {
    let cancelled = false;
    const loadBlob = async (id) => {
      const blob = await fetchVideoBlob(id);
      return { requestId: id, url: URL.createObjectURL(blob) };
    };
    const restore = async () => {
      try {
        const ids = [];
        const seen = new Set();
        const pushId = (id) => {
          if (!id || seen.has(id)) return;
          seen.add(id);
          ids.push(id);
        };

        try {
          const recent = await getRecentSucceededVideoRequests(3);
          for (const request of recent?.data?.requests || []) pushId(request?.id);
        } catch {
          // Continue with older restore paths.
        }

        if (!ids.length) {
          try {
            const latest = await getLatestSucceededVideoRequest();
            pushId(latest?.data?.request?.id || latest?.data?.requestId);
          } catch {
            // Continue with session fallback.
          }
        }

        const sessionId = sessionStorage.getItem(LAST_VIDEO_REQUEST_KEY);
        if (sessionId) pushId(sessionId);

        if (!ids.length || cancelled) return;

        const loaded = [];
        for (const id of ids.slice(0, 3)) {
          try {
            const item = await loadBlob(id);
            if (cancelled) {
              URL.revokeObjectURL(item.url);
              return;
            }
            loaded.push(item);
          } catch {
            // Skip missing files for individual slots.
          }
        }
        if (cancelled || !loaded.length) return;
        // API / fallback order is newest-first; reverse so oldest is left.
        const ordered = [...loaded].reverse();
        replaceGallery(ordered);
        setGenerationStatus('SUCCEEDED');
        setStatusMessage('Click a clip for fullscreen.');
        sessionStorage.setItem(LAST_VIDEO_REQUEST_KEY, ordered[ordered.length - 1].requestId);
      } catch {
        // No prior videos for this user — keep empty gallery + hero copy.
      }
    };
    restore();
    return () => {
      cancelled = true;
    };
  }, []);

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

  const handleGenerate = async (event) => {
    event.preventDefault();
    if (!prompt.trim()) {
      setStatusMessage('Add a prompt before generating.');
      return;
    }
    if (isBurning || planning || confirming) return;
    setModeOpen(false);
    setSettingsOpen(false);
    setMentionOpen(false);
    setPlanning(true);
    setCandidatePreview(null);
    setPendingRequestId('');
    setGenerationStatus('');
    const needsUpload = references.some((item) => !item.assetId && item.file);
    setProcessingPhase(needsUpload ? 'uploading' : 'planning');
    setStatusMessage(
      needsUpload
        ? 'Uploading references…'
        : 'Planning your video… this can take a few seconds.',
    );
    try {
      const referenceAssetIds = [];
      for (const item of references) {
        if (item.assetId) {
          referenceAssetIds.push(item.assetId);
          continue;
        }
        if (!item.file) continue;
        const created = await uploadStoryAsset({
          file: item.file,
          type: item.type === 'video' ? 'video' : 'character_image',
          seriesId: seriesIdRef.current || undefined,
          provenance: item.name,
        });
        item.assetId = created.data.asset.id;
        referenceAssetIds.push(item.assetId);
      }
      setProcessingPhase('planning');
      setStatusMessage('Planning your video… this can take a few seconds.');
      const seconds = Number(duration);
      const durationSeconds = Number.isInteger(seconds)
        ? seconds
        : (DURATION_SECONDS[duration] ?? 8);
      const wantsNewCampaign = /\b(?:create|start|begin|open)\s+(?:a\s+)?new\b[\s\S]{0,48}\bcampaign\b/i
        .test(prompt.trim());
      if (wantsNewCampaign) {
        applyStoryboardLock(false);
      }
      const result = await createVideoRequest({
        prompt: prompt.trim(),
        workflowHint: DEFAULT_WORKFLOW_HINT,
        ...(campaignIdRef.current && !wantsNewCampaign
          ? { campaignId: campaignIdRef.current }
          : {}),
        ...(wantsNewCampaign || !campaignIdRef.current
          ? { startNewCampaign: Boolean(wantsNewCampaign || !campaignIdRef.current) }
          : {}),
        ...(seriesIdRef.current ? { seriesId: seriesIdRef.current } : {}),
        ...(referenceAssetIds.length ? { referenceAssetIds } : {}),
        durationSeconds,
        aspectRatio: aspectRatio === 'Smart' ? '16:9' : aspectRatio,
        platform: 'instagram',
        sound: soundOn,
        quantity,
        requestedMode: mode,
        resolution,
        draftMode,
        format,
        // Plan + preview only — Seedance spend requires explicit confirm.
        confirmGeneration: false,
        idempotencyKey: crypto.randomUUID(),
      });
      const workflow = result.data?.workflow || result.data?.routing?.workflow || '';
      const nextCampaignId = result.data?.campaign?.id || '';
      if (nextCampaignId) {
        campaignIdRef.current = nextCampaignId;
        sessionStorage.setItem(CAMPAIGN_STORAGE_KEY, nextCampaignId);
      }
      if (result.data?.continuityStoryboard || result.data?.storyboardLocked) {
        applyStoryboardLock(
          result.data?.continuityStoryboard
          || result.data?.campaign
          || result.data?.storyboardLocked,
        );
      }
      const nextSeriesId = result.data?.series?.id || '';
      if (nextSeriesId) {
        seriesIdRef.current = nextSeriesId;
        sessionStorage.setItem(SERIES_STORAGE_KEY, nextSeriesId);
      }
      const requestId = result.data?.requestId || '';
      const genStatus = result.generationStatus
        || result.data?.generationStatus
        || 'NOT_INVOKED';
      setGenerationStatus(genStatus);
      const preview = result.data?.candidatePreview || null;
      setCandidatePreview(preview);
      setPendingRequestId(
        genStatus === 'AWAITING_CONFIRM' && preview?.ready ? requestId : '',
      );
      const tracePath = result.data?.runTrace?.mdPath || '';
      const tokens = result.data?.llm?.totalTokens;
      const cost = result.data?.llm?.estimatedCost;
      const metaBits = [
        tokens != null ? `Plan tokens: ${tokens}.` : null,
        cost != null ? `Est. LLM cost: $${cost}.` : null,
        tracePath ? `Run trace: ${tracePath}` : null,
      ].filter(Boolean);

      if (genStatus === 'AWAITING_CONFIRM' && preview?.ready) {
        setStatusMessage(
          [
            `${workflow || 'ads'} plan ready. Review the Seedance candidate below — no video tokens spent yet.`,
            ...metaBits,
          ].join(' '),
        );
      } else if (genStatus === 'FAILED' || result.data?.generationError) {
        const block = result.data?.generationError;
        setStatusMessage(
          [
            'Plan blocked before Seedance spend.',
            block?.message || preview?.note || null,
            Array.isArray(block?.issues) && block.issues.length
              ? block.issues.slice(0, 3).map((issue) => issue?.code || issue?.message || String(issue)).join(', ')
              : null,
            ...metaBits,
          ].filter(Boolean).join(' '),
        );
      } else {
        setStatusMessage(
          [`${workflow || 'video'} plan saved.`, ...metaBits].filter(Boolean).join(' '),
        );
      }
    } catch (error) {
      const data = error.body?.data || {};
      const tracePath = data.runTrace?.mdPath;
      const detail = [
        data.errorClass || data.failureCategory || error.body?.code || null,
        data.providerMessage || null,
      ].filter(Boolean).join(': ');
      setGenerationStatus(error.body?.generationStatus || 'FAILED');
      setStatusMessage(
        [
          error.message || 'The request could not be planned.',
          detail || null,
          tracePath ? `Run trace: ${tracePath}` : null,
        ].filter(Boolean).join(' '),
      );
    } finally {
      setPlanning(false);
      setProcessingPhase('');
    }
  };

  const runGenerationPoll = async (requestId) => {
    setGenerationStatus('GENERATING');
    setProcessingPhase('generating');
    setStatusMessage('Generating video… this can take a few minutes. Seedance spend started.');
    const polled = await pollVideoRequest(requestId, {
      onUpdate: (payload) => {
        const status = payload?.generationStatus
          || payload?.data?.request?.generationStatus
          || 'GENERATING';
        setGenerationStatus(status);
      },
    });
    const finalStatus = polled?.generationStatus
      || polled?.data?.request?.generationStatus
      || 'FAILED';
    setGenerationStatus(finalStatus);
    setProcessingPhase('');
    if (finalStatus === 'SUCCEEDED') {
      const blob = await fetchVideoBlob(requestId);
      const objectUrl = URL.createObjectURL(blob);
      appendGalleryVideo(requestId, objectUrl);
      sessionStorage.setItem(LAST_VIDEO_REQUEST_KEY, requestId);
      setLastSucceededRequestId(requestId);
      setPendingRequestId('');
      setStatusMessage(
        'Video ready. Review it — then Approve storyboard only if quality is good enough to reuse.',
      );
      return;
    }
    const errMsg = polled?.data?.request?.generationError?.message
      || 'Video generation failed.';
    setStatusMessage(errMsg);
  };

  const handleConfirmGenerate = async () => {
    if (!pendingRequestId || confirming) return;
    setConfirming(true);
    setProcessingPhase('confirming');
    setStatusMessage('Starting Seedance…');
    try {
      const started = await confirmVideoGenerate(pendingRequestId, {
        draftMode,
        resolution,
        quantity,
        sound: soundOn,
      });
      const status = started.generationStatus || started.data?.generationStatus;
      if (status === 'GENERATING' || status === 'SUCCEEDED') {
        await runGenerationPoll(pendingRequestId);
      } else {
        setGenerationStatus(status || 'FAILED');
        setProcessingPhase('');
        setStatusMessage(
          started.message
          || started.data?.message
          || 'Confirm failed — Seedance was not started.',
        );
      }
    } catch (error) {
      setGenerationStatus('FAILED');
      setProcessingPhase('');
      setStatusMessage(error.message || 'Confirm failed — no Seedance spend.');
    } finally {
      setConfirming(false);
    }
  };

  const isBusy = planning || confirming || processingPhase === 'generating'
    || generationStatus === 'GENERATING';
  const busyCopy = PROCESSING_COPY[processingPhase]
    || (generationStatus === 'GENERATING' ? PROCESSING_COPY.generating : null);

  const handleApproveStoryboard = async () => {
    const requestId = lastSucceededRequestId || sessionStorage.getItem(LAST_VIDEO_REQUEST_KEY);
    if (!requestId || approvingStoryboard) return;
    setApprovingStoryboard(true);
    try {
      const result = await approveStoryboard(requestId);
      applyStoryboardLock(
        result?.data?.continuityStoryboard
        || result?.data?.storyboardLocked
        || true,
      );
      if (campaignIdRef.current) {
        try {
          const locked = await getAdsCampaign(campaignIdRef.current);
          applyStoryboardLock(locked?.data?.campaign || true);
        } catch {
          // Local lock flag already set.
        }
      }
      setStatusMessage('Storyboard approved and locked for this campaign.');
    } catch (error) {
      setStatusMessage(error.message || 'Could not approve storyboard.');
    } finally {
      setApprovingStoryboard(false);
    }
  };

  const burnProgress =
    estimatedTokens > 0 ? Math.min(100, (burnedTokens / estimatedTokens) * 100) : 0;

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(254,204,0,0.16),_transparent_55%)]"
        aria-hidden="true"
      />

      <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-6 sm:px-5 sm:py-8 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col">
          {galleryVideos.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-navy/55">
                Seedance 2.5
              </p>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight text-brand-navy sm:text-3xl lg:text-4xl">
                Experience video generation and let creativity shake
              </h1>
              {storyboardLocked ? (
                <p className="mt-3 max-w-xl text-sm text-brand-navy/70">
                  Storyboard locked for this campaign
                  {lockedRefCount ? ` · ${lockedRefCount} character ref${lockedRefCount === 1 ? '' : 's'}` : ''}
                  . New prompts continue the same cast and world.
                </p>
              ) : (
                <p className="mt-3 max-w-xl text-sm text-brand-navy/55">
                  Upload character refs, plan first, review the candidate, then confirm Seedance spend. Approve storyboard only after a clean video.
                </p>
              )}
              <AnimatePresence>
                {busyCopy ? (
                  <motion.div
                    key={busyCopy.title}
                    role="status"
                    aria-live="polite"
                    initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
                    transition={{ duration: reduceMotion ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
                    className="mt-6 flex w-full max-w-md flex-col items-center gap-3 rounded-2xl border border-brand-navy/10 bg-white/90 px-5 py-4 text-center shadow-sm"
                  >
                    <motion.span
                      className="text-[#7aa2ff]"
                      animate={reduceMotion ? undefined : { rotate: 360 }}
                      transition={
                        reduceMotion
                          ? undefined
                          : { repeat: Infinity, duration: 0.9, ease: 'linear' }
                      }
                    >
                      <SpinnerIcon className="h-7 w-7" />
                    </motion.span>
                    <div>
                      <p className="text-sm font-semibold text-brand-navy">{busyCopy.title}</p>
                      <p className="mt-1 text-xs text-brand-navy/60">{busyCopy.detail}</p>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
              {candidatePreview?.ready && pendingRequestId ? (
                <div className="mt-6 w-full max-w-2xl rounded-xl border border-brand-navy/15 bg-white/90 p-4 text-left shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-navy/55">
                    Candidate preview · no Seedance spend yet
                  </p>
                  <p className="mt-2 text-xs text-brand-navy/60">
                    {candidatePreview.settings?.resolution || '720p'}
                    {' · '}
                    {candidatePreview.settings?.aspectRatio || '16:9'}
                    {' · '}
                    {candidatePreview.settings?.durationSeconds || 8}s
                    {candidatePreview.settings?.draftMode ? ' · draft' : ''}
                    {' · qty '}
                    {candidatePreview.settings?.quantity || 1}
                    {candidatePreview.referenceAssetIds?.length
                      ? ` · ${candidatePreview.referenceAssetIds.length} ref(s)`
                      : ' · no refs'}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={confirming}
                      onClick={handleConfirmGenerate}
                      className="rounded-lg bg-brand-navy px-4 py-2.5 text-sm font-semibold text-white shadow-sm disabled:opacity-60"
                    >
                      {confirming ? 'Starting Seedance…' : 'Confirm & generate video'}
                    </button>
                    <button
                      type="button"
                      disabled={confirming}
                      onClick={() => {
                        setPendingRequestId('');
                        setCandidatePreview(null);
                        setGenerationStatus('');
                        setStatusMessage('Preview discarded. No Seedance spend.');
                      }}
                      className="rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-semibold text-brand-navy"
                    >
                      Discard
                    </button>
                  </div>
                  <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.12em] text-brand-navy/45">
                    Seedance prompt
                  </p>
                  <pre className="mt-1.5 max-h-40 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-brand-navy/80">
                    {candidatePreview.promptExcerpt || candidatePreview.promptText || 'No prompt text'}
                  </pre>
                  {candidatePreview.typography?.ok === false ? (
                    <p className="mt-2 text-xs text-red-600">
                      Typography gate issues: {(candidatePreview.typography.issues || []).slice(0, 3).join(', ')}
                    </p>
                  ) : null}
                </div>
              ) : null}
              {lastSucceededRequestId && !storyboardLocked ? (
                <div className="mt-4">
                  <button
                    type="button"
                    disabled={approvingStoryboard}
                    onClick={handleApproveStoryboard}
                    className="rounded-lg border border-brand-navy/20 bg-white px-4 py-2 text-sm font-semibold text-brand-navy disabled:opacity-60"
                  >
                    {approvingStoryboard ? 'Approving…' : 'Approve storyboard (lock cast)'}
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="w-full">
              {storyboardLocked ? (
                <p className="mb-3 text-left text-sm text-brand-navy/70">
                  Storyboard locked
                  {lockedRefCount ? ` · ${lockedRefCount} character ref${lockedRefCount === 1 ? '' : 's'}` : ''}
                  — later ads follow this cast.
                </p>
              ) : lastSucceededRequestId ? (
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <p className="text-left text-sm text-brand-navy/70">
                    Video ready — approve only if quality is good enough to reuse.
                  </p>
                  <button
                    type="button"
                    disabled={approvingStoryboard}
                    onClick={handleApproveStoryboard}
                    className="rounded-lg border border-brand-navy/20 bg-white px-3 py-1.5 text-xs font-semibold text-brand-navy disabled:opacity-60"
                  >
                    {approvingStoryboard ? 'Approving…' : 'Approve storyboard'}
                  </button>
                </div>
              ) : null}
              {candidatePreview?.ready && pendingRequestId ? (
                <div className="mb-4 rounded-xl border border-brand-navy/15 bg-white/90 p-4 text-left shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-navy/55">
                    Candidate preview · confirm to spend Seedance
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={confirming}
                      onClick={handleConfirmGenerate}
                      className="rounded-lg bg-brand-navy px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                    >
                      {confirming ? 'Starting Seedance…' : 'Confirm & generate video'}
                    </button>
                    <button
                      type="button"
                      disabled={confirming}
                      onClick={() => {
                        setPendingRequestId('');
                        setCandidatePreview(null);
                        setGenerationStatus('');
                        setStatusMessage('Preview discarded. No Seedance spend.');
                      }}
                      className="rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-semibold text-brand-navy"
                    >
                      Discard
                    </button>
                  </div>
                  <pre className="mt-3 max-h-36 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-xs text-brand-navy/80">
                    {candidatePreview.promptExcerpt || candidatePreview.promptText}
                  </pre>
                </div>
              ) : null}
              <AnimatePresence>
                {busyCopy ? (
                  <motion.div
                    key={`gallery-${busyCopy.title}`}
                    role="status"
                    aria-live="polite"
                    initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduceMotion ? undefined : { opacity: 0 }}
                    transition={{ duration: reduceMotion ? 0 : 0.24 }}
                    className="mb-4 flex items-center gap-3 rounded-xl border border-brand-navy/10 bg-white/90 px-4 py-3 text-left shadow-sm"
                  >
                    <motion.span
                      className="shrink-0 text-[#7aa2ff]"
                      animate={reduceMotion ? undefined : { rotate: 360 }}
                      transition={
                        reduceMotion
                          ? undefined
                          : { repeat: Infinity, duration: 0.9, ease: 'linear' }
                      }
                    >
                      <SpinnerIcon className="h-5 w-5" />
                    </motion.span>
                    <div>
                      <p className="text-sm font-semibold text-brand-navy">{busyCopy.title}</p>
                      <p className="text-xs text-brand-navy/60">{busyCopy.detail}</p>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
              {/* One box per video only — first top-left, each new clip beside it. */}
              <div className="flex flex-row flex-wrap items-start justify-start gap-2 sm:gap-3">
                {galleryVideos.map((item) => (
                  <button
                    key={item.requestId}
                    type="button"
                    onClick={() => openVideoFullscreen(item.requestId)}
                    className="group relative aspect-video w-[31%] min-w-[96px] max-w-[240px] flex-none overflow-hidden rounded-lg bg-black text-left shadow-sm ring-1 ring-brand-navy/10 transition hover:ring-brand-navy/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy"
                    aria-label="Play video fullscreen"
                  >
                    <video
                      ref={(node) => {
                        if (node) galleryVideoElsRef.current[item.requestId] = node;
                        else delete galleryVideoElsRef.current[item.requestId];
                      }}
                      src={item.url}
                      muted
                      playsInline
                      preload="metadata"
                      className="h-full w-full object-cover"
                    >
                      <track kind="captions" />
                    </video>
                    <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 transition group-hover:opacity-100">
                      <span className="rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-brand-navy sm:text-xs">
                        Fullscreen
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="relative shrink-0 border-t border-brand-navy/5 bg-brand-cream/90 px-3 pb-3 pt-3 backdrop-blur-sm sm:px-5 sm:pb-4 lg:px-8 lg:pb-5">
        <div className="mx-auto w-full max-w-7xl">
        <form
          onSubmit={handleGenerate}
          aria-busy={isBusy}
          className={[
            'relative overflow-visible rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_24px_70px_-40px_rgba(15,40,80,0.45)] sm:rounded-[28px] sm:p-4 lg:p-5',
            isBusy ? 'ring-1 ring-[#7aa2ff]/35' : '',
          ].join(' ')}
        >
          <AnimatePresence initial={false}>
            {isBusy && busyCopy ? (
              <motion.div
                key="composer-busy"
                initial={reduceMotion ? false : { opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={reduceMotion ? undefined : { opacity: 0, height: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.22 }}
                className="mb-3 overflow-hidden"
              >
                <div className="flex items-center gap-2 rounded-xl bg-[#7aa2ff]/10 px-3 py-2 text-xs font-medium text-brand-navy">
                  <motion.span
                    className="text-[#7aa2ff]"
                    animate={reduceMotion ? undefined : { rotate: 360 }}
                    transition={
                      reduceMotion
                        ? undefined
                        : { repeat: Infinity, duration: 0.9, ease: 'linear' }
                    }
                  >
                    <SpinnerIcon className="h-4 w-4" />
                  </motion.span>
                  <span>{busyCopy.title}</span>
                  <span className="hidden text-brand-navy/55 sm:inline">· {busyCopy.detail}</span>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
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
                disabled={isBusy}
                onClick={() => fileInputRef.current?.click()}
                className="flex h-16 w-full flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-brand-navy transition hover:border-brand-yellow hover:bg-brand-yellow/10 disabled:cursor-not-allowed disabled:opacity-60 sm:h-[88px] sm:w-[88px]"
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
                disabled={isBusy}
                placeholder="Use @ to quickly reference uploaded files, such as referring to actions in @Video 1 to generate videos of characters fighting in @Picture 2 and @Picture 3."
                className="max-h-40 w-full resize-none border-0 bg-transparent text-sm leading-relaxed text-brand-navy outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-70"
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
                disabled={isBurning || isBusy}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#7aa2ff] text-white shadow-md transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
                aria-label={isBusy ? busyCopy?.title || 'Processing' : 'Generate video'}
                title={isBusy ? busyCopy?.title || 'Processing' : 'Generate video'}
              >
                {isBusy ? (
                  <motion.span
                    animate={reduceMotion ? undefined : { rotate: 360 }}
                    transition={
                      reduceMotion
                        ? undefined
                        : { repeat: Infinity, duration: 0.85, ease: 'linear' }
                    }
                  >
                    <SpinnerIcon className="h-5 w-5" />
                  </motion.span>
                ) : (
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
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
