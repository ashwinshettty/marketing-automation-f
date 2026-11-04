import { GaIcon } from '../icons/GoogleAdsIcons';

/** Lightweight SVG sparkline — no chart library required for the Overview shell. */
export default function OverviewChart() {
  return (
    <div className="rounded-2xl border border-[var(--ga-border)] bg-white p-5 shadow-[0_1px_2px_rgba(60,64,67,0.08)]">
      <div className="mb-4 flex items-center justify-end gap-3 text-[var(--ga-muted)]">
        <button type="button" className="rounded-full p-1.5 hover:bg-[var(--ga-hover)]" aria-label="Download">
          <GaIcon name="download" className="h-4 w-4" />
        </button>
      </div>
      <svg viewBox="0 0 640 220" className="h-52 w-full" role="img" aria-label="Clicks and impressions over time">
        <defs>
          <linearGradient id="gaBlueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a73e8" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#1a73e8" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[40, 80, 120, 160].map((y) => (
          <line key={y} x1="24" x2="616" y1={y} y2={y} stroke="#e8eaed" strokeWidth="1" />
        ))}
        <path
          d="M24 150 C 80 140, 120 90, 170 110 S 260 170, 320 120 S 420 40, 480 70 S 560 150, 616 95"
          fill="none"
          stroke="#ea4335"
          strokeWidth="2.5"
        />
        <path
          d="M24 170 C 90 160, 130 130, 180 140 S 270 180, 330 150 S 430 90, 500 120 S 570 160, 616 130"
          fill="url(#gaBlueFill)"
          stroke="none"
        />
        <path
          d="M24 170 C 90 160, 130 130, 180 140 S 270 180, 330 150 S 430 90, 500 120 S 570 160, 616 130"
          fill="none"
          stroke="#1a73e8"
          strokeWidth="2.5"
        />
        {['12 AM', '4 AM', '8 AM', '12 PM', '4 PM', '8 PM', '11 PM'].map((label, index) => (
          <text
            key={label}
            x={24 + index * 98}
            y="210"
            fill="#5f6368"
            fontSize="11"
          >
            {label}
          </text>
        ))}
      </svg>
    </div>
  );
}
