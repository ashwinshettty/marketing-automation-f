const CampaignSummaryCard = ({ values }) => {
  const summaryItems = [
    ['Campaign name', values.name || 'Untitled campaign'],
    ['Objective', values.objectiveLabel],
    ['Budget', `${values.budgetTypeLabel} - ${values.currency} ${values.budgetAmount || '0'}`],
    ['Audience age', `${values.minAge || '18'} to ${values.maxAge || '65'}`],
    ['Gender', values.genderLabel],
    ['Platforms', values.platformLabels || 'Not selected'],
    ['Placements', values.placementLabels || 'Not selected'],
    ['Primary CTA', values.callToActionLabel],
  ];

  return (
    <aside className="rounded-2xl border border-brand-yellow/30 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-brand-navy">Campaign Summary</h2>
        <p className="mt-1 text-sm text-brand-muted">
          Review the setup before connecting it to the Meta API.
        </p>
      </div>

      <div className="space-y-4">
        {summaryItems.map(([label, value]) => (
          <div key={label} className="rounded-xl bg-slate-50 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-brand-muted">
              {label}
            </p>
            <p className="mt-1 text-sm font-semibold text-brand-navy">{value}</p>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default CampaignSummaryCard;
