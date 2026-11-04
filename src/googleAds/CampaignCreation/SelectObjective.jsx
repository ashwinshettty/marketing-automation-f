import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GOOGLE_ADS_BASE } from '../nav/googleAdsNavConfig';
import useGoogleAdsGoals from '../goals/useGoogleAdsGoals';
import {
  buildCampaignGoalPicker,
  buildConversionGoalConfig,
} from '../goals/goalsViewHelpers';

/* ─── objective catalog (backend OBJECTIVE_KEYS) ─── */

const OBJECTIVES = [
  {
    id: 'SALES',
    title: 'Sales',
    description: 'Drive sales online, in app, by phone, or in store',
    icon: 'sales',
  },
  {
    id: 'LEADS',
    title: 'Leads',
    description: 'Get leads and other conversions by encouraging customers to take action',
    icon: 'leads',
  },
  {
    id: 'WEBSITE_TRAFFIC',
    title: 'Website traffic',
    description: 'Get the right people to visit your website',
    icon: 'traffic',
  },
  {
    id: 'APP_PROMOTION',
    title: 'App promotion',
    description: 'Get more installs, engagement and pre-registration for your app',
    icon: 'app',
  },
  {
    id: 'YOUTUBE',
    title: 'YouTube reach, views, and engagements',
    description: 'Drive awareness and consideration of your product or brand',
    icon: 'youtube',
  },
  {
    id: 'LOCAL_STORE',
    title: 'Local store visits and promotions',
    description: 'Drive visits to local stores, including restaurants and dealerships',
    icon: 'local',
  },
  {
    id: 'NO_GUIDANCE',
    title: 'Create a campaign without guidance',
    description: "You'll choose a campaign next",
    icon: 'settings',
  },
];

const CONVERSION_GOAL_OBJECTIVES = new Set(['SALES', 'LEADS', 'WEBSITE_TRAFFIC']);

/** Snapshot stored on campaign.start.goals (display) + conversionGoalConfig (refs). */
function toStartGoalsSnapshot(selectedGoals = []) {
  return (selectedGoals || []).map((goal) => ({
    id: goal.id,
    category: goal.category || null,
    label: goal.name || null,
    accountDefault: Boolean(goal.accountDefault),
    standardGoalIds: goal.standardGoalIds || [],
    customGoalId: goal.customGoalId || null,
    sources: (goal.sources || []).map((source) => ({
      origin: source.origin || null,
      source: source.source || null,
      standardGoalId: source.standardGoalId || null,
      actionCount: source.actions ?? source.actionCount ?? 0,
      valueDisplay: source.value || source.valueDisplay || '—',
      warning: Boolean(source.warning),
    })),
  }));
}

const CAMPAIGN_TYPES = [
  {
    id: 'SEARCH',
    title: 'Search',
    description: 'Drive action on Google Search with text ads',
    icons: ['g'],
  },
  {
    id: 'PERFORMANCE_MAX',
    title: 'Performance Max',
    description:
      'Reach the right people wherever they\'re browsing with ads on Google Search, YouTube, Display, and more',
    icons: ['g', 'yt', 'gmail', 'maps', 'display', 'search'],
  },
  {
    id: 'DEMAND_GEN',
    title: 'Demand Gen',
    description:
      'Drive demand and conversions on YouTube, Google Display Network, and more with image and video ads',
    icons: ['yt', 'gmail', 'display'],
  },
  {
    id: 'DISPLAY',
    title: 'Display',
    description: 'Reach potential customers across 3 million sites and apps with your creative',
    icons: ['yt', 'gmail', 'display'],
  },
  {
    id: 'SHOPPING',
    title: 'Shopping',
    description: 'Promote your products from Merchant Center on Google Search with Shopping ads',
    icons: ['g'],
  },
  {
    id: 'VIDEO',
    title: 'Video',
    description: 'Drive action on YouTube with your video ads',
    icons: ['yt', 'display'],
  },
  {
    id: 'APP',
    title: 'App',
    description:
      'Promote your Android or iOS app on Google Search, Play, YouTube and partner sites with app ads',
    icons: ['g', 'yt', 'play', 'search', 'display'],
  },
];

const YOUTUBE_GOALS = [
  {
    id: 'VIDEO_VIEWS',
    title: 'Video views',
    description: 'Get people to watch your video ads.',
    suggested: true,
    goodFor: [
      'Finding people who are more likely to be interested in your product or brand, and consider it when deciding to make a purchase',
      'Increasing the number of online searches for your product or brand',
      'Getting more people to watch your entire video ad',
    ],
    optimized: ['TrueView views'],
    calloutTitle: 'Build product consideration with TrueView views',
    calloutBody:
      'People who choose to watch or engage with your video ads are more likely to search for your product or brand and actively consider it as they get closer to making a purchase.',
  },
  {
    id: 'REACH',
    title: 'Reach',
    description: 'Reach the maximum number of people',
    suggested: false,
    goodFor: ['Maximizing unique reach on YouTube and Google video partners'],
    optimized: ['Unique reach'],
  },
  {
    id: 'YT_SUBSCRIPTIONS',
    title: 'YouTube subscriptions and engagements',
    description: 'Get people to subscribe and engage with your YouTube channel',
    suggested: false,
    goodFor: ['Growing channel subscribers and engagements'],
    optimized: ['Subscriptions', 'Engagements'],
  },
];

const RESERVATION_REACH_WAYS = [
  {
    id: 'PREMIER_REACH',
    title: 'Premier reach',
    description:
      'Get access to special features and show your ads on top content with bumper, skippable in-stream, non-skippable in-stream, Shorts ads and pause ads. This includes YouTube Select lineups.',
  },
  {
    id: 'MASTHEAD',
    title: 'Masthead',
    description:
      'Drive mass reach and awareness with a prominent ad placement on YouTube and Google TV.',
  },
  {
    id: 'STANDARD_REACH',
    title: 'Standard reach',
    description:
      'Get the most reach for your budget with bumper, skippable in-stream, or non-skippable in-stream ads.',
  },
];

const VIDEO_AD_FORMATS = [
  {
    id: 'NON_SKIPPABLE',
    title: 'Non-skippable in-stream ads',
    description:
      "Non-skippable in-stream ads can be up to 60 seconds long and play before, during, or after other videos. Users don't have the option to skip the ad.",
  },
  {
    id: 'BUMPER',
    title: 'Bumper ads',
    description:
      "Bumper ads are 6 seconds long and play before, during, or after other videos. Users don't have the option to skip the ad.",
  },
  {
    id: 'SKIPPABLE',
    title: 'Skippable in-stream ads',
    description:
      'Skippable in-stream ads are at least 7 seconds long and play before, during, or after other videos. Users have the option to skip the ad after 5 seconds.',
  },
  {
    id: 'SHORTS',
    title: 'Shorts ads',
    description:
      'Shorts ads are at least 5 seconds long and play on YouTube Shorts. Users have the option to skip the ad at any time.',
  },
  {
    id: 'PAUSE',
    title: 'Pause ads',
    description:
      "Pause ads are shown on connected TV screens after a user has paused the video player for 10 seconds and hasn't interacted with the screen for 5 seconds.",
  },
];

const APP_SUBTYPES = [
  {
    id: 'INSTALLS',
    title: 'App installs',
    description: 'Get new people to install your app',
  },
  {
    id: 'ENGAGEMENT',
    title: 'App engagement',
    description: 'Get existing users to take actions in your app (Minimum 50K installs required)',
  },
  {
    id: 'PRE_REGISTRATION',
    title: 'App pre-registration (Android only)',
    description: 'Get new users to pre-register for your app before launch',
  },
];

