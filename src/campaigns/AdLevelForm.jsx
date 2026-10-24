import CampaignFormSection from './CampaignFormSection';
import { CampaignInput, CampaignSelect, CampaignSwitch, CampaignTextarea } from './CampaignField';
import { adFormats, adSetups, callToActions } from './metaCatalog';

const VariationList = ({ label, hint, values, onChange, placeholder }) => (
  <div className="space-y-2">
    <span className="block text-sm font-medium text-brand-navy">{label}</span>
    {values.map((value, index) => (
      <div key={`${label}-${index}`} className="flex gap-2">
        <input
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(values.map((item, itemIndex) => (itemIndex === index ? event.target.value : item)))}
          className="w-full rounded-xl border border-brand-yellow/40 bg-white px-4 py-2.5 text-sm text-brand-navy outline-none focus:border-brand-navy"
        />
        {values.length > 1 ? (
          <button type="button" onClick={() => onChange(values.filter((_, itemIndex) => itemIndex !== index))} className="rounded-xl px-3 text-sm font-semibold text-brand-navy">
            Remove
          </button>
        ) : null}
      </div>
    ))}
    {values.length < 5 ? (
      <button type="button" onClick={() => onChange([...values, ''])} className="text-sm font-semibold text-brand-navy">
        Add text option
      </button>
    ) : null}
    {hint ? <p className="text-xs text-brand-muted">{hint}</p> : null}
  </div>
);

