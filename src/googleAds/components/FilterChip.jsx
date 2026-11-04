export default function FilterChip({ children, active = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
        active
          ? 'border-[var(--ga-blue)] bg-[var(--ga-blue-soft)] text-[var(--ga-blue)]'
          : 'border-[var(--ga-border)] bg-white text-[var(--ga-muted)] hover:bg-[var(--ga-hover)]'
      }`}
    >
      {children}
    </button>
  );
}