/** No-guidance → Video → Auction subtypes (Google Ads UI). */
const VIDEO_AUCTION_SUBTYPES = [
  {
    id: 'VIDEO_VIEWS',
    title: 'Video views',
    description:
      'Get people to watch your video ads using skippable in-stream, in-feed, and Shorts ads.',
    badge: 'Suggested',
    calloutTitle: 'Build product consideration with TrueView views.',
    calloutBody:
      'People who choose to watch or engage with your video ads are more likely to search for your product or brand and actively consider it as they get closer to making a purchase.',
  },
  {
    id: 'VIDEO_REACH',
    title: 'Video reach',
    description: null,
    children: [
      {
        id: 'EFFICIENT_REACH',
        title: 'Efficient reach',
        description:
          'Get the most reach for your budget using bumper, skippable in-stream, in-feed, and Shorts ads.',
      },
      {
        id: 'NON_SKIPPABLE_REACH',
        title: 'Non-skippable reach',
        description:
          'Reach people using bumper, standard non-skippable, and 30-second non-skippable in-stream ads.',
      },
      {
        id: 'TARGET_FREQUENCY',
        title: 'Target frequency',
        description:
          'Reach the same people multiple times using bumper, skippable in-stream, non-skippable in-stream, in-feed, and Shorts ads.',
      },
    ],
  },
  {
    id: 'DRIVE_CONVERSIONS',
    title: 'Drive conversions',
    description:
      'Get more conversions with video ads designed to encourage valuable interactions with your business.',
  },
  {
    id: 'AD_SEQUENCE',
    title: 'Ad sequence',
    description:
      'Tell your story by showing ads in a particular sequence to individual viewers with skippable in-stream ads, non-skippable in-stream ads, bumper ads, or a mix.',
  },
  {
    id: 'AUDIO_REACH',
    title: 'Audio reach',
    description: "Reach people while they're listening to content on YouTube.",
  },
  {
    id: 'YT_SUBSCRIPTIONS',
    title: 'YouTube subscriptions and engagements',
    description:
      'Get subscriptions and drive engagement on your YouTube channel with video ads designed to encourage valuable interactions.',
    badge: 'NEW',
  },
];

const VIDEO_REACH_CHILD_IDS = new Set([
  'EFFICIENT_REACH',
  'NON_SKIPPABLE_REACH',
  'TARGET_FREQUENCY',
]);

const OPTIMIZATION_GOALS_TITLE = 'Use these conversion goals for campaign performance optimization';
const OPTIMIZATION_GOALS_DESC =
  'Conversion goals labeled as account default will use data from all of your campaigns to improve your bid strategy and campaign performance.';

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

function ObjectiveIcon({ name, className = 'h-6 w-6' }) {
  switch (name) {
    case 'sales':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M4 8h12l4 4v7a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" {...stroke} />
          <path d="M16 8v4h4M8 14h.01M12 14h.01" {...stroke} />
        </svg>
      );
    case 'leads':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <circle cx="10" cy="8" r="3.5" {...stroke} />
          <path d="M4 19c0-3 2.5-5 6-5s6 2 6 5M15.5 11.5l1.5 1.5 3-3" {...stroke} />
        </svg>
      );
    case 'traffic':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M8 4h8l4 12H12L8 4zM10 16v4M7 20h6" {...stroke} />
        </svg>
      );
    case 'app':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <rect x="7" y="3" width="10" height="18" rx="2" {...stroke} />
          <path d="M12 8v5M10 11l2 2 2-2" {...stroke} />
        </svg>
      );
    case 'youtube':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M4 10v4l8-5v10l8-5V9L12 4 4 9v1z" {...stroke} />
        </svg>
      );
    case 'local':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10z" {...stroke} />
          <circle cx="12" cy="11" r="2.2" {...stroke} />
        </svg>
      );
    case 'settings':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <circle cx="12" cy="12" r="3" {...stroke} />
          <path d="M12 3v2M12 19v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M3 12h2M19 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" {...stroke} />
        </svg>
      );
    case 'contacts':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <circle cx="9" cy="8" r="3" {...stroke} />
          <circle cx="16" cy="9" r="2.5" {...stroke} />
          <path d="M3 19c0-2.8 2.2-4.5 6-4.5S15 16.2 15 19M13 19c.3-1.6 1.5-2.8 3.5-2.8S20 17.4 20 19" {...stroke} />
        </svg>
      );
    case 'pageViews':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <rect x="4" y="5" width="16" height="14" rx="2" {...stroke} />
          <circle cx="12" cy="12" r="2.5" {...stroke} />
        </svg>
      );
    case 'phone':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M7 3h4l1 5-2 1a12 12 0 0 0 5 5l1-2 5 1v4a2 2 0 0 1-2 2A14 14 0 0 1 5 7a2 2 0 0 1 2-4z" {...stroke} />
        </svg>
      );
    case 'purchases':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <rect x="3" y="6" width="18" height="12" rx="2" {...stroke} />
          <path d="M3 10h18" {...stroke} />
        </svg>
      );
    case 'forms':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M7 3h8l4 4v14H7V3z" {...stroke} />
          <path d="M15 3v4h4M9 13l2 2 4-4" {...stroke} />
        </svg>
      );
    case 'engagements':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M8 4h8l4 12H12L8 4zM10 16v4M7 20h6" {...stroke} />
        </svg>
      );
    case 'directions':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="m12 3 9 9-9 9-9-9 9-9z" {...stroke} />
          <path d="M10 12h5l-2-2M15 12l-2 2" {...stroke} />
        </svg>
      );
    case 'messages':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M4 5h16v11H8l-4 3V5z" {...stroke} />
          <path d="M8 9h8M8 12h5" {...stroke} />
        </svg>
      );
    case 'store':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M4 9 6 4h12l2 5v11H4V9z" {...stroke} />
          <path d="M4 9h16M9 13h6v7H9v-7z" {...stroke} />
        </svg>
      );
    case 'ytViews':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <rect x="3" y="6" width="14" height="10" rx="2" {...stroke} />
          <path d="m9 9 4 2-4 2V9zM8 17h12v3H8z" {...stroke} />
        </svg>
      );
    case 'download':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M12 4v10M8 10l4 4 4-4M5 18h14" {...stroke} />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <circle cx="12" cy="12" r="8" {...stroke} />
        </svg>
      );
  }
}

function ChannelDots({ icons = [] }) {
  const colors = {
    g: 'bg-[#4285f4]',
    yt: 'bg-[#ff0000]',
    gmail: 'bg-[#ea4335]',
    maps: 'bg-[#34a853]',
    display: 'bg-[#fbbc04]',
    search: 'bg-[#4285f4]',
    play: 'bg-[#34a853]',
  };
  return (
    <div className="mb-3 flex items-center gap-1.5">
      {icons.map((key) => (
        <span
          key={key}
          className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold text-white ${colors[key] || 'bg-[#5f6368]'}`}
        >
          {key === 'yt' ? '▶' : key === 'search' ? '⌕' : key.slice(0, 1).toUpperCase()}
        </span>
      ))}
    </div>
  );
}

function Card({ children, className = '' }) {
  return (
    <section
      className={`rounded-2xl border border-[var(--ga-border)] bg-white shadow-[0_1px_2px_rgba(60,64,67,0.08)] ${className}`}
    >
      {children}
    </section>
  );
}

function SelectableTypeCard({ selected, onClick, title, description, icons }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex min-h-[140px] flex-col items-start rounded-xl border bg-white p-4 text-left transition ${
        selected
          ? 'border-[3px] border-[var(--ga-blue)]'
          : 'border-[var(--ga-border)] hover:bg-[var(--ga-hover)]'
      }`}
    >
      {selected ? (
        <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--ga-blue)] text-[11px] text-white">
          ✓
        </span>
      ) : null}
      <ChannelDots icons={icons} />
      <span className="text-sm font-medium text-[var(--ga-ink)]">{title}</span>
      <span className="mt-2 text-xs leading-5 text-[var(--ga-muted)]">{description}</span>
    </button>
  );
}

function RadioRow({ checked, onChange, title, description, badge = null, children = null }) {
  return (
    <label className="flex cursor-pointer gap-3 py-3">
      <input
        type="radio"
        checked={checked}
        onChange={onChange}
        className="mt-1 h-4 w-4 accent-[var(--ga-blue)]"
      />
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-[var(--ga-ink)]">{title}</span>
          {badge}
        </span>
        {description ? (
          <span className="mt-1 block text-xs leading-5 text-[var(--ga-muted)]">{description}</span>
        ) : null}
        {children}
      </span>
    </label>
  );
}

