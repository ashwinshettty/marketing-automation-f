import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AdvantageBadge,
  MetaAlert,
  MetaCard,
  MetaCheckRow,
  MetaField,
  MetaInfoIcon,
  MetaInput,
  MetaRadioCard,
  MetaReadonlyRow,
  MetaSelect,
  MetaTextarea,
  MetaToggle,
} from './MetaFormPrimitives';
import { createCampaignDraft, submitCampaign, uploadCampaignImage } from '../api/campaignApi';
import { createEmptyMetaCampaign } from './metaCampaignDefaults';
import { buildCampaignRequest, imageFileFromAd } from './toCampaignPayload';
import LocationMapPanel from './LocationMapPanel';
import MetaMediaCropModal, { CroppedMediaPreview } from './MetaMediaCropModal';
import {
  META_CROP_GROUPS,
  PREVIEW_PLACEMENTS,
  createDefaultMediaCrops,
  formatAspectHint,
} from './metaMediaSpecs';
import {
  getAdFormatsForConversionLocation,
  getCallToActionsForConversionLocation,
  messageTemplateOptions,
  attributionOptions,
  bidStrategyOptions,
  adScheduleDayOptions,
  adSchedulingModeOptions,
  budgetStrategyOptions,
  budgetTypeOptions,
  buyingTypeOptions,
  hourOptions,
  callToActionOptions,
  conversionEventOptions,
  conversionLocationDefaults,
  datasetOptions,
  facebookPageOptions,
  getConversionLocationGroups,
  instagramLiveProfileOptions,
  deviceOptions,
  ageMinControlOptions,
  customAudienceOptions,
  detailedTargetingGroups,
  genderOptions,
  labelFromOptions,
  languageOptions,
  locationSuggestionOptions,
  savedAudienceOptions,
  objectiveOptions,
  instagramLivePerformanceGoalOptions,
  performanceGoalOptions,
  defaultLeadsPlacements,
  getPlacementsForPlatforms,
  placementGroups,
  placementOptions,
  platformOptions,
} from './campaignOptions';

const STORAGE_KEY = 'inkstall.metaAdsCampaign.draft';
const LEVELS = ['campaign', 'adSet', 'ad'];

function loadDraft() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createEmptyMetaCampaign();
    const parsed = JSON.parse(raw);
    const empty = createEmptyMetaCampaign();
    return {
      campaign: { ...empty.campaign, ...(parsed.campaign || {}) },
      adSet: { ...empty.adSet, ...(parsed.adSet || {}) },
      ad: { ...empty.ad, ...(parsed.ad || {}) },
    };
  } catch {
    return createEmptyMetaCampaign();
  }
}

function TreeIcon({ level }) {
  if (level === 'campaign') {
    return (
      <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 7h6l2 2h10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
      </svg>
    );
  }
  if (level === 'adSet') {
    return (
      <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="4" width="7" height="7" rx="1" />
        <rect x="14" y="4" width="7" height="7" rx="1" />
        <rect x="3" y="13" width="7" height="7" rx="1" />
        <rect x="14" y="13" width="7" height="7" rx="1" />
      </svg>
    );
  }
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M8 9h8M8 13h5" />
    </svg>
  );
}

function CampaignScorePanel({ draft, level, onAdChange }) {
  const checks = [
    { key: 'budget', label: 'Budget', ok: Number(draft.campaign.dailyBudget) > 0 },
    {
      key: 'audience',
      label: 'Audience',
      ok:
        (draft.adSet.locationTags && draft.adSet.locationTags.length > 0) ||
        Boolean(draft.adSet.locations),
    },
    { key: 'placements', label: 'Placements', ok: (draft.adSet.placements || []).length > 0 },
  ];
  const score = Math.round((checks.filter((c) => c.ok).length / checks.length) * 100);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative flex h-16 w-16 items-center justify-center">
            <svg className="h-16 w-16 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15" fill="none" stroke="#e2e8f0" strokeWidth="3" />
              <circle
                cx="18"
                cy="18"
                r="15"
                fill="none"
                stroke="#16a34a"
                strokeWidth="3"
                strokeDasharray={`${score} 100`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-sm font-bold text-slate-900">{score}</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Campaign score</p>
            <p className="text-xs text-slate-500">
              {score === 100 ? "You're using our recommended setup." : 'Complete key settings to improve your score.'}
            </p>
          </div>
        </div>
        <div className="mt-4 space-y-3 border-t border-slate-100 pt-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-slate-700">Advantage+ leads campaign</p>
            <span className="text-xs font-semibold text-emerald-600">On</span>
          </div>
          {[
            {
              key: 'budget',
              label: 'Budget',
              detail: "You're using Campaign budget (or have a single ad set).",
              ok: checks[0].ok,
            },
            {
              key: 'audience',
              label: 'Audience',
              detail: "You're either using the recommended setup or your settings are suggestions.",
              ok: checks[1].ok,
            },
            {
              key: 'placements',
              label: 'Placements',
              detail:
                draft.adSet.placementsMode === 'manual'
                  ? "You've selected specific placements (Advantage+ placements off)."
                  : "You're including all available placements for all ad sets.",
              ok: checks[2].ok,
            },
          ].map((item) => (
            <div key={item.key} className="flex gap-2">
              <span className={`mt-0.5 ${item.ok ? 'text-emerald-600' : 'text-slate-300'}`}>
                {item.ok ? '✓' : '○'}
              </span>
              <div>
                <p className="text-sm font-medium text-slate-800">{item.label}</p>
                <p className="text-xs leading-relaxed text-slate-500">{item.detail}</p>
              </div>
            </div>
          ))}
          <p className="text-xs text-slate-400">No additional recommendations available.</p>
        </div>
      </div>

      {level !== 'ad' ? (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-900">Audience definition</p>
          <p className="mt-1 text-xs text-slate-500">Your audience is broad.</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-gradient-to-r from-rose-400 via-amber-300 to-emerald-400">
            <div className="ml-auto h-full w-3 rounded-full bg-slate-800" />
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-slate-500">
            <span>Narrow</span>
            <span>Broad</span>
          </div>
          <p className="mt-3 text-xs text-slate-600">
            Estimated audience size: <span className="font-medium">614,800,000 – 723,300,000</span>
          </p>
        </div>
      ) : (
        <AdPreview
          draft={draft}
          onPreviewPlacementChange={(id) =>
            onAdChange?.({ ...draft.ad, previewPlacement: id })
          }
        />
      )}
    </div>
  );
}

function AdPreview({ draft, onPreviewPlacementChange }) {
  const { ad } = draft;
  const placementId = ad.previewPlacement || 'feed';
  const placement = PREVIEW_PLACEMENTS.find((p) => p.id === placementId) || PREVIEW_PLACEMENTS[0];
  const crop = ad.mediaCrops?.[placement.groupId];
  const isStories = placement.id === 'stories' || placement.id === 'reels';
  const pageName =
    labelFromOptions(facebookPageOptions, ad.facebookPage || draft.adSet?.facebookPage) !== '—'
      ? labelFromOptions(facebookPageOptions, ad.facebookPage || draft.adSet?.facebookPage)
      : ad.facebookPage || draft.adSet?.facebookPage || 'Page name';

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-900">Ad preview</p>
        <span className="text-xs text-emerald-600">On</span>
      </div>

      <div className="mb-3 flex flex-wrap gap-1">
        {PREVIEW_PLACEMENTS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onPreviewPlacementChange?.(p.id)}
            className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
              placement.id === p.id
                ? 'bg-[#E7F3FF] text-[#1877F2]'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {p.label}
            <span className="ml-1 opacity-70">{p.aspect}</span>
          </button>
        ))}
      </div>

      <div
        className={`mx-auto overflow-hidden border border-slate-200 bg-slate-50 shadow-inner ${
          isStories ? 'max-w-[200px] rounded-[1.35rem]' : 'max-w-[260px] rounded-2xl'
        }`}
      >
        {!isStories ? (
          <div className="border-b border-slate-200 bg-white px-3 py-2">
            <p className="text-xs font-semibold text-slate-800">{pageName}</p>
            <p className="text-[11px] text-slate-500">Sponsored</p>
          </div>
        ) : (
          <div className="absolute z-10 hidden" />
        )}

        {ad.mediaUrl ? (
          <div className="relative">
            <CroppedMediaPreview
              mediaUrl={ad.mediaUrl}
              mediaType={ad.mediaType}
              crop={crop?.enabled === false ? null : crop}
              aspectId={placement.aspect}
              className={isStories ? 'max-h-[340px]' : ''}
            />
            {ad.mediaType === 'video' ? (
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/55 text-white">
                  <svg className="h-5 w-5 translate-x-0.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              </span>
            ) : null}
            {isStories ? (
              <div className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-black/50 to-transparent px-3 pb-8 pt-3">
                <p className="text-[11px] font-semibold text-white">{pageName}</p>
                <p className="text-[10px] text-white/80">Sponsored</p>
              </div>
            ) : null}
          </div>
        ) : (
          <div
            className="flex items-center justify-center bg-slate-200 text-xs text-slate-500"
            style={{
              aspectRatio: placement.aspect === '9:16' ? '9/16' : placement.aspect === '1:1' ? '1' : placement.aspect === '1.91:1' ? '1.91' : '4/5',
              minHeight: 120,
            }}
          >
            Media preview · {placement.aspect}
          </div>
        )}

        {!isStories ? (
          <div className="space-y-1 bg-white px-3 py-2">
            <p className="text-[11px] text-slate-500">{ad.displayLink || ad.websiteUrl || 'yoursite.com'}</p>
            <p className="text-sm font-semibold text-slate-900">{ad.headline || 'Admission Form'}</p>
            <p className="line-clamp-3 text-xs text-slate-600">
              {ad.primaryText ||
                "Filling this form doesn't guarantee your admission. Inkstall will take a small test of your child."}
            </p>
            <button
              type="button"
              className="mt-2 w-full rounded-md bg-slate-200 py-1.5 text-xs font-semibold text-slate-800"
            >
              {labelFromOptions(callToActionOptions, ad.callToAction)}
            </button>
          </div>
        ) : (
          <div className="bg-slate-900 px-3 py-2.5">
            <p className="line-clamp-2 text-[11px] text-white/90">{ad.primaryText || 'Your primary text'}</p>
            <button
              type="button"
              className="mt-2 w-full rounded-full bg-white py-1.5 text-[11px] font-semibold text-slate-900"
            >
              {labelFromOptions(callToActionOptions, ad.callToAction)}
            </button>
          </div>
        )}
      </div>
      <p className="mt-2 text-center text-[10px] text-slate-500">
        Preview uses Meta {placement.aspect} crop for {placement.label}
      </p>
    </div>
  );
}

