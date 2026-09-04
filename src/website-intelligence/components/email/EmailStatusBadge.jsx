import StatusBadge from '../common/StatusBadge';

const CONFIG = {
  idle: { label: 'Not started', tone: 'neutral' },
  draft: { label: 'Draft', tone: 'neutral' },
  generating: { label: 'Generating', tone: 'brand' },
  editing: { label: 'Editing', tone: 'brand' },
  ready: { label: 'Ready', tone: 'brand' },
  sending: { label: 'Sending', tone: 'warning' },
  sent: { label: 'Sent', tone: 'positive' },
  failed: { label: 'Failed', tone: 'danger' },
};

export default function EmailStatusBadge({ status }) {
  const { label, tone } = CONFIG[status] || { label: status, tone: 'neutral' };
  return <StatusBadge status={status} label={label} tone={tone} />;
}
