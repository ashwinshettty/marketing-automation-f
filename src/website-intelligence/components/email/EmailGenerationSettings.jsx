import { Label } from '@/components/ui/label';
import SearchableDropdown from '@/components/smoothui/searchable-dropdown';

const TONE_ITEMS = [
  { id: 'professional', label: 'Professional', description: 'Clear and businesslike' },
  { id: 'consultative', label: 'Consultative', description: 'Advisory and collaborative' },
  { id: 'technical', label: 'Technical', description: 'Detail-oriented and precise' },
  { id: 'executive', label: 'Executive', description: 'Concise and decision-focused' },
];

const CTA_ITEMS = [
  {
    id: 'open_conversation',
    label: 'Open a conversation',
    description: 'Invite general interest, no hard ask',
  },
];

const LENGTH_ITEMS = [
  { id: 'standard', label: 'Standard', hint: '180–220 words' },
  { id: 'detailed', label: 'Detailed', hint: '420–520 words' },
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
          {LENGTH_ITEMS.map((item) => (
            <label key={item.id} className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="radio"
                name="email-length"
                checked={settings.length === item.id}
                onChange={() => update('length', item.id)}
                className="size-4 accent-brand"
              />
              <span>
                {item.label}
                <span className="ml-1 text-xs text-muted-foreground">({item.hint})</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
