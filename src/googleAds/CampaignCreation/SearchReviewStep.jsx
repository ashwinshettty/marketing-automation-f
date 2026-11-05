const LOCATION_LABELS = {
  ALL_COUNTRIES: 'All countries and territories',
  COUNTRY_IN: 'India',
  ENTER_ANOTHER: 'Custom location',
};

const LANGUAGE_LABELS = {
  en: 'English',
  hi: 'Hindi',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
};

function SummaryCard({ title, children }) {
  return (
    <section className="rounded-2xl border border-[var(--ga-border)] bg-white shadow-[0_1px_2px_rgba(60,64,67,0.08)]">
      <div className="border-b border-[var(--ga-border)] px-6 py-4">
        <h2 className="text-base font-medium text-[var(--ga-ink)]">{title}</h2>
      </div>
      <div className="space-y-3 px-6 py-5 text-sm text-[var(--ga-ink)]">{children}</div>
    </section>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
      <dt className="w-40 shrink-0 text-[var(--ga-muted)]">{label}</dt>
      <dd className="min-w-0 flex-1 break-words font-medium">{value || '—'}</dd>
    </div>
  );
}

export default function SearchReviewStep({
  value,
  submitting = false,
  submitError = null,
  submitResult = null,
}) {
  const keywordCount = value.keywords
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean).length;

  const filledHeadlines = value.headlines.filter((item) => item.trim()).length;
  const filledDescriptions = value.descriptions.filter((item) => item.trim()).length;

  const customLocations = [
    ...(value.locationItems || []).map((item) => (
      `${item.action === 'exclude' ? 'Exclude' : 'Include'} ${item.name}`
    )),
    ...(value.locationRadii || []).map((item) => {
      const unit = item.radiusUnits === 'MILES' ? 'mi' : 'km';
      return `${item.radius} ${unit} around ${item.label}`;
    }),
  ];
  const locationValue = value.locationMode === 'ENTER_ANOTHER'
    ? customLocations.join('; ')
    : LOCATION_LABELS[value.locationMode];

  const languages = value.languages
    .map((code) => LANGUAGE_LABELS[code] || code)
    .join(', ');

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[28px] font-normal tracking-tight text-[var(--ga-ink)]">Review</h1>
        <p className="mt-1 text-sm text-[var(--ga-muted)]">
          Check your Search campaign details before creating it on Google Ads.
        </p>
      </div>

      <SummaryCard title="Campaign settings">
        <dl className="space-y-3">
          <Row label="Name" value={value.campaignName.trim() || value.campaignNamePlaceholder} />
          <Row label="Objective" value={value.objective} />
          <Row label="Locations" value={locationValue} />
          <Row label="Languages" value={languages} />
          <Row
            label="EU political ads"
            value={
              value.euPoliticalAds === 'CONTAINS'
                ? 'Yes'
                : value.euPoliticalAds === 'DOES_NOT_CONTAIN'
                  ? 'No'
                  : 'Not answered'
            }
          />
        </dl>
      </SummaryCard>

      <SummaryCard title="Keywords and ads">
        <dl className="space-y-3">
          <Row label="Ad group" value={value.adGroupName} />
          <Row label="Keywords" value={`${keywordCount} keyword${keywordCount === 1 ? '' : 's'}`} />
          <Row label="Final URL" value={value.finalUrl} />
          <Row
            label="Display path"
            value={[value.path1, value.path2].filter(Boolean).join(' / ') || '—'}
          />
          <Row
            label="Call phones"
            value={
              value.phoneNumbers?.length
                ? value.phoneNumbers.join(', ')
                : 'None'
            }
          />
          <Row
            label="Lead form"
            value={
              value.leadFormEnabled
                ? value.leadForm?.businessName || value.leadForm?.headline || 'Enabled'
                : 'Not added'
            }
          />
          <Row label="Headlines" value={`${filledHeadlines} filled`} />
          <Row label="Descriptions" value={`${filledDescriptions} filled`} />
        </dl>
      </SummaryCard>

      <SummaryCard title="Budget">
        <dl className="space-y-3">
          <Row
            label="Budget type"
            value={value.budgetType === 'TOTAL' ? 'Campaign total' : 'Average daily'}
          />
          <Row
            label="Budget"
            value={
              value.budgetType === 'TOTAL'
                ? (value.totalBudget ? `₹${value.totalBudget}` : '—')
                : (value.dailyBudget ? `₹${value.dailyBudget}` : '—')
            }
          />
          {value.budgetType === 'TOTAL' ? (
            <Row
              label="Dates"
              value={
                value.budgetStartDate && value.budgetEndDate
                  ? `${value.budgetStartDate} → ${value.budgetEndDate}`
                  : '—'
              }
            />
          ) : null}
          <Row label="Promotion mode" value={value.promotionMode ? 'On' : 'Off'} />
        </dl>
      </SummaryCard>

      {submitError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {submitError}
        </div>
      ) : null}

      {submitResult ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
          <p className="font-medium">{submitResult.message}</p>
          <p className="mt-1 text-emerald-700">
            Delivery status follows the server <code>GOOGLE_AD_STATUS</code> flag
            {submitResult.paused ? ' (currently PAUSED — no spend).' : ' (currently ENABLED).'}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-[var(--ga-border)] bg-[var(--ga-surface)] px-5 py-4 text-sm text-[var(--ga-muted)]">
          {submitting
            ? 'Saving draft and creating the campaign on Google Ads…'
            : 'Submit saves a draft, then creates the campaign using the backend GOOGLE_AD_STATUS setting (PAUSED keeps ads off).'}
        </div>
      )}
    </div>
  );
}
