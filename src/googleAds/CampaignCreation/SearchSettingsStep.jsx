import LocationSection from './locations/LocationSection';

const LANGUAGE_OPTIONS = [
  { id: 'en', label: 'English' },
  { id: 'hi', label: 'Hindi' },
  { id: 'es', label: 'Spanish' },
  { id: 'fr', label: 'French' },
  { id: 'de', label: 'German' },
];

function SectionCard({ title, children, defaultOpen = true }) {
  return (
    <section className="rounded-2xl border border-[var(--ga-border)] bg-white shadow-[0_1px_2px_rgba(60,64,67,0.08)]">
      <details open={defaultOpen} className="group">
        <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-4 text-base font-medium text-[var(--ga-ink)] marker:content-none [&::-webkit-details-marker]:hidden">
          {title}
          <span className="text-[var(--ga-muted)] transition group-open:rotate-180">▾</span>
        </summary>
        <div className="border-t border-[var(--ga-border)] px-6 py-5">{children}</div>
      </details>
    </section>
  );
}

export default function SearchSettingsStep({ value, onChange }) {
  const set = (patch) => onChange({ ...value, ...patch });

  const toggleLanguage = (id) => {
    const has = value.languages.includes(id);
    set({
      languages: has
        ? value.languages.filter((code) => code !== id)
        : [...value.languages, id],
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[28px] font-normal tracking-tight text-[var(--ga-ink)]">
          Campaign settings
        </h1>
        <p className="mt-1 text-sm text-[var(--ga-muted)]">
          Define where and how this Search campaign should run.
        </p>
      </div>

      <SectionCard title="Campaign name">
        <input
          value={value.campaignName}
          onChange={(event) => set({ campaignName: event.target.value })}
          placeholder={value.campaignNamePlaceholder || 'Campaign name'}
          className="w-full max-w-xl rounded-lg border border-[var(--ga-border)] px-3 py-2.5 text-sm outline-none focus:border-[var(--ga-blue)] placeholder:text-[var(--ga-muted)]"
        />
      </SectionCard>

      <SectionCard title="Locations">
        <LocationSection value={value} onChange={set} />
      </SectionCard>

      <SectionCard title="Languages">
        <p className="mb-3 text-sm text-[var(--ga-muted)]">
          Show ads to people who speak these languages
        </p>
        <div className="flex flex-wrap gap-2">
          {LANGUAGE_OPTIONS.map((lang) => {
            const active = value.languages.includes(lang.id);
            return (
              <button
                key={lang.id}
                type="button"
                onClick={() => toggleLanguage(lang.id)}
                className={`rounded-full border px-3 py-1.5 text-sm transition ${
                  active
                    ? 'border-[var(--ga-blue)] bg-[var(--ga-blue-soft)] text-[var(--ga-blue)]'
                    : 'border-[var(--ga-border)] text-[var(--ga-ink)] hover:bg-[var(--ga-hover)]'
                }`}
              >
                {lang.label}
              </button>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard title="EU political ads">
        <p className="mb-3 text-sm text-[var(--ga-muted)]">
          Do your ads contain political content related to elections or referendums in the EU?
        </p>
        <div className="space-y-2">
          <label className="flex cursor-pointer items-center gap-3 py-1">
            <input
              type="radio"
              name="euPolitical"
              checked={value.euPoliticalAds === 'DOES_NOT_CONTAIN'}
              onChange={() => set({ euPoliticalAds: 'DOES_NOT_CONTAIN' })}
              className="h-4 w-4 accent-[var(--ga-blue)]"
            />
            <span className="text-sm text-[var(--ga-ink)]">No</span>
          </label>
          <label className="flex cursor-pointer items-center gap-3 py-1">
            <input
              type="radio"
              name="euPolitical"
              checked={value.euPoliticalAds === 'CONTAINS'}
              onChange={() => set({ euPoliticalAds: 'CONTAINS' })}
              className="h-4 w-4 accent-[var(--ga-blue)]"
            />
            <span className="text-sm text-[var(--ga-ink)]">Yes</span>
          </label>
        </div>
      </SectionCard>
    </div>
  );
}
