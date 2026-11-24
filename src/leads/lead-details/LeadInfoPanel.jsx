import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  agentCallOutcomeBadgeClass,
  formatAgentCallOutcome,
} from '../../utils/agentCallOutcomes';
import LeadEditModal from './LeadEditModal';
import StudentTab from './StudentTab';
import CreateActionItemModal from './CreateActionItemModal';

const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const LeadInfoPanel = ({ lead, onLeadUpdate }) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventsRefreshKey, setEventsRefreshKey] = useState(0);

  if (!lead) {
    return null;
  }

  return (
    <div className="relative min-w-0 max-w-full rounded-2xl border border-brand-yellow/40 bg-white p-3 shadow-sm sm:p-6">
      <Link
        to="/leads"
        className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand-navy hover:underline sm:mb-4"
      >
        ← Back to leads
      </Link>

      <div className="mb-4 flex items-start gap-3 sm:mb-6 sm:gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-navy text-lg font-semibold text-brand-yellow sm:h-16 sm:w-16 sm:text-xl">
          {lead.name.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h2 className="min-w-0 break-words text-lg font-semibold leading-tight text-brand-navy sm:text-xl">
              {lead.name}
            </h2>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEventModalOpen(true)}
                className="rounded-xl bg-brand-yellow px-3 py-2 text-sm font-semibold text-brand-navy transition hover:bg-brand-yellow-hover sm:px-4 sm:py-2.5"
              >
                Add Event
              </button>
              <button
                type="button"
                onClick={() => setIsEditOpen(true)}
                aria-label={`Edit ${lead.name}`}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-brand-yellow/40 bg-brand-cream text-brand-navy transition hover:bg-brand-yellow/30 sm:h-10 sm:w-10"
              >
                <EditIcon />
              </button>
            </div>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                lead.type === 'enquiry'
                  ? 'bg-sky-100 text-sky-800'
                  : 'bg-amber-100 text-amber-900'
              }`}
            >
              {lead.tag || (lead.type === 'enquiry' ? 'Enquiry' : 'Admission Due')}
            </span>
            {lead.lastAgentOutcome ? (
              <span
                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${agentCallOutcomeBadgeClass(
                  lead.lastAgentOutcome,
                )}`}
                title={lead.lastAgentCallSummary || 'Latest agent call outcome'}
              >
                Call: {formatAgentCallOutcome(lead.lastAgentOutcome)}
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-brand-muted">
            {lead.grade} · {lead.board}
          </p>
        </div>
      </div>

      <StudentTab
        lead={lead}
        onLeadUpdate={onLeadUpdate}
        eventsRefreshKey={eventsRefreshKey}
      />

      {/* <Link
        to="/leads"
        className="mt-6 inline-flex text-sm font-medium text-brand-navy hover:underline"
      >
        ← Back to leads
      </Link> */}

      {isEditOpen && (
        <LeadEditModal
          lead={lead}
          onClose={() => setIsEditOpen(false)}
          onSaved={(updatedLead) => {
            onLeadUpdate?.(updatedLead);
            setIsEditOpen(false);
          }}
        />
      )}
      {isEventModalOpen && (
        <CreateActionItemModal
          lead={lead}
          onClose={() => setIsEventModalOpen(false)}
          onSaved={() => {
            setEventsRefreshKey((current) => current + 1);
            setIsEventModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default LeadInfoPanel;
