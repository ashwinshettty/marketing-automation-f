/** Shared post-call outcome labels for sales + agent tracking. */

export const AGENT_CALL_OUTCOMES = [
  { value: 'no_answer', label: 'No answer' },
  { value: 'conversation_started', label: 'Conversation started' },
  { value: 'interested', label: 'Interested' },
  { value: 'not_interested', label: 'Not interested' },
  { value: 'demo_booked', label: 'Demo booked' },
  { value: 'converted', label: 'Converted' },
  { value: 'unclear', label: 'Unclear' },
];

export const AGENT_CALL_OUTCOME_LABELS = Object.fromEntries(
  AGENT_CALL_OUTCOMES.map((item) => [item.value, item.label]),
);

export const formatAgentCallOutcome = (value) =>
  AGENT_CALL_OUTCOME_LABELS[value] || (value ? String(value) : '');

export const agentCallOutcomeBadgeClass = (value) => {
  switch (value) {
    case 'demo_booked':
      return 'bg-emerald-100 text-emerald-800';
    case 'interested':
      return 'bg-sky-100 text-sky-800';
    case 'conversation_started':
      return 'bg-indigo-100 text-indigo-800';
    case 'not_interested':
      return 'bg-rose-100 text-rose-800';
    case 'converted':
      return 'bg-amber-100 text-amber-900';
    case 'no_answer':
      return 'bg-slate-100 text-slate-600';
    default:
      return 'bg-slate-100 text-slate-700';
  }
};
