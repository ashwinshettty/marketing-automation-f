import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { formatAgentCallOutcome } from '../../utils/agentCallOutcomes';
import { getLeadNotesList } from '../../utils/mapStudentToLead';
import { normalizePhoneNumber } from '../../utils/normalizePhone';
import LeadEventsPanel from './LeadEventsPanel';
import LeadTimeline from './LeadTimeline';
import NotesPanel from './NotesPanel';
import SmsPanel from './SmsPanel';
import WhatsAppChatPanel from './WhatsAppChatPanel';

const INFO_FIELDS = [
  { key: 'contactNo', label: 'Contact No' },
  { key: 'email', label: 'Email' },
  { key: 'grade', label: 'Grade' },
  { key: 'board', label: 'Board' },
  { key: 'source', label: 'Source' },
  { key: 'subject', label: 'Subject' },
  { key: 'enquiredFor', label: 'Enquired for (tuition)' },
  { key: 'lastAgentOutcomeLabel', label: 'Last call outcome' },
  { key: 'parentName', label: 'Parent Name' },
  { key: 'city', label: 'City' },
  { key: 'status', label: 'Status' },
  { key: 'createdAt', label: 'Created On' },
];

const TABS = [
  { id: 'info', label: 'Student Info' },
  { id: 'notes', label: 'Notes' },
  { id: 'events', label: 'Event' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'sms', label: 'SMS' },
];

const isValidTab = (tab) => TABS.some((item) => item.id === tab);

const formatInfoValue = (value) => {
  const text = String(value ?? '').trim();
  return text && text !== '-' ? text : '-';
};

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-[#25D366]" aria-hidden="true">
    <path d="M20.5 3.5A11 11 0 0 0 2.1 17.2L1 23l5.9-1.1A11 11 0 0 0 20.5 3.5zM12 20.4a9.1 9.1 0 0 1-4.6-1.3l-.3-.2-3.5.7.7-3.4-.2-.3A9.1 9.1 0 1 1 12 20.4zm5-6.8c-.3-.1-1.6-.8-1.8-.9s-.4-.1-.6.1-.7.9-.9 1.1-.3.2-.6.1a7.4 7.4 0 0 1-2.2-1.4 8.2 8.2 0 0 1-1.5-1.9c-.2-.3 0-.4.1-.6l.4-.4.2-.4a.5.5 0 0 0 0-.5c-.1-.1-.6-1.4-.8-1.9s-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.8 11.8 0 0 0 4.6 4 15 15 0 0 0 1.5.5 3.6 3.6 0 0 0 1.7.1 2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .2-1.3c-.1-.2-.3-.2-.6-.4z" />
  </svg>
);

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
    <path
      d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.35 1.9.66 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.31 1.85.53 2.81.66A2 2 0 0 1 22 16.92z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const StudentInfoContent = ({ lead }) => {
  const displayLead = {
    ...lead,
    lastAgentOutcomeLabel: lead.lastAgentOutcome
      ? formatAgentCallOutcome(lead.lastAgentOutcome)
      : '-',
  };

  return (
    <dl className="grid gap-2.5 sm:grid-cols-2 sm:gap-4">
      {INFO_FIELDS.map(({ key, label }) => {
        const value = formatInfoValue(displayLead[key]);
        const callDigits = key === 'contactNo' ? normalizePhoneNumber(displayLead.contactNo) : '';

        return (
          <div
            key={key}
            className={`rounded-xl border border-slate-100 bg-brand-cream/50 px-3 py-2.5 sm:px-4 sm:py-3${
              key === 'subject' ? ' sm:col-span-2' : ''
            }`}
          >
            <dt className="text-xs font-medium uppercase tracking-wide text-brand-muted">
              {label}
            </dt>
            <dd className="mt-1 text-sm font-medium text-brand-navy whitespace-pre-wrap break-words">
              {callDigits ? (
                <span className="flex items-center justify-between gap-2">
                  <span className="min-w-0 break-words">{value}</span>
                  <span className="flex shrink-0 items-center gap-1.5 lg:hidden">
                    <a
                      href={`https://wa.me/${callDigits}`}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-brand-yellow/40 bg-white"
                      aria-label={`WhatsApp ${value}`}
                    >
                      <WhatsAppIcon />
                    </a>
                    <a
                      href={`tel:+${callDigits}`}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-brand-yellow/40 bg-white text-brand-navy"
                      aria-label={`Call ${value}`}
                    >
                      <PhoneIcon />
                    </a>
                  </span>
                </span>
              ) : (
                value
              )}
            </dd>
          </div>
        );
      })}
    </dl>
  );
};

const StudentTab = ({ lead, onLeadUpdate, eventsRefreshKey = 0 }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(
    isValidTab(tabFromUrl) ? tabFromUrl : 'info',
  );
  const notesList = getLeadNotesList(lead);

  useEffect(() => {
    if (isValidTab(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);

    if (tabId === 'info') {
      searchParams.delete('tab');
      setSearchParams(searchParams, { replace: true });
      return;
    }

    setSearchParams({ tab: tabId }, { replace: true });
  };

  if (!lead) {
    return null;
  }

  return (
    <div className="min-w-0">
      <div
        className="-mx-3 flex min-w-0 gap-0.5 overflow-x-auto overscroll-x-contain border-b border-brand-yellow/30 px-3 sm:mx-0 sm:gap-1 sm:px-0"
        role="tablist"
        aria-label="Student details tabs"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const noteCount = tab.id === 'notes' ? notesList.length : 0;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => handleTabChange(tab.id)}
              className={`relative shrink-0 px-2.5 py-2.5 text-sm font-medium transition sm:px-4 sm:py-3 ${
                isActive
                  ? 'border-b-2 border-brand-navy text-brand-navy'
                  : 'text-brand-muted hover:text-brand-navy'
              }`}
            >
              {tab.label}
              {noteCount > 0 && (
                <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-yellow px-1.5 text-[11px] font-semibold text-brand-navy">
                  {noteCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="pt-3 sm:pt-6" role="tabpanel">
        {activeTab === 'info' && <StudentInfoContent lead={lead} />}
        {activeTab === 'notes' && (
          <NotesPanel lead={lead} onLeadUpdate={onLeadUpdate} />
        )}
        {activeTab === 'events' && (
          <LeadEventsPanel lead={lead} refreshKey={eventsRefreshKey} />
        )}
        {activeTab === 'timeline' && (
          <LeadTimeline lead={lead} eventsRefreshKey={eventsRefreshKey} />
        )}
        {activeTab === 'whatsapp' && <WhatsAppChatPanel lead={lead} />}
        {activeTab === 'sms' && <SmsPanel lead={lead} />}
      </div>
    </div>
  );
};

export default StudentTab;
