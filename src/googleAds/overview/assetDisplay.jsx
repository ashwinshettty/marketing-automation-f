export const ASSET_PAGE_SIZE = 5;

export function statusTone(label) {
  if (label === 'Eligible') return 'bg-[#1e8e3e]';
  if (String(label).startsWith('Eligible')) return 'bg-[#f9ab00]';
  if (label === 'Not eligible') return 'bg-[#d93025]';
  return 'bg-[#9aa0a6]';
}

export function AssetName({ row }) {
  return (
    <span className="flex min-w-0 items-center gap-3">
      <span className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${statusTone(row.statusLabel)}`} aria-hidden="true" />
      {row.imageUrl ? (
        <img src={row.imageUrl} alt="" className="h-10 w-10 shrink-0 rounded object-cover" />
      ) : null}
      <span className="min-w-0">
        <span className="block truncate text-[var(--ga-ink)]">{row.name}</span>
        {row.campaignName && row.showCampaign ? (
          <span className="block truncate text-xs text-[var(--ga-muted)]">{row.campaignName}</span>
        ) : null}
      </span>
    </span>
  );
}
