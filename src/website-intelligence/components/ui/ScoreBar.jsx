export default function ScoreBar({ value = 0, max = 100, variant = 'signal', className = '' }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const fillClass = variant === 'risk' ? 'bg-destructive' : variant === 'info' ? 'bg-brand' : 'bg-success';

  return (
    <div className={`score-bar ${className}`} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
      <div className={`score-bar-fill ${fillClass}`} style={{ width: `${pct}%` }} />
    </div>
  );
}
