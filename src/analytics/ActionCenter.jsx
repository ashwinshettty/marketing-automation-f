const ActionCenter = ({ actions, onOpenLead, onViewCampaign }) => {
  const groups = (actions?.groups || []).filter((group) => group.total > 0);
  if (!groups.length) return null;

  return (
    <section className="min-w-0 max-w-full break-words rounded-2xl border border-brand-yellow/40 bg-white p-4 shadow-sm sm:p-5">
      <h2 className="text-base font-semibold text-brand-navy">Needs a person today</h2>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {groups.map((group) => (
          <article key={group.key} className="rounded-xl border border-brand-yellow/30 bg-brand-cream/60 p-3">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold text-brand-navy">{group.title}</h3>
              <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-brand-navy">
                {group.total}
              </span>
            </div>
            <p className="mt-1 text-xs text-brand-muted">{group.rule}</p>
            {group.items.length === 0 ? (
              <p className="mt-3 text-sm text-brand-muted">Nothing in this group for the current filters.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {group.items.map((item) => (
                  <li key={`${group.key}-${item.id}`} className="rounded-lg bg-white px-3 py-2">
                    <p className="text-sm font-medium text-brand-navy">{item.name}</p>
                    <p className="text-xs text-brand-muted">{item.reason}</p>
                    <div className="mt-2 flex gap-2">
                      {item.type === 'campaign' ? (
                        <button
                          type="button"
                          onClick={() => onViewCampaign(item.campaignKey)}
                          className="text-xs font-semibold text-brand-navy underline"
                        >
                          View campaign
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onOpenLead(item)}
                          className="text-xs font-semibold text-brand-navy underline"
                        >
                          Open lead
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </div>
    </section>
  );
};

export default ActionCenter;
