import { Link } from 'react-router-dom';
import { useLead } from '../../context/LeadContext';

const INFO_FIELDS = [
  { key: 'contactNo', label: 'Contact No' },
  { key: 'email', label: 'Email' },
  { key: 'grade', label: 'Grade' },
  { key: 'board', label: 'Board' },
  { key: 'source', label: 'Source' },
  { key: 'parentName', label: 'Parent Name' },
  { key: 'city', label: 'City' },
  { key: 'status', label: 'Status' },
  { key: 'createdAt', label: 'Created On' },
];

const LeadInfoPanel = () => {
  const { selectedLead: lead } = useLead();

  if (!lead) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-brand-yellow/40 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-navy text-xl font-semibold text-brand-yellow">
            {lead.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-brand-navy">{lead.name}</h2>
            <p className="text-sm text-brand-muted">
              {lead.grade} · {lead.board}
            </p>
          </div>
        </div>
        <div>
          <Link
            to={`/leads/${lead.id}/whatsapp`}
            aria-label={`Open WhatsApp chat with ${lead.name}`}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#25D366] text-white transition hover:scale-105"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.553 4.116 1.519 5.852L0 24l6.335-1.662C8.008 23.447 9.964 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818c-1.93 0-3.753-.52-5.318-1.428l-.381-.227-3.755.985 1.002-3.648-.249-.374A9.817 9.817 0 0 1 2.182 12c0-5.422 4.396-9.818 9.818-9.818 5.422 0 9.818 4.396 9.818 9.818 0 5.422-4.396 9.818-9.818 9.818z" />
            </svg>
          </Link>
        </div>
      </div>

      <dl className="grid gap-4 sm:grid-cols-2">
        {INFO_FIELDS.map(({ key, label }) => (
          <div
            key={key}
            className="rounded-xl border border-slate-100 bg-brand-cream/50 px-4 py-3"
          >
            <dt className="text-xs font-medium uppercase tracking-wide text-brand-muted">
              {label}
            </dt>
            <dd className="mt-1 text-sm font-medium text-brand-navy">{lead[key]}</dd>
          </div>
        ))}
      </dl>

      {lead.notes && (
        <div className="mt-6 rounded-xl bg-brand-yellow-soft/50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">
            Notes
          </p>
          <p className="mt-1 text-sm text-brand-navy">{lead.notes}</p>
        </div>
      )}

      <Link
        to="/leads"
        className="mt-6 inline-flex text-sm font-medium text-brand-navy hover:underline"
      >
        ← Back to leads
      </Link>
    </div>
  );
};

export default LeadInfoPanel;