function ObjectiveIcon({ type }) {
  const common = 'h-5 w-5 shrink-0 text-slate-600';
  if (type === 'megaphone') {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M3 11v2a2 2 0 0 0 2 2h1l6 4V5L6 9H5a2 2 0 0 0-2 2z" />
        <path d="M16 9.5a4 4 0 0 1 0 5" />
      </svg>
    );
  }
  if (type === 'cursor') {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M4 4l7 16 2-6 6-2L4 4z" />
      </svg>
    );
  }
  if (type === 'chat') {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M4 6a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H9l-5 4V6z" />
      </svg>
    );
  }
  if (type === 'funnel') {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M4 5h16l-6 7v6l-4 2v-8L4 5z" />
      </svg>
    );
  }
  if (type === 'people') {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <circle cx="9" cy="8" r="3" />
        <circle cx="17" cy="9" r="2.5" />
        <path d="M3 19c0-3 2.5-5 6-5s6 2 6 5M14 19c.3-1.8 1.6-3 3.5-3 1.7 0 3 1 3.3 2.5" />
      </svg>
    );
  }
  return (
    <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M6 8h12l-1 12H7L6 8z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

function PencilIcon({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}

/** Collapsed summary row: pencil on hover; click opens accordion panel. */
function AccordionEditRow({ label, info, value, open, onToggle, children }) {
  return (
    <div className={`rounded-xl transition ${open ? 'border border-[#B7D2F5] bg-[#E7F3FF]' : ''}`}>
      <button
        type="button"
        onClick={onToggle}
        className={`group flex w-full items-start gap-3 rounded-xl px-2 py-2.5 text-left transition ${
          open ? '' : 'hover:bg-slate-50'
        }`}
      >
        <div className="min-w-0 flex-1">
          <p className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-800">
            {label}
            {info ? <MetaInfoIcon /> : null}
          </p>
          {!open ? <p className="mt-1 text-sm text-slate-900">{value}</p> : null}
        </div>
        <span
          className={`mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#1877F2] transition ${
            open
              ? 'bg-white/80 opacity-100'
              : 'opacity-0 group-hover:bg-[#E7F3FF] group-hover:opacity-100'
          }`}
          aria-hidden
        >
          {open ? (
            <svg className="h-4 w-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 15l6-6 6 6" />
            </svg>
          ) : (
            <PencilIcon />
          )}
        </span>
      </button>
      {open ? <div className="border-t border-[#B7D2F5]/70 px-2 pb-3 pt-1">{children}</div> : null}
    </div>
  );
}

function CampaignLevelForm({ data, onChange }) {
  const set = (key, value) => onChange({ ...data, [key]: value });
  const [openSection, setOpenSection] = useState(null);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [spendingOpen, setSpendingOpen] = useState(true);
  const [bidStrategyOpen, setBidStrategyOpen] = useState(false);
  const [budgetSchedulingOpen, setBudgetSchedulingOpen] = useState(false);
  const [showBudgetMore, setShowBudgetMore] = useState(false);
  const [openPeriodIds, setOpenPeriodIds] = useState(() => new Set());
  const [viewMenuOpen, setViewMenuOpen] = useState(false);
  const [scheduleViewFilter, setScheduleViewFilter] = useState('all');
  const [scheduleViewSort, setScheduleViewSort] = useState('newest');

  const spendingMode = data.spendingLimitMode || (data.spendingLimit ? 'custom' : 'none');
  const toggleSection = (id) => setOpenSection((prev) => (prev === id ? null : id));

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4">
      <MetaCard id="campaign-name" title="Campaign name">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <MetaInput value={data.name} onChange={(e) => set('name', e.target.value)} className="min-w-0 flex-1" />
          <button
            type="button"
            className="w-full shrink-0 rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:w-auto"
          >
            Create template
          </button>
        </div>
      </MetaCard>

      <MetaCard id="campaign-details" title="Campaign details">
        <div className="space-y-1">
          <AccordionEditRow
            label="Buying type"
            value={labelFromOptions(buyingTypeOptions, data.buyingType)}
            open={openSection === 'buying'}
            onToggle={() => toggleSection('buying')}
          >
            <div className="space-y-2 pt-1">
              {buyingTypeOptions.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex cursor-pointer gap-3 rounded-lg border px-3 py-3 transition ${
                    data.buyingType === opt.value
                      ? 'border-[#1877F2] bg-white'
                      : 'border-transparent bg-white/70 hover:bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="buyingType"
                    checked={data.buyingType === opt.value}
                    onChange={() => set('buyingType', opt.value)}
                    className="mt-1"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-slate-900">{opt.label}</span>
                    <span className="mt-0.5 block text-xs text-slate-600">{opt.description}</span>
                  </span>
                </label>
              ))}
            </div>
          </AccordionEditRow>

          <AccordionEditRow
            label="Campaign objective"
            info
            value={labelFromOptions(objectiveOptions, data.objective)}
            open={openSection === 'objective'}
            onToggle={() => toggleSection('objective')}
          >
            <div className="overflow-hidden rounded-lg bg-white p-1.5">
              {objectiveOptions.map((opt) => {
                const selected = data.objective === opt.value;
                return (
                  <label
                    key={opt.value}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 transition ${
                      selected ? 'bg-[#E7F3FF]' : 'hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="campaignObjective"
                      checked={selected}
                      onChange={() => set('objective', opt.value)}
                    />
                    <ObjectiveIcon type={opt.icon} />
                    <span className="text-sm font-medium text-slate-900">{opt.label}</span>
                  </label>
                );
              })}
            </div>
          </AccordionEditRow>

          <div className="px-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setShowMoreOptions((v) => {
                  if (!v) setSpendingOpen(true);
                  return !v;
                });
              }}
              className="inline-flex items-center gap-1 text-sm font-medium text-[#1877F2] hover:underline"
            >
              {showMoreOptions ? 'Hide options' : 'Show more options'}
              <svg
                className={`h-3.5 w-3.5 transition ${showMoreOptions ? 'rotate-180' : ''}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
          </div>

          {showMoreOptions ? (
            <div className="mt-2 overflow-hidden rounded-xl border border-[#B7D2F5] bg-[#E7F3FF]">
              <button
                type="button"
                onClick={() => setSpendingOpen((v) => !v)}
                className="group flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left"
              >
                <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-800">
                  Campaign spending limit
                  <span className="font-normal text-slate-500">· Optional</span>
                  <MetaInfoIcon />
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[#1877F2] opacity-0 transition group-hover:bg-white/70 group-hover:opacity-100">
                    <PencilIcon />
                  </span>
                  <svg
                    className={`h-4 w-4 text-slate-500 transition ${spendingOpen ? 'rotate-180' : ''}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </span>
              </button>

              {spendingOpen ? (
                <div className="space-y-2 border-t border-[#B7D2F5]/70 px-3 py-3">
                  <label
                    className={`flex cursor-pointer gap-3 rounded-lg border px-3 py-3 ${
                      spendingMode === 'none' ? 'border-[#1877F2] bg-white' : 'border-transparent bg-white/70'
                    }`}
                  >
                    <input
                      type="radio"
                      name="spendingLimitMode"
                      checked={spendingMode === 'none'}
                      onChange={() => onChange({ ...data, spendingLimitMode: 'none', spendingLimit: '' })}
                      className="mt-0.5"
                    />
                    <span className="text-sm font-semibold text-slate-900">None set</span>
                  </label>
                  <label
                    className={`flex cursor-pointer gap-3 rounded-lg border px-3 py-3 ${
                      spendingMode === 'custom' ? 'border-[#1877F2] bg-white' : 'border-transparent bg-white/70'
                    }`}
                  >
                    <input
                      type="radio"
                      name="spendingLimitMode"
                      checked={spendingMode === 'custom'}
                      onChange={() => set('spendingLimitMode', 'custom')}
                      className="mt-0.5"
                    />
                    <span className="flex-1">
                      <span className="block text-sm font-semibold text-slate-900">
                        Add campaign spending limit
                      </span>
                      {spendingMode === 'custom' ? (
                        <span className="mt-2 block space-y-1">
                          <span className="flex items-center gap-2">
                            <span className="text-sm text-slate-500">₹</span>
                            <MetaInput
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="No Limit Set"
                              value={data.spendingLimit}
                              onChange={(e) => set('spendingLimit', e.target.value)}
                              className="max-w-[200px] bg-white"
                            />
                          </span>
                          <span className="block text-xs text-slate-500">₹0.00 Total Spent</span>
                        </span>
                      ) : null}
                    </span>
                  </label>
                </div>
              ) : (
                <p className="border-t border-[#B7D2F5]/70 px-3 py-2 text-sm text-slate-900">
                  {spendingMode === 'custom' && data.spendingLimit
                    ? `₹${Number(data.spendingLimit).toLocaleString('en-IN')} INR`
                    : 'None added'}
                </p>
              )}
            </div>
          ) : null}
        </div>
      </MetaCard>

      <MetaCard id="campaign-budget" title="Budget" badge={<AdvantageBadge on={data.advantagePlus} />}>
        <AccordionEditRow
          label="Budget strategy"
          info
          value={labelFromOptions(budgetStrategyOptions, data.budgetStrategy)}
          open={openSection === 'budget'}
          onToggle={() => toggleSection('budget')}
        >
          <div className="space-y-2 pt-1">
            {budgetStrategyOptions.map((opt) => (
              <MetaRadioCard
                key={opt.value}
                name="budgetStrategy"
                value={opt.value}
                checked={data.budgetStrategy === opt.value}
                onChange={(v) => {
                  set('budgetStrategy', v);
                  setShowBudgetMore(false);
                }}
                label={opt.label}
                description={
                  opt.value === 'campaign'
                    ? `${opt.description} About campaign budget`
                    : opt.description
                }
              />
            ))}
          </div>

          {/* Campaign budget → amount + bid strategy */}
          {data.budgetStrategy === 'campaign' ? (
            <div className="mt-3 space-y-4">
              <div className="rounded-lg bg-white p-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <MetaSelect
                    value={data.budgetType}
                    onChange={(e) => set('budgetType', e.target.value)}
                    className="bg-white sm:w-44"
                  >
                    {budgetTypeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </MetaSelect>
                  <div className="relative flex-1">
                    <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-slate-500">
                      ₹
                    </span>
                    <MetaInput
                      type="number"
                      min="0"
                      step="0.01"
                      value={data.dailyBudget}
                      onChange={(e) => set('dailyBudget', e.target.value)}
                      className="bg-white pl-7 pr-14"
                    />
                    <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-slate-500">
                      INR
                    </span>
                  </div>
                </div>
                {data.dailyBudget ? (
                  <p className="mt-2 text-xs leading-relaxed text-slate-500">
                    We&apos;ll spend around ₹{Number(data.dailyBudget).toFixed(2)} per day. Your maximum daily spend
                    is ₹{(Number(data.dailyBudget) * 1.75).toFixed(2)} and your maximum weekly spend is ₹
                    {(Number(data.dailyBudget) * 7).toFixed(2)}.{' '}
                    <button type="button" className="font-medium text-[#1877F2] hover:underline">
                      About {data.budgetType === 'lifetime' ? 'lifetime' : 'daily'} budget
                    </button>
                  </p>
                ) : null}
              </div>

              <div className="mt-1">
                <AccordionEditRow
                  label="Campaign bid strategy"
                  info
                  value={
                    bidStrategyOptions.find((o) => o.value === (data.bidStrategy || 'highest_volume'))
                      ?.shortLabel ||
                    labelFromOptions(bidStrategyOptions, data.bidStrategy || 'highest_volume')
                  }
                  open={bidStrategyOpen}
                  onToggle={() => setBidStrategyOpen((v) => !v)}
                >
                  <div className="rounded-lg bg-white p-3">
                    <p className="mb-2 text-xs text-slate-500">How we&apos;ll bid in ad auctions.</p>
                    <MetaSelect
                      value={data.bidStrategy || 'highest_volume'}
                      onChange={(e) => set('bidStrategy', e.target.value)}
                      className="bg-white"
                    >
                      {bidStrategyOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </MetaSelect>
                    {bidStrategyOptions.find((o) => o.value === (data.bidStrategy || 'highest_volume'))
                      ?.description ? (
                      <p className="mt-2 text-xs leading-relaxed text-slate-500">
                        {
                          bidStrategyOptions.find((o) => o.value === (data.bidStrategy || 'highest_volume'))
                            .description
                        }
                      </p>
                    ) : null}

                    {(data.bidStrategy === 'cost_per_result' || data.bidStrategy === 'roas_goal') && (
                      <MetaField
                        label={data.bidStrategy === 'roas_goal' ? 'ROAS goal' : 'Cost per result goal'}
                        className="mt-3"
                      >
                        <div className="relative">
                          <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-slate-500">
                            {data.bidStrategy === 'roas_goal' ? '' : '₹'}
                          </span>
                          <MetaInput
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder={data.bidStrategy === 'roas_goal' ? 'e.g. 2.0' : '0.00'}
                            value={data.bidGoalValue || ''}
                            onChange={(e) => set('bidGoalValue', e.target.value)}
                            className={data.bidStrategy === 'roas_goal' ? 'bg-white' : 'bg-white pl-7'}
                          />
                        </div>
                      </MetaField>
                    )}

                    {data.bidStrategy === 'bid_cap' ? (
                      <MetaField label="Bid cap" className="mt-3">
                        <div className="relative">
                          <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-slate-500">
                            ₹
                          </span>
                          <MetaInput
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            value={data.bidCap || ''}
                            onChange={(e) => set('bidCap', e.target.value)}
                            className="bg-white pl-7 pr-14"
                          />
                          <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-slate-500">
                            INR
                          </span>
                        </div>
                      </MetaField>
                    ) : null}
                  </div>
                </AccordionEditRow>

                <div className="mt-2 px-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowBudgetMore((v) => {
                        if (!v) setBudgetSchedulingOpen(false);
                        return !v;
                      });
                    }}
                    className="inline-flex items-center gap-1 text-sm font-medium text-[#1877F2] hover:underline"
                  >
                    {showBudgetMore ? 'Hide settings' : 'Show more settings'}
                    <svg
                      className={`h-3.5 w-3.5 transition ${showBudgetMore ? 'rotate-180' : ''}`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>

                  {showBudgetMore ? (
                    <div className="mt-2">
                      <AccordionEditRow
                        label="Budget scheduling"
                        info
                        value={
                          data.scheduleBudgetIncreases && (data.budgetSchedulePeriods || []).length
                            ? `${data.budgetSchedulePeriods.length} time period${
                                data.budgetSchedulePeriods.length > 1 ? 's' : ''
                              }`
                            : 'None selected'
                        }
                        open={budgetSchedulingOpen}
                        onToggle={() => setBudgetSchedulingOpen((v) => !v)}
                      >
                        <div className="rounded-lg bg-white p-3">
                          <p className="text-sm text-slate-600">
                            Increase your budget during specific days or times.
                          </p>

                          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                            <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-800">
                              <input
                                type="checkbox"
                                checked={Boolean(data.scheduleBudgetIncreases)}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  const periods = data.budgetSchedulePeriods?.length
                                    ? data.budgetSchedulePeriods
                                    : [
                                        {
                                          id: `period-${Date.now()}`,
                                          startDate: '',
                                          startTime: '00:00',
                                          endDate: '',
                                          endTime: '00:00',
                                          increaseType: 'value',
                                          increaseAmount: '200',
                                        },
                                      ];
                                  onChange({
                                    ...data,
                                    scheduleBudgetIncreases: checked,
                                    budgetSchedulePeriods: periods,
                                  });
                                  if (checked) {
                                    const firstId = periods[0]?.id;
                                    if (firstId) setOpenPeriodIds(new Set([firstId]));
                                  } else {
                                    setViewMenuOpen(false);
                                    setOpenPeriodIds(new Set());
                                  }
                                }}
                              />
                              Schedule budget increases
                            </label>

                            <div className="relative">
                              <button
                                type="button"
                                disabled={!data.scheduleBudgetIncreases}
                                onClick={() =>
                                  data.scheduleBudgetIncreases && setViewMenuOpen((v) => !v)
                                }
                                className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${
                                  data.scheduleBudgetIncreases
                                    ? 'border-slate-300 text-slate-700 hover:bg-slate-50'
                                    : 'cursor-not-allowed border-slate-200 text-slate-400 opacity-60'
                                }`}
                              >
                                View
                                <svg
                                  className={`h-3.5 w-3.5 transition ${viewMenuOpen ? 'rotate-180' : ''}`}
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path d="M6 9l6 6 6-6" />
                                </svg>
                              </button>

                              {viewMenuOpen && data.scheduleBudgetIncreases ? (
                                <>
                                  <button
                                    type="button"
                                    className="fixed inset-0 z-10 cursor-default"
                                    aria-label="Close view menu"
                                    onClick={() => setViewMenuOpen(false)}
                                  />
                                  <div className="absolute right-0 z-20 mt-1 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white py-2 shadow-lg">
                                    {(() => {
                                      const periods = data.budgetSchedulePeriods || [];
                                      const today = new Date();
                                      today.setHours(0, 0, 0, 0);
                                      const isCompleted = (p) => {
                                        if (!p.endDate) return false;
                                        const end = new Date(p.endDate);
                                        end.setHours(0, 0, 0, 0);
                                        return end < today;
                                      };
                                      const upcomingCount = periods.filter((p) => !isCompleted(p)).length;
                                      const completedCount = periods.filter((p) => isCompleted(p)).length;
                                      const allCount = periods.length;
                                      const filterItems = [
                                        { id: 'upcoming', label: 'Upcoming entries', count: upcomingCount, tone: 'green' },
                                        { id: 'completed', label: 'Completed entries', count: completedCount, tone: 'gray' },
                                        { id: 'all', label: 'All entries', count: allCount, tone: 'gray' },
                                      ];
                                      const sortItems = [
                                        { id: 'newest', label: 'Sort by newest to oldest', dir: 'up' },
                                        { id: 'oldest', label: 'Sort by oldest to newest', dir: 'down' },
                                      ];
                                      return (
                                        <>
                                          <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                            Filter
                                          </p>
                                          {filterItems.map((item) => (
                                            <button
                                              key={item.id}
                                              type="button"
                                              onClick={() => {
                                                setScheduleViewFilter(item.id);
                                                setViewMenuOpen(false);
                                              }}
                                              className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm ${
                                                scheduleViewFilter === item.id
                                                  ? 'bg-[#E7F3FF] font-medium text-slate-900'
                                                  : 'text-slate-700 hover:bg-slate-50'
                                              }`}
                                            >
                                              <span>{item.label}</span>
                                              <span
                                                className={`inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${
                                                  item.tone === 'green'
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : 'bg-slate-100 text-slate-600'
                                                }`}
                                              >
                                                {item.count}
                                              </span>
                                            </button>
                                          ))}
                                          <div className="my-2 border-t border-slate-100" />
                                          <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                            Sort
                                          </p>
                                          {sortItems.map((item) => (
                                            <button
                                              key={item.id}
                                              type="button"
                                              onClick={() => {
                                                setScheduleViewSort(item.id);
                                                setViewMenuOpen(false);
                                              }}
                                              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm ${
                                                scheduleViewSort === item.id
                                                  ? 'bg-[#E7F3FF] font-medium text-slate-900'
                                                  : 'text-slate-700 hover:bg-slate-50'
                                              }`}
                                            >
                                              <svg
                                                className="h-3.5 w-3.5 text-slate-500"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                              >
                                                {item.dir === 'up' ? (
                                                  <path d="M12 19V5M5 12l7-7 7 7" />
                                                ) : (
                                                  <path d="M12 5v14M5 12l7 7 7-7" />
                                                )}
                                              </svg>
                                              {item.label}
                                            </button>
                                          ))}
                                        </>
                                      );
                                    })()}
                                  </div>
                                </>
                              ) : null}
                            </div>
                          </div>

                          {data.scheduleBudgetIncreases ? (
                            <div className="mt-3 space-y-3">
                              {(data.budgetSchedulePeriods || [])
                                .filter((period) => {
                                  const today = new Date();
                                  today.setHours(0, 0, 0, 0);
                                  const end = period.endDate ? new Date(period.endDate) : null;
                                  if (end) end.setHours(0, 0, 0, 0);
                                  const completed = end ? end < today : false;
                                  if (scheduleViewFilter === 'upcoming') return !completed;
                                  if (scheduleViewFilter === 'completed') return completed;
                                  return true;
                                })
                                .sort((a, b) => {
                                  const aKey = a.startDate || a.id || '';
                                  const bKey = b.startDate || b.id || '';
                                  if (scheduleViewSort === 'oldest') return aKey.localeCompare(bKey);
                                  return bKey.localeCompare(aKey);
                                })
                                .map((period) => {
                                const index = (data.budgetSchedulePeriods || []).findIndex(
                                  (p) => p.id === period.id
                                );
                                const safeIndex = index >= 0 ? index : 0;
                                const updatePeriod = (patch) => {
                                  const next = (data.budgetSchedulePeriods || []).map((p, i) =>
                                    i === safeIndex ? { ...p, ...patch } : p
                                  );
                                  set('budgetSchedulePeriods', next);
                                };
                                const baseBudget = Number(data.dailyBudget) || 0;
                                const bump = Number(period.increaseAmount) || 0;
                                const avg =
                                  period.increaseType === 'percent'
                                    ? baseBudget + (baseBudget * bump) / 100
                                    : baseBudget + bump;
                                const periodId = period.id || `idx-${safeIndex}`;
                                const isPeriodOpen = openPeriodIds.has(periodId);
                                const formatDayMonth = (iso) => {
                                  if (!iso) return null;
                                  const d = new Date(`${iso}T00:00:00`);
                                  if (Number.isNaN(d.getTime())) return iso;
                                  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
                                };
                                const startLabel = formatDayMonth(period.startDate);
                                const endLabel = formatDayMonth(period.endDate);
                                const spendSummary =
                                  startLabel && endLabel
                                    ? `Spend ₹${avg.toLocaleString('en-IN', {
                                        minimumFractionDigits: 0,
                                        maximumFractionDigits: 0,
                                      })} as the daily budget from ${startLabel} to ${endLabel}`
                                    : startLabel
                                      ? `Spend ₹${avg.toLocaleString('en-IN', {
                                          minimumFractionDigits: 0,
                                          maximumFractionDigits: 0,
                                        })} as the daily budget from ${startLabel}`
                                      : `Spend ₹${avg.toLocaleString('en-IN', {
                                          minimumFractionDigits: 0,
                                          maximumFractionDigits: 0,
                                        })} as the daily budget`;

                                const togglePeriod = () => {
                                  setOpenPeriodIds((prev) => {
                                    const next = new Set(prev);
                                    if (next.has(periodId)) next.delete(periodId);
                                    else next.add(periodId);
                                    return next;
                                  });
                                };

                                return (
                                  <div
                                    key={periodId}
                                    className={`overflow-hidden rounded-xl border ${
                                      isPeriodOpen
                                        ? 'border-[#B7D2F5] bg-[#E7F3FF]'
                                        : 'border-slate-200 bg-slate-100'
                                    }`}
                                  >
                                    {isPeriodOpen ? (
                                      <>
                                        <button
                                          type="button"
                                          onClick={togglePeriod}
                                          className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left"
                                        >
                                          <span className="text-[13px] font-semibold text-slate-800">
                                            Time period for budget increase
                                          </span>
                                          <svg
                                            className="h-4 w-4 rotate-180 text-slate-500"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                          >
                                            <path d="M6 9l6 6 6-6" />
                                          </svg>
                                        </button>
                                        <div className="space-y-3 border-t border-[#B7D2F5]/70 bg-white px-3 py-3">
                                          <div className="grid gap-3 sm:grid-cols-2">
                                            <MetaField label="Starts on">
                                              <div className="flex gap-2">
                                                <MetaInput
                                                  type="date"
                                                  value={period.startDate || ''}
                                                  onChange={(e) =>
                                                    updatePeriod({ startDate: e.target.value })
                                                  }
                                                  className="bg-white"
                                                />
                                                <MetaInput
                                                  type="time"
                                                  value={period.startTime || '00:00'}
                                                  onChange={(e) =>
                                                    updatePeriod({ startTime: e.target.value })
                                                  }
                                                  className="w-28 bg-white"
                                                />
                                              </div>
                                            </MetaField>
                                            <MetaField label="Ends">
                                              <div className="flex gap-2">
                                                <MetaInput
                                                  type="date"
                                                  value={period.endDate || ''}
                                                  onChange={(e) =>
                                                    updatePeriod({ endDate: e.target.value })
                                                  }
                                                  className="bg-white"
                                                />
                                                <MetaInput
                                                  type="time"
                                                  value={period.endTime || '00:00'}
                                                  onChange={(e) =>
                                                    updatePeriod({ endTime: e.target.value })
                                                  }
                                                  className="w-28 bg-white"
                                                />
                                              </div>
                                            </MetaField>
                                          </div>

                                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                            <MetaSelect
                                              value={period.increaseType || 'value'}
                                              onChange={(e) =>
                                                updatePeriod({ increaseType: e.target.value })
                                              }
                                              className="bg-white sm:flex-1"
                                            >
                                              <option value="value">
                                                Increase daily budget by value amount (₹)
                                              </option>
                                              <option value="percent">
                                                Increase daily budget by a percentage (%)
                                              </option>
                                            </MetaSelect>
                                            <div className="relative sm:w-40">
                                              <MetaInput
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={period.increaseAmount || ''}
                                                onChange={(e) =>
                                                  updatePeriod({ increaseAmount: e.target.value })
                                                }
                                                className="bg-white pr-12"
                                              />
                                              <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-slate-500">
                                                {period.increaseType === 'percent' ? '%' : 'INR'}
                                              </span>
                                            </div>
                                          </div>

                                          <p className="text-xs leading-relaxed text-slate-500">
                                            Meta will aim to spend an average of ₹{avg.toFixed(2)} a day
                                            {period.increaseType === 'percent'
                                              ? ` (a ${bump}% increase)`
                                              : ` (a ₹${bump.toFixed(2)} increase)`}
                                            {startLabel && endLabel
                                              ? ` from ${startLabel} to ${endLabel}.`
                                              : '.'}
                                          </p>

                                          <button
                                            type="button"
                                            onClick={() => {
                                              const next = (data.budgetSchedulePeriods || []).filter(
                                                (_, i) => i !== safeIndex
                                              );
                                              onChange({
                                                ...data,
                                                budgetSchedulePeriods: next,
                                                scheduleBudgetIncreases: next.length > 0,
                                              });
                                            }}
                                            className="inline-flex items-center gap-1.5 text-sm font-medium text-rose-600 hover:underline"
                                          >
                                            <svg
                                              className="h-4 w-4"
                                              viewBox="0 0 24 24"
                                              fill="none"
                                              stroke="currentColor"
                                              strokeWidth="1.8"
                                            >
                                              <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
                                            </svg>
                                            Remove this period
                                          </button>
                                        </div>
                                      </>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={togglePeriod}
                                        className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left hover:bg-slate-200/60"
                                      >
                                        <span className="min-w-0 flex-1 text-sm font-medium text-slate-800">
                                          {spendSummary}
                                        </span>
                                        <span className="inline-flex shrink-0 items-center gap-1.5">
                                          <span className="text-xs font-semibold text-emerald-600">
                                            In draft
                                          </span>
                                          <svg
                                            className="h-4 w-4 text-slate-500"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                          >
                                            <path d="M6 9l6 6 6-6" />
                                          </svg>
                                        </span>
                                      </button>
                                    )}
                                  </div>
                                );
                              })}

                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <button
                                  type="button"
                                  disabled={(data.budgetSchedulePeriods || []).length >= 50}
                                  onClick={() => {
                                    const newId = `period-${Date.now()}`;
                                    const next = [
                                      ...(data.budgetSchedulePeriods || []),
                                      {
                                        id: newId,
                                        startDate: '',
                                        startTime: '00:00',
                                        endDate: '',
                                        endTime: '00:00',
                                        increaseType: 'value',
                                        increaseAmount: '200',
                                      },
                                    ];
                                    set('budgetSchedulePeriods', next);
                                    setOpenPeriodIds((prev) => new Set([...prev, newId]));
                                  }}
                                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                                >
                                  + Add another time period
                                </button>
                                <span className="text-xs text-slate-500">
                                  {(data.budgetSchedulePeriods || []).length}/50 time periods
                                </span>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </AccordionEditRow>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}

          {/* Ad set budget → share checkbox only */}
          {data.budgetStrategy === 'ad_set' ? (
            <div className="mt-3 rounded-lg bg-white px-3 py-2">
              <label className="flex cursor-pointer gap-3 py-1">
                <input
                  type="checkbox"
                  checked={Boolean(data.shareBudgetAcrossAdSets)}
                  onChange={(e) => set('shareBudgetAcrossAdSets', e.target.checked)}
                  className="mt-1"
                />
                <span>
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-800">
                    Share some of your budget with other ad sets
                    <MetaInfoIcon />
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-slate-500">
                    We&apos;ll share up to 20% of your ad set budget with other ad sets within this campaign when
                    it&apos;s likely to improve performance.{' '}
                    <button type="button" className="font-medium text-[#1877F2] hover:underline">
                      About ad set budget sharing
                    </button>
                  </span>
                </span>
              </label>
            </div>
          ) : null}
        </AccordionEditRow>
      </MetaCard>

    </div>
  );
}

function AdSetLevelForm({ data, onChange, campaignObjective = 'leads', campaignBudget = null }) {
  const set = (key, value) => onChange({ ...data, [key]: value });
  const [showConversionMore, setShowConversionMore] = useState(false);
  const [showScheduleMore, setShowScheduleMore] = useState(false);
  const [audienceLocationMenuOpen, setAudienceLocationMenuOpen] = useState(false);
  const [detailedTargetingOpen, setDetailedTargetingOpen] = useState(false);
  const [detailedTargetingSearch, setDetailedTargetingSearch] = useState('');
  const [includeCustomOpen, setIncludeCustomOpen] = useState(false);
  const [excludeCustomOpen, setExcludeCustomOpen] = useState(false);
  const [audienceControlsMore, setAudienceControlsMore] = useState(
    () => Boolean(data.showAudienceControlsMore)
  );
  const [dropPinMode, setDropPinMode] = useState(false);
  const [locationBrowseOpen, setLocationBrowseOpen] = useState(false);
  const [showValueRuleBanner, setShowValueRuleBanner] = useState(
    () => data.showValueRuleSetBanner !== false
  );
  const [editingCostGoal, setEditingCostGoal] = useState(false);
  const [locationMenuOpen, setLocationMenuOpen] = useState(false);
  const [expandedLocationGroups, setExpandedLocationGroups] = useState(() => new Set(['multiple', 'single']));
  const [engageInfoOpen, setEngageInfoOpen] = useState(false);
  const [attributionSettingsOpen, setAttributionSettingsOpen] = useState(false);
  const [openAttrMenu, setOpenAttrMenu] = useState(null); // 'click' | 'view' | null
  const [eventMenuOpen, setEventMenuOpen] = useState(false);
  const [eventSearch, setEventSearch] = useState('');
  const [hoveredDisabledEvent, setHoveredDisabledEvent] = useState(null);
  const [datasetMenuOpen, setDatasetMenuOpen] = useState(false);
  const [datasetSearch, setDatasetSearch] = useState('');
  const [attributionModelMenuOpen, setAttributionModelMenuOpen] = useState(false);
  const [pageMenuOpen, setPageMenuOpen] = useState(false);
  const [pageSearch, setPageSearch] = useState('');
  const [personalPagesOpen, setPersonalPagesOpen] = useState(true);
  const [valueRulesOpen, setValueRulesOpen] = useState(false);
  const [showPreferredAudienceBanner, setShowPreferredAudienceBanner] = useState(true);
  const [liveVideoEditOpen, setLiveVideoEditOpen] = useState(false);

  const locationGroups = useMemo(
    () => getConversionLocationGroups(campaignObjective),
    [campaignObjective]
  );
  const locationOptions = useMemo(
    () => locationGroups.flatMap((g) => g.options),
    [locationGroups]
  );

  // Normalize legacy draft value from older "Message destinations" option
  const conversionLocation =
    data.conversionLocation === 'message_destinations' ? 'messenger' : data.conversionLocation;

  const isFormsMessenger = conversionLocation === 'forms_and_messenger';
  const isInstagramLive = conversionLocation === 'instagram_live';
  const isInstantForms = conversionLocation === 'instant_forms';
  const isMessagingLocation = ['messenger', 'instagram', 'whatsapp'].includes(conversionLocation);
  const needsPagePicker = isFormsMessenger || isInstantForms || isMessagingLocation;
  const hidePixelFields = isFormsMessenger || isInstagramLive || isInstantForms || isMessagingLocation;
  const showPreferredBanner = isFormsMessenger || isInstagramLive;
  const hideShowMoreFields = isFormsMessenger || isInstagramLive;

  const clickThroughOptions = [
    { value: '1', label: '1 day' },
    { value: '7', label: '7 days' },
  ];
  const viewThroughOptions = [
    { value: 'none', label: 'None' },
    { value: '1', label: '1 day' },
  ];

  const attrWindowLabel = (options, value) =>
    options.find((o) => o.value === value)?.label || value;

  const AttributionWindowMenu = ({ menuId, value, options, onChange, openUp = false }) => {
    const open = openAttrMenu === menuId;
    return (
      <div className="relative z-30 mt-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setOpenAttrMenu(open ? null : menuId);
          }}
          className="flex w-full items-center justify-between gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-left text-sm text-slate-900 hover:border-slate-400"
        >
          <span>{attrWindowLabel(options, value)}</span>
          <svg
            className={`h-4 w-4 shrink-0 text-slate-500 transition ${open ? 'rotate-180' : ''}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        {open ? (
          <>
            <button
              type="button"
              className="fixed inset-0 z-40 cursor-default"
              aria-label="Close menu"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOpenAttrMenu(null);
              }}
            />
            <div
              className={`absolute left-0 right-0 z-50 rounded-xl border border-slate-200 bg-white py-1 shadow-lg ${
                openUp ? 'bottom-full mb-1' : 'top-full mt-1'
              }`}
            >
              {options.map((opt) => {
                const selected = value === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onChange(opt.value);
                      setOpenAttrMenu(null);
                    }}
                    className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm ${
                      selected ? 'bg-[#E7F3FF] font-medium text-slate-900' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                        selected ? 'border-[#1877F2] bg-[#1877F2]' : 'border-slate-400 bg-white'
                      }`}
                      aria-hidden
                    >
                      {selected ? <span className="h-1.5 w-1.5 rounded-full bg-white" /> : null}
                    </span>
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </>
        ) : null}
      </div>
    );
  };

  const toggleInList = (key, value) => {
    const list = data[key] || [];
    set(key, list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4">
      <MetaCard title="Ad set name">
        <div className="flex flex-col gap-2 sm:flex-row">
          <MetaInput value={data.name} onChange={(e) => set('name', e.target.value)} className="min-w-0 flex-1" />
          <button
            type="button"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:w-auto"
          >
            Create template
          </button>
        </div>
      </MetaCard>

      <MetaCard id="adset-conversion" title="Conversion">
        <div className="space-y-5">
          <div>
            <p className="text-[13px] font-semibold text-slate-800">Conversion location</p>
            <p className="mt-0.5 text-xs text-slate-500">
              Choose where you want to generate leads.{' '}
              <button type="button" className="font-medium text-[#1877F2] hover:underline">
                About conversion locations
              </button>
            </p>

            <div className="relative mt-2">
              <button
                type="button"
                onClick={() => setLocationMenuOpen((v) => !v)}
                className="flex w-full items-center justify-between gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-left text-sm text-slate-900 outline-none transition hover:border-slate-400 focus:border-[#1877F2] focus:ring-2 focus:ring-[#1877F2]/20"
              >
                <span>
                  {labelFromOptions(locationOptions, conversionLocation) ||
                    'Select conversion location'}
                </span>
                <svg
                  className={`h-4 w-4 shrink-0 text-slate-500 transition ${locationMenuOpen ? 'rotate-180' : ''}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {locationMenuOpen ? (
                <>
                  <button
                    type="button"
                    className="fixed inset-0 z-10 cursor-default"
                    aria-label="Close conversion location menu"
                    onClick={() => setLocationMenuOpen(false)}
                  />
                  <div className="absolute left-0 right-0 z-20 mt-1 max-h-80 overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                    {locationGroups.map((group) => {
                      const expanded = expandedLocationGroups.has(group.id);
                      const showGroupHeader = locationGroups.length > 1;
                      return (
                        <div key={group.id} className="border-b border-slate-100 last:border-b-0">
                          {showGroupHeader ? (
                            <button
                              type="button"
                              onClick={() => {
                                setExpandedLocationGroups((prev) => {
                                  const next = new Set(prev);
                                  if (next.has(group.id)) next.delete(group.id);
                                  else next.add(group.id);
                                  return next;
                                });
                              }}
                              className="flex w-full items-start justify-between gap-2 px-3 py-2.5 text-left hover:bg-slate-50"
                            >
                              <span>
                                <span className="block text-sm font-semibold text-slate-900">{group.label}</span>
                                {group.description ? (
                                  <span className="mt-0.5 block text-xs text-slate-500">{group.description}</span>
                                ) : null}
                              </span>
                              <svg
                                className={`mt-1 h-4 w-4 shrink-0 text-slate-500 transition ${
                                  expanded ? 'rotate-180' : ''
                                }`}
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path d="M6 9l6 6 6-6" />
                              </svg>
                            </button>
                          ) : group.description ? (
                            <p className="px-3 py-2 text-xs text-slate-500">{group.description}</p>
                          ) : null}

                          {expanded || !showGroupHeader ? (
                            <div className="pb-1">
                              {group.options.map((opt) => {
                                const selected = conversionLocation === opt.value;
                                return (
                                  <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => {
                                      const defaults = conversionLocationDefaults[opt.value] || {};
                                      const next = {
                                        ...data,
                                        conversionLocation: opt.value,
                                        ...defaults,
                                        facebookPage: defaults.facebookPage || data.facebookPage,
                                        liveVideoInstagram:
                                          defaults.liveVideoInstagram || data.liveVideoInstagram,
                                      };
                                      onChange(next);
                                      setLocationMenuOpen(false);
                                      setLiveVideoEditOpen(false);
                                      setPageMenuOpen(false);
                                    }}
                                    className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition ${
                                      selected
                                        ? 'bg-[#E7F3FF] font-medium text-slate-900'
                                        : 'text-slate-700 hover:bg-slate-50'
                                    }`}
                                  >
                                    <span
                                      className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                                        selected
                                          ? 'border-[#1877F2] bg-[#1877F2]'
                                          : 'border-slate-400 bg-white'
                                      }`}
                                      aria-hidden
                                    >
                                      {selected ? (
                                        <span className="h-1.5 w-1.5 rounded-full bg-white" />
                                      ) : null}
                                    </span>
                                    {opt.label}
                                  </button>
                                );
                              })}
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : null}
            </div>
          </div>

          {isInstagramLive ? (
            <div className="space-y-4">
              <div>
                <p className="text-[13px] font-semibold text-slate-800">Live video location</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Select the Instagram profile that you&apos;ll go live from
                </p>
                {(() => {
                  const profile =
                    instagramLiveProfileOptions.find((opt) => opt.value === data.liveVideoInstagram) ||
                    instagramLiveProfileOptions[0];
                  return (
                    <div className="relative mt-2">
                      <button
                        type="button"
                        onClick={() => setLiveVideoEditOpen((v) => !v)}
                        className="group flex w-full items-center gap-3 rounded-lg bg-[#F0F2F5] px-3 py-3 text-left hover:bg-slate-200/80"
                      >
                        <span
                          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                          style={{ backgroundColor: profile?.avatarColor || '#F5A623' }}
                          aria-hidden
                        >
                          {profile?.avatarInitials || 'IG'}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-slate-900">
                            {profile?.label || 'Instagram'}
                          </span>
                          <span className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-600">
                            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                              <path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm10 2H7a3 3 0 00-3 3v10a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3zm-5 3.5A4.5 4.5 0 1112 16.5 4.5 4.5 0 0112 7.5zm0 2A2.5 2.5 0 1014.5 12 2.5 2.5 0 0012 9.5zM17.5 6.75a1 1 0 11-1 1 1 1 0 011-1z" />
                            </svg>
                            @{profile?.handle || data.liveVideoInstagram || 'select_profile'}
                          </span>
                        </span>
                        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#1877F2] group-hover:bg-white/80">
                          <PencilIcon />
                        </span>
                      </button>
                      {liveVideoEditOpen ? (
                        <>
                          <button
                            type="button"
                            className="fixed inset-0 z-10 cursor-default"
                            aria-label="Close live video profile menu"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setLiveVideoEditOpen(false);
                            }}
                          />
                          <div className="absolute left-0 right-0 z-20 mt-1 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                            {instagramLiveProfileOptions.map((opt) => {
                              const selected = data.liveVideoInstagram === opt.value;
                              return (
                                <button
                                  key={opt.value}
                                  type="button"
                                  onClick={() => {
                                    set('liveVideoInstagram', opt.value);
                                    setLiveVideoEditOpen(false);
                                  }}
                                  className={`flex w-full items-center gap-3 px-3 py-2.5 text-left ${
                                    selected ? 'bg-[#E7F3FF]' : 'hover:bg-slate-50'
                                  }`}
                                >
                                  <span
                                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                                    style={{ backgroundColor: opt.avatarColor }}
                                    aria-hidden
                                  >
                                    {opt.avatarInitials}
                                  </span>
                                  <span className="min-w-0">
                                    <span className="block text-sm font-semibold text-slate-900">{opt.label}</span>
                                    <span className="block text-xs text-slate-500">@{opt.handle}</span>
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </>
                      ) : null}
                    </div>
                  );
                })()}
              </div>

              <div className="border-b border-slate-200 pb-4">
                <p className="text-[13px] font-semibold text-slate-800">Facebook Page</p>
                <div className="mt-2 flex items-center gap-2.5">
                  <span
                    className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1877F2] text-white"
                    aria-hidden
                  >
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14 8h3V5h-3c-2.2 0-4 1.8-4 4v2H7v3h3v7h3v-7h3l1-3h-4V9c0-.6.4-1 1-1z" />
                    </svg>
                  </span>
                  <span className="text-sm font-medium text-slate-900">
                    {labelFromOptions(facebookPageOptions, data.facebookPage) !== '—'
                      ? labelFromOptions(facebookPageOptions, data.facebookPage)
                      : data.facebookPage || 'Select Page'}
                  </span>
                </div>
              </div>
            </div>
          ) : null}

          {isFormsMessenger ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-3">
              <p className="text-sm font-semibold text-emerald-900">Recommendation</p>
              <p className="mt-1 text-xs leading-relaxed text-emerald-900/90">
                You could get 14-24% lower cost per lead by choosing website and instant forms.
              </p>
              <div className="mt-2 flex flex-wrap gap-3 text-sm font-semibold text-[#1877F2]">
                <button type="button" className="hover:underline">
                  Apply now
                </button>
                <button type="button" className="hover:underline">
                  View in ad set
                </button>
              </div>
            </div>
          ) : null}

          {needsPagePicker ? (
            <div>
              <p className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-800">
                Facebook Page
                <MetaInfoIcon />
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                Choose the Page that you want to promote.
              </p>

              {(() => {
                const selectedPage =
                  facebookPageOptions.find((opt) => opt.value === data.facebookPage) || null;
                const filteredPages = facebookPageOptions.filter((opt) => {
                  const q = pageSearch.trim().toLowerCase();
                  if (!q) return true;
                  return (
                    opt.label.toLowerCase().includes(q) ||
                    String(opt.pageId || '').includes(q)
                  );
                });

                return (
                  <div className="relative mt-2">
                    <button
                      type="button"
                      onClick={() => setPageMenuOpen((v) => !v)}
                      className="flex w-full items-center justify-between gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-left text-sm text-slate-900 hover:border-slate-400 focus:border-[#1877F2] focus:ring-2 focus:ring-[#1877F2]/20"
                    >
                      <span className="flex min-w-0 items-center gap-2.5">
                        {selectedPage ? (
                          <>
                            <span
                              className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[10px] font-bold text-white"
                              style={{ backgroundColor: selectedPage.avatarColor || '#1877F2' }}
                              aria-hidden
                            >
                              {selectedPage.avatarInitials || selectedPage.label.slice(0, 2)}
                            </span>
                            <span className="truncate font-medium">{selectedPage.label}</span>
                          </>
                        ) : (
                          <span className="text-slate-500">Select Page</span>
                        )}
                      </span>
                      <svg
                        className={`h-4 w-4 shrink-0 text-slate-500 transition ${pageMenuOpen ? 'rotate-180' : ''}`}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </button>

                    {pageMenuOpen ? (
                      <>
                        <button
                          type="button"
                          className="fixed inset-0 z-10 cursor-default"
                          aria-label="Close Facebook Page menu"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setPageMenuOpen(false);
                            setPageSearch('');
                          }}
                        />
                        <div className="absolute left-0 right-0 z-20 mt-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                          <div className="border-b border-slate-100 p-2">
                            <div className="relative">
                              <svg
                                className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-slate-400"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <circle cx="11" cy="11" r="7" />
                                <path d="M20 20l-3-3" />
                              </svg>
                              <input
                                type="search"
                                value={pageSearch}
                                onChange={(e) => setPageSearch(e.target.value)}
                                placeholder="Search by Page name or ID"
                                className="w-full rounded-lg border border-slate-200 bg-white py-2 pr-3 pl-9 text-sm outline-none focus:border-[#1877F2]"
                                autoFocus
                              />
                            </div>
                          </div>

                          <div className="max-h-64 overflow-y-auto py-1">
                            <button
                              type="button"
                              onClick={() => setPersonalPagesOpen((v) => !v)}
                              className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left hover:bg-slate-50"
                            >
                              <span>
                                <span className="block text-sm font-semibold text-slate-900">Personal</span>
                                <span className="mt-0.5 block text-xs text-slate-500">
                                  {filteredPages.length} Pages
                                </span>
                              </span>
                              <svg
                                className={`h-4 w-4 shrink-0 text-slate-500 transition ${personalPagesOpen ? 'rotate-90' : ''}`}
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path d="M9 6l6 6-6 6" />
                              </svg>
                            </button>

                            {personalPagesOpen
                              ? filteredPages.map((opt) => {
                                  const selected = data.facebookPage === opt.value;
                                  return (
                                    <button
                                      key={opt.value}
                                      type="button"
                                      onClick={() => {
                                        set('facebookPage', opt.value);
                                        setPageMenuOpen(false);
                                        setPageSearch('');
                                      }}
                                      className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left ${
                                        selected
                                          ? 'bg-[#E7F3FF] text-slate-900'
                                          : 'text-slate-700 hover:bg-slate-50'
                                      }`}
                                    >
                                      <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center" aria-hidden>
                                        {selected ? (
                                          <svg
                                            className="h-4 w-4 text-[#1877F2]"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="3"
                                          >
                                            <path d="M5 12l5 5L20 7" />
                                          </svg>
                                        ) : null}
                                      </span>
                                      <span
                                        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[11px] font-bold text-white"
                                        style={{ backgroundColor: opt.avatarColor || '#1877F2' }}
                                        aria-hidden
                                      >
                                        {opt.avatarInitials || opt.label.slice(0, 2)}
                                      </span>
                                      <span className="min-w-0">
                                        <span className="block text-sm font-semibold text-slate-900">
                                          {opt.label}
                                        </span>
                                        {opt.pageId ? (
                                          <span className="mt-0.5 block text-xs text-slate-500">
                                            ID: {opt.pageId}
                                          </span>
                                        ) : null}
                                      </span>
                                    </button>
                                  );
                                })
                              : null}
                          </div>

                          <div className="border-t border-slate-100 px-3 py-2.5">
                            <button
                              type="button"
                              className="text-sm font-medium text-[#1877F2] hover:underline"
                            >
                              Can&apos;t find a Page? Learn more
                            </button>
                          </div>
                        </div>
                      </>
                    ) : null}
                  </div>
                );
              })()}
            </div>
          ) : null}

          {!hidePixelFields ? (
            <div>
              <p className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-800">
                Conversion location value rules
                <MetaInfoIcon />
              </p>
              <p className="mt-1 text-sm text-slate-900">
                Enabled: {data.locationValueRulesEnabled ? 'Yes' : 'No'}
              </p>
            </div>
          ) : null}

          <div>
            <p className="text-[13px] font-semibold text-slate-800">Performance goal</p>
            <p className="mt-0.5 text-xs text-slate-500">
              How you measure success for your ads.{' '}
              <button type="button" className="font-medium text-[#1877F2] hover:underline">
                About performance goals
              </button>
            </p>
            <MetaSelect
              className="mt-2"
              value={
                isInstagramLive &&
                !instagramLivePerformanceGoalOptions.some((o) => o.value === data.performanceGoal)
                  ? 'maximize_conversions'
                  : data.performanceGoal
              }
              onChange={(e) => set('performanceGoal', e.target.value)}
            >
              {(isInstagramLive ? instagramLivePerformanceGoalOptions : performanceGoalOptions).map(
                (opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                )
              )}
            </MetaSelect>
            {data.performanceGoal === 'maximize_leads' ? (
              <p className="mt-1.5 text-xs text-slate-500">
                We&apos;ll try to deliver your ads to help you get the most leads possible.
              </p>
            ) : null}
          </div>

          {isInstagramLive && data.performanceGoal === 'maximize_conversions' ? (
            <div>
              <p className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-800">
                <span className="text-rose-500">*</span> Dataset
                <MetaInfoIcon />
              </p>
              <div className="mt-2 rounded-lg border border-[#B7D2F5] bg-[#E7F3FF] px-3.5 py-3">
                <div className="flex gap-2.5">
                  <span
                    className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-500 text-[11px] font-semibold text-slate-600"
                    aria-hidden
                  >
                    i
                  </span>
                  <p className="text-xs leading-relaxed text-slate-700">
                    A dataset (formerly known as pixel) is required. To publish, set up your dataset or switch to a
                    different optimisation, such as landing page views.{' '}
                    <button type="button" className="font-medium text-[#1877F2] hover:underline">
                      About datasets
                    </button>
                  </p>
                </div>
                <button
                  type="button"
                  className="mt-3 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                >
                  Create dataset
                </button>
              </div>
            </div>
          ) : null}

          {!hidePixelFields ? (
          <>
          <div>
            <p className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-800">
              <span className="text-rose-500">*</span> Dataset
              <MetaInfoIcon />
            </p>
            <p className="mt-0.5 text-xs text-slate-500">Track actions that people take on your website.</p>

            <div className="relative mt-2">
              <button
                type="button"
                onClick={() => setDatasetMenuOpen((v) => !v)}
                className="flex w-full items-center justify-between gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-left text-sm text-slate-900 hover:border-slate-400 focus:border-[#1877F2] focus:ring-2 focus:ring-[#1877F2]/20"
              >
                <span>
                  {labelFromOptions(datasetOptions, data.dataset) || 'Select dataset'}
                </span>
                <svg
                  className={`h-4 w-4 shrink-0 text-slate-500 transition ${datasetMenuOpen ? 'rotate-180' : ''}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {datasetMenuOpen ? (
                <>
                  <button
                    type="button"
                    className="fixed inset-0 z-10 cursor-default"
                    aria-label="Close dataset menu"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setDatasetMenuOpen(false);
                      setDatasetSearch('');
                    }}
                  />
                  <div className="absolute left-0 right-0 z-20 mt-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                    <div className="border-b border-slate-100 p-2">
                      <div className="relative">
                        <svg
                          className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-slate-400"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle cx="11" cy="11" r="7" />
                          <path d="M20 20l-3-3" />
                        </svg>
                        <input
                          type="search"
                          value={datasetSearch}
                          onChange={(e) => setDatasetSearch(e.target.value)}
                          placeholder="Search"
                          className="w-full rounded-lg border border-slate-200 bg-white py-2 pr-3 pl-9 text-sm outline-none focus:border-[#1877F2]"
                          autoFocus
                        />
                      </div>
                    </div>

                    <div className="max-h-56 overflow-y-auto py-1">
                      <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        Inactive datasets
                      </p>
                      {datasetOptions
                        .filter((opt) =>
                          opt.label.toLowerCase().includes(datasetSearch.trim().toLowerCase())
                        )
                        .map((opt) => {
                          const selected = data.dataset === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => {
                                set('dataset', opt.value);
                                setDatasetMenuOpen(false);
                                setDatasetSearch('');
                              }}
                              className={`flex w-full items-start gap-3 px-3 py-2.5 text-left ${
                                selected
                                  ? 'bg-[#E7F3FF] text-slate-900'
                                  : 'text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <span
                                className={`mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                                  selected
                                    ? 'border-[#1877F2] bg-[#1877F2]'
                                    : 'border-slate-400 bg-white'
                                }`}
                                aria-hidden
                              >
                                {selected ? (
                                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                                ) : null}
                              </span>
                              <span className="min-w-0">
                                <span className={`block text-sm ${selected ? 'font-semibold' : 'font-medium'}`}>
                                  {opt.label}
                                </span>
                                {opt.datasetId ? (
                                  <span className="mt-0.5 block text-xs text-slate-500">
                                    Dataset ID: {opt.datasetId}
                                  </span>
                                ) : null}
                              </span>
                            </button>
                          );
                        })}
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>

          <div>
            <p className="text-[13px] font-semibold text-slate-800">
              <span className="text-rose-500">*</span> Conversion event
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              The action that you want people to take when they see your ads.{' '}
              <button type="button" className="font-medium text-[#1877F2] hover:underline">
                About conversion events
              </button>
            </p>

            <div className="relative mt-2">
              <button
                type="button"
                onClick={() => setEventMenuOpen((v) => !v)}
                className="flex w-full items-center justify-between gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-left text-sm text-slate-900 hover:border-slate-400 focus:border-[#1877F2] focus:ring-2 focus:ring-[#1877F2]/20"
              >
                <span>
                  {labelFromOptions(conversionEventOptions, data.conversionEvent) || 'Select conversion event'}
                </span>
                <svg
                  className={`h-4 w-4 shrink-0 text-slate-500 transition ${eventMenuOpen ? 'rotate-180' : ''}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {eventMenuOpen ? (
                <>
                  <button
                    type="button"
                    className="fixed inset-0 z-10 cursor-default"
                    aria-label="Close conversion event menu"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setEventMenuOpen(false);
                      setEventSearch('');
                      setHoveredDisabledEvent(null);
                    }}
                  />
                  <div className="absolute left-0 right-0 z-20 mt-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                    <div className="border-b border-slate-100 p-2">
                      <div className="relative">
                        <svg
                          className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-slate-400"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle cx="11" cy="11" r="7" />
                          <path d="M20 20l-3-3" />
                        </svg>
                        <input
                          type="search"
                          value={eventSearch}
                          onChange={(e) => setEventSearch(e.target.value)}
                          placeholder="Search"
                          className="w-full rounded-lg border border-slate-200 bg-white py-2 pr-3 pl-9 text-sm outline-none focus:border-[#1877F2]"
                          autoFocus
                        />
                      </div>
                    </div>

                    <div className="max-h-64 overflow-y-auto py-1">
                      <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        Inactive events
                      </p>
                      {conversionEventOptions
                        .filter((opt) =>
                          opt.label.toLowerCase().includes(eventSearch.trim().toLowerCase())
                        )
                        .map((opt) => {
                          const selected = data.conversionEvent === opt.value;
                          const disabled = opt.available === false;
                          return (
                            <div key={opt.value} className="relative">
                              <button
                                type="button"
                                disabled={disabled}
                                onMouseEnter={() =>
                                  disabled ? setHoveredDisabledEvent(opt.value) : setHoveredDisabledEvent(null)
                                }
                                onMouseLeave={() => setHoveredDisabledEvent(null)}
                                onClick={() => {
                                  if (disabled) return;
                                  set('conversionEvent', opt.value);
                                  setEventMenuOpen(false);
                                  setEventSearch('');
                                  setHoveredDisabledEvent(null);
                                }}
                                className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm ${
                                  disabled
                                    ? 'cursor-not-allowed text-slate-400'
                                    : selected
                                      ? 'bg-[#E7F3FF] font-medium text-slate-900'
                                      : 'text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                <span
                                  className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                                    disabled
                                      ? 'border-slate-300 bg-slate-100'
                                      : selected
                                        ? 'border-[#1877F2] bg-[#1877F2]'
                                        : 'border-slate-400 bg-white'
                                  }`}
                                  aria-hidden
                                >
                                  {selected && !disabled ? (
                                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                                  ) : null}
                                </span>
                                {opt.label}
                              </button>
                              {disabled && hoveredDisabledEvent === opt.value && opt.disabledReason ? (
                                <div className="absolute top-1/2 left-full z-30 ml-2 w-56 -translate-y-1/2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs leading-relaxed text-slate-700 shadow-lg">
                                  {opt.disabledReason}
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                    </div>

                    <div className="border-t border-slate-100 p-2">
                      <button
                        type="button"
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                      >
                        Create custom conversion
                      </button>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>

          <div className="rounded-lg border border-amber-300 bg-amber-50 px-3.5 py-3">
            <div className="flex gap-2">
              <span className="mt-0.5 text-amber-600" aria-hidden>
                ▲
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-amber-950">Set up conversion event</p>
                <p className="mt-1 text-xs leading-relaxed text-amber-900/90">
                  The dataset that you&apos;ve selected doesn&apos;t have any conversion events set up. Set up a
                  conversion event to help you get better results.{' '}
                  <button type="button" className="font-medium text-[#1877F2] hover:underline">
                    Learn how to set up a conversion event
                  </button>
                </p>
                <button
                  type="button"
                  className="mt-3 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                >
                  Set up conversion event
                </button>
              </div>
            </div>
          </div>

          <div>
            <p className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-800">
              Attribution model
              <MetaInfoIcon />
            </p>

            <div className="relative mt-2">
              <button
                type="button"
                onClick={() => setAttributionModelMenuOpen((v) => !v)}
                className="flex w-full items-center justify-between gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-left text-sm text-slate-900 hover:border-slate-400 focus:border-[#1877F2] focus:ring-2 focus:ring-[#1877F2]/20"
              >
                <span>
                  {labelFromOptions(attributionOptions, data.attributionModel) || 'Select attribution model'}
                </span>
                <svg
                  className={`h-4 w-4 shrink-0 text-slate-500 transition ${
                    attributionModelMenuOpen ? 'rotate-180' : ''
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {attributionModelMenuOpen ? (
                <>
                  <button
                    type="button"
                    className="fixed inset-0 z-10 cursor-default"
                    aria-label="Close attribution model menu"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setAttributionModelMenuOpen(false);
                    }}
                  />
                  <div className="absolute left-0 right-0 z-20 mt-1 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                    {attributionOptions.map((opt) => {
                      const selected = data.attributionModel === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            set('attributionModel', opt.value);
                            setAttributionModelMenuOpen(false);
                          }}
                          className={`flex w-full items-start gap-3 px-3 py-3 text-left ${
                            selected ? 'bg-[#E7F3FF]' : 'hover:bg-slate-50'
                          }`}
                        >
                          <span
                            className={`mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                              selected
                                ? 'border-[#1877F2] bg-[#1877F2]'
                                : 'border-slate-400 bg-white'
                            }`}
                            aria-hidden
                          >
                            {selected ? (
                              <span className="h-1.5 w-1.5 rounded-full bg-white" />
                            ) : null}
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-semibold text-slate-900">{opt.label}</span>
                            {opt.description ? (
                              <span className="mt-1 block text-xs leading-relaxed text-slate-500">
                                {opt.description}{' '}
                                <span
                                  role="link"
                                  tabIndex={0}
                                  onClick={(e) => e.stopPropagation()}
                                  onKeyDown={(e) => e.stopPropagation()}
                                  className="font-medium text-[#1877F2] hover:underline"
                                >
                                  {opt.aboutLabel}
                                </span>
                              </span>
                            ) : null}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : null}
            </div>
          </div>
          </>
          ) : null}

          <div>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[13px] font-semibold text-slate-800">Cost per result goal</p>
                {editingCostGoal ? (
                  <MetaInput
                    className="mt-2 max-w-[200px]"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="None"
                    value={data.costPerResultGoal}
                    onChange={(e) => set('costPerResultGoal', e.target.value)}
                    onBlur={() => setEditingCostGoal(false)}
                    autoFocus
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditingCostGoal(true)}
                    className="mt-1 text-sm text-slate-900 hover:underline"
                  >
                    {data.costPerResultGoal ? `₹${data.costPerResultGoal}` : 'None'}
                  </button>
                )}
              </div>
              {data.costPerResultGoal ? (
                <button
                  type="button"
                  onClick={() => set('costPerResultGoal', '')}
                  className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Clear cost per result goal"
                >
                  ✕
                </button>
              ) : null}
            </div>
          </div>

          {data.conversionLocation === 'website_and_calls' ? (
            <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-3.5">
              <div>
                <p className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-800">
                  Conversion value rules
                  <MetaInfoIcon />
                </p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  Adjust the value of conversions from different locations based on how much they are worth to your
                  business. This will be used to guide delivery.
                </p>
              </div>

              <div className="space-y-2">
                <label
                  className={`flex cursor-pointer gap-3 rounded-lg border px-3 py-3 ${
                    (data.conversionValueWorthMode || 'same') === 'same'
                      ? 'border-[#1877F2] bg-[#E7F3FF]'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="conversionValueWorthMode"
                    checked={(data.conversionValueWorthMode || 'same') === 'same'}
                    onChange={() => set('conversionValueWorthMode', 'same')}
                    className="mt-0.5"
                  />
                  <span className="text-sm font-medium text-slate-800">
                    Conversions from different locations are worth the same
                  </span>
                </label>

                <label
                  className={`flex cursor-pointer gap-3 rounded-lg border px-3 py-3 ${
                    data.conversionValueWorthMode === 'different'
                      ? 'border-[#1877F2] bg-[#E7F3FF]'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="conversionValueWorthMode"
                    checked={data.conversionValueWorthMode === 'different'}
                    onChange={() => set('conversionValueWorthMode', 'different')}
                    className="mt-0.5"
                  />
                  <span className="text-sm font-medium text-slate-800">
                    Conversions from different locations have different worth
                  </span>
                </label>
              </div>

              {data.conversionValueWorthMode === 'different' ? (
                <div className="space-y-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <span className="w-40 shrink-0 text-sm font-medium text-slate-800">Website conversions</span>
                    <MetaSelect
                      className="bg-white sm:w-36"
                      value={data.websiteConversionAdjust || 'increase'}
                      onChange={(e) => set('websiteConversionAdjust', e.target.value)}
                    >
                      <option value="increase">Increase</option>
                      <option value="decrease">Decrease</option>
                    </MetaSelect>
                    <div className="relative sm:w-28">
                      <MetaInput
                        type="number"
                        min="20"
                        max={data.websiteConversionAdjust === 'decrease' ? '90' : '1000'}
                        value={data.websiteConversionPercent || ''}
                        onChange={(e) => set('websiteConversionPercent', e.target.value)}
                        className="bg-white pr-8"
                      />
                      <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-slate-500">
                        %
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <span className="w-40 shrink-0 text-sm font-medium text-slate-800">Call conversions</span>
                    <MetaSelect
                      className="bg-white sm:w-36"
                      value={data.callConversionAdjust || 'decrease'}
                      onChange={(e) => set('callConversionAdjust', e.target.value)}
                    >
                      <option value="increase">Increase</option>
                      <option value="decrease">Decrease</option>
                    </MetaSelect>
                    <div className="relative sm:w-28">
                      <MetaInput
                        type="number"
                        min="20"
                        max={data.callConversionAdjust === 'decrease' ? '90' : '1000'}
                        value={data.callConversionPercent || ''}
                        onChange={(e) => set('callConversionPercent', e.target.value)}
                        className="bg-white pr-8"
                      />
                      <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-slate-500">
                        %
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2.5">
                    <MetaInfoIcon />
                    <p className="text-xs leading-relaxed text-sky-900/90">
                      Value adjustments need to be between 20% and 1,000% for increase and between 20% and 90% for
                      decrease.
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {showPreferredBanner && showPreferredAudienceBanner ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/80 px-3.5 py-3">
              <div className="flex gap-2.5">
                <span
                  className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center text-emerald-600"
                  aria-hidden
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                    <path d="M12 2l1.4 4.2L18 7.6l-3.4 3 1 4.4L12 12.8 8.4 15l1-4.4L6 7.6l4.6-1.4L12 2zm6.5 10.5l.7 2.1 2.2.7-1.7 1.5.5 2.2-1.7-1.1-1.7 1.1.5-2.2-1.7-1.5 2.2-.7.7-2.1z" />
                  </svg>
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="inline-flex flex-wrap items-center gap-1.5 text-sm font-semibold text-emerald-950">
                      You could get 103% more conversions from preferred audiences
                      <MetaInfoIcon />
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowPreferredAudienceBanner(false)}
                      className="rounded p-0.5 text-emerald-700 hover:bg-emerald-100"
                      aria-label="Dismiss"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-emerald-900/90">
                    Value rules let you prioritise the audiences that matter most to your business by increasing or
                    decreasing bids. This can help drive more conversions from people who are most relevant to your
                    business goals.{' '}
                    <button type="button" className="font-medium text-[#1877F2] hover:underline">
                      About value rules
                    </button>
                  </p>
                  <button
                    type="button"
                    onClick={() => set('valueRulesEnabled', true)}
                    className="mt-3 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                  >
                    Create a rule set
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {!showPreferredBanner && !hidePixelFields && showValueRuleBanner ? (
            <div className="rounded-lg border border-sky-200 bg-sky-50 px-3.5 py-3">
              <div className="flex gap-2">
                <MetaInfoIcon />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-sky-950">Apply an existing value rule set</p>
                    <button
                      type="button"
                      onClick={() => {
                        setShowValueRuleBanner(false);
                        set('showValueRuleSetBanner', false);
                      }}
                      className="rounded p-0.5 text-sky-700 hover:bg-sky-100"
                      aria-label="Dismiss"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-sky-900/90">
                    You could apply Placement to this ad set to get more outcomes from your preferred audiences,
                    placements or conversion locations.
                  </p>
                  <div className="mt-2 flex gap-3 text-sm font-semibold text-[#1877F2]">
                    <button type="button" className="hover:underline">
                      Preview
                    </button>
                    <button type="button" className="hover:underline">
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {isFormsMessenger ? (
            <AccordionEditRow
              label="Value rules"
              info
              value={data.valueRulesEnabled ? 'Enabled' : 'Not set'}
              open={valueRulesOpen}
              onToggle={() => setValueRulesOpen((v) => !v)}
            >
              <div className="space-y-3 pt-1">
                <p className="text-xs leading-relaxed text-slate-600">
                  Tell us how much certain audiences, conversion locations and placements are worth to your
                  business. Our system will optimise for outcomes based on these rules.{' '}
                  <button type="button" className="font-medium text-[#1877F2] hover:underline">
                    About value rules
                  </button>
                </p>
                <button
                  type="button"
                  onClick={() => set('valueRulesEnabled', true)}
                  className="inline-flex items-center gap-2 rounded-lg px-1 py-1.5 text-sm font-semibold text-[#1877F2] hover:bg-[#D8EBFF]"
                >
                  <span
                    className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#1877F2] text-base leading-none"
                    aria-hidden
                  >
                    +
                  </span>
                  Create a rule set
                </button>
              </div>
            </AccordionEditRow>
          ) : (
            <div>
              <p className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-800">
                Value rules
                <MetaInfoIcon />
              </p>
              <p className="mt-1 text-sm text-slate-900">
                Enabled: {data.valueRulesEnabled ? 'Yes' : 'No'}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowConversionMore((v) => !v)}
            className="inline-flex items-center gap-1 text-sm font-medium text-[#1877F2] hover:underline"
          >
            {showConversionMore ? 'Hide options' : 'Show more options'}
            <svg
              className={`h-3.5 w-3.5 transition ${showConversionMore ? 'rotate-180' : ''}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

          {!hideShowMoreFields && showConversionMore ? (
            <div className="space-y-3">
              <div className="overflow-hidden rounded-lg border border-slate-300 bg-[#F0F2F5]">
                <button
                  type="button"
                  onClick={() => setEngageInfoOpen((v) => !v)}
                  className="flex w-full items-center gap-2.5 px-3.5 py-3 text-left hover:bg-slate-200/50"
                >
                  <span
                    className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-500 text-[11px] font-semibold text-slate-600"
                    aria-hidden
                  >
                    i
                  </span>
                  <span className="min-w-0 flex-1 text-sm font-medium text-slate-900">
                    Introducing engage-through attribution
                  </span>
                  <svg
                    className={`h-4 w-4 shrink-0 text-slate-600 transition ${engageInfoOpen ? 'rotate-180' : ''}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {engageInfoOpen ? (
                  <div className="border-t border-slate-300/80 px-3.5 pb-3.5 pt-2">
                    <p className="text-sm leading-relaxed text-slate-700">
                      Formerly engaged-view, engage-through is when someone interacts with your ad and converts
                      within one day. Reported as 1-day engagement, we&apos;re updating this attribution to better
                      measure your ad performance. 1-day engagement will include clicks on ads (excluding link
                      clicks) and video views after 5 seconds.
                    </p>
                    <button
                      type="button"
                      className="mt-2.5 text-sm font-medium text-[#1877F2] hover:underline"
                    >
                      About engage-through
                    </button>
                  </div>
                ) : null}
              </div>

              <div
                className={`rounded-xl border ${
                  attributionSettingsOpen ? 'border-[#B7D2F5] bg-[#E7F3FF]' : 'border-slate-200 bg-white'
                } ${openAttrMenu ? 'overflow-visible' : 'overflow-hidden'}`}
              >
                <button
                  type="button"
                  onClick={() => setAttributionSettingsOpen((v) => !v)}
                  className="group flex w-full items-start gap-3 px-3 py-2.5 text-left"
                >
                  <div className="min-w-0 flex-1">
                    <p className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-800">
                      Attribution settings
                      <MetaInfoIcon />
                    </p>
                    {!attributionSettingsOpen ? (
                      <p className="mt-1 text-sm text-slate-900">
                        {data.clickThroughWindow || '7'}-day click
                        {data.viewThroughWindow && data.viewThroughWindow !== 'none'
                          ? `, ${data.viewThroughWindow}-day view`
                          : ''}
                      </p>
                    ) : null}
                  </div>
                  <span
                    className={`mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#1877F2] transition ${
                      attributionSettingsOpen
                        ? 'bg-white/80 opacity-100'
                        : 'opacity-0 group-hover:bg-[#E7F3FF] group-hover:opacity-100'
                    }`}
                    aria-hidden
                  >
                    {attributionSettingsOpen ? (
                      <svg
                        className="h-4 w-4 text-slate-500"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M6 15l6-6 6 6" />
                      </svg>
                    ) : (
                      <PencilIcon />
                    )}
                  </span>
                </button>

                {attributionSettingsOpen ? (
                  <div className="space-y-4 border-t border-[#B7D2F5]/70 bg-white px-3 py-3">
                    <div>
                      <p className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-800">
                        Click-through
                        <MetaInfoIcon />
                      </p>
                      <AttributionWindowMenu
                        menuId="click"
                        value={data.clickThroughWindow || '7'}
                        options={clickThroughOptions}
                        onChange={(v) => set('clickThroughWindow', v)}
                      />
                    </div>

                    <div>
                      <p className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-800">
                        Engage-through
                        <MetaInfoIcon />
                      </p>
                      <MetaSelect
                        className="mt-2 cursor-not-allowed bg-slate-100 text-slate-500"
                        value={data.engageThroughWindow || 'none'}
                        disabled
                        onChange={() => {}}
                      >
                        <option value="none">None</option>
                      </MetaSelect>
                    </div>

                    <div>
                      <p className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-800">
                        View-through
                        <MetaInfoIcon />
                      </p>
                      <AttributionWindowMenu
                        menuId="view"
                        value={data.viewThroughWindow || '1'}
                        options={viewThroughOptions}
                        onChange={(v) => set('viewThroughWindow', v)}
                        openUp
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </MetaCard>

      {isInstagramLive ? (
        <MetaCard title="Live video ad">
          <p className="text-sm leading-relaxed text-slate-600">
            Use settings that are suggested for a live video ad. This will adjust your budget and schedule to
            more efficiently deliver your ads and drive engagement.
          </p>

          <div className="mt-3 flex gap-2.5 rounded-lg border border-slate-200 bg-[#F0F2F5] px-3.5 py-3">
            <span
              className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-500 text-[11px] font-semibold text-slate-600"
              aria-hidden
            >
              i
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900">
                For better ad delivery, create your ad before going live
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                Select upcoming live video to create your ad in advance. Creating an ad at least 3 hours before
                going live allows time for review and reduces delivery delays.{' '}
                <button type="button" className="font-medium text-[#1877F2] hover:underline">
                  Learn more
                </button>
              </p>
            </div>
          </div>

          <div className="mt-3 space-y-2">
            <label
              className={`flex gap-3 rounded-lg border px-3 py-3 ${
                data.hasCurrentLiveVideo
                  ? (data.liveVideoAdType || 'upcoming') === 'current'
                    ? 'cursor-pointer border-[#1877F2] bg-[#E7F3FF]'
                    : 'cursor-pointer border-slate-200 hover:border-slate-300'
                  : 'cursor-not-allowed border-slate-200 bg-slate-50 opacity-60'
              }`}
            >
              <input
                type="radio"
                name="liveVideoAdType"
                checked={(data.liveVideoAdType || 'upcoming') === 'current'}
                disabled={!data.hasCurrentLiveVideo}
                onChange={() => set('liveVideoAdType', 'current')}
                className="mt-1"
              />
              <span
                className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm ring-1 ring-slate-200"
                aria-hidden
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <rect x="3" y="6" width="14" height="12" rx="2" />
                  <path d="M17 10l4-2v8l-4-2" />
                </svg>
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-slate-900">Current live video</span>
                <span className="mt-0.5 block text-xs text-slate-500">
                  Send people to a live video happening now
                </span>
              </span>
            </label>

            <label
              className={`flex cursor-pointer gap-3 rounded-lg border px-3 py-3 ${
                (data.liveVideoAdType || 'upcoming') === 'upcoming'
                  ? 'border-[#1877F2] bg-[#E7F3FF]'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <input
                type="radio"
                name="liveVideoAdType"
                checked={(data.liveVideoAdType || 'upcoming') === 'upcoming'}
                onChange={() => set('liveVideoAdType', 'upcoming')}
                className="mt-1"
              />
              <span
                className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm ring-1 ring-slate-200"
                aria-hidden
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <rect x="3" y="5" width="18" height="16" rx="2" />
                  <path d="M3 9h18" />
                  <path d="M8 3v4M16 3v4" />
                  <path d="M10 14l4 2.5L10 19v-5z" fill="currentColor" stroke="none" />
                </svg>
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-slate-900">Upcoming live video</span>
                <span className="mt-0.5 block text-xs text-slate-500">
                  Schedule an ad before going live
                </span>
              </span>
            </label>
          </div>
        </MetaCard>
      ) : null}

      <MetaCard id="adset-schedule" title="Budget & schedule">
        {(() => {
          const usesCampaignBudget = (campaignBudget?.budgetStrategy || 'campaign') === 'campaign';
          const effectiveBudgetType = usesCampaignBudget
            ? campaignBudget?.budgetType || 'daily'
            : data.budgetType || 'daily';
          const effectiveBudgetAmount = usesCampaignBudget
            ? campaignBudget?.dailyBudget || ''
            : data.dailyBudget || '';
          const budgetAmountNum = Number(effectiveBudgetAmount) || 0;
          const isLifetime = effectiveBudgetType === 'lifetime';
          const showAdScheduling = isLifetime || showScheduleMore;

          const toggleScheduleDay = (day) => {
            const current = data.adScheduleDays || [];
            const next = current.includes(day)
              ? current.filter((d) => d !== day)
              : [...current, day];
            set('adScheduleDays', next.length ? next : [day]);
          };

          return (
            <div className="space-y-5">
              {/* Budget amount — Campaign budget (readonly) vs Ad set budget (editable) */}
              <div>
                <p className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-800">
                  Budget
                  <MetaInfoIcon />
                </p>

                {usesCampaignBudget ? (
                  <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {campaignBudget?.advantagePlus !== false
                            ? 'Campaign budget (Advantage+)'
                            : 'Campaign budget'}
                        </p>
                        <p className="mt-1 text-sm text-slate-800">
                          {labelFromOptions(budgetTypeOptions, effectiveBudgetType)}
                          {budgetAmountNum > 0
                            ? ` · ₹${budgetAmountNum.toLocaleString('en-IN', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}`
                            : ''}
                        </p>
                        <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                          Budget is set at the campaign level and shared across ad sets for the best
                          opportunities.{' '}
                          <button type="button" className="font-medium text-[#1877F2] hover:underline">
                            About campaign budget
                          </button>
                        </p>
                      </div>
                    </div>
                    {!isLifetime && budgetAmountNum > 0 ? (
                      <p className="mt-2 text-xs leading-relaxed text-slate-500">
                        We&apos;ll spend around ₹{budgetAmountNum.toFixed(2)} per day across this campaign.
                        Your maximum daily spend is ₹{(budgetAmountNum * 1.75).toFixed(2)} and your maximum
                        weekly spend is ₹{(budgetAmountNum * 7).toFixed(2)}.
                      </p>
                    ) : null}
                    {isLifetime && budgetAmountNum > 0 ? (
                      <p className="mt-2 text-xs leading-relaxed text-slate-500">
                        We&apos;ll aim to spend ₹{budgetAmountNum.toFixed(2)} over the lifetime of this
                        campaign. You can set an ad schedule below for this ad set.
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <div className="mt-2 space-y-2">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <MetaSelect
                        value={data.budgetType || 'daily'}
                        onChange={(e) => {
                          const nextType = e.target.value;
                          const next = { ...data, budgetType: nextType };
                          if (nextType === 'lifetime' && !data.endDateEnabled) {
                            next.endDateEnabled = true;
                          }
                          onChange(next);
                        }}
                        className="sm:w-44"
                      >
                        {budgetTypeOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </MetaSelect>
                      <div className="relative flex-1">
                        <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-slate-500">
                          ₹
                        </span>
                        <MetaInput
                          type="number"
                          min="0"
                          step="0.01"
                          value={data.dailyBudget || ''}
                          onChange={(e) => set('dailyBudget', e.target.value)}
                          className="pl-7 pr-14"
                        />
                        <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-slate-500">
                          INR
                        </span>
                      </div>
                    </div>
                    {data.budgetType !== 'lifetime' && budgetAmountNum > 0 ? (
                      <p className="text-xs leading-relaxed text-slate-500">
                        We&apos;ll spend around ₹{budgetAmountNum.toFixed(2)} per day. Your maximum daily spend
                        is ₹{(budgetAmountNum * 1.75).toFixed(2)} and your maximum weekly spend is ₹
                        {(budgetAmountNum * 7).toFixed(2)}.{' '}
                        <button type="button" className="font-medium text-[#1877F2] hover:underline">
                          About daily budget
                        </button>
                      </p>
                    ) : null}
                    {data.budgetType === 'lifetime' && budgetAmountNum > 0 ? (
                      <p className="text-xs leading-relaxed text-slate-500">
                        We&apos;ll aim to spend ₹{budgetAmountNum.toFixed(2)} over the lifetime of this ad set.
                        Lifetime budgets work best with a start and end date.{' '}
                        <button type="button" className="font-medium text-[#1877F2] hover:underline">
                          About lifetime budget
                        </button>
                      </p>
                    ) : null}
                  </div>
                )}
              </div>

              {/* Schedule */}
              <div>
                <p className="text-[13px] font-semibold text-slate-800">Schedule</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Choose when your ads will start and stop running. Times use your ad account time zone (
                  {data.timezoneLabel || 'Asia/Kolkata'}).
                </p>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <MetaField label="Start date" required>
                    <MetaInput
                      type="date"
                      value={data.startDate}
                      onChange={(e) => set('startDate', e.target.value)}
                    />
                  </MetaField>
                  <MetaField label="Start time" required>
                    <MetaInput
                      type="time"
                      value={data.startTime || '09:00'}
                      onChange={(e) => set('startTime', e.target.value)}
                    />
                  </MetaField>
                </div>

                <div className="mt-2">
                  <MetaCheckRow
                    checked={Boolean(data.endDateEnabled) || isLifetime}
                    onChange={(v) => {
                      if (isLifetime && !usesCampaignBudget) return;
                      set('endDateEnabled', v);
                    }}
                    label="Set an end date"
                    description={
                      isLifetime && !usesCampaignBudget
                        ? 'Required for lifetime budgets.'
                        : 'Without an end date, your ads will run continuously from the start date.'
                    }
                  />
                </div>

                {data.endDateEnabled || isLifetime ? (
                  <div className="mt-2 grid gap-3 sm:grid-cols-2">
                    <MetaField label="End date" required={isLifetime}>
                      <MetaInput
                        type="date"
                        value={data.endDate}
                        min={data.startDate || undefined}
                        onChange={(e) => set('endDate', e.target.value)}
                      />
                    </MetaField>
                    <MetaField label="End time" required={isLifetime}>
                      <MetaInput
                        type="time"
                        value={data.endTime || '21:00'}
                        onChange={(e) => set('endTime', e.target.value)}
                      />
                    </MetaField>
                  </div>
                ) : null}

                {!data.endDateEnabled && !isLifetime ? (
                  <p className="mt-2 text-xs text-slate-500">
                    Ads will run continuously starting{' '}
                    {data.startDate
                      ? new Date(`${data.startDate}T${data.startTime || '09:00'}`).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })
                      : 'on the selected start date'}
                    .
                  </p>
                ) : null}
              </div>

              {/* Ad scheduling — Meta shows this for lifetime; also under Show more for daily */}
              {!isLifetime ? (
                <button
                  type="button"
                  onClick={() => setShowScheduleMore((v) => !v)}
                  className="inline-flex items-center gap-1 text-sm font-medium text-[#1877F2] hover:underline"
                >
                  {showScheduleMore ? 'Hide options' : 'Show more options'}
                  <svg
                    className={`h-3.5 w-3.5 transition ${showScheduleMore ? 'rotate-180' : ''}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
              ) : null}

              {showAdScheduling ? (
                <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-3.5">
                  <div>
                    <p className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-800">
                      Ad scheduling
                      <MetaInfoIcon />
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Choose when your ads can run. Your ad set must run for at least one hour.
                    </p>
                  </div>

                  <div className="space-y-2">
                    {adSchedulingModeOptions.map((opt) => (
                      <label
                        key={opt.value}
                        className={`flex cursor-pointer gap-3 rounded-lg border px-3 py-3 ${
                          (data.adSchedulingMode || 'all_time') === opt.value
                            ? 'border-[#1877F2] bg-[#E7F3FF]'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="adSchedulingMode"
                          checked={(data.adSchedulingMode || 'all_time') === opt.value}
                          onChange={() => set('adSchedulingMode', opt.value)}
                          className="mt-0.5"
                        />
                        <span>
                          <span className="block text-sm font-medium text-slate-800">{opt.label}</span>
                          <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">
                            {opt.description}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>

                  {(data.adSchedulingMode || 'all_time') === 'schedule' ? (
                    <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <div>
                        <p className="text-xs font-semibold text-slate-700">Days</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {adScheduleDayOptions.map((day) => {
                            const selected = (data.adScheduleDays || []).includes(day.value);
                            return (
                              <button
                                key={day.value}
                                type="button"
                                onClick={() => toggleScheduleDay(day.value)}
                                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                                  selected
                                    ? 'bg-[#1877F2] text-white'
                                    : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                                }`}
                              >
                                {day.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <MetaField label="From">
                          <MetaSelect
                            value={data.adScheduleStartHour || '09'}
                            onChange={(e) => set('adScheduleStartHour', e.target.value)}
                          >
                            {hourOptions.map((h) => (
                              <option key={h.value} value={h.value}>
                                {h.label}
                              </option>
                            ))}
                          </MetaSelect>
                        </MetaField>
                        <MetaField label="To">
                          <MetaSelect
                            value={data.adScheduleEndHour || '21'}
                            onChange={(e) => set('adScheduleEndHour', e.target.value)}
                          >
                            {hourOptions.map((h) => (
                              <option key={h.value} value={h.value}>
                                {h.label}
                              </option>
                            ))}
                          </MetaSelect>
                        </MetaField>
                      </div>
                      <p className="text-xs text-slate-500">
                        Schedule uses {data.timezoneLabel || 'Asia/Kolkata'} (ad account time zone).
                      </p>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {/* Dynamic creative — Meta places this with Budget & schedule on ad set */}
              <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2.5">
                <div>
                  <p className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-800">
                    Dynamic creative
                    <MetaInfoIcon />
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Automatically combine your creative assets to find better combinations for each person who
                    sees your ads.
                  </p>
                </div>
                <MetaToggle
                  checked={Boolean(data.dynamicCreative)}
                  onChange={(v) => set('dynamicCreative', v)}
                  label={data.dynamicCreative ? 'On' : 'Off'}
                />
              </div>
            </div>
          );
        })()}
      </MetaCard>

      <MetaCard
        id="adset-audience"
        title="Audience"
        badge={<AdvantageBadge on={data.advantageAudience !== false && !data.furtherLimitAudience} />}
      >
        {(() => {
          const advantageOn = data.advantageAudience !== false && !data.furtherLimitAudience;
          const locationTags =
            data.locationTags && data.locationTags.length
              ? data.locationTags
              : data.locations
                ? [{ value: 'legacy', label: String(data.locations), type: 'Location' }]
                : [];
          const locationQuery = (data.locationSearch || '').trim().toLowerCase();
          const filteredLocations = locationSuggestionOptions.filter((opt) => {
            if (locationTags.some((t) => t.value === opt.value)) return false;
            if (!locationQuery) return true;
            return opt.label.toLowerCase().includes(locationQuery);
          });
          const includedCustom = data.includedCustomAudiences || [];
          const excludedCustom = data.excludedCustomAudiences || [];
          const detailed = data.detailedTargeting || [];
          const languages = data.languages || [];
          const dtQuery = detailedTargetingSearch.trim().toLowerCase();

          const addLocation = (opt) => {
            onChange({
              ...data,
              locationTags: [...locationTags, { value: opt.value, label: opt.label, type: opt.type }],
              locationSearch: '',
            });
            setAudienceLocationMenuOpen(false);
          };
          const removeLocation = (value) => {
            set(
              'locationTags',
              locationTags.filter((t) => t.value !== value)
            );
          };
          const toggleListValue = (key, value) => {
            const list = data[key] || [];
            set(
              key,
              list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
            );
          };

          return (
            <div className="space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900">
                    {advantageOn ? 'Advantage+ audience' : 'Original audience options'}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    {advantageOn ? (
                      <>
                        We&apos;ll show your ads to people most likely to respond, using your audience controls and
                        suggestions.{' '}
                        <button type="button" className="font-medium text-[#1877F2] hover:underline">
                          About Advantage+ audience
                        </button>
                      </>
                    ) : (
                      'Your ads will only go to people who match the audience settings you choose.'
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (advantageOn) {
                      onChange({
                        ...data,
                        furtherLimitAudience: true,
                        advantageAudience: false,
                        ageAsSuggestion: false,
                        genderAsSuggestion: false,
                        detailedTargetingAsSuggestion: false,
                        customAudienceAsSuggestion: false,
                      });
                    } else {
                      onChange({
                        ...data,
                        furtherLimitAudience: false,
                        advantageAudience: true,
                        ageAsSuggestion: true,
                        genderAsSuggestion: true,
                        detailedTargetingAsSuggestion: true,
                        customAudienceAsSuggestion: true,
                      });
                    }
                  }}
                  className="shrink-0 text-sm font-semibold text-[#1877F2] hover:underline"
                >
                  {advantageOn ? 'Switch to original audience options' : 'Switch to Advantage+ audience'}
                </button>
              </div>

              <div>
                <p className="text-[13px] font-semibold text-slate-800">Use a saved audience</p>
                <MetaSelect
                  className="mt-2"
                  value={data.savedAudience || ''}
                  onChange={(e) => set('savedAudience', e.target.value)}
                >
                  {savedAudienceOptions.map((opt) => (
                    <option key={opt.value || 'empty'} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </MetaSelect>
              </div>

              {/* Audience controls */}
              <div className="space-y-3">
                <div>
                  <p className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-800">
                    Audience controls
                    <MetaInfoIcon />
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    These settings limit who can see your ads. Meta won&apos;t go beyond these controls.
                  </p>
                </div>

                <div>
                  <p className="text-[13px] font-semibold text-slate-800">Locations</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Include people living in or recently in these locations.
                  </p>

                  {/* Meta-style: Include | Search | Browse */}
                  <div className="relative mt-2 flex flex-col gap-2 sm:flex-row sm:items-stretch">
                    <MetaSelect
                      className="sm:w-32"
                      value={data.locationAction || 'include'}
                      onChange={(e) => set('locationAction', e.target.value)}
                    >
                      <option value="include">Include</option>
                      <option value="exclude">Exclude</option>
                    </MetaSelect>
                    <div className="relative min-w-0 flex-1">
                      <div className="flex min-h-[42px] items-center rounded-lg border border-slate-300 bg-white px-3 focus-within:border-[#1877F2] focus-within:ring-2 focus-within:ring-[#1877F2]/20">
                        <svg
                          className="mr-2 h-4 w-4 shrink-0 text-slate-400"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle cx="11" cy="11" r="7" />
                          <path d="M20 20l-3-3" />
                        </svg>
                        <input
                          type="search"
                          value={data.locationSearch || ''}
                          onChange={(e) => {
                            set('locationSearch', e.target.value);
                            setAudienceLocationMenuOpen(true);
                          }}
                          onFocus={() => setAudienceLocationMenuOpen(true)}
                          placeholder="Search locations"
                          className="w-full border-0 bg-transparent py-2 text-sm outline-none"
                        />
                      </div>
                      {audienceLocationMenuOpen ? (
                        <>
                          <button
                            type="button"
                            className="fixed inset-0 z-10 cursor-default"
                            aria-label="Close locations menu"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setAudienceLocationMenuOpen(false);
                            }}
                          />
                          <div className="absolute left-0 right-0 z-20 mt-1 max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                            {filteredLocations.length ? (
                              filteredLocations.map((opt) => (
                                <button
                                  key={opt.value}
                                  type="button"
                                  onClick={() => addLocation(opt)}
                                  className="flex w-full items-start justify-between gap-2 px-3 py-2.5 text-left hover:bg-slate-50"
                                >
                                  <span className="text-sm font-medium text-slate-800">{opt.label}</span>
                                  <span className="shrink-0 text-xs text-slate-500">{opt.type}</span>
                                </button>
                              ))
                            ) : (
                              <p className="px-3 py-2.5 text-sm text-slate-500">No locations found</p>
                            )}
                          </div>
                        </>
                      ) : null}
                    </div>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setLocationBrowseOpen((v) => !v)}
                        className="h-full min-h-[42px] rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                      >
                        Browse
                      </button>
                      {locationBrowseOpen ? (
                        <>
                          <button
                            type="button"
                            className="fixed inset-0 z-10 cursor-default"
                            aria-label="Close browse"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setLocationBrowseOpen(false);
                            }}
                          />
                          <div className="absolute right-0 z-20 mt-1 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                            <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                              Browse locations
                            </p>
                            {locationSuggestionOptions.slice(0, 8).map((opt) => (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => {
                                  addLocation(opt);
                                  setLocationBrowseOpen(false);
                                }}
                                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-slate-50"
                              >
                                <span>{opt.label}</span>
                                <span className="text-xs text-slate-400">{opt.type}</span>
                              </button>
                            ))}
                          </div>
                        </>
                      ) : null}
                    </div>
                  </div>

                  {locationTags.length ? (
                    <div className="mt-3 space-y-1.5">
                      {locationTags.map((tag) => (
                        <div
                          key={tag.value}
                          className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-900">{tag.label}</p>
                            <p className="text-xs text-slate-500">
                              {(data.locationAction || 'include') === 'exclude' ? 'Exclude' : 'Include'} ·{' '}
                              {tag.type || 'Location'}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeLocation(tag.value)}
                            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            aria-label={`Remove ${tag.label}`}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  <div className="mt-3">
                    <LocationMapPanel
                      latitude={data.latitude}
                      longitude={data.longitude}
                      radiusKm={data.radiusKm || '10'}
                      dropPinMode={dropPinMode}
                      onDropPinModeChange={setDropPinMode}
                      centerLabel={locationTags[0]?.label || 'India'}
                      onPinChange={({ latitude, longitude }) => {
                        onChange({
                          ...data,
                          latitude,
                          longitude,
                          ...(latitude && longitude && !data.radiusKm ? { radiusKm: '10' } : {}),
                        });
                      }}
                      onRadiusChange={(v) => set('radiusKm', v)}
                    />
                  </div>

                  <button
                    type="button"
                    className="mt-2 text-sm font-medium text-[#1877F2] hover:underline"
                  >
                    Add locations in bulk
                  </button>

                  <label className="mt-2 flex cursor-pointer items-start gap-2">
                    <input
                      type="checkbox"
                      checked={Boolean(data.locationExpand)}
                      onChange={(e) => set('locationExpand', e.target.checked)}
                      className="mt-0.5"
                    />
                    <span className="text-xs text-slate-600">
                      Reach more people likely to respond to your ads outside these locations when it improves
                      performance.
                    </span>
                  </label>
                </div>

                {locationTags.some((t) => /india/i.test(t.label)) ? (
                  <MetaAlert
                    tone="warn"
                    title="To run ads in India, you need to declare if your ads are related to securities and investments."
                    action={
                      <button type="button" className="mt-2 text-xs font-semibold text-amber-900 underline">
                        Review requirements
                      </button>
                    }
                  />
                ) : null}

                <button
                  type="button"
                  onClick={() => {
                    setAudienceControlsMore((v) => !v);
                    set('showAudienceControlsMore', !audienceControlsMore);
                  }}
                  className="inline-flex items-center gap-1 text-sm font-medium text-[#1877F2] hover:underline"
                >
                  {audienceControlsMore ? 'Hide options' : 'Show more options'}
                  <svg
                    className={`h-3.5 w-3.5 transition ${audienceControlsMore ? 'rotate-180' : ''}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>

                {audienceControlsMore ? (
                  <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/80 p-3.5">
                    <div>
                      <p className="text-[13px] font-semibold text-slate-800">Minimum age</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        People younger than this age won&apos;t see your ads.
                      </p>
                      <MetaSelect
                        className="mt-2 max-w-[160px]"
                        value={data.minAgeControl || data.ageMin || '18'}
                        onChange={(e) => {
                          const v = e.target.value;
                          onChange({
                            ...data,
                            minAgeControl: v,
                            ageMin: String(Math.max(Number(data.ageMin || 18), Number(v))),
                          });
                        }}
                      >
                        {ageMinControlOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </MetaSelect>
                    </div>

                    <div>
                      <p className="text-[13px] font-semibold text-slate-800">Languages</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Enter a language if you want to show ads only to people who use that language on Meta.
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {languageOptions.map((opt) => {
                          const selected = languages.includes(opt.value);
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => toggleListValue('languages', opt.value)}
                              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                                selected
                                  ? 'bg-[#1877F2] text-white'
                                  : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <p className="text-[13px] font-semibold text-slate-800">
                        Exclude these custom audiences
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        People in these audiences won&apos;t see your ads.
                      </p>
                      <div className="relative mt-2">
                        <button
                          type="button"
                          onClick={() => setExcludeCustomOpen((v) => !v)}
                          className="flex w-full items-center justify-between gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-left text-sm hover:border-slate-400"
                        >
                          <span className="text-slate-500">
                            {excludedCustom.length
                              ? `${excludedCustom.length} excluded`
                              : 'Search existing audiences'}
                          </span>
                          <svg className="h-4 w-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M6 9l6 6 6-6" />
                          </svg>
                        </button>
                        {excludeCustomOpen ? (
                          <>
                            <button
                              type="button"
                              className="fixed inset-0 z-10 cursor-default"
                              aria-label="Close exclude audiences"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setExcludeCustomOpen(false);
                              }}
                            />
                            <div className="absolute left-0 right-0 z-20 mt-1 max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                              {customAudienceOptions.map((opt) => {
                                const selected = excludedCustom.includes(opt.value);
                                return (
                                  <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => toggleListValue('excludedCustomAudiences', opt.value)}
                                    className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm ${
                                      selected ? 'bg-[#E7F3FF]' : 'hover:bg-slate-50'
                                    }`}
                                  >
                                    <span
                                      className={`inline-flex h-4 w-4 items-center justify-center rounded border ${
                                        selected ? 'border-[#1877F2] bg-[#1877F2] text-white' : 'border-slate-400'
                                      }`}
                                    >
                                      {selected ? '✓' : ''}
                                    </span>
                                    {opt.label}
                                  </button>
                                );
                              })}
                            </div>
                          </>
                        ) : null}
                      </div>
                      {excludedCustom.length ? (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {excludedCustom.map((id) => (
                            <span
                              key={id}
                              className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-800"
                            >
                              {labelFromOptions(customAudienceOptions, id)}
                              <button
                                type="button"
                                onClick={() => toggleListValue('excludedCustomAudiences', id)}
                                aria-label="Remove"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-white px-3.5 py-3">
                      <p className="text-sm font-semibold text-slate-800">Radius targeting</p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-500">
                        Use <span className="font-semibold text-slate-700">Drop Pin</span> on the Locations map
                        above to set a point and radius. You can also drag the pin or adjust the km slider under
                        the map.
                      </p>
                      {data.latitude && data.longitude ? (
                        <p className="mt-2 text-xs text-slate-600">
                          Active pin: {Number(data.latitude).toFixed(4)}, {Number(data.longitude).toFixed(4)} ·{' '}
                          {data.radiusKm || 10} km
                        </p>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Audience suggestions */}
              <div className="space-y-3">
                <div>
                  <p className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-800">
                    {advantageOn ? 'Audience suggestions' : 'Audience'}
                    <MetaInfoIcon />
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {advantageOn
                      ? 'We\'ll also show ads to people beyond your suggestions when it\'s likely to improve performance.'
                      : 'Your ads will only reach people who match these settings.'}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-[13px] font-semibold text-slate-800">Age</p>
                    <div className="mt-2 flex items-center gap-2">
                      <MetaInput
                        type="number"
                        min={data.minAgeControl || 13}
                        max="65"
                        value={data.ageMin}
                        onChange={(e) => set('ageMin', e.target.value)}
                        className="w-20"
                      />
                      <span className="text-sm text-slate-500">—</span>
                      <MetaInput
                        type="number"
                        min={data.ageMin || 13}
                        max="65"
                        value={data.ageMax}
                        onChange={(e) => set('ageMax', e.target.value)}
                        className="w-20"
                      />
                    </div>
                    {advantageOn ? (
                      <label className="mt-2 flex cursor-pointer items-center gap-2 text-xs text-slate-600">
                        <input
                          type="checkbox"
                          checked={data.ageAsSuggestion !== false}
                          onChange={(e) => set('ageAsSuggestion', e.target.checked)}
                        />
                        Use as a suggestion
                      </label>
                    ) : null}
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-slate-800">Gender</p>
                    <MetaSelect
                      className="mt-2"
                      value={data.gender}
                      onChange={(e) => set('gender', e.target.value)}
                    >
                      {genderOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </MetaSelect>
                    {advantageOn ? (
                      <label className="mt-2 flex cursor-pointer items-center gap-2 text-xs text-slate-600">
                        <input
                          type="checkbox"
                          checked={data.genderAsSuggestion !== false}
                          onChange={(e) => set('genderAsSuggestion', e.target.checked)}
                        />
                        Use as a suggestion
                      </label>
                    ) : null}
                  </div>
                </div>

                <div>
                  <p className="text-[13px] font-semibold text-slate-800">Detailed targeting</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Include demographics, interests or behaviours.{' '}
                    <button type="button" className="font-medium text-[#1877F2] hover:underline">
                      About detailed targeting
                    </button>
                  </p>
                  <div className="relative mt-2">
                    <button
                      type="button"
                      onClick={() => setDetailedTargetingOpen((v) => !v)}
                      className="flex w-full items-center justify-between gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-left text-sm hover:border-slate-400"
                    >
                      <span className={detailed.length ? 'text-slate-900' : 'text-slate-500'}>
                        {detailed.length
                          ? `${detailed.length} selected`
                          : 'Add demographics, interests or behaviours'}
                      </span>
                      <svg className="h-4 w-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </button>
                    {detailedTargetingOpen ? (
                      <>
                        <button
                          type="button"
                          className="fixed inset-0 z-10 cursor-default"
                          aria-label="Close detailed targeting"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setDetailedTargetingOpen(false);
                            setDetailedTargetingSearch('');
                          }}
                        />
                        <div className="absolute left-0 right-0 z-20 mt-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                          <div className="border-b border-slate-100 p-2">
                            <input
                              type="search"
                              value={detailedTargetingSearch}
                              onChange={(e) => setDetailedTargetingSearch(e.target.value)}
                              placeholder="Search"
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#1877F2]"
                              autoFocus
                            />
                          </div>
                          <div className="max-h-64 overflow-y-auto py-1">
                            {detailedTargetingGroups.map((group) => {
                              const opts = group.options.filter(
                                (o) => !dtQuery || o.label.toLowerCase().includes(dtQuery)
                              );
                              if (!opts.length) return null;
                              return (
                                <div key={group.id}>
                                  <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                    {group.label}
                                  </p>
                                  {opts.map((opt) => {
                                    const selected = detailed.includes(opt.value);
                                    return (
                                      <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => toggleListValue('detailedTargeting', opt.value)}
                                        className={`flex w-full items-start gap-2 px-3 py-2.5 text-left text-sm ${
                                          selected ? 'bg-[#E7F3FF]' : 'hover:bg-slate-50'
                                        }`}
                                      >
                                        <span
                                          className={`mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] ${
                                            selected
                                              ? 'border-[#1877F2] bg-[#1877F2] text-white'
                                              : 'border-slate-400'
                                          }`}
                                        >
                                          {selected ? '✓' : ''}
                                        </span>
                                        <span>
                                          <span className="block font-medium text-slate-800">{opt.label}</span>
                                          <span className="block text-xs text-slate-500">{opt.category}</span>
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    ) : null}
                  </div>
                  {detailed.length ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {detailed.map((id) => {
                        const opt = detailedTargetingGroups
                          .flatMap((g) => g.options)
                          .find((o) => o.value === id);
                        return (
                          <span
                            key={id}
                            className="inline-flex items-center gap-1 rounded-full bg-[#E7F3FF] px-2.5 py-1 text-xs font-medium text-slate-800"
                          >
                            {opt?.label || id}
                            <button
                              type="button"
                              onClick={() => toggleListValue('detailedTargeting', id)}
                              aria-label="Remove"
                            >
                              ×
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  ) : null}
                  {advantageOn ? (
                    <label className="mt-2 flex cursor-pointer items-center gap-2 text-xs text-slate-600">
                      <input
                        type="checkbox"
                        checked={data.detailedTargetingAsSuggestion !== false}
                        onChange={(e) => set('detailedTargetingAsSuggestion', e.target.checked)}
                      />
                      Use as a suggestion
                    </label>
                  ) : null}
                </div>

                <div>
                  <p className="text-[13px] font-semibold text-slate-800">
                    Include these custom audiences
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Include people who are in at least one of the following.
                  </p>
                  <div className="relative mt-2">
                    <button
                      type="button"
                      onClick={() => setIncludeCustomOpen((v) => !v)}
                      className="flex w-full items-center justify-between gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-left text-sm hover:border-slate-400"
                    >
                      <span className="text-slate-500">
                        {includedCustom.length
                          ? `${includedCustom.length} selected`
                          : 'Search existing audiences'}
                      </span>
                      <svg className="h-4 w-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </button>
                    {includeCustomOpen ? (
                      <>
                        <button
                          type="button"
                          className="fixed inset-0 z-10 cursor-default"
                          aria-label="Close include audiences"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setIncludeCustomOpen(false);
                          }}
                        />
                        <div className="absolute left-0 right-0 z-20 mt-1 max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                          {customAudienceOptions.map((opt) => {
                            const selected = includedCustom.includes(opt.value);
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => toggleListValue('includedCustomAudiences', opt.value)}
                                className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm ${
                                  selected ? 'bg-[#E7F3FF]' : 'hover:bg-slate-50'
                                }`}
                              >
                                <span
                                  className={`inline-flex h-4 w-4 items-center justify-center rounded border ${
                                    selected ? 'border-[#1877F2] bg-[#1877F2] text-white' : 'border-slate-400'
                                  }`}
                                >
                                  {selected ? '✓' : ''}
                                </span>
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                      </>
                    ) : null}
                  </div>
                  {includedCustom.length ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {includedCustom.map((id) => (
                        <span
                          key={id}
                          className="inline-flex items-center gap-1 rounded-full bg-[#E7F3FF] px-2.5 py-1 text-xs font-medium text-slate-800"
                        >
                          {labelFromOptions(customAudienceOptions, id)}
                          <button
                            type="button"
                            onClick={() => toggleListValue('includedCustomAudiences', id)}
                            aria-label="Remove"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : null}
                  {advantageOn ? (
                    <label className="mt-2 flex cursor-pointer items-center gap-2 text-xs text-slate-600">
                      <input
                        type="checkbox"
                        checked={data.customAudienceAsSuggestion !== false}
                        onChange={(e) => set('customAudienceAsSuggestion', e.target.checked)}
                      />
                      Use as a suggestion
                    </label>
                  ) : null}
                </div>
              </div>

              {advantageOn ? (
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      ...data,
                      furtherLimitAudience: true,
                      advantageAudience: false,
                      ageAsSuggestion: false,
                      genderAsSuggestion: false,
                      detailedTargetingAsSuggestion: false,
                      customAudienceAsSuggestion: false,
                    })
                  }
                  className="text-sm font-medium text-[#1877F2] hover:underline"
                >
                  Further limit the reach of your ads
                </button>
              ) : null}
            </div>
          );
        })()}
      </MetaCard>

      <MetaCard title="Policy and regulatory requirements (India)">
        <p className="mb-2 text-xs text-slate-500">
          Provide required information about your ads, yourself or your organisation.
        </p>
        <MetaCheckRow
          checked={data.securitiesRelated}
          onChange={(v) => set('securitiesRelated', v)}
          label="This ad set includes ads related to securities and investments"
        />
      </MetaCard>

      <MetaCard
        title="Placements"
        badge={
          <AdvantageBadge
            on={
              data.placementsMode !== 'manual' &&
              (Array.isArray(data.devices)
                ? data.devices.includes('mobile') && data.devices.includes('desktop')
                : data.devices === 'all')
            }
          />
        }
      >
        {(() => {
          const platforms = data.platforms || [];
          const placements = data.placements || [];
          const devices = Array.isArray(data.devices)
            ? data.devices
            : data.devices === 'mobile'
              ? ['mobile']
              : data.devices === 'desktop'
                ? ['desktop']
                : ['mobile', 'desktop'];
          const advantageOn =
            data.placementsMode !== 'manual' &&
            devices.includes('mobile') &&
            devices.includes('desktop');
          const showSettings = Boolean(data.showPlacementSettings) || !advantageOn;
          const availablePlacements = getPlacementsForPlatforms(
            platforms.length ? platforms : platformOptions.map((p) => p.value)
          );
          const selectedCount = placements.filter((p) => availablePlacements.includes(p)).length;

          const setDevices = (nextDevices) => {
            const next = { ...data, devices: nextDevices };
            if (!nextDevices.includes('mobile') || !nextDevices.includes('desktop')) {
              next.placementsMode = 'manual';
            }
            onChange(next);
          };

          const toggleDevice = (device) => {
            const next = devices.includes(device)
              ? devices.filter((d) => d !== device)
              : [...devices, device];
            if (!next.length) return;
            setDevices(next);
          };

          const togglePlatform = (platform) => {
            const nextPlatforms = platforms.includes(platform)
              ? platforms.filter((p) => p !== platform)
              : [...platforms, platform];
            if (!nextPlatforms.length) return;
            const allowed = getPlacementsForPlatforms(nextPlatforms);
            const nextPlacements = placements.filter((p) => allowed.includes(p));
            // When enabling a platform, add its default placements if Advantage+ or empty
            if (!platforms.includes(platform)) {
              getPlacementsForPlatforms([platform]).forEach((p) => {
                if (!nextPlacements.includes(p) && defaultLeadsPlacements.includes(p)) {
                  nextPlacements.push(p);
                }
              });
            }
            onChange({
              ...data,
              platforms: nextPlatforms,
              placements: nextPlacements,
              placementsMode: 'manual',
            });
          };

          const togglePlacement = (value) => {
            const next = placements.includes(value)
              ? placements.filter((p) => p !== value)
              : [...placements, value];
            onChange({
              ...data,
              placements: next,
              placementsMode: 'manual',
            });
          };

          const toggleGroup = (groupOptions) => {
            const values = groupOptions
              .filter((o) => availablePlacements.includes(o.value))
              .map((o) => o.value);
            if (!values.length) return;
            const allOn = values.every((v) => placements.includes(v));
            const next = allOn
              ? placements.filter((p) => !values.includes(p))
              : [...new Set([...placements, ...values])];
            onChange({ ...data, placements: next, placementsMode: 'manual' });
          };

          const restoreAdvantage = () => {
            onChange({
              ...data,
              placementsMode: 'advantage',
              devices: ['mobile', 'desktop'],
              platforms: ['facebook', 'instagram', 'messenger', 'audience_network', 'threads'],
              placements: [...defaultLeadsPlacements],
              allowLimitedSpendExcluded: true,
              showPlacementSettings: false,
            });
          };

          return (
            <div className="space-y-4">
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900">
                      {advantageOn ? 'Advantage+ placements' : 'Manual placements'}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                      {advantageOn ? (
                        <>
                          We&apos;ll show your ads in the places they&apos;re likely to perform best across Meta
                          technologies.{' '}
                          <button type="button" className="font-medium text-[#1877F2] hover:underline">
                            About Advantage+ placements
                          </button>
                        </>
                      ) : (
                        <>
                          You&apos;ve chosen specific devices, platforms or placements. This turns Advantage+
                          placements off.
                        </>
                      )}
                    </p>
                    {advantageOn ? (
                      <p className="mt-2 text-sm text-slate-800">
                        All available placements included
                      </p>
                    ) : (
                      <p className="mt-2 text-sm text-slate-800">
                        {selectedCount} placement{selectedCount === 1 ? '' : 's'} selected
                      </p>
                    )}
                  </div>
                  {advantageOn ? (
                    <button
                      type="button"
                      onClick={() => set('showPlacementSettings', true)}
                      className="shrink-0 text-sm font-semibold text-[#1877F2] hover:underline"
                    >
                      Show more settings
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={restoreAdvantage}
                      className="shrink-0 text-sm font-semibold text-[#1877F2] hover:underline"
                    >
                      Use Advantage+ placements
                    </button>
                  )}
                </div>
              </div>

              {showSettings ? (
                <div className="space-y-5">
                  {advantageOn ? (
                    <button
                      type="button"
                      onClick={() => set('showPlacementSettings', false)}
                      className="inline-flex items-center gap-1 text-sm font-medium text-[#1877F2] hover:underline"
                    >
                      Hide settings
                      <svg className="h-3.5 w-3.5 rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </button>
                  ) : null}

                  <div>
                    <p className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-800">
                      Devices and operating systems
                      <MetaInfoIcon />
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Choose which devices can show your ads. Excluding Mobile or Desktop turns Advantage+
                      placements off.
                    </p>
                    <div className="mt-2 grid gap-1 sm:grid-cols-2">
                      {deviceOptions.map((opt) => (
                        <MetaCheckRow
                          key={opt.value}
                          checked={devices.includes(opt.value)}
                          onChange={() => toggleDevice(opt.value)}
                          label={opt.label}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-800">
                      Platforms
                      <MetaInfoIcon />
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Untick platforms you want to exclude. Related placements update automatically.
                    </p>
                    <div className="mt-2 grid gap-1 sm:grid-cols-2">
                      {platformOptions.map((opt) => (
                        <MetaCheckRow
                          key={opt.value}
                          checked={platforms.includes(opt.value)}
                          onChange={() => togglePlatform(opt.value)}
                          label={opt.label}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-800">
                      Placement controls
                      <MetaInfoIcon />
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Untick placements to exclude them. Excluding any placement turns Advantage+ placements
                      off. Unavailable placements for your objective are hidden.
                    </p>

                    <div className="mt-3 space-y-4">
                      {placementGroups.map((group) => {
                        const visible = group.options.filter((o) =>
                          availablePlacements.includes(o.value)
                        );
                        if (!visible.length) return null;
                        const allOn = visible.every((o) => placements.includes(o.value));
                        const someOn = visible.some((o) => placements.includes(o.value));
                        return (
                          <div
                            key={group.id}
                            className="overflow-hidden rounded-xl border border-slate-200 bg-white"
                          >
                            <div className="flex items-start justify-between gap-3 border-b border-slate-100 bg-slate-50 px-3.5 py-2.5">
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-900">{group.label}</p>
                                <p className="mt-0.5 text-xs text-slate-500">{group.description}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => toggleGroup(visible)}
                                className="shrink-0 text-xs font-semibold text-[#1877F2] hover:underline"
                              >
                                {allOn ? 'Deselect all' : someOn ? 'Select all' : 'Select all'}
                              </button>
                            </div>
                            <div className="grid gap-0.5 p-2 sm:grid-cols-2">
                              {visible.map((opt) => {
                                const disabledByDevice =
                                  opt.desktopOnly && !devices.includes('desktop');
                                return (
                                  <MetaCheckRow
                                    key={opt.value}
                                    checked={placements.includes(opt.value) && !disabledByDevice}
                                    onChange={() => {
                                      if (disabledByDevice) return;
                                      togglePlacement(opt.value);
                                    }}
                                    label={opt.label}
                                    description={
                                      disabledByDevice ? 'Requires Desktop devices' : undefined
                                    }
                                  />
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {!advantageOn ? (
                    <label className="flex cursor-pointer gap-3 rounded-lg border border-slate-200 px-3 py-3">
                      <input
                        type="checkbox"
                        checked={data.allowLimitedSpendExcluded !== false}
                        onChange={(e) => set('allowLimitedSpendExcluded', e.target.checked)}
                        className="mt-1"
                      />
                      <span>
                        <span className="block text-sm font-medium text-slate-800">
                          Allow limited spend to excluded placements
                        </span>
                        <span className="mt-1 block text-xs leading-relaxed text-slate-500">
                          Allow up to 5% of your budget for each excluded placement when it&apos;s likely to
                          improve performance.
                        </span>
                      </span>
                    </label>
                  ) : null}

                  <div className="space-y-3 rounded-xl border border-slate-200 p-3.5">
                    <p className="text-[13px] font-semibold text-slate-800">Inventory filters</p>
                    <MetaCheckRow
                      checked={Boolean(data.skippableAds)}
                      onChange={(v) => set('skippableAds', v)}
                      label="Include skippable ads"
                      description="Allow ads that people can skip after a few seconds where supported."
                    />
                    <MetaField label="Publisher block lists" hint="None selected if blank">
                      <MetaInput
                        value={data.publisherBlockLists}
                        onChange={(e) => set('publisherBlockLists', e.target.value)}
                        placeholder="Search block lists"
                      />
                    </MetaField>
                    <MetaField label="Content type exclusions" hint="Optional">
                      <MetaInput
                        value={data.contentTypeExclusions}
                        onChange={(e) => set('contentTypeExclusions', e.target.value)}
                        placeholder="Exclude content types"
                      />
                    </MetaField>
                    <MetaField label="Topic exclusions" hint="Optional">
                      <MetaInput
                        value={data.topicExclusions}
                        onChange={(e) => set('topicExclusions', e.target.value)}
                        placeholder="Exclude topics"
                      />
                    </MetaField>
                  </div>
                </div>
              ) : null}
            </div>
          );
        })()}
      </MetaCard>
    </div>
  );
}

function AdLevelForm({ data, onChange, campaign = {}, adSet = {} }) {
  const set = (key, value) => onChange({ ...data, [key]: value });
  const instantForms = ['Inkstall School 2', 'School from home'];
  const mediaInputRef = useRef(null);
  const [mediaDragOver, setMediaDragOver] = useState(false);
  const [mediaError, setMediaError] = useState('');
  const [cropOpen, setCropOpen] = useState(false);
  const [pendingMedia, setPendingMedia] = useState(null);

  const objective = campaign.objective || 'leads';
  const conversionLocation =
    adSet.conversionLocation === 'message_destinations'
      ? 'messenger'
      : adSet.conversionLocation || 'website_and_forms';
  const platforms = adSet.platforms || [];
  const locationLabel =
    labelFromOptions(
      getConversionLocationGroups(objective).flatMap((g) => g.options),
      conversionLocation
    ) || conversionLocation;

  const needsWebsite = [
    'website',
    'website_and_forms',
    'website_and_calls',
  ].includes(conversionLocation);
  const needsInstantForm = [
    'instant_forms',
    'website_and_forms',
    'forms_and_messenger',
  ].includes(conversionLocation);
  const needsMessaging = ['messenger', 'instagram', 'whatsapp', 'forms_and_messenger'].includes(
    conversionLocation
  );
  const needsCalls = conversionLocation === 'calls' || conversionLocation === 'website_and_calls';
  const isInstagramLive = conversionLocation === 'instagram_live';
  const needsApp = conversionLocation === 'app';
  const showInstagramIdentity =
    platforms.includes('instagram') ||
    isInstagramLive ||
    conversionLocation === 'instagram' ||
    Boolean(adSet.liveVideoInstagram);
  const showThreadsIdentity = platforms.includes('threads');
  const showMessengerIdentity = platforms.includes('messenger') || needsMessaging;

  const formatOptions = getAdFormatsForConversionLocation(conversionLocation);
  const ctaOptions = getCallToActionsForConversionLocation(conversionLocation);

  const pageValue = data.facebookPage || adSet.facebookPage || '';
  const pageLabel =
    labelFromOptions(facebookPageOptions, pageValue) !== '—'
      ? labelFromOptions(facebookPageOptions, pageValue)
      : pageValue || 'Select Page';
  const igHandle =
    data.instagramProfile ||
    adSet.liveVideoInstagram ||
    (instagramLiveProfileOptions[0]?.handle ?? '');

  // Keep Ad identity in sync with Ad set Page / Instagram when those change
  useEffect(() => {
    const next = { ...data };
    let changed = false;
    if (adSet.facebookPage && data.facebookPage !== adSet.facebookPage) {
      next.facebookPage = adSet.facebookPage;
      changed = true;
    }
    if (adSet.liveVideoInstagram && !data.instagramProfile) {
      next.instagramProfile = adSet.liveVideoInstagram;
      changed = true;
    }
    const allowedFormats = getAdFormatsForConversionLocation(conversionLocation).map((o) => o.value);
    if (!allowedFormats.includes(data.format)) {
      next.format = allowedFormats[0] || 'single';
      changed = true;
    }
    const allowedCtas = getCallToActionsForConversionLocation(conversionLocation).map((o) => o.value);
    if (!allowedCtas.includes(data.callToAction)) {
      next.callToAction = allowedCtas[0] || 'learn_more';
      changed = true;
    }
    if (changed) onChange(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync when ad set targeting changes
  }, [adSet.facebookPage, adSet.liveVideoInstagram, conversionLocation]);

  const clearMediaBlob = (url) => {
    if (url?.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(url);
      } catch {
        /* ignore */
      }
    }
  };

  const openCropForMedia = (payload) => {
    setPendingMedia(payload);
    setCropOpen(true);
  };

  const handleMediaFile = (file) => {
    if (!file) return;
    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    if (!isVideo && !isImage) {
      setMediaError('Choose an image (JPG, PNG) or video (MP4, MOV). Meta accepts JPG/PNG and MP4/MOV.');
      return;
    }
    // Soft limit for browser draft preview (Meta allows larger files via API upload)
    const maxBytes = isVideo ? 200 * 1024 * 1024 : 30 * 1024 * 1024;
    if (file.size > maxBytes) {
      setMediaError(
        isVideo
          ? 'Video is too large for in-browser preview (max 200 MB here). Use a smaller file or paste a URL.'
          : 'Image is too large (max 30 MB).'
      );
      return;
    }
    const url = URL.createObjectURL(file);
    const openWithDuration = (duration = 0) => {
      setMediaError('');
      openCropForMedia({
        mediaUrl: url,
        mediaType: isVideo ? 'video' : 'image',
        mediaName: file.name,
        mediaSize: file.size,
        mediaDuration: duration,
        replacePrevious: true,
      });
    };
    if (isVideo) {
      const probe = document.createElement('video');
      probe.preload = 'metadata';
      probe.onloadedmetadata = () => {
        const duration = Number.isFinite(probe.duration) ? probe.duration : 0;
        if (duration > 0 && duration < 1) {
          setMediaError('Video must be at least 1 second long (Meta: 1 second–241 minutes).');
          URL.revokeObjectURL(url);
          return;
        }
        if (duration > 241 * 60) {
          setMediaError('Video must be 241 minutes or shorter.');
          URL.revokeObjectURL(url);
          return;
        }
        openWithDuration(duration);
      };
      probe.onerror = () => {
        setMediaError('Could not read this video file.');
        URL.revokeObjectURL(url);
      };
      probe.src = url;
    } else {
      openWithDuration(0);
    }
  };

  const applyCroppedMedia = (crops) => {
    if (!pendingMedia && !data.mediaUrl) {
      setCropOpen(false);
      return;
    }
    const source = pendingMedia || {
      mediaUrl: data.mediaUrl,
      mediaType: data.mediaType,
      mediaName: data.mediaName,
      mediaSize: data.mediaSize,
      mediaDuration: data.mediaDuration,
    };
    if (pendingMedia?.replacePrevious && data.mediaUrl && data.mediaUrl !== source.mediaUrl) {
      clearMediaBlob(data.mediaUrl);
    }
    onChange({
      ...data,
      mediaUrl: source.mediaUrl,
      mediaType: source.mediaType,
      mediaName: source.mediaName,
      mediaSize: source.mediaSize,
      mediaDuration: source.mediaDuration || 0,
      mediaCrops: crops,
      mediaCropMode: 'per_placement',
      format: data.format === 'carousel' ? data.format : 'single',
      previewPlacement: data.previewPlacement || 'feed',
    });
    setPendingMedia(null);
    setCropOpen(false);
  };

  const cancelCrop = () => {
    if (pendingMedia?.mediaUrl && pendingMedia.mediaUrl !== data.mediaUrl) {
      clearMediaBlob(pendingMedia.mediaUrl);
    }
    setPendingMedia(null);
    setCropOpen(false);
  };

  const removeMedia = () => {
    clearMediaBlob(data.mediaUrl);
    setMediaError('');
    onChange({
      ...data,
      mediaUrl: '',
      mediaType: '',
      mediaName: '',
      mediaSize: 0,
      mediaDuration: 0,
      mediaCrops: null,
    });
    if (mediaInputRef.current) mediaInputRef.current.value = '';
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[#B7D2F5] bg-[#E7F3FF] px-3.5 py-3">
        <p className="text-sm font-semibold text-slate-900">Inherited from campaign &amp; ad set</p>
        <p className="mt-1 text-xs leading-relaxed text-slate-600">
          Objective:{' '}
          <span className="font-medium text-slate-800">
            {labelFromOptions(objectiveOptions, objective)}
          </span>
          {' · '}
          Conversion location: <span className="font-medium text-slate-800">{locationLabel}</span>
          {adSet.performanceGoal ? (
            <>
              {' · '}
              Performance goal:{' '}
              <span className="font-medium text-slate-800">
                {labelFromOptions(
                  [...performanceGoalOptions, ...instagramLivePerformanceGoalOptions],
                  adSet.performanceGoal
                )}
              </span>
            </>
          ) : null}
        </p>
      </div>

      <MetaCard title="Ad name">
        <div className="flex flex-col gap-2 sm:flex-row">
          <MetaInput value={data.name} onChange={(e) => set('name', e.target.value)} className="min-w-0 flex-1" />
          <button
            type="button"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:w-auto"
          >
            Create template
          </button>
        </div>
      </MetaCard>

      {!isInstagramLive ? (
        <MetaCard title="Partnership ad">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-slate-500">Run ads with creators or partners.</p>
            <MetaToggle
              checked={data.partnershipAd}
              onChange={(v) => set('partnershipAd', v)}
              label={data.partnershipAd ? 'On' : 'Off'}
            />
          </div>
        </MetaCard>
      ) : null}

      <MetaCard title="Identity">
        <div className="grid gap-3">
          <div>
            <p className="text-[13px] font-semibold text-slate-800">Facebook Page</p>
            <p className="mt-0.5 text-xs text-slate-500">
              Uses the Page selected in your ad set
              {adSet.facebookPage ? ' (Conversion).' : '.'}
            </p>
            <MetaSelect
              className="mt-2"
              value={pageValue}
              onChange={(e) => set('facebookPage', e.target.value)}
            >
              {facebookPageOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </MetaSelect>
            <div className="mt-2">
              {pageValue ? (
                <MetaAlert tone="info" title="Terms accepted">
                  You&apos;ve accepted the terms for using {pageLabel} in ads.
                </MetaAlert>
              ) : (
                <MetaAlert tone="warn" title="Select a Facebook Page">
                  Choose a Page in Conversion (ad set) or here before publishing.
                </MetaAlert>
              )}
            </div>
          </div>

          {showInstagramIdentity ? (
            <div>
              <p className="text-[13px] font-semibold text-slate-800">Instagram account</p>
              <p className="mt-0.5 text-xs text-slate-500">
                {isInstagramLive
                  ? 'Linked from Live video location on your ad set.'
                  : 'Shown on Instagram placements selected in Placements.'}
              </p>
              <MetaSelect
                className="mt-2"
                value={
                  instagramLiveProfileOptions.some((o) => o.value === igHandle || o.handle === igHandle)
                    ? instagramLiveProfileOptions.find(
                        (o) => o.value === igHandle || o.handle === igHandle
                      )?.value
                    : igHandle
                }
                onChange={(e) => set('instagramProfile', e.target.value)}
              >
                {instagramLiveProfileOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    @{opt.handle}
                  </option>
                ))}
              </MetaSelect>
            </div>
          ) : null}

          {showThreadsIdentity ? (
            <MetaField label="Threads profile">
              <MetaInput
                value={data.threadsProfile}
                onChange={(e) => set('threadsProfile', e.target.value)}
              />
            </MetaField>
          ) : null}

          {showMessengerIdentity && !showInstagramIdentity ? (
            <p className="text-xs text-slate-500">
              Messenger uses your Facebook Page identity for this ad set.
            </p>
          ) : null}
        </div>
      </MetaCard>

      <MetaCard id="ad-setup" title="Ad setup">
        {isInstagramLive ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3">
            <p className="text-sm font-semibold text-slate-900">Live video creative</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              Your ad will use the{' '}
              {(adSet.liveVideoAdType || 'upcoming') === 'current'
                ? 'current live video'
                : 'upcoming live video'}{' '}
              from @{igHandle || 'your Instagram account'} as the creative. Add primary text below; media
              upload is not required for live video ads.
            </p>
          </div>
        ) : (
          <>
            <MetaField label="Create ad">
              <MetaSelect value={data.createMode} onChange={(e) => set('createMode', e.target.value)}>
                <option value="create_ad">Create ad</option>
                <option value="use_existing">Use existing post</option>
              </MetaSelect>
            </MetaField>
            <p className="mt-3 text-sm font-medium text-slate-800">Format</p>
            <p className="mt-0.5 text-xs text-slate-500">
              Formats available for {locationLabel} (Leads objective).
            </p>
            <div className="mt-2 space-y-2">
              {formatOptions.map((opt) => (
                <MetaRadioCard
                  key={opt.value}
                  name="adFormat"
                  value={opt.value}
                  checked={data.format === opt.value}
                  onChange={(v) => set('format', v)}
                  label={opt.label}
                />
              ))}
            </div>
            <MetaCheckRow
              checked={data.multiAdvertiserAds}
              onChange={(v) => set('multiAdvertiserAds', v)}
              label="Multi-advertiser ads"
              description="Your ad can appear with others in the same ad unit to help promote discoverability."
            />
          </>
        )}
      </MetaCard>

      <MetaCard id="ad-destination" title="Destination">
        {needsWebsite || needsApp ? (
          <>
            <MetaField
              label={needsApp ? 'App store URL' : 'Website URL'}
              required
              hint="Enter the URL that people visit after your ad"
            >
              <MetaInput
                placeholder="https://"
                value={data.websiteUrl}
                onChange={(e) => set('websiteUrl', e.target.value)}
              />
            </MetaField>
            {!needsApp ? (
              <MetaField
                label="Display link"
                className="mt-3"
                hint={`${(data.displayLink || '').length}/250`}
              >
                <MetaInput
                  maxLength={250}
                  value={data.displayLink}
                  onChange={(e) => set('displayLink', e.target.value)}
                />
              </MetaField>
            ) : null}
          </>
        ) : null}

        {needsCalls ? (
          <MetaField
            label="Phone number"
            required
            className={needsWebsite ? 'mt-3' : ''}
            hint="People can call this number from your ad"
          >
            <MetaInput
              placeholder="+91…"
              value={data.phoneNumber || ''}
              onChange={(e) => set('phoneNumber', e.target.value)}
            />
          </MetaField>
        ) : null}

        {needsMessaging && !needsInstantForm ? (
          <div className={needsWebsite || needsCalls ? 'mt-4' : ''}>
            {conversionLocation === 'whatsapp' ? (
              <MetaField
                label="WhatsApp number"
                required
                hint="The business number customers message, with country code. This is not the WhatsApp API phone-number ID."
              >
                <MetaInput
                  placeholder="+91…"
                  value={data.phoneNumber || ''}
                  onChange={(e) => set('phoneNumber', e.target.value)}
                />
              </MetaField>
            ) : null}
            <p className={`text-sm font-semibold text-slate-800 ${conversionLocation === 'whatsapp' ? 'mt-4' : ''}`}>Message template</p>
            <p className="mt-0.5 text-xs text-slate-500">
              Choose how conversations start in{' '}
              {conversionLocation === 'whatsapp'
                ? 'WhatsApp'
                : conversionLocation === 'instagram'
                  ? 'Instagram'
                  : 'Messenger'}
              .
            </p>
            <div className="mt-2 space-y-2">
              {messageTemplateOptions.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex cursor-pointer gap-3 rounded-lg border px-3 py-3 ${
                    (data.messageTemplate || 'start_conversation') === opt.value
                      ? 'border-[#1877F2] bg-[#E7F3FF]'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="messageTemplate"
                    checked={(data.messageTemplate || 'start_conversation') === opt.value}
                    onChange={() => set('messageTemplate', opt.value)}
                    className="mt-0.5"
                  />
                  <span>
                    <span className="block text-sm font-medium text-slate-800">{opt.label}</span>
                    <span className="mt-0.5 block text-xs text-slate-500">{opt.description}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        ) : null}

        {needsInstantForm ? (
          <div className={needsWebsite || needsCalls ? 'mt-4' : ''}>
            <p className="text-sm font-medium text-slate-800">
              <span className="text-rose-500">*</span> Instant form
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              Required for {locationLabel}. Forms open on Facebook or Instagram without leaving the app.
            </p>
            <button
              type="button"
              className="mt-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              + Create instant form
            </button>
            <div className="mt-3 space-y-2">
              {instantForms.map((form) => (
                <label
                  key={form}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 ${
                    data.instantForm === form
                      ? 'border-[#1877F2] bg-[#1877F2]/5'
                      : 'border-slate-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="instantForm"
                    checked={data.instantForm === form}
                    onChange={() => set('instantForm', form)}
                  />
                  <span className="text-sm text-slate-800">{form}</span>
                </label>
              ))}
            </div>
            <div className="mt-3 space-y-1 border-t border-slate-100 pt-3">
              <MetaCheckRow
                checked={data.requireSmsVerification}
                onChange={(v) => set('requireSmsVerification', v)}
                label="Require SMS verification to submit form"
                description="Leads must verify their phone number via a one-time code."
              />
              <MetaCheckRow
                checked={data.requireWorkEmail}
                onChange={(v) => set('requireWorkEmail', v)}
                label="Require work email address"
                description="Leads must use an email associated with a real organisation."
              />
              <MetaCheckRow
                checked={data.chatWithLeads}
                onChange={(v) => set('chatWithLeads', v)}
                label="Chat with leads from instant form"
                description="Receive messages via Messenger or Instagram after form submission."
              />
            </div>
          </div>
        ) : null}

        {isInstagramLive ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3">
            <p className="text-sm font-semibold text-slate-900">Destination</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              People who tap your ad will go to the Instagram live video (
              {(adSet.liveVideoAdType || 'upcoming') === 'current' ? 'happening now' : 'upcoming'}
              ). Configure live video settings in the ad set.
            </p>
          </div>
        ) : null}

        {!needsWebsite &&
        !needsInstantForm &&
        !needsMessaging &&
        !needsCalls &&
        !needsApp &&
        !isInstagramLive ? (
          <p className="text-xs text-slate-500">
            Destination fields for this conversion location will appear based on your ad set settings.
          </p>
        ) : null}
      </MetaCard>

      {needsWebsite || needsApp ? (
        <MetaCard title="Tracking">
          <MetaCheckRow
            checked={data.websiteEvents}
            onChange={(v) => set('websiteEvents', v)}
            label="Website events"
            description={
              adSet.dataset
                ? `Uses dataset from ad set: ${labelFromOptions(datasetOptions, adSet.dataset)}`
                : 'Track actions with your Meta pixel / dataset from the ad set.'
            }
          />
          {needsApp || conversionLocation === 'app' ? (
            <MetaCheckRow
              checked={data.appEvents}
              onChange={(v) => set('appEvents', v)}
              label="App events"
            />
          ) : null}
          <MetaField label="URL parameters" className="mt-2" hint="Example: key1=value1&key2=value2">
            <MetaInput
              value={data.urlParameters}
              onChange={(e) => set('urlParameters', e.target.value)}
            />
          </MetaField>
          <button type="button" className="mt-2 text-xs font-medium text-[#1877F2] hover:underline">
            Build a URL parameter
          </button>
        </MetaCard>
      ) : null}

      <MetaCard id="ad-creative" title="Ad creative">
        {!isInstagramLive ? (
          <div className="mb-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-800">
                  Media
                  <MetaInfoIcon />
                </p>
                <p className="mt-0.5 max-w-xl text-xs leading-relaxed text-slate-500">
                  {formatAspectHint()} Videos 1 second–241 minutes; MP4 or MOV. Images JPG or PNG.
                </p>
              </div>
              {data.mediaUrl ? (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPendingMedia(null);
                      setCropOpen(true);
                    }}
                    className="rounded-lg border border-[#1877F2] bg-white px-3 py-1.5 text-sm font-semibold text-[#1877F2] hover:bg-[#E7F3FF]"
                  >
                    Edit crops
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMediaError('');
                      mediaInputRef.current?.click();
                    }}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={removeMedia}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-rose-600 hover:bg-rose-50"
                  >
                    Remove
                  </button>
                </div>
              ) : null}
            </div>

            <input
              ref={mediaInputRef}
              type="file"
              accept="video/mp4,video/quicktime,image/jpeg,image/png,image/jpg"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleMediaFile(file);
                e.target.value = '';
              }}
            />

            {data.mediaUrl ? (
              <div className="mt-3 space-y-3">
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                  <div className="grid gap-0 sm:grid-cols-3">
                    {META_CROP_GROUPS.map((g) => {
                      const crop = data.mediaCrops?.[g.id];
                      const enabled = crop?.enabled !== false;
                      const aspect = crop?.aspect || g.defaultAspect;
                      return (
                        <div key={g.id} className="border-b border-slate-200 sm:border-b-0 sm:border-r last:border-0">
                          <div className="flex items-center justify-between gap-1 bg-white px-2.5 py-1.5">
                            <p className="truncate text-[11px] font-semibold text-slate-800">{g.shortLabel}</p>
                            <span
                              className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                                enabled
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-slate-100 text-slate-400'
                              }`}
                            >
                              {enabled ? aspect : 'Off'}
                            </span>
                          </div>
                          {enabled ? (
                            <CroppedMediaPreview
                              mediaUrl={data.mediaUrl}
                              mediaType={data.mediaType}
                              crop={crop}
                              aspectId={aspect}
                              className="max-h-40"
                            />
                          ) : (
                            <div className="flex h-28 items-center justify-center bg-slate-100 text-[11px] text-slate-400">
                              Not cropped
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-white px-3.5 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {data.mediaName || (data.mediaType === 'video' ? 'Video' : 'Image')}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {data.mediaType === 'video' ? 'Video' : 'Image'}
                        {data.mediaSize
                          ? ` · ${(Number(data.mediaSize) / (1024 * 1024)).toFixed(1)} MB`
                          : ''}
                        {data.mediaType === 'video' && data.mediaDuration
                          ? ` · ${Math.floor(Number(data.mediaDuration) / 60)}:${String(
                              Math.floor(Number(data.mediaDuration) % 60)
                            ).padStart(2, '0')}`
                          : ''}
                        {' · '}
                        Cropped for Meta placements
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        data.mediaType === 'video'
                          ? 'bg-[#E7F3FF] text-[#1877F2]'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {data.mediaType === 'video' ? 'Video ready' : 'Image ready'}
                    </span>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-[#F7F8FA] px-3 py-2.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Meta placement ratios
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {[
                      { a: '4:5', t: 'Feed rec.' },
                      { a: '1:1', t: 'Square' },
                      { a: '9:16', t: 'Stories/Reels' },
                      { a: '1.91:1', t: 'Right column' },
                      { a: '16:9', t: 'Horizontal' },
                    ].map((x) => (
                      <span
                        key={x.a}
                        className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] text-slate-700"
                      >
                        <span className="font-semibold">{x.a}</span>
                        <span className="text-slate-400">{x.t}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setMediaError('');
                    mediaInputRef.current?.click();
                  }
                }}
                onClick={() => {
                  setMediaError('');
                  mediaInputRef.current?.click();
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setMediaDragOver(true);
                }}
                onDragLeave={() => setMediaDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setMediaDragOver(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleMediaFile(file);
                }}
                className={`mt-3 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-10 text-center transition ${
                  mediaDragOver
                    ? 'border-[#1877F2] bg-[#E7F3FF]'
                    : 'border-slate-300 bg-slate-50 hover:border-[#1877F2] hover:bg-[#F5F9FF]'
                }`}
              >
                <div className="flex items-center gap-3 text-slate-500">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <circle cx="8.5" cy="10" r="1.5" />
                      <path d="M21 16l-5-5-8 8" />
                    </svg>
                  </span>
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="3" y="6" width="13" height="12" rx="2" />
                      <path d="M16 10l5-3v10l-5-3" />
                    </svg>
                  </span>
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-900">Add media</p>
                <p className="mt-1 max-w-sm text-xs text-slate-500">
                  Drag and drop an image or video. You&apos;ll crop to Meta placement aspect ratios next
                  (Feed 4:5, Stories/Reels 9:16, Horizontal 16:9).
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMediaError('');
                      if (mediaInputRef.current) {
                        mediaInputRef.current.accept = 'video/mp4,video/quicktime';
                        mediaInputRef.current.click();
                        setTimeout(() => {
                          if (mediaInputRef.current) {
                            mediaInputRef.current.accept =
                              'video/mp4,video/quicktime,image/jpeg,image/png,image/jpg';
                          }
                        }, 0);
                      }
                    }}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                  >
                    Add video
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMediaError('');
                      if (mediaInputRef.current) {
                        mediaInputRef.current.accept = 'image/jpeg,image/png,image/jpg';
                        mediaInputRef.current.click();
                        setTimeout(() => {
                          if (mediaInputRef.current) {
                            mediaInputRef.current.accept =
                              'video/mp4,video/quicktime,image/jpeg,image/png,image/jpg';
                          }
                        }, 0);
                      }
                    }}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                  >
                    Add image
                  </button>
                </div>
              </div>
            )}

            {mediaError ? (
              <p className="mt-2 text-xs font-medium text-rose-600">{mediaError}</p>
            ) : null}

            <details className="mt-3 rounded-lg border border-slate-200 bg-white px-3 py-2">
              <summary className="cursor-pointer text-sm font-medium text-[#1877F2]">
                Or paste a media URL
              </summary>
              <MetaInput
                className="mt-2"
                placeholder="https://… image or video"
                value={data.mediaUrl?.startsWith('blob:') ? '' : data.mediaUrl || ''}
                onChange={(e) => {
                  const url = e.target.value.trim();
                  if (!url) {
                    onChange({
                      ...data,
                      mediaUrl: '',
                      mediaType: '',
                      mediaName: '',
                      mediaSize: 0,
                      mediaDuration: 0,
                      mediaCrops: null,
                    });
                    setMediaError('');
                    return;
                  }
                  const looksVideo = /\.(mp4|mov|webm)(\?|$)/i.test(url);
                  openCropForMedia({
                    mediaUrl: url,
                    mediaType: looksVideo ? 'video' : 'image',
                    mediaName: url.split('/').pop() || 'Remote media',
                    mediaSize: 0,
                    mediaDuration: 0,
                    replacePrevious: true,
                  });
                  setMediaError('');
                }}
              />
            </details>

            <MetaMediaCropModal
              open={cropOpen}
              mediaUrl={pendingMedia?.mediaUrl || data.mediaUrl}
              mediaType={pendingMedia?.mediaType || data.mediaType}
              mediaName={pendingMedia?.mediaName || data.mediaName}
              initialCrops={data.mediaCrops || createDefaultMediaCrops()}
              onCancel={cancelCrop}
              onDone={applyCroppedMedia}
            />
          </div>
        ) : null}

        <MetaField label="Primary text">
          <MetaTextarea
            rows={3}
            value={data.primaryText}
            onChange={(e) => set('primaryText', e.target.value)}
            placeholder={
              isInstagramLive
                ? 'Tell people what to expect from your live video…'
                : 'Write the main text for your ad…'
            }
          />
        </MetaField>
        {!isInstagramLive ? (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <MetaField label="Headline">
              <MetaInput value={data.headline} onChange={(e) => set('headline', e.target.value)} />
            </MetaField>
            <MetaField label="Call to action">
              <MetaSelect
                value={data.callToAction}
                onChange={(e) => set('callToAction', e.target.value)}
              >
                {ctaOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </MetaSelect>
            </MetaField>
          </div>
        ) : (
          <MetaField label="Call to action" className="mt-3">
            <MetaSelect
              value={data.callToAction}
              onChange={(e) => set('callToAction', e.target.value)}
            >
              {ctaOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </MetaSelect>
          </MetaField>
        )}
        {!isInstagramLive ? (
          <MetaField label="Description" className="mt-3">
            <MetaInput
              value={data.description}
              onChange={(e) => set('description', e.target.value)}
            />
          </MetaField>
        ) : null}
      </MetaCard>

      {needsInstantForm || objective === 'leads' ? (
        <MetaCard title="Automated lead delivery · Optional">
          <div className="space-y-2">
            {[
              { name: 'Google Sheets', desc: 'Get leads in a spreadsheet.' },
              { name: 'Microsoft Excel', desc: 'Get leads in a worksheet.' },
              { name: 'CRM', desc: 'Get leads in your CRM.' },
            ].map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2.5"
              >
                <div>
                  <p className="text-sm font-medium text-slate-800">{item.name}</p>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
                <button
                  type="button"
                  className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Set up
                </button>
              </div>
            ))}
          </div>
        </MetaCard>
      ) : null}
    </div>
  );
}

export default function MetaAdsCampaign({ onClose }) {
  const [draft, setDraft] = useState(loadDraft);
  const [level, setLevel] = useState('campaign');
  const [treeOpen, setTreeOpen] = useState(() =>
    typeof window === 'undefined' ? false : window.innerWidth >= 1024
  );
  const [scoreOpen, setScoreOpen] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [draftOn, setDraftOn] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState('');
  const [publishNotice, setPublishNotice] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    setSavedAt(new Date());
  }, [draft]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setTreeOpen(true);
      if (window.innerWidth >= 1280) setScoreOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const breadcrumbs = useMemo(
    () => [
      { id: 'campaign', label: draft.campaign.name || 'Campaign' },
      { id: 'adSet', label: draft.adSet.name || 'Ad set' },
      { id: 'ad', label: draft.ad.name || 'Ad' },
    ],
    [draft]
  );

  const levelIndex = LEVELS.indexOf(level);
  const currentCrumb = breadcrumbs[levelIndex] || breadcrumbs[0];

  const updateLevel = (key, next) => setDraft((prev) => ({ ...prev, [key]: next }));

  const goNext = () => {
    if (levelIndex < LEVELS.length - 1) setLevel(LEVELS[levelIndex + 1]);
  };

  const goBack = () => {
    if (levelIndex > 0) setLevel(LEVELS[levelIndex - 1]);
  };

  const resetDraft = () => {
    const empty = createEmptyMetaCampaign();
    setDraft(empty);
    setLevel('campaign');
  };

  const closeEditor = () => {
    if (typeof onClose === 'function') onClose();
    else resetDraft();
  };

  const openPublishIssue = () => {
    if (!publishError?.step) return;
    setLevel(publishError.step);
    if (window.innerWidth < 1024) setTreeOpen(false);
    window.setTimeout(() => {
      document.getElementById(publishError.anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  const publishDraft = async () => {
    const { body, errors } = buildCampaignRequest(draft);
    if (errors.length) {
      setPublishNotice('');
      setPublishError(errors[0]);
      return;
    }

    setPublishing(true);
    setPublishError('');
    setPublishNotice('Creating the campaign…');
    try {
      const created = await createCampaignDraft(body);
      const campaignId = created?.campaign?._id;
      if (!campaignId) throw new Error('The campaign was not saved.');

      const image = imageFileFromAd(draft.ad);
      if (image) {
        setPublishNotice('Uploading the image…');
        try {
          await uploadCampaignImage(campaignId, image);
        } catch (imageError) {
          setPublishNotice(imageError.message || 'The image was skipped.');
        }
      }

      setPublishNotice('Submitting the paused ad…');
      await submitCampaign(campaignId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(createEmptyMetaCampaign()));
      setPublishNotice('Campaign created. It is paused in Meta.');
      resetDraft();
      if (typeof onClose === 'function') onClose();
    } catch (error) {
      setPublishNotice('');
      setPublishError(error.message || 'The campaign could not be created.');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="relative flex h-[calc(100dvh-5.5rem)] min-h-0 flex-col overflow-hidden bg-[#E8F0FE]/50 sm:h-[calc(100dvh-6.5rem)]">
      {/* Top bar */}
      <div className="shrink-0 border-b border-slate-200 bg-white px-3 py-2 sm:px-4 sm:py-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setTreeOpen((v) => !v)}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 lg:h-8 lg:w-8"
              aria-label="Toggle campaign tree"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>

            {/* Mobile: current level only */}
            <button
              type="button"
              onClick={() => setLevel(currentCrumb.id)}
              className="inline-flex min-w-0 items-center gap-1.5 truncate text-sm font-semibold text-[#1877F2] sm:hidden"
            >
              <TreeIcon level={currentCrumb.id} />
              <span className="truncate">{currentCrumb.label}</span>
            </button>

            {/* sm+: full breadcrumbs */}
            <div className="hidden min-w-0 flex-wrap items-center gap-1.5 text-sm text-slate-600 sm:flex">
              {breadcrumbs.map((crumb, i) => (
                <span key={crumb.id} className="inline-flex min-w-0 items-center gap-1.5">
                  {i > 0 ? <span className="shrink-0 text-slate-300">›</span> : null}
                  <button
                    type="button"
                    onClick={() => setLevel(crumb.id)}
                    className={`inline-flex max-w-[140px] items-center gap-1.5 truncate font-medium md:max-w-[180px] ${
                      level === crumb.id ? 'text-[#1877F2]' : 'hover:text-slate-900'
                    }`}
                  >
                    <TreeIcon level={crumb.id} />
                    {crumb.label}
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setScoreOpen((v) => !v)}
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-slate-200 px-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 xl:hidden"
              aria-expanded={scoreOpen}
            >
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border-2 border-emerald-500 text-[10px] font-bold text-emerald-700">
                100
              </span>
              <span className="hidden sm:inline">Score</span>
            </button>
            <div className="hidden items-center gap-1 rounded-lg border border-slate-200 p-0.5 md:flex">
              <span className="rounded-md bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-800">Edit</span>
              <span className="px-3 py-1.5 text-xs font-medium text-slate-500">Review</span>
            </div>
            <span className="hidden text-xs text-slate-500 sm:inline">In draft</span>
            <MetaToggle checked={draftOn} onChange={setDraftOn} />
          </div>
        </div>

        {/* Mobile level stepper */}
        <div className="mt-2 flex gap-1 sm:hidden">
          {LEVELS.map((id, i) => {
            const active = level === id;
            const labels = { campaign: 'Campaign', adSet: 'Ad set', ad: 'Ad' };
            return (
              <button
                key={id}
                type="button"
                onClick={() => setLevel(id)}
                className={`flex-1 rounded-lg px-2 py-2 text-center text-[11px] font-semibold ${
                  active
                    ? 'bg-[#E7F3FF] text-[#1877F2]'
                    : i < levelIndex
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-slate-100 text-slate-500'
                }`}
              >
                {i + 1}. {labels[id]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        {/* Structure drawer */}
        {treeOpen ? (
          <aside className="absolute inset-y-0 left-0 z-30 flex w-[min(18rem,85vw)] flex-col border-r border-slate-200 bg-[#F0F2F5] shadow-xl lg:static lg:z-0 lg:w-64 lg:shadow-none">
            <div className="flex items-center justify-between border-b border-slate-200 px-3 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Structure</p>
              <button
                type="button"
                onClick={() => setTreeOpen(false)}
                className="rounded p-1.5 text-slate-500 hover:bg-slate-200 lg:hidden"
                aria-label="Close tree"
              >
                ✕
              </button>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto p-2">
              {LEVELS.map((id, index) => {
                const label =
                  id === 'campaign' ? draft.campaign.name : id === 'adSet' ? draft.adSet.name : draft.ad.name;
                const active = level === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setLevel(id);
                      if (window.innerWidth < 1024) setTreeOpen(false);
                    }}
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-3 text-left text-sm transition lg:py-2.5 ${
                      active
                        ? 'bg-white font-semibold text-[#1877F2] shadow-sm'
                        : 'text-slate-700 hover:bg-white/70'
                    }`}
                    style={{ paddingLeft: `${12 + index * 14}px` }}
                  >
                    <TreeIcon level={id} />
                    <span className="truncate">{label || id}</span>
                  </button>
                );
              })}
            </nav>
          </aside>
        ) : null}

        {treeOpen ? (
          <button
            type="button"
            className="absolute inset-0 z-20 bg-black/30 lg:hidden"
            aria-label="Close overlay"
            onClick={() => setTreeOpen(false)}
          />
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden xl:flex-row">
            <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-3 py-3 pb-28 sm:px-5 sm:py-4 sm:pb-24">
              {level === 'campaign' ? (
                <CampaignLevelForm data={draft.campaign} onChange={(next) => updateLevel('campaign', next)} />
              ) : null}
              {level === 'adSet' ? (
                <AdSetLevelForm
                  data={draft.adSet}
                  onChange={(next) => updateLevel('adSet', next)}
                  campaignObjective={draft.campaign?.objective || 'leads'}
                  campaignBudget={{
                    budgetStrategy: draft.campaign?.budgetStrategy || 'campaign',
                    budgetType: draft.campaign?.budgetType || 'daily',
                    dailyBudget: draft.campaign?.dailyBudget || '',
                    advantagePlus: draft.campaign?.advantagePlus !== false,
                  }}
                />
              ) : null}
              {level === 'ad' ? (
                <AdLevelForm
                  data={draft.ad}
                  onChange={(next) => updateLevel('ad', next)}
                  campaign={draft.campaign}
                  adSet={draft.adSet}
                />
              ) : null}
            </main>

            {/* Desktop score column */}
            <aside className="hidden min-h-0 w-[320px] shrink-0 overflow-y-auto border-l border-slate-200 bg-[#F5F7FA] px-4 py-4 pb-24 xl:block">
              <CampaignScorePanel
                draft={draft}
                level={level}
                onAdChange={(next) => updateLevel('ad', next)}
              />
            </aside>
          </div>

          {/* Mobile score sheet */}
          {scoreOpen ? (
            <>
              <button
                type="button"
                className="absolute inset-0 z-40 bg-black/30 xl:hidden"
                aria-label="Close score"
                onClick={() => setScoreOpen(false)}
              />
              <div className="absolute inset-x-0 bottom-0 z-50 max-h-[75dvh] overflow-y-auto rounded-t-2xl border border-slate-200 bg-[#F5F7FA] px-3 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-3 shadow-2xl xl:hidden">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-800">Campaign insights</p>
                  <button
                    type="button"
                    onClick={() => setScoreOpen(false)}
                    className="rounded-md px-2 py-1 text-sm text-slate-500 hover:bg-slate-200"
                  >
                    Done
                  </button>
                </div>
                <CampaignScorePanel
                  draft={draft}
                  level={level}
                  onAdChange={(next) => updateLevel('ad', next)}
                />
              </div>
            </>
          ) : null}

          {publishError || publishNotice ? (
            <div
              className={`flex shrink-0 flex-wrap items-center justify-between gap-2 border-t px-3 py-2 text-sm sm:px-4 ${
                publishError
                  ? 'border-red-200 bg-red-50 text-red-700'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-800'
              }`}
            >
              <p className="min-w-0 flex-1">
                {typeof publishError === 'string' ? publishError : publishError?.message || publishNotice}
              </p>
              {publishError?.step ? (
                <button
                  type="button"
                  onClick={openPublishIssue}
                  className="shrink-0 rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-red-700 ring-1 ring-inset ring-red-300 hover:bg-red-100"
                >
                  {publishError.step === 'campaign'
                    ? 'Go to campaign'
                    : publishError.step === 'adSet'
                      ? 'Go to ad set'
                      : 'Go to ad'}
                </button>
              ) : null}
            </div>
          ) : null}

          <footer className="safe-area-pb sticky bottom-0 z-30 flex shrink-0 items-center justify-between gap-2 border-t border-slate-200 bg-white/95 px-3 py-2.5 backdrop-blur sm:gap-3 sm:px-4 sm:py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.04)]">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={closeEditor}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:px-4"
              >
                Close
              </button>
              <span className="hidden items-center gap-1.5 text-xs text-emerald-600 sm:inline-flex">
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-white">
                  ✓
                </span>
                <span className="truncate">{savedAt ? 'Saved' : 'Saving…'}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goBack}
                disabled={levelIndex === 0}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 sm:px-4"
              >
                Back
              </button>
              {levelIndex < LEVELS.length - 1 ? (
                <button
                  type="button"
                  onClick={goNext}
                  className="rounded-lg bg-[#1877F2] px-4 py-2 text-sm font-semibold text-white hover:bg-[#166FE5] sm:px-5"
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  onClick={publishDraft}
                  disabled={publishing}
                  className="rounded-lg bg-[#00A400] px-4 py-2 text-sm font-semibold text-white hover:bg-[#008F00] disabled:cursor-wait disabled:opacity-60 sm:px-5"
                >
                  {publishing ? 'Publishing…' : 'Publish'}
                </button>
              )}
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