/** Auction subtype row — selected state uses a bordered card + checkmark (Google Ads UI). */
function AuctionSubtypeOption({
  checked,
  onChange,
  title,
  description,
  badge = null,
  children = null,
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative w-full rounded-xl border p-4 text-left transition ${
        checked
          ? 'border-[3px] border-[var(--ga-blue)] bg-white'
          : 'border-transparent hover:bg-[var(--ga-hover)]'
      }`}
    >
      {checked ? (
        <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--ga-blue)] text-[11px] text-white">
          ✓
        </span>
      ) : null}
      <span className="flex items-start gap-3">
        <span
          className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
            checked ? 'border-[var(--ga-blue)]' : 'border-[#5f6368]'
          }`}
          aria-hidden="true"
        >
          {checked ? <span className="h-2 w-2 rounded-full bg-[var(--ga-blue)]" /> : null}
        </span>
        <span className="min-w-0 flex-1 pr-6">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-[var(--ga-ink)]">{title}</span>
            {badge}
          </span>
          {description ? (
            <span className="mt-1 block text-xs leading-5 text-[var(--ga-muted)]">{description}</span>
          ) : null}
          {children}
        </span>
      </span>
    </button>
  );
}

function WarningIcon() {
  return (
    <span
      className="ml-1 inline-block text-[11px] text-[#f9ab00]"
      title="Needs attention"
      aria-label="Needs attention"
    >
      ⚠
    </span>
  );
}

