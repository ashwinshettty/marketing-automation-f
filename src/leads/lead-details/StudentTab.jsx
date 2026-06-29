import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getLeadNotesList } from '../../utils/mapStudentToLead';
import LeadTimeline from './LeadTimeline';
import NotesPanel from './NotesPanel';
import WhatsAppChatPanel from './WhatsAppChatPanel';

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

const TABS = [
  { id: 'info', label: 'Student Info' },
  { id: 'notes', label: 'Notes' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'whatsapp', label: 'WhatsApp' },
];

const isValidTab = (tab) => TABS.some((item) => item.id === tab);

const StudentInfoContent = ({ lead }) => (
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
);

const StudentTab = ({ lead, onLeadUpdate }) => {
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
    <div>
      <div
        className="flex gap-1 overflow-x-auto border-b border-brand-yellow/30"
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
              className={`relative shrink-0 px-4 py-3 text-sm font-medium transition ${
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

      <div className="pt-6" role="tabpanel">
        {activeTab === 'info' && <StudentInfoContent lead={lead} />}
        {activeTab === 'notes' && (
          <NotesPanel lead={lead} onLeadUpdate={onLeadUpdate} />
        )}
        {activeTab === 'timeline' && <LeadTimeline lead={lead} />}
        {activeTab === 'whatsapp' && <WhatsAppChatPanel lead={lead} />}
      </div>
    </div>
  );
};

export default StudentTab;
