import { useMemo, useState } from 'react';
import AdPreview from './AdPreview';
import AdLevelForm from './AdLevelForm';
import AdSetLevelForm from './AdSetLevelForm';
import CampaignLevelForm from './CampaignLevelForm';
import { createAd, createAdSet, objectiveLabel, stampAdDestination, validateAd, validateAdSet, validateCampaignLevel } from './campaignEntity';

const CampaignEditor = ({ campaign, initialSelection, onChange, onClose, onPublish, onBackToObjective }) => {
  const [selection, setSelection] = useState(initialSelection || { level: 'campaign' });
  const [errors, setErrors] = useState([]);
  const [surface, setSurface] = useState('facebook_feed');

  const adSet = campaign.adSets.find((item) => item.id === selection.adSetId) || campaign.adSets[0];
  const ad = adSet?.ads.find((item) => item.id === selection.adId) || adSet?.ads[0];

  const updateAdSet = (nextAdSet) => {
    setErrors([]);
    onChange({
      ...campaign,
      adSets: campaign.adSets.map((item) => (item.id === nextAdSet.id ? nextAdSet : item)),
    });
  };

  const updateAd = (nextAd) => {
    updateAdSet({
      ...adSet,
      ads: adSet.ads.map((item) => (item.id === nextAd.id ? nextAd : item)),
    });
  };

  const showErrors = (next) => {
    setErrors(next);
    return next.length === 0;
  };

  const goNext = () => {
    if (selection.level === 'campaign') {
      if (!showErrors(validateCampaignLevel(campaign))) return;
      const first = campaign.adSets[0];
      setSelection({ level: 'adset', adSetId: first.id });
      return;
    }
    if (selection.level === 'adset') {
      if (!showErrors(validateAdSet(campaign, adSet))) return;
      const firstAd = adSet.ads[0];
      setSelection({ level: 'ad', adSetId: adSet.id, adId: firstAd.id });
    }
  };

  const goBack = () => {
    setErrors([]);
    if (selection.level === 'ad') {
      setSelection({ level: 'adset', adSetId: adSet.id });
      return;
    }
    if (selection.level === 'adset') {
      setSelection({ level: 'campaign' });
      return;
    }
    onBackToObjective();
  };

  const publish = () => {
    const campaignErrors = validateCampaignLevel(campaign);
    if (campaignErrors.length) {
      setSelection({ level: 'campaign' });
      setErrors(campaignErrors);
      return;
    }
    for (const set of campaign.adSets) {
      const setErrors = validateAdSet(campaign, set);
      if (setErrors.length) {
        setSelection({ level: 'adset', adSetId: set.id });
        setErrors(setErrors);
        return;
      }
      for (const item of set.ads) {
        const adErrors = validateAd(set, item);
        if (adErrors.length) {
          setSelection({ level: 'ad', adSetId: set.id, adId: item.id });
          setErrors(adErrors);
          return;
        }
      }
    }
    onPublish();
  };

  const onImage = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (file.size > 1500000) {
      setErrors(['That file is over 1.5 MB. Paste a media URL instead.']);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => updateAd({ ...ad, mediaUrl: String(reader.result || '') });
    reader.readAsDataURL(file);
  };

  const levelTitle = useMemo(() => {
    if (selection.level === 'campaign') return 'Campaign';
    if (selection.level === 'adset') return 'Ad set';
    return 'Ad';
  }, [selection.level]);

  return (
    <div className="flex h-full min-h-[720px] flex-col">
      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-64 shrink-0 overflow-y-auto border-r border-brand-yellow/30 bg-white p-4 md:block">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">Campaign structure</p>
          <button type="button" onClick={() => { setErrors([]); setSelection({ level: 'campaign' }); }} className={`mt-3 w-full rounded-xl px-3 py-2 text-left ${selection.level === 'campaign' ? 'bg-brand-cream' : 'hover:bg-brand-cream'}`}>
            <span className="block text-[11px] font-semibold uppercase tracking-wide text-brand-muted">Campaign</span>
            <span className="block truncate text-sm font-semibold text-brand-navy">{campaign.campaignName || 'Untitled campaign'}</span>
            <span className="block text-xs text-brand-muted">{objectiveLabel(campaign.objective)}</span>
          </button>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-muted">Ad sets</p>
            <button
              type="button"
              onClick={() => {
                const next = createAdSet(campaign.objective || 'leads');
                next.adSetName = `Ad set ${campaign.adSets.length + 1}`;
                onChange({ ...campaign, adSets: [...campaign.adSets, next] });
                setSelection({ level: 'adset', adSetId: next.id });
              }}
              className="text-sm font-semibold text-brand-navy"
            >
              + Add
            </button>
          </div>
          {campaign.adSets.map((item, index) => (
            <div key={item.id} className="mt-2">
              <button type="button" onClick={() => { setErrors([]); setSelection({ level: 'adset', adSetId: item.id }); }} className={`w-full rounded-xl px-3 py-2 text-left ${selection.level === 'adset' && adSet?.id === item.id ? 'bg-brand-cream' : 'hover:bg-brand-cream'}`}>
                <span className="block text-sm font-semibold text-brand-navy">{item.adSetName || `Ad set ${index + 1}`}</span>
              </button>
              <div className="ml-3 mt-1 border-l border-brand-yellow/40 pl-2">
                <button
                  type="button"
                  onClick={() => {
                    const nextAd = stampAdDestination(createAd(campaign.campaignName), item);
                    nextAd.adName = `Ad ${item.ads.length + 1}`;
                    updateAdSet({ ...item, ads: [...item.ads, nextAd] });
                    setSelection({ level: 'ad', adSetId: item.id, adId: nextAd.id });
                  }}
                  className="px-2 py-1 text-xs font-semibold text-brand-navy"
                >
                  + Ad
                </button>
                {item.ads.map((itemAd, adIndex) => (
                  <button key={itemAd.id} type="button" onClick={() => { setErrors([]); setSelection({ level: 'ad', adSetId: item.id, adId: itemAd.id }); }} className={`block w-full rounded-lg px-2 py-1.5 text-left text-sm ${selection.level === 'ad' && ad?.id === itemAd.id ? 'bg-brand-yellow-soft font-semibold text-brand-navy' : 'text-brand-muted'}`}>
                    {itemAd.adName || `Ad ${adIndex + 1}`}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </aside>

        <div className="min-w-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-navy">{levelTitle}</p>
          <h2 className="mt-1 text-lg font-semibold text-brand-navy">
            {selection.level === 'campaign' && (campaign.campaignName || 'Campaign')}
            {selection.level === 'adset' && (adSet?.adSetName || 'Ad set')}
            {selection.level === 'ad' && (ad?.adName || 'Ad')}
          </h2>
          {errors.length ? (
            <ul className="mt-4 space-y-1 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
              {errors.map((error) => <li key={error}>{error}</li>)}
            </ul>
          ) : null}
          <div className="mt-5">
            {selection.level === 'campaign' ? <CampaignLevelForm campaign={campaign} onChange={(next) => { setErrors([]); onChange(next); }} /> : null}
            {selection.level === 'adset' && adSet ? <AdSetLevelForm campaign={campaign} adSet={adSet} onChange={updateAdSet} /> : null}
            {selection.level === 'ad' && ad ? <AdLevelForm ad={ad} adSet={adSet} objective={campaign.objective} onChange={updateAd} onImage={onImage} /> : null}
          </div>
          {selection.level === 'ad' && ad ? (
            <div className="mt-5 xl:hidden">
              <AdPreview ad={ad} surface={surface} onSurfaceChange={setSurface} />
            </div>
          ) : null}
        </div>

        {selection.level === 'ad' && ad ? (
          <aside className="hidden w-80 shrink-0 overflow-y-auto border-l border-brand-yellow/30 bg-brand-cream p-4 xl:block">
            <AdPreview ad={ad} surface={surface} onSurfaceChange={setSurface} />
          </aside>
        ) : null}
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-brand-yellow/30 bg-white px-4 py-3 sm:px-6">
        <button type="button" onClick={onClose} className="rounded-xl border border-brand-yellow/50 px-4 py-2.5 text-sm font-semibold text-brand-navy">
          Close
        </button>
        <div className="flex gap-2">
          <button type="button" onClick={goBack} className="rounded-xl border border-brand-yellow/50 bg-white px-4 py-2.5 text-sm font-semibold text-brand-navy">
            Back
          </button>
          {selection.level === 'ad' ? (
            <button type="button" onClick={publish} className="rounded-xl bg-brand-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-navy-hover">
              Publish
            </button>
          ) : (
            <button type="button" onClick={goNext} className="rounded-xl bg-brand-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-navy-hover">
              Next
            </button>
          )}
        </div>
      </footer>
    </div>
  );
};

export default CampaignEditor;
