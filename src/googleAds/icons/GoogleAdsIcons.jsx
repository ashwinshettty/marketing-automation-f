const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export function GaIcon({ name, className = 'h-5 w-5' }) {
  switch (name) {
    case 'plus':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <circle cx="12" cy="12" r="9" {...stroke} />
          <path d="M12 8v8M8 12h8" {...stroke} />
        </svg>
      );
    case 'campaigns':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M4 10v4M8 7v10M12 4v16M16 8v8M20 11v2" {...stroke} />
        </svg>
      );
    case 'goals':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <circle cx="12" cy="12" r="8" {...stroke} />
          <circle cx="12" cy="12" r="4" {...stroke} />
          <circle cx="12" cy="12" r="1.25" fill="currentColor" />
        </svg>
      );
    case 'tools':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17v3h3l5.3-5.3a4 4 0 0 0 5.4-5.4l-2.1 2.1-1.9-.5-.5-1.9 2.1-2.1z" {...stroke} />
        </svg>
      );
    case 'billing':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <rect x="3" y="6" width="18" height="12" rx="2" {...stroke} />
          <path d="M3 10h18" {...stroke} />
        </svg>
      );
    case 'admin':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <circle cx="12" cy="12" r="3" {...stroke} />
          <path d="M12 3v2M12 19v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M3 12h2M19 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" {...stroke} />
        </svg>
      );
    case 'chevron':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="m6 9 6 6 6-6" {...stroke} />
        </svg>
      );
    case 'home':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="m4 11 8-7 8 7M6 10v9h12v-9" {...stroke} />
        </svg>
      );
    case 'search':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <circle cx="11" cy="11" r="6" {...stroke} />
          <path d="m16 16 3.5 3.5" {...stroke} />
        </svg>
      );
    case 'download':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M12 4v10M8 10l4 4 4-4M5 18h14" {...stroke} />
        </svg>
      );
    case 'back':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M15 6 9 12l6 6" {...stroke} />
        </svg>
      );
    default:
      return null;
  }
}
