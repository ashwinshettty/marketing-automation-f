import { cn } from '../../lib/utils';

export function ShimmerButton({
  shimmerColor = '#ffd300',
  shimmerSize = '0.08em',
  borderRadius = '12px',
  shimmerDuration = '3s',
  background = '#000080',
  className,
  children,
  ...props
}) {
  const reduced =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <button
      style={{
        '--spread': '90deg',
        '--shimmer-color': shimmerColor,
        '--radius': borderRadius,
        '--speed': shimmerDuration,
        '--cut': shimmerSize,
        '--bg': background,
      }}
      className={cn(
        'group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden border border-white/10 px-3.5 py-2 text-sm font-semibold whitespace-nowrap text-white [background:var(--bg)] [border-radius:var(--radius)]',
        'transform-gpu transition-transform duration-300 ease-in-out active:translate-y-px',
        'disabled:cursor-not-allowed disabled:opacity-60',
        className,
      )}
      {...props}
    >
      {!reduced && (
        <div className="absolute inset-0 -z-30 overflow-visible blur-[2px] [container-type:size]">
          <div className="animate-shimmer-slide absolute inset-0 aspect-square h-[100cqh]">
            <div className="animate-spin-around absolute -inset-full w-auto rotate-0 [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))]" />
          </div>
        </div>
      )}
      {children}
      <div className="absolute inset-0 size-full rounded-xl shadow-[inset_0_-8px_10px_#ffffff1f] transition-all duration-300 group-hover:shadow-[inset_0_-6px_10px_#ffffff3f]" />
      <div className="absolute -z-20 [inset:var(--cut)] [border-radius:var(--radius)] [background:var(--bg)]" />
    </button>
  );
}
