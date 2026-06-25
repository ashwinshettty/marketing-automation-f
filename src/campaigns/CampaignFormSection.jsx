const CampaignFormSection = ({ title, description, children }) => {
  return (
    <section className="rounded-2xl border border-brand-yellow/30 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-brand-navy">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-brand-muted">{description}</p>
        ) : null}
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
};

export default CampaignFormSection;
