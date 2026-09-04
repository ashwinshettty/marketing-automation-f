import { Bold, Italic, Link2, List } from 'lucide-react';
import { Button } from '@/components/ui/button';

function wrapSelection(textarea, before, after = before) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = textarea.value.slice(start, end);
  const next = `${textarea.value.slice(0, start)}${before}${selected}${after}${textarea.value.slice(end)}`;
  return { next, cursor: start + before.length + selected.length + after.length };
}

export default function EmailEditor({ value, onChange }) {
  const applyFormat = (type) => {
    const textarea = document.getElementById('outreach-email-body');
    if (!textarea) return;

    let result;
    if (type === 'bold') result = wrapSelection(textarea, '**', '**');
    else if (type === 'italic') result = wrapSelection(textarea, '_', '_');
    else if (type === 'link') result = wrapSelection(textarea, '[', '](https://)');
    else if (type === 'list') {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selected = textarea.value.slice(start, end) || 'List item';
      const block = selected
        .split('\n')
        .map((line) => (line.startsWith('- ') ? line : `- ${line}`))
        .join('\n');
      result = {
        next: `${textarea.value.slice(0, start)}${block}${textarea.value.slice(end)}`,
        cursor: start + block.length,
      };
    }

    if (!result) return;
    onChange(result.next);
    window.requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(result.cursor, result.cursor);
    });
  };

  const TOOLS = [
    { id: 'bold', label: 'Bold', Icon: Bold },
    { id: 'italic', label: 'Italic', Icon: Italic },
    { id: 'link', label: 'Insert link', Icon: Link2 },
    { id: 'list', label: 'Bullet list', Icon: List },
  ];

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/25">
      <div role="toolbar" aria-label="Formatting" className="flex gap-0.5 border-b border-border bg-muted/40 p-1.5">
        {TOOLS.map(({ id, label, Icon }) => (
          <Button
            key={id}
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => applyFormat(id)}
            aria-label={label}
            title={label}
          >
            <Icon />
          </Button>
        ))}
      </div>

      <label htmlFor="outreach-email-body" className="sr-only">
        Email body
      </label>
      <textarea
        id="outreach-email-body"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={16}
        className="w-full resize-y border-0 bg-transparent px-4 py-3 text-sm leading-relaxed outline-none"
        placeholder="Write your outreach email…"
      />
    </div>
  );
}
