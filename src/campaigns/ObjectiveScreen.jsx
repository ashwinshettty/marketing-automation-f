import { buyingTypes, objectives } from './metaCatalog';

const ObjectiveScreen = ({ buyingType, objective, onBuyingType, onObjective, onContinue, onClose }) => (
  <div className="mx-auto max-w-5xl px-4 py-6 sm:px-8 sm:py-8">
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-navy">+ Create</p>
        <h2 className="mt-1 text-xl font-semibold text-brand-navy">Choose a campaign objective</h2>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-brand-muted">
          The buying type decides how you are charged. The objective is the result this campaign is built to get. Click Continue to open the campaign.
        </p>
      </div>
      <button type="button" onClick={onClose} className="rounded-xl border border-brand-yellow/50 bg-white px-4 py-2 text-sm font-semibold text-brand-navy">
        Close
      </button>
    </div>

    <section className="rounded-2xl border border-brand-yellow/40 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-brand-navy">Buying type</h3>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {buyingTypes.map((item) => {
          const active = buyingType === item.value;
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => onBuyingType(item.value)}
              className={`rounded-2xl border px-4 py-4 text-left ${active ? 'border-brand-yellow bg-brand-cream shadow-sm' : 'border-brand-yellow/30 bg-white'}`}
            >
              <span className="block text-sm font-semibold text-brand-navy">{item.label}</span>
              <span className="mt-1 block text-sm text-brand-muted">{item.description}</span>
            </button>
          );
        })}
      </div>
    </section>

    <section className="mt-5 rounded-2xl border border-brand-yellow/40 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-brand-navy">Campaign objective</h3>
      <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {objectives.map((item) => {
          const locked = buyingType === 'reservation' && item.value !== 'awareness';
          const active = objective === item.value;
          return (
            <button
              key={item.value}
              type="button"
              disabled={locked}
              onClick={() => onObjective(item.value)}
              className={`rounded-2xl border px-4 py-4 text-left disabled:cursor-not-allowed disabled:opacity-40 ${active ? 'border-brand-yellow bg-brand-cream shadow-sm' : 'border-brand-yellow/30 bg-white hover:border-brand-yellow'}`}
            >
              <span className="block text-sm font-semibold text-brand-navy">{item.label}</span>
              <span className="mt-1 block text-sm text-brand-muted">{item.description}</span>
            </button>
          );
        })}
      </div>
    </section>

    <div className="mt-6 flex justify-end">
      <button
        type="button"
        disabled={!objective}
        onClick={onContinue}
        className="rounded-xl bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-navy-hover disabled:opacity-40"
      >
        Continue
      </button>
    </div>
  </div>
);

export default ObjectiveScreen;
