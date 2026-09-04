import {
  FileText,
  FormInput,
  Phone,
  Mail,
  MessageCircle,
  HelpCircle,
} from 'lucide-react';

const EVIDENCE_META = {
  page_title: {
    label: 'Page title',
    hint: 'The name shown in the browser tab for this page',
    icon: FileText,
    order: 1,
  },
  form: {
    label: 'Form',
    hint: 'An interactive form visitors can fill out',
    icon: FormInput,
    order: 2,
  },
  phone: {
    label: 'Phone number',
    hint: 'A phone number visible on the page',
    icon: Phone,
    order: 3,
  },
  email: {
    label: 'Email address',
    hint: 'An email address found on the page',
    icon: Mail,
    order: 4,
  },
  whatsapp: {
    label: 'WhatsApp link',
    hint: 'A link to start a WhatsApp conversation',
    icon: MessageCircle,
    order: 5,
  },
};

const FORM_FIELD_LABELS = {
  q: 'Search box',
  authenticity_token: 'Security field',
  locale: 'Language',
  email: 'Email',
  name: 'Name',
  phone: 'Phone',
  message: 'Message',
  submit: 'Submit button',
};

export function getEvidenceMeta(evidence) {
  const key = evidence.normalizedValue || evidence.type || 'other';
  return (
    EVIDENCE_META[key] || {
      label: formatLabel(key),
      hint: 'Something the crawler noticed on this page',
      icon: HelpCircle,
      order: 99,
    }
  );
}

function formatLabel(value) {
  return String(value)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatEvidenceValue(evidence) {
  if (evidence.normalizedValue === 'form') {
    try {
      const parsed = JSON.parse(evidence.observedValue);
      const fields = (parsed.fields || [])
        .filter(Boolean)
        .map((field) => FORM_FIELD_LABELS[field] || formatLabel(field));

      if (fields.length === 0) return 'A form was found, but no field names were detected.';
      if (fields.length === 1) return `Contains: ${fields[0]}`;
      return `Contains: ${fields.join(', ')}`;
    } catch {
      return 'A form was found on this page.';
    }
  }

  return evidence.observedValue;
}

export function groupEvidenceByKind(evidence = []) {
  const groups = new Map();

  for (const item of evidence) {
    const key = item.normalizedValue || item.type || 'other';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  }

  return [...groups.entries()]
    .map(([key, items]) => ({ key, items, meta: getEvidenceMeta(items[0]) }))
    .sort((a, b) => a.meta.order - b.meta.order);
}

export function getEvidenceSummary(evidence = []) {
  const pageUrls = new Set(evidence.map((item) => item.pageUrl).filter(Boolean));
  return {
    total: evidence.length,
    pages: pageUrls.size,
  };
}

export function formatPageLabel(url) {
  if (!url) return 'Unknown page';
  try {
    const parsed = new URL(url);
    const path = parsed.pathname === '/' ? 'Homepage' : parsed.pathname.replace(/\/$/, '');
    return `${parsed.hostname}${path === 'Homepage' ? '' : path}`;
  } catch {
    return url;
  }
}