const AdLevelForm = ({ ad, adSet, objective, onChange, onImage }) => {
  const set = (field) => (event) => onChange({ ...ad, [field]: event.target.value });
  const location = adSet.conversionLocation;
  const showUrl = ['website', 'website_and_app', 'app'].includes(location) || !location;
  const showForm = location === 'instant_form';
  const showPhone = location === 'calls' || location === 'whatsapp';

  return (
    <div className="space-y-5">
      <CampaignFormSection title="Ad name" description="Name the creative so you can tell versions apart.">
        <CampaignInput label="Ad name" value={ad.adName} onChange={set('adName')} placeholder="Summer Sale - Blue Hero Image - Shop Now CTA" />
      </CampaignFormSection>

      <CampaignFormSection title="Identity" description="The Page and Instagram account are the name and picture people see on the ad.">
        <div className="grid gap-4 md:grid-cols-2">
          <CampaignInput label="Facebook Page" value={ad.pageName} onChange={set('pageName')} placeholder="Your Page" hint="Required. This Page is the identity of the ad." />
          <CampaignInput label="Instagram account" value={ad.instagramAccount} onChange={set('instagramAccount')} placeholder="Use Facebook Page" hint="Leave blank to use the Facebook Page on Instagram." />
        </div>
      </CampaignFormSection>

      <CampaignFormSection title="Ad setup" description="Create a new ad, or use a post that is already on your Page or Instagram account.">
        <div className="grid gap-3 md:grid-cols-2">
          {adSetups.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => onChange({ ...ad, adSetup: item.value })}
              className={`rounded-2xl border px-4 py-4 text-left ${ad.adSetup === item.value ? 'border-brand-yellow bg-brand-cream shadow-sm' : 'border-brand-yellow/30 bg-white'}`}
            >
              <span className="block text-sm font-semibold text-brand-navy">{item.label}</span>
              <span className="mt-1 block text-sm text-brand-muted">{item.description}</span>
            </button>
          ))}
        </div>
        {ad.adSetup === 'existing' ? (
          <CampaignInput label="Existing post" value={ad.existingPost} onChange={set('existingPost')} placeholder="Post link or post ID" />
        ) : null}
      </CampaignFormSection>

      {ad.adSetup === 'create' ? (
        <>
          <CampaignFormSection title="Format" description="Flexible is under the same format list. It is available for traffic, engagement, app promotion, and sales.">
            <div className="grid gap-3 md:grid-cols-2">
              {adFormats.filter((item) => item.value !== 'flexible' || ['traffic', 'engagement', 'app_promotion', 'sales'].includes(objective)).map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => onChange({ ...ad, format: item.value })}
                  className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold text-brand-navy ${ad.format === item.value ? 'border-brand-yellow bg-brand-cream' : 'border-brand-yellow/30 bg-white'}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </CampaignFormSection>

          <CampaignFormSection title="Ad creative" description="Add media, then primary text, headline, description, and a call to action. You can add up to five text options.">
            {ad.format === 'carousel' ? (
              <CampaignTextarea label="Carousel image links" value={ad.carouselUrls} onChange={set('carouselUrls')} placeholder={'https://example.com/one.jpg\nhttps://example.com/two.jpg'} hint="One link per line. Two to ten cards." />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="block text-sm font-medium text-brand-navy">{ad.format === 'collection' ? 'Cover media' : 'Upload image or video link file'}</span>
                  <input type="file" accept="image/*,video/*" onChange={onImage} className="block w-full text-sm text-brand-navy file:mr-3 file:rounded-lg file:border-0 file:bg-brand-yellow file:px-3 file:py-2 file:text-sm file:font-semibold file:text-brand-navy" />
                  <span className="block text-xs text-brand-muted">Images under 1.5 MB stay with the campaign. Larger files should use a link.</span>
                </label>
                <CampaignInput label="Media URL" value={ad.mediaUrl?.startsWith('data:') ? '' : ad.mediaUrl} onChange={set('mediaUrl')} placeholder="https://" />
              </div>
            )}
            {ad.mediaUrl?.startsWith('data:') ? <p className="text-xs font-medium text-brand-navy">Media attached.</p> : null}
            <VariationList label="Primary text" values={ad.primaryTexts} onChange={(primaryTexts) => onChange({ ...ad, primaryTexts })} placeholder="Text above the creative" hint="People usually see about the first 125 characters before See more." />
            <VariationList label="Headline" values={ad.headlines} onChange={(headlines) => onChange({ ...ad, headlines })} placeholder="Text under the creative" hint="About 40 characters stays readable beside the button." />
            <VariationList label="Description" values={ad.descriptions} onChange={(descriptions) => onChange({ ...ad, descriptions })} placeholder="Optional extra line" />
            <CampaignSelect label="Call to action" value={ad.callToAction} onChange={set('callToAction')} options={callToActions} />
          </CampaignFormSection>

          <CampaignFormSection title="Destination" description="Filled from the conversion you chose. Change it here only if this ad should open a different destination.">
            {showUrl ? (
              <>
                <CampaignInput label="Website URL" value={ad.destinationUrl} onChange={set('destinationUrl')} placeholder="https://" />
                <CampaignInput label="Display link" value={ad.displayLink} onChange={set('displayLink')} placeholder="example.com/offer" hint="Optional. The short link people see on the ad." />
                {['app', 'website_and_app'].includes(location) ? (
                  <CampaignInput label="Deep link" value={ad.deepLink} onChange={set('deepLink')} placeholder="myapp://product/1" />
                ) : null}
              </>
            ) : null}
            {showForm ? (
              <CampaignInput label="Instant form" value={ad.leadFormName} onChange={set('leadFormName')} placeholder="Admission enquiry" hint="People submit this form without leaving Facebook or Instagram." />
            ) : null}
            {showPhone ? (
              <CampaignInput label={location === 'whatsapp' ? 'WhatsApp number' : 'Phone number'} value={ad.phoneNumber} onChange={set('phoneNumber')} placeholder="+91" />
            ) : null}
            {location === 'messaging' || location === 'messenger' || location === 'instagram' ? (
              <p className="text-sm text-brand-muted">The ad opens a chat on the Page or Instagram account in Identity.</p>
            ) : null}
            {location === 'on_ad' || location === 'page' ? (
              <p className="text-sm text-brand-muted">The result happens on the ad or the Page. A website URL is optional.</p>
            ) : null}
            <CampaignInput label="URL parameters" value={ad.urlParameters} onChange={set('urlParameters')} placeholder="utm_source=meta&utm_medium=paid_social&utm_campaign=june" hint="Appended to website links so analytics can attribute the visit." />
            <CampaignTextarea label="Site links" value={ad.siteLinks} onChange={set('siteLinks')} placeholder={'Courses | https://example.com/courses\nFees | https://example.com/fees'} hint="Optional. One label and URL per line." />
          </CampaignFormSection>

          <CampaignSwitch label="Advantage+ creative" description="Allow Meta to try text and visual variations that may improve delivery." checked={ad.advantageCreative} onChange={(advantageCreative) => onChange({ ...ad, advantageCreative })} />
          <CampaignSwitch label="Multi-advertiser ads" description="Your ad can appear beside other businesses in some placements." checked={ad.multiAdvertiser} onChange={(multiAdvertiser) => onChange({ ...ad, multiAdvertiser })} />
        </>
      ) : null}
    </div>
  );
};

export default AdLevelForm;
