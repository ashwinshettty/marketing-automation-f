import { Label } from '@/components/ui/label';
import SearchableDropdown from '@/components/smoothui/searchable-dropdown';

const TONE_ITEMS = [
  { id: 'professional', label: 'Professional', description: 'Clear and businesslike' },
  { id: 'consultative', label: 'Consultative', description: 'Advisory and collaborative' },
  { id: 'technical', label: 'Technical', description: 'Detail-oriented and precise' },
  { id: 'executive', label: 'Executive', description: 'Concise and decision-focused' },
];

const CTA_ITEMS = [
  { id: 'share_examples', label: 'Share examples', description: 'Offer relevant examples next' },
  { id: 'book_a_call', label: 'Book a call', description: 'Invite a short introduction' },
  { id: 'reply_if_interested', label: 'Reply if interested', description: 'Ask them to reply by email' },
];

export default function EmailGenerationSettings({ settings, onChange }) {
  const update = (key, value) => onChange({ ...settings, [key]: value });

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="min-w-0">
        <Label className="label-text mb-1.5 block">Tone</Label>
        <SearchableDropdown
          className="w-full"
          label="Select tone"
          placeholder="Search tones…"
          emptyMessage="No tone matches"
          items={TONE_ITEMS}
          value={settings.tone}
          onChange={(item) => update('tone', item.id)}
        />
      </div>

      <div className="min-w-0">
        <Label className="label-text mb-1.5 block">Call to action</Label>
        <SearchableDropdown
          className="w-full"
          label="Select call to action"
          placeholder="Search actions…"
          emptyMessage="No action matches"
          items={CTA_ITEMS}
          value={settings.callToAction}
          onChange={(item) => update('callToAction', item.id)}
        />
      </div>

      <fieldset className="sm:col-span-2">
        <legend className="label-text mb-2">Length</legend>
        <div className="flex flex-wrap gap-4">
          {['short', 'standard', 'detailed'].map((length) => (
            <label key={length} className="flex cursor-pointer items-center gap-2 text-sm capitalize">
              <input
                type="radio"
                name="email-length"
                checked={settings.length === length}
                onChange={() => update('length', length)}
                className="size-4 accent-brand"
              />
              {length}
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
