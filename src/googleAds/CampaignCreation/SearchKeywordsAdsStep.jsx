import { useState } from 'react';
import AdLivePreview from './AdLivePreview';
import {
  LEAD_CONTACT_FIELDS,
  LEAD_WORK_FIELDS,
  parseDisplayHost,
} from './searchWizardDefaults';

function SectionCard({ title, badge = null, children, defaultOpen = true }) {
  return (
    <section className="rounded-2xl border border-[var(--ga-border)] bg-white shadow-[0_1px_2px_rgba(60,64,67,0.08)]">
      <details open={defaultOpen} className="group">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-6 py-4 marker:content-none [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-2 text-base font-medium text-[var(--ga-ink)]">
            {title}
            {badge}
          </span>
          <span className="text-[var(--ga-muted)] transition group-open:rotate-180">▾</span>
        </summary>
        <div className="border-t border-[var(--ga-border)] px-6 py-5">{children}</div>
      </details>
    </section>
  );
}

function CharCount({ value, max }) {
  return (
    <div className="mt-1 text-right text-[11px] text-[var(--ga-muted)]">
      {String(value || '').length} / {max}
    </div>
  );
}

function KeywordsPanel({ value, set }) {
  const addService = () => {
    const tag = value.keywordServiceDraft.trim();
    if (!tag || value.keywordServices.includes(tag)) return;
    set({
      keywordServices: [...value.keywordServices, tag],
      keywordServiceDraft: '',
    });
  };

  const generateSuggestions = () => {
    const seeds = [
      ...value.keywordServices,
      ...value.keywordSeedUrl
        .replace(/^https?:\/\//i, '')
        .split(/[/?#]/)
        .filter(Boolean)
        .slice(0, 2),
    ].filter(Boolean);

    const base = seeds.length ? seeds : ['your product', 'your service'];
    const ideas = base.flatMap((seed) => [
      seed,
      `best ${seed}`,
      `${seed} near me`,
      `buy ${seed}`,
    ]);
    const unique = [...new Set(ideas.map((item) => item.toLowerCase()))];
    set({ suggestedKeywords: unique });
  };

  const applySuggestions = () => {
    if (!value.suggestedKeywords.length) return;
    const existing = value.keywords
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    const merged = [...new Set([...existing, ...value.suggestedKeywords])];
    set({ keywords: merged.join('\n') });
  };

  return (
    <SectionCard title="Keywords">
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-[var(--ga-ink)]">
            Get keyword suggestions (optional)
          </h3>
          <p className="mt-1 text-xs leading-5 text-[var(--ga-muted)]">
            Google Ads can find keywords for you by scanning a web page or seeing what’s working for
            similar products or services. Keyword research generation will plug in here later.
          </p>

          <label className="mt-4 block text-sm text-[var(--ga-ink)]">Final URL</label>
          <div className="relative mt-1 max-w-xl">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ga-muted)]">
              🔗
            </span>
            <input
              value={value.keywordSeedUrl}
              onChange={(event) => set({ keywordSeedUrl: event.target.value })}
              placeholder="https://www.example.com"
              className="w-full rounded-lg border border-[var(--ga-border)] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[var(--ga-blue)]"
            />
          </div>

          <label className="mt-4 block text-sm text-[var(--ga-ink)]">
            Add products or services to advertise
          </label>
          <div className="mt-1 flex max-w-xl flex-wrap items-center gap-2 rounded-lg border border-[var(--ga-border)] px-2 py-2">
            {value.keywordServices.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-[var(--ga-blue-soft)] px-2.5 py-1 text-xs text-[var(--ga-blue)]"
              >
                {tag}
                <button
                  type="button"
                  onClick={() =>
                    set({
                      keywordServices: value.keywordServices.filter((item) => item !== tag),
                    })
                  }
                  className="text-[var(--ga-blue)] hover:opacity-70"
                  aria-label={`Remove ${tag}`}
                >
                  ×
                </button>
              </span>
            ))}
            <input
              value={value.keywordServiceDraft}
              onChange={(event) => set({ keywordServiceDraft: event.target.value })}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  addService();
                }
              }}
              placeholder="Type and press Enter"
              className="min-w-[140px] flex-1 border-0 bg-transparent py-1 text-sm outline-none"
            />
          </div>

          <button
            type="button"
            onClick={generateSuggestions}
            className="mt-3 rounded-full bg-[var(--ga-blue-soft)] px-4 py-2 text-sm font-medium text-[var(--ga-blue)] hover:brightness-95"
          >
            Update keyword suggestions
          </button>

          {value.suggestedKeywords.length ? (
            <div className="mt-3 rounded-xl border border-[var(--ga-border)] bg-[var(--ga-surface)] p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-[var(--ga-ink)]">
                  Suggested keywords
                </span>
                <button
                  type="button"
                  onClick={applySuggestions}
                  className="text-xs font-medium text-[var(--ga-blue)] hover:underline"
                >
                  Apply all
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {value.suggestedKeywords.map((kw) => (
                  <button
                    key={kw}
                    type="button"
                    onClick={() => {
                      const lines = value.keywords
                        .split('\n')
                        .map((line) => line.trim())
                        .filter(Boolean);
                      if (!lines.includes(kw)) set({ keywords: [...lines, kw].join('\n') });
                    }}
                    className="rounded-full border border-[var(--ga-border)] bg-white px-2.5 py-1 text-xs text-[var(--ga-ink)] hover:border-[var(--ga-blue)]"
                  >
                    + {kw}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div>
          <h3 className="text-sm font-medium text-[var(--ga-ink)]">Enter keywords</h3>
          <p className="mt-1 text-xs leading-5 text-[var(--ga-muted)]">
            Keywords are words or phrases used to match your ads with the terms people are searching
            for. One keyword per line.
          </p>
          <textarea
            value={value.keywords}
            onChange={(event) => set({ keywords: event.target.value })}
            rows={8}
            placeholder={'google products\ngoogle homepage\nfind google home page'}
            className="mt-3 w-full rounded-lg border border-[var(--ga-border)] px-3 py-2.5 text-sm outline-none focus:border-[var(--ga-blue)]"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[var(--ga-surface)] px-4 py-3 text-sm">
          <span className="text-[var(--ga-muted)]">
            ⌕ Add more keywords: Show your ads more often to people searching for what your business
            offers.
          </span>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={generateSuggestions}
              className="font-medium text-[var(--ga-blue)] hover:underline"
            >
              View
            </button>
            <button
              type="button"
              onClick={applySuggestions}
              className="font-medium text-[var(--ga-blue)] hover:underline"
            >
              Apply all
            </button>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

function CallsPanel({ value, set }) {
  const addPhone = () => {
    const phone = value.phoneDraft.trim();
    if (!phone || value.phoneNumbers.includes(phone)) return;
    set({ phoneNumbers: [...value.phoneNumbers, phone], phoneDraft: '' });
  };

  return (
    <SectionCard title="Calls — Add a phone number" defaultOpen>
      <p className="mb-3 text-xs text-[var(--ga-muted)]">
        Campaign-level calls. Numbers added here can appear with your ads.
      </p>
      {value.phoneNumbers.length ? (
        <ul className="mb-3 space-y-2">
          {value.phoneNumbers.map((phone) => (
            <li
              key={phone}
              className="flex items-center justify-between rounded-lg border border-[var(--ga-border)] px-3 py-2 text-sm"
            >
              <span className="flex items-center gap-2 text-[var(--ga-ink)]">
                <span aria-hidden="true">📞</span>
                {phone}
              </span>
              <button
                type="button"
                onClick={() =>
                  set({ phoneNumbers: value.phoneNumbers.filter((item) => item !== phone) })
                }
                className="text-xs text-[var(--ga-muted)] hover:text-[var(--ga-ink)]"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mb-3 rounded-xl bg-[#fef7e0] px-4 py-3 text-xs text-[var(--ga-ink)]">
          Add a call asset so people can tap to call from your ads.
        </div>
      )}
      <div className="flex max-w-md gap-2">
        <input
          value={value.phoneDraft}
          onChange={(event) => set({ phoneDraft: event.target.value })}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              addPhone();
            }
          }}
          placeholder="Phone number"
          className="w-full rounded-lg border border-[var(--ga-border)] px-3 py-2.5 text-sm outline-none focus:border-[var(--ga-blue)]"
        />
        <button
          type="button"
          onClick={addPhone}
          className="shrink-0 rounded-full bg-[var(--ga-blue)] px-4 py-2 text-sm font-medium text-white hover:brightness-95"
        >
          + Calls
        </button>
      </div>
    </SectionCard>
  );
}

function LeadFormPanel({ value, set }) {
  const form = value.leadForm;
  const patchForm = (patch) => set({ leadForm: { ...form, ...patch } });

  const toggleList = (key, id) => {
    const list = form[key];
    patchForm({
      [key]: list.includes(id) ? list.filter((item) => item !== id) : [...list, id],
    });
  };

  if (!value.leadFormEnabled) {
    return (
      <SectionCard title="Lead forms — Add a form">
        <div className="rounded-xl bg-[#fef7e0] px-4 py-3 text-xs text-[var(--ga-ink)]">
          Because you selected leads as a campaign goal, you should add a lead form to use with your
          ads.
        </div>
        <button
          type="button"
          onClick={() => set({ leadFormEnabled: true })}
          className="mt-3 text-sm font-medium text-[var(--ga-blue)] hover:underline"
        >
          + Lead forms
        </button>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Lead forms">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs text-[var(--ga-muted)]">Configure the form people fill out from your ad.</p>
        <button
          type="button"
          onClick={() => set({ leadFormEnabled: false })}
          className="shrink-0 text-xs text-[var(--ga-muted)] hover:text-[var(--ga-ink)]"
        >
          Remove form
        </button>
      </div>

      <div className="space-y-3">
        <div className="rounded-xl border border-[var(--ga-border)] p-3">
          <h3 className="mb-2 text-sm font-medium text-[var(--ga-ink)]">Create your lead form</h3>
          <label className="block text-xs text-[var(--ga-muted)]">Headline</label>
          <input
            value={form.headline}
            onChange={(event) => patchForm({ headline: event.target.value })}
            maxLength={30}
            className="mt-1 w-full rounded-lg border border-[var(--ga-border)] px-3 py-2 text-sm outline-none focus:border-[var(--ga-blue)]"
          />
          <CharCount value={form.headline} max={30} />

          <label className="mt-3 block text-xs text-[var(--ga-muted)]">Business name</label>
          <input
            value={form.businessName}
            onChange={(event) => patchForm({ businessName: event.target.value })}
            maxLength={25}
            className="mt-1 w-full rounded-lg border border-[var(--ga-border)] px-3 py-2 text-sm outline-none focus:border-[var(--ga-blue)]"
          />
          <CharCount value={form.businessName} max={25} />

          <label className="mt-3 block text-xs text-[var(--ga-muted)]">Description</label>
          <textarea
            value={form.description}
            onChange={(event) => patchForm({ description: event.target.value })}
            maxLength={200}
            rows={3}
            className="mt-1 w-full rounded-lg border border-[var(--ga-border)] px-3 py-2 text-sm outline-none focus:border-[var(--ga-blue)]"
          />
          <CharCount value={form.description} max={200} />
        </div>

        <div className="rounded-xl border border-[var(--ga-border)] p-3">
          <h3 className="mb-2 text-sm font-medium text-[var(--ga-ink)]">Contact information</h3>
          <div className="mb-2 grid grid-cols-[48px_1fr_72px] gap-2 text-xs text-[var(--ga-muted)]">
            <span>Add</span>
            <span>Field</span>
            <span>Optional</span>
          </div>
          <div className="divide-y divide-[var(--ga-border)]">
            {LEAD_CONTACT_FIELDS.map((field) => {
              const checked = form.contactFields.includes(field.id);
              return (
                <div key={field.id} className="py-2">
                  <label className="grid grid-cols-[48px_1fr_72px] items-start gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleList('contactFields', field.id)}
                      className="mt-1 h-4 w-4 accent-[var(--ga-blue)]"
                    />
                    <span>
                      <span className="text-[var(--ga-ink)]">{field.label}</span>
                      {field.prefilled ? (
                        <span className="mt-0.5 block text-[11px] text-[var(--ga-muted)] underline decoration-dashed">
                          Pre-filled
                        </span>
                      ) : null}
                      {field.id === 'name' && checked ? (
                        <div className="mt-2 space-y-1 text-xs">
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              checked={form.nameFormat === 'FIRST_LAST'}
                              onChange={() => patchForm({ nameFormat: 'FIRST_LAST' })}
                              className="accent-[var(--ga-blue)]"
                            />
                            First name and last name
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              checked={form.nameFormat === 'FULL'}
                              onChange={() => patchForm({ nameFormat: 'FULL' })}
                              className="accent-[var(--ga-blue)]"
                            />
                            Full name
                          </label>
                        </div>
                      ) : null}
                    </span>
                    <span />
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-[var(--ga-border)] p-3">
          <h3 className="mb-2 text-sm font-medium text-[var(--ga-ink)]">Work information</h3>
          <div className="divide-y divide-[var(--ga-border)]">
            {LEAD_WORK_FIELDS.map((field) => (
              <label
                key={field.id}
                className="flex items-center gap-3 py-2 text-sm text-[var(--ga-ink)]"
              >
                <input
                  type="checkbox"
                  checked={form.workFields.includes(field.id)}
                  onChange={() => toggleList('workFields', field.id)}
                  className="h-4 w-4 accent-[var(--ga-blue)]"
                />
                {field.label}
              </label>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[var(--ga-border)] p-3">
          <h3 className="mb-2 text-sm font-medium text-[var(--ga-ink)]">Additional information</h3>
          <label className="flex items-center gap-3 text-sm text-[var(--ga-ink)]">
            <input
              type="checkbox"
              checked={form.additionalAge}
              onChange={(event) => patchForm({ additionalAge: event.target.checked })}
              className="h-4 w-4 accent-[var(--ga-blue)]"
            />
            Are you over _ years of age?
          </label>
        </div>

        <div className="rounded-xl border border-[var(--ga-border)] p-3">
          <h3 className="mb-2 text-sm font-medium text-[var(--ga-ink)]">Custom questions</h3>
          <div className="mb-3">
            <label className="text-xs text-[var(--ga-muted)]">Language</label>
            <select
              className="mt-1 block rounded-lg border border-[var(--ga-border)] px-3 py-2 text-sm"
              defaultValue="en"
            >
              <option value="en">English</option>
            </select>
          </div>
          <div className="space-y-2">
            {form.customQuestions.map((question, index) => (
              <div key={`cq-${index}`} className="flex gap-2">
                <input
                  value={question}
                  onChange={(event) => {
                    const next = [...form.customQuestions];
                    next[index] = event.target.value;
                    patchForm({ customQuestions: next });
                  }}
                  placeholder="Custom question"
                  className="w-full rounded-lg border border-[var(--ga-border)] px-3 py-2 text-sm outline-none focus:border-[var(--ga-blue)]"
                />
                <button
                  type="button"
                  onClick={() =>
                    patchForm({
                      customQuestions: form.customQuestions.filter((_, i) => i !== index),
                    })
                  }
                  className="text-xs text-[var(--ga-muted)]"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => patchForm({ customQuestions: [...form.customQuestions, ''] })}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--ga-border)] py-3 text-sm font-medium text-[var(--ga-blue)] hover:bg-[var(--ga-hover)]"
          >
            + Question
          </button>
          <label className="mt-4 block text-xs text-[var(--ga-muted)]">Privacy policy URL</label>
          <input
            value={form.privacyPolicyUrl}
            onChange={(event) => patchForm({ privacyPolicyUrl: event.target.value })}
            placeholder="Privacy policy URL"
            className="mt-1 w-full rounded-lg border border-[var(--ga-border)] px-3 py-2 text-sm outline-none focus:border-[var(--ga-blue)]"
          />
        </div>

        <div className="rounded-xl border border-[var(--ga-border)] p-3">
          <h3 className="mb-2 text-sm font-medium text-[var(--ga-ink)]">
            Create form submission message
          </h3>
          <label className="block text-xs text-[var(--ga-muted)]">Headline</label>
          <input
            value={form.thankYouHeadline}
            onChange={(event) => patchForm({ thankYouHeadline: event.target.value })}
            maxLength={30}
            className="mt-1 w-full rounded-lg border border-[var(--ga-border)] px-3 py-2 text-sm outline-none focus:border-[var(--ga-blue)]"
          />
          <CharCount value={form.thankYouHeadline} max={30} />
          <label className="mt-3 block text-xs text-[var(--ga-muted)]">Description</label>
          <textarea
            value={form.thankYouDescription}
            onChange={(event) => patchForm({ thankYouDescription: event.target.value })}
            maxLength={200}
            rows={2}
            className="mt-1 w-full rounded-lg border border-[var(--ga-border)] px-3 py-2 text-sm outline-none focus:border-[var(--ga-blue)]"
          />
          <CharCount value={form.thankYouDescription} max={200} />
          <label className="mt-3 block text-xs text-[var(--ga-muted)]">Call-to-action</label>
          <select
            value={form.thankYouCta}
            onChange={(event) => patchForm({ thankYouCta: event.target.value })}
            className="mt-1 block w-full rounded-lg border border-[var(--ga-border)] px-3 py-2 text-sm"
          >
            <option>Visit site</option>
            <option>Download</option>
            <option>Get quote</option>
          </select>
          <label className="mt-3 block text-xs text-[var(--ga-muted)]">Call-to-action URL</label>
          <input
            value={form.thankYouCtaUrl}
            onChange={(event) => patchForm({ thankYouCtaUrl: event.target.value })}
            className="mt-1 w-full rounded-lg border border-[var(--ga-border)] px-3 py-2 text-sm outline-none focus:border-[var(--ga-blue)]"
          />
        </div>

        <div className="rounded-xl border border-[var(--ga-border)] p-3">
          <h3 className="mb-2 text-sm font-medium text-[var(--ga-ink)]">
            Select a call-to-action for your ad
          </h3>
          <label className="block text-xs text-[var(--ga-muted)]">Call-to-action</label>
          <select
            value={form.adCta}
            onChange={(event) => patchForm({ adCta: event.target.value })}
            className="mt-1 block w-full rounded-lg border border-[var(--ga-border)] px-3 py-2 text-sm"
          >
            <option>Learn more</option>
            <option>Get quote</option>
            <option>Sign up</option>
            <option>Contact us</option>
          </select>
          <label className="mt-3 block text-xs text-[var(--ga-muted)]">
            Call-to-action description
          </label>
          <input
            value={form.adCtaDescription}
            onChange={(event) => patchForm({ adCtaDescription: event.target.value })}
            maxLength={30}
            className="mt-1 w-full rounded-lg border border-[var(--ga-border)] px-3 py-2 text-sm outline-none focus:border-[var(--ga-blue)]"
          />
          <CharCount value={form.adCtaDescription} max={30} />
        </div>
      </div>
    </SectionCard>
  );
}

function AdsPanel({ value, set }) {
  const host = parseDisplayHost(value.finalUrl);

  const updateListItem = (key, index, text) => {
    const next = [...value[key]];
    next[index] = text;
    set({ [key]: next });
  };

  const addListItem = (key, max) => {
    if (value[key].length >= max) return;
    set({ [key]: [...value[key], ''] });
  };

  const removeListItem = (key, index, min) => {
    if (value[key].length <= min) return;
    set({ [key]: value[key].filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4">
      <SectionCard title="Final URL">
        <div className="relative max-w-xl">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ga-muted)]">
            🔗
          </span>
          <input
            value={value.finalUrl}
            onChange={(event) => set({ finalUrl: event.target.value })}
            placeholder="https://www.example.com"
            className="w-full rounded-lg border border-[var(--ga-border)] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[var(--ga-blue)]"
          />
        </div>
        <p className="mt-2 text-xs text-[var(--ga-muted)]">
          This URL is used for your ad and can help suggest headlines and descriptions later.
        </p>
      </SectionCard>

      <SectionCard title="Display path">
        <div className="text-sm text-[var(--ga-muted)]">{host}/</div>
        <div className="mt-2 flex max-w-xl items-start gap-2">
          <div className="flex-1">
            <input
              value={value.path1}
              onChange={(event) => set({ path1: event.target.value.slice(0, 15) })}
              maxLength={15}
              className="w-full rounded-lg border border-[var(--ga-border)] px-3 py-2.5 text-sm outline-none focus:border-[var(--ga-blue)]"
            />
            <CharCount value={value.path1} max={15} />
          </div>
          <span className="pt-2.5 text-[var(--ga-muted)]">/</span>
          <div className="flex-1">
            <input
              value={value.path2}
              onChange={(event) => set({ path2: event.target.value.slice(0, 15) })}
              maxLength={15}
              className="w-full rounded-lg border border-[var(--ga-border)] px-3 py-2.5 text-sm outline-none focus:border-[var(--ga-blue)]"
            />
            <CharCount value={value.path2} max={15} />
          </div>
        </div>
      </SectionCard>

      <CallsPanel value={value} set={set} />

      <SectionCard title="Headlines">
        <p className="mb-3 text-xs text-[var(--ga-muted)]">
          At least 3 headlines (max 15, 30 characters each)
        </p>
        <div className="space-y-2">
          {value.headlines.map((headline, index) => (
            <div key={`h-${index}`} className="max-w-xl">
              <div className="flex items-center gap-2">
                <input
                  value={headline}
                  onChange={(event) => updateListItem('headlines', index, event.target.value)}
                  maxLength={30}
                  placeholder={`Headline ${index + 1}`}
                  className="w-full rounded-lg border border-[var(--ga-border)] px-3 py-2.5 text-sm outline-none focus:border-[var(--ga-blue)]"
                />
                {value.headlines.length > 3 ? (
                  <button
                    type="button"
                    onClick={() => removeListItem('headlines', index, 3)}
                    className="text-sm text-[var(--ga-muted)]"
                  >
                    Remove
                  </button>
                ) : null}
              </div>
              <CharCount value={headline} max={30} />
            </div>
          ))}
        </div>
        {value.headlines.length < 15 ? (
          <button
            type="button"
            onClick={() => addListItem('headlines', 15)}
            className="mt-2 text-sm font-medium text-[var(--ga-blue)] hover:underline"
          >
            Add headline
          </button>
        ) : null}
      </SectionCard>

      <SectionCard title="Descriptions">
        <p className="mb-3 text-xs text-[var(--ga-muted)]">
          At least 2 descriptions (max 4, 90 characters each)
        </p>
        <div className="space-y-2">
          {value.descriptions.map((description, index) => (
            <div key={`d-${index}`} className="max-w-2xl">
              <div className="flex items-start gap-2">
                <textarea
                  value={description}
                  onChange={(event) => updateListItem('descriptions', index, event.target.value)}
                  maxLength={90}
                  rows={2}
                  placeholder={`Description ${index + 1}`}
                  className="w-full rounded-lg border border-[var(--ga-border)] px-3 py-2.5 text-sm outline-none focus:border-[var(--ga-blue)]"
                />
                {value.descriptions.length > 2 ? (
                  <button
                    type="button"
                    onClick={() => removeListItem('descriptions', index, 2)}
                    className="mt-2 text-sm text-[var(--ga-muted)]"
                  >
                    Remove
                  </button>
                ) : null}
              </div>
              <CharCount value={description} max={90} />
            </div>
          ))}
        </div>
        {value.descriptions.length < 4 ? (
          <button
            type="button"
            onClick={() => addListItem('descriptions', 4)}
            className="mt-2 text-sm font-medium text-[var(--ga-blue)] hover:underline"
          >
            Add description
          </button>
        ) : null}
      </SectionCard>
    </div>
  );
}

export default function SearchKeywordsAdsStep({ value, onChange }) {
  const [panel, setPanel] = useState('keywords');
  const set = (patch) => onChange({ ...value, ...patch });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[28px] font-normal tracking-tight text-[var(--ga-ink)]">
          Keywords and ads
        </h1>
        <p className="mt-1 text-sm text-[var(--ga-muted)]">
          Add details to match your ads to the right searches.
        </p>
      </div>

      <div className="flex gap-2 border-b border-[var(--ga-border)]">
        {[
          { id: 'keywords', label: 'Keywords' },
          { id: 'ads', label: 'Ads' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setPanel(tab.id)}
            className={`border-b-2 px-3 py-2 text-sm font-medium ${
              panel === tab.id
                ? 'border-[var(--ga-blue)] text-[var(--ga-blue)]'
                : 'border-transparent text-[var(--ga-muted)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mb-2 max-w-md">
        <label className="mb-1 block text-sm font-medium text-[var(--ga-ink)]">Ad group name</label>
        <input
          value={value.adGroupName}
          onChange={(event) => set({ adGroupName: event.target.value })}
          className="w-full rounded-lg border border-[var(--ga-border)] px-3 py-2.5 text-sm outline-none focus:border-[var(--ga-blue)]"
        />
      </div>

      {panel === 'keywords' ? <KeywordsPanel value={value} set={set} /> : null}

      {panel === 'ads' ? (
        <div className="space-y-8">
          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="min-w-0 space-y-4">
              <AdsPanel value={value} set={set} />
            </div>
            <div className="min-w-0">
              <AdLivePreview value={value} initialTab="ad" sticky compact />
            </div>
          </div>

          <div className="border-t border-[var(--ga-border)] pt-6">
            {value.leadFormEnabled ? (
              <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                <div className="min-w-0">
                  <LeadFormPanel value={value} set={set} />
                </div>
                <div className="min-w-0">
                  <AdLivePreview value={value} initialTab="lead" sticky compact />
                </div>
              </div>
            ) : (
              <div className="max-w-2xl">
                <LeadFormPanel value={value} set={set} />
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