function GoalRowMenu({ goal, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (event) => {
      if (!menuRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        aria-label={`Actions for ${goal.name}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="rounded-full px-2 py-1 text-[var(--ga-muted)] hover:bg-[var(--ga-hover)]"
      >
        ⋮
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-1 w-40 overflow-hidden rounded-lg border border-[var(--ga-border)] bg-white py-1 shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onEdit?.(goal);
            }}
            className="flex w-full px-4 py-2.5 text-left text-sm text-[var(--ga-ink)] hover:bg-[var(--ga-hover)]"
          >
            Edit
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onDelete?.(goal.id);
            }}
            className="flex w-full px-4 py-2.5 text-left text-sm text-[#c5221f] hover:bg-[var(--ga-hover)]"
          >
            Delete
          </button>
        </div>
      ) : null}
    </div>
  );
}

function ConversionGoalsPanel({
  objectiveTitle,
  title = null,
  description = null,
  goals,
  onRemove,
  onEditGoal,
  additionalGoals,
  onAddGoal,
  loading = false,
  error = null,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onDoc = (event) => {
      if (!menuRef.current?.contains(event.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const available = (additionalGoals || []).filter(
    (goal) => !(goals || []).some((item) => item.id === goal.id),
  );

  const heading = title
    || `Use these conversion goals to improve ${objectiveTitle}`;
  const body = description
    || `Conversion goals labeled as account default will use data from all of your campaigns to improve your bid strategy and campaign performance, even if they don't seem directly related to ${objectiveTitle}.`;

  return (
    <Card>
      <div className="border-b border-[var(--ga-border)] px-6 py-5">
        <h2 className="text-[22px] font-normal text-[var(--ga-ink)]">{heading}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--ga-muted)]">{body}</p>
      </div>

      {error ? (
        <div className="mx-6 mt-4 rounded-lg border border-[#fce8e6] bg-[#fce8e6]/80 px-3 py-2 text-sm text-[#c5221f]">
          {error}
        </div>
      ) : null}

      {loading && !(goals || []).length ? (
        <div className="px-6 py-10 text-sm text-[var(--ga-muted)]">
          Loading conversion goals from Google Ads…
        </div>
      ) : (
        <div className="overflow-x-auto px-2 pb-2 pt-2">
          <table className="min-w-full text-left text-sm">
            <thead className="text-[var(--ga-muted)]">
              <tr className="border-b border-[var(--ga-border)]">
                <th className="px-4 py-3 font-medium">Conversion Goals</th>
                <th className="px-4 py-3 font-medium">Conversion Source</th>
                <th className="px-4 py-3 font-medium">Conversion Actions</th>
                <th className="px-4 py-3 font-medium">Value</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {(goals || []).length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-[var(--ga-muted)]">
                    No conversion goals selected. Add a goal below, or sync goals from Google Ads first.
                  </td>
                </tr>
              ) : null}
              {(goals || []).map((goal) =>
                (goal.sources || []).map((source, index) => (
                  <tr
                    key={`${goal.id}-${source.origin || source.source}-${index}`}
                    className="border-b border-[var(--ga-border)]"
                  >
                    <td className="px-4 py-3 align-top">
                      {index === 0 ? (
                        <div className="flex items-start gap-2">
                          <span className="mt-0.5 text-[var(--ga-muted)]">
                            <ObjectiveIcon name={goal.icon} className="h-5 w-5" />
                          </span>
                          <div>
                            <div className="font-medium text-[var(--ga-ink)]">{goal.name}</div>
                            {goal.accountDefault ? (
                              <div className="text-xs text-[var(--ga-muted)]">account default</div>
                            ) : null}
                          </div>
                        </div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-[var(--ga-ink)]">{source.source}</td>
                    <td className="px-4 py-3 text-[var(--ga-ink)]">
                      <span className="underline decoration-[var(--ga-border)]">
                        {source.actions} {source.actions === 1 ? 'action' : 'actions'}
                      </span>
                      {source.warning ? <WarningIcon /> : null}
                    </td>
                    <td className="px-4 py-3 text-[var(--ga-ink)]">{source.value}</td>
                    <td className="relative px-4 py-3 text-right">
                      {index === 0 ? (
                        <GoalRowMenu
                          goal={goal}
                          onEdit={onEditGoal}
                          onDelete={onRemove}
                        />
                      ) : null}
                    </td>
                  </tr>
                )),
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="relative px-6 py-4" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="text-sm font-medium text-[var(--ga-blue)] hover:underline"
        >
          Add goal
        </button>
        {menuOpen ? (
          <div className="absolute bottom-12 left-6 z-20 w-64 rounded-xl border border-[var(--ga-border)] bg-white py-2 shadow-lg">
            <div className="px-4 py-2 text-xs font-medium text-[var(--ga-muted)]">Additional goals</div>
            {available.length === 0 ? (
              <div className="px-4 py-2 text-sm text-[var(--ga-muted)]">No more goals to add</div>
            ) : (
              available.map((goal) => (
                <button
                  key={goal.id}
                  type="button"
                  onClick={() => {
                    onAddGoal(goal);
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-[var(--ga-ink)] hover:bg-[var(--ga-hover)]"
                >
                  <ObjectiveIcon name={goal.icon} className="h-5 w-5 text-[var(--ga-muted)]" />
                  {goal.name}
                </button>
              ))
            )}
          </div>
        ) : null}
      </div>
    </Card>
  );
}

function defaultCampaignName(objectiveId, typeLabel) {
  const objective = OBJECTIVES.find((item) => item.id === objectiveId);
  const stamp = new Date().toISOString().slice(0, 10);
  return `${objective?.title || 'Campaign'}-${typeLabel}-${stamp}`;
}

/**
 * Step 1 — Choose objective, then objective-specific setup (Google Ads–style).
 */
export default function SelectObjective() {
  const navigate = useNavigate();
  const [objective, setObjective] = useState(null);

  const {
    goals: syncedGoals,
    loading: goalsLoading,
    error: goalsError,
  } = useGoogleAdsGoals({ includeDeleted: false, ifStale: true });

  const picker = useMemo(
    () => buildCampaignGoalPicker(syncedGoals),
    [syncedGoals],
  );

  // Sales / Leads / Website traffic
  const [goals, setGoals] = useState([]);

  // App promotion
  const [appSubtype, setAppSubtype] = useState('INSTALLS');
  const [appPlatform, setAppPlatform] = useState(null);
  const [appQuery, setAppQuery] = useState('');
  const [appCampaignName, setAppCampaignName] = useState('');

  // YouTube
  const [buyMethod, setBuyMethod] = useState('AUCTION');
  const [youtubeGoal, setYoutubeGoal] = useState('VIDEO_VIEWS');
  const [reachWay, setReachWay] = useState('PREMIER_REACH');
  const [adFormat, setAdFormat] = useState('NON_SKIPPABLE');

  // Local store
  const [localGoals, setLocalGoals] = useState([]);
  const [localCampaignName, setLocalCampaignName] = useState('');
  const [storeLocations, setStoreLocations] = useState('ALL');
  const [merchantProducts, setMerchantProducts] = useState(false);
  const [finalUrl, setFinalUrl] = useState('');

  // No guidance
  const [campaignType, setCampaignType] = useState('SEARCH');
  const [unguidedName, setUnguidedName] = useState('');
  const [unguidedGoals, setUnguidedGoals] = useState([]);
  const [unguidedFinalUrl, setUnguidedFinalUrl] = useState('');
  const [unguidedVideoBuy, setUnguidedVideoBuy] = useState('AUCTION');
  const [unguidedVideoSubtype, setUnguidedVideoSubtype] = useState('VIDEO_VIEWS');
  const [unguidedVideoReachWay, setUnguidedVideoReachWay] = useState('PREMIER_REACH');
  const [unguidedVideoFormat, setUnguidedVideoFormat] = useState('NON_SKIPPABLE');
  const [unguidedAppSubtype, setUnguidedAppSubtype] = useState('INSTALLS');
  const [unguidedAppPlatform, setUnguidedAppPlatform] = useState(null);
  const [unguidedAppQuery, setUnguidedAppQuery] = useState('');

  // Seed selected goals from synced account-default goals once loaded.
  useEffect(() => {
    if (!picker.accountDefaultRows.length) return;
    setGoals((prev) => (prev.length ? prev : picker.accountDefaultRows));
    setUnguidedGoals((prev) => (prev.length ? prev : picker.accountDefaultRows));
    setLocalGoals((prev) => (prev.length ? prev : picker.accountDefaultRows));
  }, [picker.accountDefaultRows]);

  const objectiveMeta = useMemo(
    () => OBJECTIVES.find((item) => item.id === objective) || null,
    [objective],
  );

  const youtubeGoalMeta = YOUTUBE_GOALS.find((item) => item.id === youtubeGoal);
  const selectedCampaignType = CAMPAIGN_TYPES.find((type) => type.id === campaignType);

  const addUnguidedGoal = (goal) => {
    setUnguidedGoals((prev) => {
      if (prev.some((item) => item.id === goal.id)) return prev;
      return [...prev, goal];
    });
  };

  /** Open Goals Summary to edit the account goal (Google Ads–style). */
  const handleEditGoal = (goal) => {
    const params = new URLSearchParams();
    if (goal?.category) params.set('category', goal.category);
    if (goal?.customGoalId) params.set('customGoalId', goal.customGoalId);
    const qs = params.toString();
    navigate(`${GOOGLE_ADS_BASE}/goals/conversions${qs ? `?${qs}` : ''}`);
  };

  const appNamePlaceholder = useMemo(
    () => defaultCampaignName('APP_PROMOTION', 'App'),
    [],
  );
  const localNamePlaceholder = useMemo(
    () => defaultCampaignName('LOCAL_STORE', 'Performance Max'),
    [],
  );
  const unguidedNamePlaceholder = useMemo(
    () => (selectedCampaignType
      ? defaultCampaignName('NO_GUIDANCE', selectedCampaignType.title)
      : ''),
    [selectedCampaignType],
  );

  const resolvedAppName = appCampaignName.trim() || appNamePlaceholder;
  const resolvedLocalName = localCampaignName.trim() || localNamePlaceholder;
  const resolvedUnguidedName = unguidedName.trim() || unguidedNamePlaceholder;

  useEffect(() => {
    if (!objective) return;
    if (objective === 'APP_PROMOTION') {
      setAppCampaignName('');
    }
    if (objective === 'LOCAL_STORE') {
      setLocalCampaignName('');
      setLocalGoals(picker.accountDefaultRows);
    }
    if (CONVERSION_GOAL_OBJECTIVES.has(objective)) {
      setGoals(picker.accountDefaultRows);
    }
    if (objective === 'NO_GUIDANCE') {
      setUnguidedName('');
      setUnguidedGoals(picker.accountDefaultRows);
      setUnguidedFinalUrl('');
      setUnguidedVideoBuy('AUCTION');
      setUnguidedVideoSubtype('VIDEO_VIEWS');
      setUnguidedVideoReachWay('PREMIER_REACH');
      setUnguidedVideoFormat('NON_SKIPPABLE');
      setUnguidedAppSubtype('INSTALLS');
      setUnguidedAppPlatform(null);
      setUnguidedAppQuery('');
    }
  }, [objective, picker.accountDefaultRows]);

  useEffect(() => {
    if (objective !== 'NO_GUIDANCE' || !selectedCampaignType) return;
    setUnguidedName('');
    setUnguidedGoals(picker.accountDefaultRows);
    setUnguidedFinalUrl('');
    if (selectedCampaignType.id === 'VIDEO') {
      setUnguidedVideoBuy('AUCTION');
      setUnguidedVideoSubtype('VIDEO_VIEWS');
      setUnguidedVideoReachWay('PREMIER_REACH');
      setUnguidedVideoFormat('NON_SKIPPABLE');
    }
    if (selectedCampaignType.id === 'APP') {
      setUnguidedAppSubtype('INSTALLS');
      setUnguidedAppPlatform(null);
      setUnguidedAppQuery('');
    }
  }, [objective, campaignType, selectedCampaignType, picker.accountDefaultRows]);

  const selectUnguidedVideoBuy = (method) => {
    setUnguidedVideoBuy(method);
    if (method === 'AUCTION') {
      setUnguidedVideoSubtype((prev) =>
        prev && !VIDEO_REACH_CHILD_IDS.has(prev) && prev !== 'VIDEO_REACH'
          ? prev
          : 'VIDEO_VIEWS',
      );
    } else {
      setUnguidedVideoReachWay((prev) => prev || 'PREMIER_REACH');
      setUnguidedVideoFormat((prev) => prev || 'NON_SKIPPABLE');
    }
  };

  const selectUnguidedVideoReachWay = (way) => {
    setUnguidedVideoReachWay(way);
    if (way === 'STANDARD_REACH') {
      setUnguidedVideoFormat((prev) =>
        ['NON_SKIPPABLE', 'BUMPER', 'SKIPPABLE'].includes(prev) ? prev : 'NON_SKIPPABLE',
      );
    } else if (way === 'PREMIER_REACH') {
      setUnguidedVideoFormat((prev) => prev || 'NON_SKIPPABLE');
    }
  };

  const isSearchPath =
    CONVERSION_GOAL_OBJECTIVES.has(objective)
    || (objective === 'NO_GUIDANCE' && campaignType === 'SEARCH');

  const canContinue = (() => {
    if (!objective) return false;
    if (CONVERSION_GOAL_OBJECTIVES.has(objective)) return goals.length > 0;
    if (objective === 'APP_PROMOTION') {
      return Boolean(appSubtype && appPlatform && resolvedAppName);
    }
    if (objective === 'YOUTUBE') {
      if (buyMethod === 'RESERVATION') return Boolean(reachWay && adFormat);
      return Boolean(youtubeGoal);
    }
    if (objective === 'LOCAL_STORE') {
      return Boolean(resolvedLocalName);
    }
    if (objective === 'NO_GUIDANCE') {
      if (!campaignType) return false;
      if (campaignType === 'SEARCH') {
        return Boolean(resolvedUnguidedName && unguidedGoals.length);
      }
      if (campaignType === 'PERFORMANCE_MAX') {
        return Boolean(resolvedUnguidedName && unguidedFinalUrl.trim() && unguidedGoals.length);
      }
      if (campaignType === 'DEMAND_GEN') return unguidedGoals.length > 0;
      if (campaignType === 'DISPLAY' || campaignType === 'SHOPPING') {
        return Boolean(resolvedUnguidedName && unguidedGoals.length);
      }
      if (campaignType === 'VIDEO') {
        if (unguidedVideoBuy === 'RESERVATION') {
          if (unguidedVideoReachWay === 'MASTHEAD') return true;
          return Boolean(unguidedVideoReachWay && unguidedVideoFormat);
        }
        return Boolean(
          unguidedVideoSubtype && unguidedVideoSubtype !== 'VIDEO_REACH',
        );
      }
      if (campaignType === 'APP') {
        return Boolean(resolvedUnguidedName && unguidedAppSubtype && unguidedAppPlatform);
      }
      return false;
    }
    return true;
  })();

  const selectedGoalsForNav = (() => {
    if (CONVERSION_GOAL_OBJECTIVES.has(objective)) return goals;
    if (objective === 'LOCAL_STORE') return localGoals;
    if (objective === 'NO_GUIDANCE' && campaignType !== 'VIDEO' && campaignType !== 'APP') {
      return unguidedGoals;
    }
    return [];
  })();

  const conversionGoalConfig = buildConversionGoalConfig(
    selectedGoalsForNav,
    picker.accountDefaultStandardIds,
  );

  const buildNavState = () => ({
    objective,
    goals: selectedGoalsForNav,
    startGoals: toStartGoalsSnapshot(selectedGoalsForNav),
    conversionGoalConfig,
    app: objective === 'APP_PROMOTION'
      ? {
        subtype: appSubtype,
        platform: appPlatform,
        query: appQuery,
        name: appCampaignName.trim(),
        namePlaceholder: appNamePlaceholder,
        campaignType: 'APP',
      }
      : null,
    youtube: objective === 'YOUTUBE'
      ? {
        buyMethod,
        goal: youtubeGoal,
        reachWay: buyMethod === 'RESERVATION' ? reachWay : null,
        adFormat: buyMethod === 'RESERVATION' ? adFormat : null,
        campaignType: 'VIDEO',
      }
      : null,
    local: objective === 'LOCAL_STORE'
      ? {
        name: localCampaignName.trim(),
        namePlaceholder: localNamePlaceholder,
        campaignType: 'PERFORMANCE_MAX',
        storeLocations,
        merchantProducts,
        finalUrl,
      }
      : null,
    unguided: objective === 'NO_GUIDANCE'
      ? {
        campaignType,
        name: unguidedName.trim(),
        namePlaceholder: unguidedNamePlaceholder,
        goals:
          campaignType === 'VIDEO' || campaignType === 'APP'
            ? null
            : unguidedGoals,
        finalUrl: campaignType === 'PERFORMANCE_MAX' ? unguidedFinalUrl : null,
        video: campaignType === 'VIDEO'
          ? {
            buyMethod: unguidedVideoBuy,
            subtype: unguidedVideoBuy === 'AUCTION' ? unguidedVideoSubtype : null,
            reachWay: unguidedVideoBuy === 'RESERVATION' ? unguidedVideoReachWay : null,
            adFormat:
              unguidedVideoBuy === 'RESERVATION' && unguidedVideoReachWay !== 'MASTHEAD'
                ? unguidedVideoFormat
                : null,
          }
          : null,
        app: campaignType === 'APP'
          ? {
            subtype: unguidedAppSubtype,
            platform: unguidedAppPlatform,
            query: unguidedAppQuery,
            name: unguidedName.trim(),
            namePlaceholder: unguidedNamePlaceholder,
          }
          : null,
      }
      : null,
  });

  const handleContinue = () => {
    if (!canContinue) return;
    const state = buildNavState();
    if (isSearchPath) {
      navigate(`${GOOGLE_ADS_BASE}/create/search`, { state });
      return;
    }
    navigate(`${GOOGLE_ADS_BASE}/create/coming-soon`, { state });
  };

  return (
    <div className="mx-auto flex min-h-full max-w-5xl flex-col px-6 py-8">
      <h1 className="mb-6 text-[28px] font-normal tracking-tight text-[var(--ga-ink)]">
        What’s your campaign objective?
      </h1>

      <Card className="mb-4">
        <div className="border-b border-[var(--ga-border)] px-6 py-5">
          <h2 className="text-base font-medium text-[var(--ga-ink)]">Choose your objective</h2>
        </div>
        <div className="px-6 py-5">
          <p className="mb-5 text-sm text-[var(--ga-muted)]">
            Select an objective to tailor your experience to the goals and settings that will work
            best for your campaign
          </p>
          <div
            role="radiogroup"
            aria-label="Campaign objective"
            className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
          >
            {OBJECTIVES.map((item) => {
              const active = objective === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setObjective(item.id)}
                  className={`relative flex min-h-[148px] flex-col items-start rounded-xl border bg-white p-4 text-left transition-colors ${
                    active
                      ? 'border-[3px] border-[var(--ga-blue)]'
                      : 'border-[var(--ga-border)] hover:bg-[var(--ga-hover)]'
                  }`}
                >
                  {active ? (
                    <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--ga-blue)] text-[11px] text-white">
                      ✓
                    </span>
                  ) : null}
                  <span className="mb-3 text-[var(--ga-muted)]">
                    <ObjectiveIcon name={item.icon} />
                  </span>
                  <span className="text-sm font-medium text-[var(--ga-ink)]">{item.title}</span>
                  <span className="mt-2 text-xs leading-5 text-[var(--ga-muted)]">
                    {item.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Sales / Leads / Website traffic → conversion goals */}
      {CONVERSION_GOAL_OBJECTIVES.has(objective) ? (
        <div className="mb-4">
          <ConversionGoalsPanel
            objectiveTitle={objectiveMeta.title}
            goals={goals}
            additionalGoals={picker.additionalRows}
            loading={goalsLoading}
            error={goalsError}
            onRemove={(id) => setGoals((prev) => prev.filter((goal) => goal.id !== id))}
            onEditGoal={handleEditGoal}
            onAddGoal={(goal) =>
              setGoals((prev) => (prev.some((item) => item.id === goal.id) ? prev : [...prev, goal]))
            }
          />
        </div>
      ) : null}

      {/* App promotion */}
      {objective === 'APP_PROMOTION' ? (
        <div className="mb-4 space-y-4">
          <Card>
            <div className="border-b border-[var(--ga-border)] px-6 py-4">
              <h2 className="text-base font-medium text-[var(--ga-ink)]">Select a campaign type</h2>
            </div>
            <div className="p-5">
              <div className="max-w-sm">
                <SelectableTypeCard
                  selected
                  onClick={() => {}}
                  title="App"
                  description="Promote your Android or iOS app on Google Search, Play, YouTube and partner sites with app ads"
                  icons={['g', 'yt', 'gmail', 'display', 'search', 'play']}
                />
              </div>
            </div>
          </Card>

          <Card>
            <div className="border-b border-[var(--ga-border)] px-6 py-4">
              <h2 className="text-base font-medium text-[var(--ga-ink)]">Campaign name</h2>
            </div>
            <div className="p-5">
              <input
                value={appCampaignName}
                onChange={(event) => setAppCampaignName(event.target.value)}
                placeholder={appNamePlaceholder}
                className="w-full max-w-xl rounded-lg border border-[var(--ga-border)] px-3 py-2.5 text-sm outline-none focus:border-[var(--ga-blue)] placeholder:text-[var(--ga-muted)]"
              />
            </div>
          </Card>

          <Card>
            <div className="border-b border-[var(--ga-border)] px-6 py-4">
              <h2 className="text-base font-medium text-[var(--ga-ink)]">
                Select a campaign subtype{' '}
                <button type="button" className="text-sm font-medium text-[var(--ga-blue)]">
                  Learn more
                </button>
              </h2>
            </div>
            <div className="divide-y divide-[var(--ga-border)] px-6">
              {APP_SUBTYPES.map((item) => (
                <RadioRow
                  key={item.id}
                  checked={appSubtype === item.id}
                  onChange={() => setAppSubtype(item.id)}
                  title={item.title}
                  description={item.description}
                />
              ))}
            </div>
          </Card>

          <Card>
            <div className="space-y-5 p-6">
              <div>
                <h3 className="mb-3 text-sm font-medium text-[var(--ga-ink)]">
                  Select your mobile app’s platform
                </h3>
                <div className="flex gap-6">
                  {['Android', 'iOS'].map((platform) => (
                    <RadioRow
                      key={platform}
                      checked={appPlatform === platform}
                      onChange={() => setAppPlatform(platform)}
                      title={platform}
                    />
                  ))}
                </div>
              </div>
              <div>
                <h3 className="mb-3 text-sm font-medium text-[var(--ga-ink)]">Look up your app</h3>
                <div className="relative max-w-2xl">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ga-muted)]">
                    ⌕
                  </span>
                  <input
                    value={appQuery}
                    onChange={(event) => setAppQuery(event.target.value)}
                    placeholder="Enter the app name, package name, publisher, or Play Store URL"
                    className="w-full rounded-lg border border-[var(--ga-border)] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[var(--ga-blue)]"
                  />
                </div>
                <p className="mt-2 text-xs text-[var(--ga-muted)]">
                  If you cannot find your app, please see{' '}
                  <button type="button" className="text-[var(--ga-blue)] hover:underline">
                    these steps
                  </button>
                </p>
              </div>
            </div>
          </Card>
        </div>
      ) : null}

      {/* YouTube */}
      {objective === 'YOUTUBE' ? (
        <div className="mb-4 space-y-4">
          <Card>
            <div className="border-b border-[var(--ga-border)] px-6 py-4">
              <h2 className="text-base font-medium text-[var(--ga-ink)]">
                Select how you want to buy ads
              </h2>
            </div>
            <div className="divide-y divide-[var(--ga-border)] px-6">
              <RadioRow
                checked={buyMethod === 'AUCTION'}
                onChange={() => setBuyMethod('AUCTION')}
                title="Auction"
                description="Buy cost-effective ads by bidding in the Google Ads auction."
              />
              <RadioRow
                checked={buyMethod === 'RESERVATION'}
                onChange={() => setBuyMethod('RESERVATION')}
                title="Reservation"
                description="Buy a targeted number of impressions at a fixed CPM. Includes YouTube Select lineups and Masthead."
              />
            </div>
          </Card>

          {buyMethod === 'AUCTION' ? (
            <Card>
              <div className="border-b border-[var(--ga-border)] px-6 py-4">
                <h2 className="text-base font-medium text-[var(--ga-ink)]">Choose a campaign goal</h2>
                <p className="mt-1 text-sm text-[var(--ga-muted)]">
                  Each goal determines which metrics the campaign is optimized to deliver.
                </p>
              </div>
              <div className="grid gap-4 p-6 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="divide-y divide-[var(--ga-border)]">
                  {YOUTUBE_GOALS.map((item) => (
                    <RadioRow
                      key={item.id}
                      checked={youtubeGoal === item.id}
                      onChange={() => setYoutubeGoal(item.id)}
                      title={item.title}
                      description={item.description}
                      badge={
                        item.suggested ? (
                          <span className="rounded bg-[#e8f0fe] px-2 py-0.5 text-[11px] font-medium text-[var(--ga-blue)]">
                            Suggested
                          </span>
                        ) : null
                      }
                    >
                      {youtubeGoal === item.id && item.calloutTitle ? (
                        <div className="mt-3 rounded-xl bg-[#e8f0fe] p-4 text-sm text-[var(--ga-ink)]">
                          <div className="font-medium">{item.calloutTitle}</div>
                          <p className="mt-1 text-[var(--ga-muted)]">{item.calloutBody}</p>
                          <button type="button" className="mt-2 text-[var(--ga-blue)] hover:underline">
                            Learn more
                          </button>
                        </div>
                      ) : null}
                    </RadioRow>
                  ))}
                </div>
                {youtubeGoalMeta ? (
                  <aside className="rounded-xl border border-[var(--ga-border)] bg-[var(--ga-surface)] p-4">
                    <h3 className="text-sm font-medium text-[var(--ga-ink)]">Good for</h3>
                    <ul className="mt-3 space-y-3 text-xs leading-5 text-[var(--ga-muted)]">
                      {youtubeGoalMeta.goodFor.map((line) => (
                        <li key={line}>• {line}</li>
                      ))}
                    </ul>
                    <h3 className="mt-5 text-sm font-medium text-[var(--ga-ink)]">Optimized to get more</h3>
                    <ul className="mt-2 space-y-1 text-xs text-[var(--ga-blue)] underline">
                      {youtubeGoalMeta.optimized.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                    <button type="button" className="mt-4 text-sm text-[var(--ga-blue)] hover:underline">
                      Compare goals
                    </button>
                  </aside>
                ) : null}
              </div>
            </Card>
          ) : null}

          <Card>
            <div className="border-b border-[var(--ga-border)] px-6 py-4">
              <h2 className="text-base font-medium text-[var(--ga-ink)]">Select a campaign type</h2>
            </div>
            <div className="p-5">
              <div className="max-w-sm">
                <SelectableTypeCard
                  selected
                  onClick={() => {}}
                  title="Video"
                  description="Reach viewers on YouTube and get conversions"
                  icons={['yt', 'display']}
                />
              </div>
            </div>
          </Card>

          {buyMethod === 'RESERVATION' ? (
            <>
              <Card>
                <div className="border-b border-[var(--ga-border)] px-6 py-4">
                  <h2 className="text-base font-medium text-[var(--ga-ink)]">
                    Select the ways you’d like to reach your goal
                  </h2>
                </div>
                <div className="divide-y divide-[var(--ga-border)] px-6">
                  {RESERVATION_REACH_WAYS.map((item) => (
                    <RadioRow
                      key={item.id}
                      checked={reachWay === item.id}
                      onChange={() => setReachWay(item.id)}
                      title={item.title}
                      description={item.description}
                    />
                  ))}
                </div>
              </Card>
              <Card>
                <div className="border-b border-[var(--ga-border)] px-6 py-4">
                  <h2 className="text-base font-medium text-[var(--ga-ink)]">
                    Select an ad format for your video campaign
                  </h2>
                </div>
                <div className="divide-y divide-[var(--ga-border)] px-6">
                  {VIDEO_AD_FORMATS.map((item) => (
                    <RadioRow
                      key={item.id}
                      checked={adFormat === item.id}
                      onChange={() => setAdFormat(item.id)}
                      title={item.title}
                      description={item.description}
                    />
                  ))}
                </div>
              </Card>
            </>
          ) : null}
        </div>
      ) : null}

      {/* Local store → Performance Max */}
      {objective === 'LOCAL_STORE' ? (
        <div className="mb-4 space-y-4">
          <Card>
            <div className="border-b border-[var(--ga-border)] px-6 py-4">
              <h2 className="text-base font-medium text-[var(--ga-ink)]">Select a campaign type</h2>
            </div>
            <div className="space-y-4 p-5">
              <div className="max-w-md">
                <SelectableTypeCard
                  selected
                  onClick={() => {}}
                  title="Performance Max"
                  description="Reach the right people wherever they're browsing with ads on Google Search, YouTube, Display, and more."
                  icons={['g', 'yt', 'gmail', 'maps', 'display', 'search']}
                />
              </div>
              <div className="rounded-xl bg-[#e8f0fe] p-4 text-sm text-[var(--ga-ink)]">
                Performance Max has replaced Local campaigns. Performance Max brings you the same
                optimization benefits, including store visits, call clicks, and directions to help
                you meet your offline goals.{' '}
                <button type="button" className="text-[var(--ga-blue)] hover:underline">
                  Learn more
                </button>
              </div>
            </div>
          </Card>

          <Card>
            <div className="border-b border-[var(--ga-border)] px-6 py-4">
              <h2 className="text-base font-medium text-[var(--ga-ink)]">Campaign name</h2>
            </div>
            <div className="p-5">
              <input
                value={localCampaignName}
                onChange={(event) => setLocalCampaignName(event.target.value)}
                placeholder={localNamePlaceholder}
                className="w-full max-w-xl rounded-lg border border-[var(--ga-border)] px-3 py-2.5 text-sm outline-none focus:border-[var(--ga-blue)] placeholder:text-[var(--ga-muted)]"
              />
            </div>
          </Card>

          <ConversionGoalsPanel
            objectiveTitle="Local store visits and promotions"
            goals={localGoals}
            additionalGoals={picker.additionalRows}
            loading={goalsLoading}
            error={goalsError}
            onRemove={(id) => setLocalGoals((prev) => prev.filter((goal) => goal.id !== id))}
            onEditGoal={handleEditGoal}
            onAddGoal={(goal) =>
              setLocalGoals((prev) => (
                prev.some((item) => item.id === goal.id) ? prev : [...prev, goal]
              ))
            }
          />

          <Card>
            <div className="border-b border-[var(--ga-border)] px-6 py-4">
              <h2 className="text-base font-medium text-[var(--ga-ink)]">Campaign feeds</h2>
              <p className="mt-1 text-sm text-[var(--ga-muted)]">
                Expand available ad formats, power ad creatives, and improve targeting.
              </p>
            </div>
            <div className="space-y-3 p-6">
              <p className="text-sm text-[var(--ga-ink)]">
                Which store locations should your ads promote?
              </p>
              <label className="block max-w-md text-sm text-[var(--ga-muted)]">
                Choose locations for this campaign:
                <select
                  value={storeLocations}
                  onChange={(event) => setStoreLocations(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-[var(--ga-border)] bg-white px-3 py-2.5 text-[var(--ga-ink)] outline-none focus:border-[var(--ga-blue)]"
                >
                  <option value="ALL">Use all locations</option>
                  <option value="SELECTED">Selected locations only</option>
                </select>
              </label>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h2 className="mb-3 text-base font-medium text-[var(--ga-ink)]">
                Add products to this campaign
              </h2>
              <label className="flex items-center gap-3 text-sm text-[var(--ga-ink)]">
                <input
                  type="checkbox"
                  checked={merchantProducts}
                  onChange={(event) => setMerchantProducts(event.target.checked)}
                  className="h-4 w-4 accent-[var(--ga-blue)]"
                />
                Advertise products from a Merchant Center account
              </label>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h2 className="text-base font-medium text-[var(--ga-ink)]">
                Where should people go after clicking your ads?
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--ga-muted)]">
                Think about the product or service you want to sell and enter the URL you want people
                to see after clicking your ads. This might be your homepage or a more specific page
                on your website.
              </p>
              <div className="relative mt-4 max-w-xl">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ga-muted)]">
                  🔗
                </span>
                <input
                  value={finalUrl}
                  onChange={(event) => setFinalUrl(event.target.value)}
                  placeholder="Final URL"
                  className="w-full rounded-lg border border-[var(--ga-border)] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[var(--ga-blue)]"
                />
              </div>
            </div>
          </Card>
        </div>
      ) : null}

      {/* Without guidance → campaign type + type-specific setup */}
      {objective === 'NO_GUIDANCE' ? (
        <div className="mb-4 space-y-4">
          <Card>
            <div className="border-b border-[var(--ga-border)] px-6 py-4">
              <h2 className="text-base font-medium text-[var(--ga-ink)]">Select a campaign type</h2>
            </div>
            <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
              {CAMPAIGN_TYPES.map((type) => (
                <SelectableTypeCard
                  key={type.id}
                  selected={campaignType === type.id}
                  onClick={() => setCampaignType(type.id)}
                  title={type.title}
                  description={type.description}
                  icons={type.icons}
                />
              ))}
            </div>
          </Card>

          {/* Search → name + goals */}
          {campaignType === 'SEARCH' ? (
            <>
              <Card>
                <div className="border-b border-[var(--ga-border)] px-6 py-4">
                  <h2 className="text-base font-medium text-[var(--ga-ink)]">Campaign name</h2>
                </div>
                <div className="p-5">
                  <input
                    value={unguidedName}
                    onChange={(event) => setUnguidedName(event.target.value)}
                    placeholder={unguidedNamePlaceholder}
                    className="w-full max-w-xl rounded-lg border border-[var(--ga-border)] px-3 py-2.5 text-sm outline-none focus:border-[var(--ga-blue)] placeholder:text-[var(--ga-muted)]"
                  />
                </div>
              </Card>
              <ConversionGoalsPanel
                title={OPTIMIZATION_GOALS_TITLE}
                description={OPTIMIZATION_GOALS_DESC}
                goals={unguidedGoals}
                additionalGoals={picker.additionalRows}
            loading={goalsLoading}
            error={goalsError}
                onRemove={(id) => setUnguidedGoals((prev) => prev.filter((goal) => goal.id !== id))}
                onEditGoal={handleEditGoal}
                onAddGoal={addUnguidedGoal}
              />
            </>
          ) : null}

          {/* Performance Max → name + goals + final URL */}
          {campaignType === 'PERFORMANCE_MAX' ? (
            <>
              <Card>
                <div className="border-b border-[var(--ga-border)] px-6 py-4">
                  <h2 className="text-base font-medium text-[var(--ga-ink)]">Campaign name</h2>
                </div>
                <div className="p-5">
                  <input
                    value={unguidedName}
                    onChange={(event) => setUnguidedName(event.target.value)}
                    placeholder={unguidedNamePlaceholder}
                    className="w-full max-w-xl rounded-lg border border-[var(--ga-border)] px-3 py-2.5 text-sm outline-none focus:border-[var(--ga-blue)] placeholder:text-[var(--ga-muted)]"
                  />
                </div>
              </Card>

              <ConversionGoalsPanel
                title={OPTIMIZATION_GOALS_TITLE}
                description={OPTIMIZATION_GOALS_DESC}
                goals={unguidedGoals}
                additionalGoals={picker.additionalRows}
            loading={goalsLoading}
            error={goalsError}
                onRemove={(id) => setUnguidedGoals((prev) => prev.filter((goal) => goal.id !== id))}
                onEditGoal={handleEditGoal}
                onAddGoal={addUnguidedGoal}
              />

              <Card>
                <div className="border-b border-[var(--ga-border)] px-6 py-4">
                  <h2 className="text-base font-medium text-[var(--ga-ink)]">
                    Where should people go after clicking your ads?
                  </h2>
                </div>
                <div className="p-6">
                  <p className="max-w-3xl text-sm leading-6 text-[var(--ga-muted)]">
                    Think about the product or service you want to sell and enter the URL you want
                    people to see after clicking your ads. This might be your homepage or a more
                    specific page on your website.
                  </p>
                  <div className="relative mt-4 max-w-xl">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ga-muted)]">
                      🔗
                    </span>
                    <input
                      value={unguidedFinalUrl}
                      onChange={(event) => setUnguidedFinalUrl(event.target.value)}
                      placeholder="Final URL"
                      className="w-full rounded-lg border border-[var(--ga-border)] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[var(--ga-blue)]"
                    />
                  </div>
                </div>
              </Card>
            </>
          ) : null}

          {/* Demand Gen → conversion goals only */}
          {campaignType === 'DEMAND_GEN' ? (
            <ConversionGoalsPanel
              title={OPTIMIZATION_GOALS_TITLE}
              description={OPTIMIZATION_GOALS_DESC}
              goals={unguidedGoals}
              additionalGoals={picker.additionalRows}
            loading={goalsLoading}
            error={goalsError}
              onRemove={(id) => setUnguidedGoals((prev) => prev.filter((goal) => goal.id !== id))}
              onEditGoal={handleEditGoal}
              onAddGoal={addUnguidedGoal}
            />
          ) : null}

          {/* Display / Shopping → name + conversion goals */}
          {campaignType === 'DISPLAY' || campaignType === 'SHOPPING' ? (
            <>
              <Card>
                <div className="border-b border-[var(--ga-border)] px-6 py-4">
                  <h2 className="text-base font-medium text-[var(--ga-ink)]">Campaign name</h2>
                </div>
                <div className="p-5">
                  <input
                    value={unguidedName}
                    onChange={(event) => setUnguidedName(event.target.value)}
                    placeholder={unguidedNamePlaceholder}
                    className="w-full max-w-xl rounded-lg border border-[var(--ga-border)] px-3 py-2.5 text-sm outline-none focus:border-[var(--ga-blue)] placeholder:text-[var(--ga-muted)]"
                  />
                </div>
              </Card>

              <ConversionGoalsPanel
                title={OPTIMIZATION_GOALS_TITLE}
                description={OPTIMIZATION_GOALS_DESC}
                goals={unguidedGoals}
                additionalGoals={picker.additionalRows}
            loading={goalsLoading}
            error={goalsError}
                onRemove={(id) => setUnguidedGoals((prev) => prev.filter((goal) => goal.id !== id))}
                onEditGoal={handleEditGoal}
                onAddGoal={addUnguidedGoal}
              />
            </>
          ) : null}

          {/* Video → Auction / Reservation branching */}
          {campaignType === 'VIDEO' ? (
            <>
              <Card>
                <div className="border-b border-[var(--ga-border)] px-6 py-4">
                  <h2 className="text-base font-medium text-[var(--ga-ink)]">
                    Select how you want to buy ads
                  </h2>
                </div>
                <div className="divide-y divide-[var(--ga-border)] px-6">
                  <RadioRow
                    checked={unguidedVideoBuy === 'AUCTION'}
                    onChange={() => selectUnguidedVideoBuy('AUCTION')}
                    title="Auction"
                    description="Buy cost-effective ads by bidding in the Google Ads auction."
                  />
                  <RadioRow
                    checked={unguidedVideoBuy === 'RESERVATION'}
                    onChange={() => selectUnguidedVideoBuy('RESERVATION')}
                    title="Reservation"
                    description="Buy a targeted number of impressions at a fixed CPM. Includes YouTube Select lineups and Masthead. Learn more"
                  />
                </div>
              </Card>

              {unguidedVideoBuy === 'AUCTION' ? (
                <Card>
                  <div className="border-b border-[var(--ga-border)] px-6 py-4">
                    <h2 className="text-base font-medium text-[var(--ga-ink)]">
                      Select a campaign subtype
                    </h2>
                  </div>
                  <div className="space-y-1 p-3">
                    {VIDEO_AUCTION_SUBTYPES.map((item) => {
                      if (item.children) {
                        const childSelected = VIDEO_REACH_CHILD_IDS.has(unguidedVideoSubtype);
                        return (
                          <div
                            key={item.id}
                            className={`rounded-xl border p-4 ${
                              childSelected
                                ? 'border-[3px] border-[var(--ga-blue)]'
                                : 'border-transparent'
                            }`}
                          >
                            <div className="text-sm font-medium text-[var(--ga-ink)]">{item.title}</div>
                            <div className="mt-1 space-y-0 pl-1">
                              {item.children.map((child) => (
                                <RadioRow
                                  key={child.id}
                                  checked={unguidedVideoSubtype === child.id}
                                  onChange={() => setUnguidedVideoSubtype(child.id)}
                                  title={child.title}
                                  description={child.description}
                                />
                              ))}
                            </div>
                          </div>
                        );
                      }

                      return (
                        <AuctionSubtypeOption
                          key={item.id}
                          checked={unguidedVideoSubtype === item.id}
                          onChange={() => setUnguidedVideoSubtype(item.id)}
                          title={item.title}
                          description={item.description}
                          badge={
                            item.badge ? (
                              <span className="rounded bg-[#e8f0fe] px-2 py-0.5 text-[11px] font-medium text-[var(--ga-blue)]">
                                {item.badge}
                              </span>
                            ) : null
                          }
                        >
                          {unguidedVideoSubtype === item.id && item.calloutTitle ? (
                            <div className="mt-3 rounded-lg border border-[#d2e3fc] bg-[#e8f0fe] p-4 text-sm text-[var(--ga-ink)]">
                              <div className="flex gap-2">
                                <span
                                  className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[var(--ga-blue)] text-[10px] text-white"
                                  aria-hidden="true"
                                >
                                  i
                                </span>
                                <div>
                                  <div className="font-medium">{item.calloutTitle}</div>
                                  <p className="mt-1 text-[var(--ga-muted)]">{item.calloutBody}</p>
                                </div>
                              </div>
                            </div>
                          ) : null}
                        </AuctionSubtypeOption>
                      );
                    })}
                  </div>
                </Card>
              ) : null}

              {unguidedVideoBuy === 'RESERVATION' ? (
                <>
                  <Card>
                    <div className="border-b border-[var(--ga-border)] px-6 py-4">
                      <h2 className="text-base font-medium text-[var(--ga-ink)]">
                        Select the ways you’d like to reach your goal
                      </h2>
                    </div>
                    <div className="divide-y divide-[var(--ga-border)] px-6">
                      {RESERVATION_REACH_WAYS.map((item) => (
                        <RadioRow
                          key={item.id}
                          checked={unguidedVideoReachWay === item.id}
                          onChange={() => selectUnguidedVideoReachWay(item.id)}
                          title={item.title}
                          description={item.description}
                        />
                      ))}
                    </div>
                  </Card>
                  {unguidedVideoReachWay !== 'MASTHEAD' ? (
                    <Card>
                      <div className="border-b border-[var(--ga-border)] px-6 py-4">
                        <h2 className="text-base font-medium text-[var(--ga-ink)]">
                          Select an ad format for your video campaign
                        </h2>
                      </div>
                      <div className="divide-y divide-[var(--ga-border)] px-6">
                        {(unguidedVideoReachWay === 'STANDARD_REACH'
                          ? VIDEO_AD_FORMATS.filter((item) =>
                            ['NON_SKIPPABLE', 'BUMPER', 'SKIPPABLE'].includes(item.id),
                          )
                          : VIDEO_AD_FORMATS
                        ).map((item) => (
                          <RadioRow
                            key={item.id}
                            checked={unguidedVideoFormat === item.id}
                            onChange={() => setUnguidedVideoFormat(item.id)}
                            title={item.title}
                            description={item.description}
                          />
                        ))}
                      </div>
                    </Card>
                  ) : null}
                </>
              ) : null}
            </>
          ) : null}

          {/* App → name + subtype + platform */}
          {campaignType === 'APP' ? (
            <>
              <Card>
                <div className="border-b border-[var(--ga-border)] px-6 py-4">
                  <h2 className="text-base font-medium text-[var(--ga-ink)]">Campaign name</h2>
                </div>
                <div className="p-5">
                  <input
                    value={unguidedName}
                    onChange={(event) => setUnguidedName(event.target.value)}
                    placeholder={unguidedNamePlaceholder}
                    className="w-full max-w-xl rounded-lg border border-[var(--ga-border)] px-3 py-2.5 text-sm outline-none focus:border-[var(--ga-blue)] placeholder:text-[var(--ga-muted)]"
                  />
                </div>
              </Card>

              <Card>
                <div className="border-b border-[var(--ga-border)] px-6 py-4">
                  <h2 className="text-base font-medium text-[var(--ga-ink)]">
                    Select a campaign subtype
                  </h2>
                </div>
                <div className="divide-y divide-[var(--ga-border)] px-6">
                  {APP_SUBTYPES.map((item) => (
                    <RadioRow
                      key={item.id}
                      checked={unguidedAppSubtype === item.id}
                      onChange={() => setUnguidedAppSubtype(item.id)}
                      title={item.title}
                      description={item.description}
                    />
                  ))}
                </div>
              </Card>

              <Card>
                <div className="space-y-5 p-6">
                  <div>
                    <h3 className="mb-3 text-sm font-medium text-[var(--ga-ink)]">
                      Select your mobile app’s platform
                    </h3>
                    <div className="flex gap-6">
                      {['Android', 'iOS'].map((platform) => (
                        <RadioRow
                          key={platform}
                          checked={unguidedAppPlatform === platform}
                          onChange={() => setUnguidedAppPlatform(platform)}
                          title={platform}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-3 text-sm font-medium text-[var(--ga-ink)]">Look up your app</h3>
                    <div className="relative max-w-2xl">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ga-muted)]">
                        ⌕
                      </span>
                      <input
                        value={unguidedAppQuery}
                        onChange={(event) => setUnguidedAppQuery(event.target.value)}
                        placeholder="Enter the app name, package name, publisher, or Play Store URL"
                        className="w-full rounded-lg border border-[var(--ga-border)] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[var(--ga-blue)]"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </>
          ) : null}
        </div>
      ) : null}

      <div className="mt-2 flex items-center justify-end gap-5">
        <button
          type="button"
          onClick={() => navigate(`${GOOGLE_ADS_BASE}/campaigns/overview`)}
          className="text-sm font-medium text-[var(--ga-blue)] hover:underline"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={!canContinue}
          onClick={handleContinue}
          className={`rounded-full px-5 py-2 text-sm font-medium text-white transition ${
            canContinue
              ? 'bg-[var(--ga-blue)] hover:brightness-95'
              : 'cursor-not-allowed bg-[#a8c7fa]'
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
