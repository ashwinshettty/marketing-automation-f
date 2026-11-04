import { useEffect, useState } from 'react';
import { parseDisplayHost } from './searchWizardDefaults';

function PhoneFrame({ children, desktop = false }) {
  if (desktop) {
    return (
      <div className="mx-auto w-full max-w-[420px] overflow-hidden rounded-xl border border-[var(--ga-border)] bg-white shadow-sm">
        <div className="flex items-center gap-1.5 border-b border-[var(--ga-border)] bg-[var(--ga-surface)] px-3 py-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ea4335]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#fbbc04]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#34a853]" />
          <span className="ml-2 truncate rounded bg-white px-2 py-0.5 text-[10px] text-[var(--ga-muted)]">
            google.com
          </span>
        </div>
        <div className="p-4">{children}</div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-[280px] overflow-hidden rounded-[28px] border-[8px] border-[#202124] bg-white shadow-lg">
      <div className="mx-auto mt-2 h-1.5 w-16 rounded-full bg-[#202124]" />
      <div className="min-h-[360px] p-3">{children}</div>
    </div>
  );
}

function SearchAdPreview({ value }) {
  const host = parseDisplayHost(value.finalUrl);
  const path = [value.path1, value.path2].filter(Boolean).join('/');
  const displayUrl = path ? `${host}/${path}` : host;
  const headline =
    value.headlines.find((h) => h.trim()) || 'Your headline will appear here';
  const description =
    value.descriptions.find((d) => d.trim())
    || 'Your description will appear here once you add ad copy.';
  const phones = (value.phoneNumbers || []).filter(Boolean);

  return (
    <div className="space-y-2 text-left">
      <div className="flex items-center gap-1 text-[11px] text-[var(--ga-muted)]">
        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#34a853] text-[8px] text-white">
          ▶
        </span>
        <span className="truncate">{displayUrl || 'www.example.com'}</span>
      </div>
      <div className="text-[15px] font-medium leading-5 text-[#1a0dab]">{headline}</div>
      <p className="text-[12px] leading-4 text-[var(--ga-muted)]">{description}</p>
      {phones.length ? (
        <div className="mt-2 space-y-1.5 border-t border-[var(--ga-border)] pt-2">
          {phones.map((phone) => (
            <div
              key={phone}
              className="flex items-center gap-2 text-[12px] font-medium text-[var(--ga-ink)]"
            >
              <span aria-hidden="true">📞</span>
              Call {phone}
            </div>
          ))}
        </div>
      ) : null}
      {value.leadFormEnabled ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="rounded-full border border-[var(--ga-border)] px-2 py-0.5 text-[10px] text-[var(--ga-blue)]">
            {value.leadForm.adCta || 'Learn more'}
          </span>
        </div>
      ) : null}
    </div>
  );
}

function LeadFormPreview({ value, mode }) {
  const form = value.leadForm;
  const showFirstLast = form.nameFormat === 'FIRST_LAST' && form.contactFields.includes('name');
  const fields = [];

  if (showFirstLast) {
    fields.push('First name', 'Last name');
  } else if (form.contactFields.includes('name')) {
    fields.push('Full name');
  }
  form.contactFields.forEach((id) => {
    if (id === 'name') return;
    const labels = {
      email: 'Email',
      phone: 'Phone number',
      country: 'Country',
      city: 'City',
      zip: 'Zip/Postal code',
      state: 'State/Province',
      street: 'Street address',
    };
    if (labels[id]) fields.push(labels[id]);
  });
  form.workFields.forEach((id) => {
    const labels = {
      company: 'Company name',
      workEmail: 'Work email',
      workPhone: 'Work phone number',
      jobTitle: 'Job title',
    };
    if (labels[id]) fields.push(labels[id]);
  });
  if (form.additionalAge) fields.push('Are you over 18 years of age?');
  form.customQuestions.forEach((q) => {
    if (q.trim()) fields.push(q.trim());
  });

  if (mode === 'thanks') {
    return (
      <div className="space-y-3 text-left">
        <div className="h-16 rounded-lg bg-[var(--ga-blue)]" />
        <h3 className="text-base font-medium text-[var(--ga-ink)]">
          {form.thankYouHeadline || 'Thank you'}
        </h3>
        <p className="text-xs text-[var(--ga-muted)]">
          {form.thankYouDescription || "We'll contact you soon"}
        </p>
        <button
          type="button"
          className="w-full rounded-lg bg-[var(--ga-blue)] py-2 text-xs font-medium text-white"
        >
          {form.thankYouCta || 'Visit site'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3 text-left">
      <div className="h-16 rounded-lg bg-[var(--ga-blue)]" />
      <div>
        <h3 className="text-sm font-medium text-[var(--ga-ink)]">
          {form.businessName || 'Business name'}
        </h3>
        <p className="mt-1 text-[11px] text-[var(--ga-muted)]">
          {form.description || form.headline || 'Form description'}
        </p>
      </div>
      <div className="space-y-2">
        {(fields.length ? fields : ['First name', 'Last name', 'Email']).map((label) => (
          <div key={label}>
            <div className="mb-0.5 text-[10px] text-[var(--ga-muted)]">{label}</div>
            <div className="h-7 rounded border border-[var(--ga-border)] bg-white" />
          </div>
        ))}
      </div>
      <p className="text-[9px] leading-3 text-[var(--ga-muted)]">
        Google Disclosure — By submitting, you agree to share this info with the business per their
        privacy policy.
      </p>
      <button
        type="button"
        className="w-full rounded-lg bg-[var(--ga-blue)] py-2 text-xs font-medium text-white"
      >
        SUBMIT
      </button>
    </div>
  );
}

export default function AdLivePreview({
  value,
  initialTab = 'ad',
  sticky = false,
  compact = false,
}) {
  const [device, setDevice] = useState('mobile');
  const [tab, setTab] = useState(initialTab);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  const tabs = value.leadFormEnabled
    ? [
      { id: 'ad', label: 'Ad' },
      { id: 'lead', label: 'Lead Form' },
      { id: 'thanks', label: 'Submission' },
    ]
    : [{ id: 'ad', label: 'Ad' }];

  const activeTab = tabs.some((t) => t.id === tab) ? tab : tabs[0].id;

  return (
    <div
      className={`rounded-2xl border border-[var(--ga-border)] bg-white shadow-[0_1px_2px_rgba(60,64,67,0.08)] ${
        sticky ? 'lg:sticky lg:top-4' : ''
      }`}
    >
      <div className="flex items-center justify-between border-b border-[var(--ga-border)] px-4 py-3">
        <h3 className="text-sm font-medium text-[var(--ga-ink)]">Preview</h3>
        <div className="flex items-center gap-1 rounded-lg bg-[var(--ga-surface)] p-1">
          <button
            type="button"
            onClick={() => setDevice('mobile')}
            className={`rounded-md px-2 py-1 text-xs ${
              device === 'mobile' ? 'bg-white text-[var(--ga-blue)] shadow-sm' : 'text-[var(--ga-muted)]'
            }`}
            aria-label="Mobile preview"
          >
            📱
          </button>
          <button
            type="button"
            onClick={() => setDevice('desktop')}
            className={`rounded-md px-2 py-1 text-xs ${
              device === 'desktop' ? 'bg-white text-[var(--ga-blue)] shadow-sm' : 'text-[var(--ga-muted)]'
            }`}
            aria-label="Laptop preview"
          >
            💻
          </button>
        </div>
      </div>

      {tabs.length > 1 ? (
        <div className="flex gap-3 overflow-x-auto border-b border-[var(--ga-border)] px-4">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`shrink-0 border-b-2 py-2 text-xs font-medium ${
                activeTab === item.id
                  ? 'border-[var(--ga-blue)] text-[var(--ga-blue)]'
                  : 'border-transparent text-[var(--ga-muted)]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}

      <div className={`bg-[var(--ga-surface)] ${compact ? 'px-2 py-4' : 'px-3 py-5'}`}>
        <PhoneFrame desktop={device === 'desktop'}>
          {activeTab === 'ad' ? <SearchAdPreview value={value} /> : null}
          {activeTab === 'lead' ? <LeadFormPreview value={value} mode="form" /> : null}
          {activeTab === 'thanks' ? <LeadFormPreview value={value} mode="thanks" /> : null}
        </PhoneFrame>
        <p className="mt-3 text-center text-[10px] text-[var(--ga-muted)]">
          Previews are examples and may not show every format.
        </p>
      </div>
    </div>
  );
}
