export const inputClass =
  'w-full rounded-xl border border-brand-yellow/40 bg-white px-4 py-2.5 text-sm text-brand-navy outline-none transition focus:border-brand-navy disabled:cursor-not-allowed disabled:opacity-50';

export const labelClass = 'mb-2 block text-sm font-medium text-brand-navy';

export const sectionCardClass =
  'rounded-2xl border border-brand-yellow/40 bg-brand-cream/40 p-5 shadow-sm';

export const previewCardClass =
  'rounded-2xl border border-brand-yellow/40 bg-brand-cream/30 p-5';

export const primaryBtnClass =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-brand-navy px-6 py-2.5 text-sm font-medium text-white transition hover:bg-brand-navy-hover disabled:cursor-not-allowed disabled:opacity-50';

export const secondaryBtnClass =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-brand-yellow/40 bg-white px-6 py-2.5 text-sm font-medium text-brand-navy transition hover:bg-brand-yellow/20 disabled:cursor-not-allowed disabled:opacity-50';

export const accentBtnClass =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-brand-yellow px-6 py-2.5 text-sm font-semibold text-brand-navy transition hover:bg-brand-yellow-hover disabled:cursor-not-allowed disabled:opacity-50';

export const tabClass = (active) =>
  `relative pb-3 px-1 text-base font-semibold transition-colors ${
    active ? 'text-brand-navy' : 'text-brand-muted hover:text-brand-navy'
  }`;

export const tabIndicatorClass = 'absolute bottom-0 left-0 right-0 h-0.5 bg-brand-navy rounded-full';

export const stepActiveClass = 'flex items-center gap-2';
export const stepDotActive = 'flex h-5 w-5 items-center justify-center rounded-full bg-brand-navy';
export const stepDotInner = 'h-2.5 w-2.5 rounded-full bg-brand-yellow';
export const stepDotDone = 'flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white';
export const stepDotPending = 'h-5 w-5 rounded-full border-2 border-brand-yellow/50';
export const stepLabelActive = 'text-sm font-medium text-brand-navy';
export const stepLabelDone = 'text-sm font-medium text-emerald-600';
export const stepLabelPending = 'text-sm text-brand-muted';

export const categoryBtnClass = (selected, hasError) => {
  if (selected) {
    return 'flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-brand-navy bg-brand-yellow/30 px-4 py-3 text-brand-navy transition-all';
  }
  if (hasError) {
    return 'flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-red-400 bg-white px-4 py-3 text-brand-navy transition-all hover:border-red-500';
  }
  return 'flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-brand-yellow/40 bg-white px-4 py-3 text-brand-navy transition-all hover:border-brand-navy/40 hover:bg-brand-cream/60';
};

export const radioCardClass = (selected, hasError) => {
  if (selected) {
    return 'flex cursor-pointer items-start gap-3 rounded-xl border-2 border-brand-navy bg-brand-yellow-soft/50 p-4 transition-all';
  }
  if (hasError) {
    return 'flex cursor-pointer items-start gap-3 rounded-xl border-2 border-red-400 bg-white p-4 transition-all hover:border-red-500';
  }
  return 'flex cursor-pointer items-start gap-3 rounded-xl border border-brand-yellow/40 bg-white p-4 transition-all hover:border-brand-navy/30 hover:bg-brand-cream/40';
};
