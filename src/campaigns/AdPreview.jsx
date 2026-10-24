import { useEffect, useState } from 'react';
import { callToActions, labelOf, previewSurfaces } from './metaCatalog';

const domainFromUrl = (value) => {
  try {
    return new URL(value).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
};

const AdPreview = ({ ad, surface, onSurfaceChange }) => {
  const [failed, setFailed] = useState(false);
  const page = ad.pageName?.trim() || 'Facebook Page';
  const primary = ad.primaryTexts?.find((item) => item.trim()) || 'Primary text';
  const headline = ad.headlines?.find((item) => item.trim()) || 'Headline';
  const button = labelOf(callToActions, ad.callToAction) || 'Learn more';
  const image = ad.format === 'carousel'
    ? String(ad.carouselUrls || '').split('\n').map((line) => line.trim()).find((line) => line.startsWith('http'))
    : ad.mediaUrl;
  const story = surface === 'instagram_stories' || surface === 'instagram_reels';

  useEffect(() => {
    setFailed(false);
  }, [image, surface]);

  return (
    <div className="rounded-2xl border border-brand-yellow/30 bg-white p-4 shadow-sm">
      <p className="text-sm font-semibold text-brand-navy">Ad preview</p>
      <label className="mt-3 block">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-brand-navy">Placement</span>
        <select value={surface} onChange={(event) => onSurfaceChange(event.target.value)} className="w-full rounded-xl border border-brand-yellow/40 bg-white px-3 py-2 text-sm text-brand-navy">
          {previewSurfaces.map((item) => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </select>
      </label>
      <div className={`mx-auto mt-4 overflow-hidden rounded-2xl border border-brand-yellow/40 bg-white ${story ? 'max-w-[220px]' : 'max-w-[280px]'}`}>
        <div className="flex items-center gap-2 px-3 py-3">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-navy text-xs font-semibold text-brand-yellow">{page.slice(0, 1).toUpperCase()}</span>
          <span>
            <span className="block text-sm font-semibold text-brand-navy">{surface.startsWith('instagram') ? page.replace(/\s+/g, '').toLowerCase() : page}</span>
            <span className="block text-[11px] text-brand-muted">Sponsored</span>
          </span>
        </div>
        {!story ? <p className="line-clamp-4 px-3 pb-3 text-[13px] leading-5 text-brand-navy">{primary}</p> : null}
        <div className={`bg-brand-cream ${story ? 'aspect-[9/16]' : 'aspect-[4/5]'}`}>
          {image && !failed && !String(image).startsWith('data:video') ? (
            <img src={image} alt="" className="h-full w-full object-cover" onError={() => setFailed(true)} />
          ) : (
            <div className="flex h-full items-center justify-center px-4 text-center text-xs font-medium text-brand-navy">Media preview</div>
          )}
        </div>
        <div className="flex items-center gap-2 bg-brand-cream px-3 py-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[10px] uppercase tracking-wide text-brand-muted">{domainFromUrl(ad.destinationUrl) || ad.leadFormName || 'Destination'}</p>
            <p className="truncate text-sm font-semibold text-brand-navy">{headline}</p>
          </div>
          <span className="shrink-0 rounded-lg bg-brand-navy px-2 py-1 text-[11px] font-semibold text-white">{button}</span>
        </div>
      </div>
    </div>
  );
};

export default AdPreview;
