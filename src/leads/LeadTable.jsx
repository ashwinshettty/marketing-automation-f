import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSmsLeadStatuses } from '../api/smsApi';
import SmsSendModal from '../components/sms/SmsSendModal';
import { useLead } from '../context/LeadContext';
import LeadEditModal from './lead-details/LeadEditModal';

const ActionButton = ({ label, onClick, children, className = '' }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    className={`rounded-lg p-2 transition ${className}`}
  >
    {children}
  </button>
);

const ViewIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const DeleteIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
    <polyline points="3 6 5 6 21 6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const COLUMNS = [
  { key: 'srNo', label: 'Sr No' },
  { key: 'name', label: 'Name' },
  { key: 'tag', label: 'Type' },
  { key: 'contactNo', label: 'Contact No' },
  { key: 'grade', label: 'Grade' },
  { key: 'board', label: 'Board' },
  { key: 'source', label: 'Source' },
  { key: 'lastActivityAt', label: 'Last Activity' },
  { key: 'createdAt', label: 'Created On' },
];

const LeadTypeBadge = ({ lead }) => {
  const isEnquiry = lead.type === 'enquiry';
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        isEnquiry
          ? 'bg-sky-100 text-sky-800'
          : 'bg-amber-100 text-amber-900'
      }`}
    >
      {lead.tag || (isEnquiry ? 'Enquiry' : 'Admission Due')}
    </span>
  );
};

const LeadTable = () => {
  const navigate = useNavigate();
  const { leads, loading, error, pagination, goToPage, selectLead, updateLeadInList, appliedFilters } =
    useLead();
  const [editingLead, setEditingLead] = useState(null);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [smsModal, setSmsModal] = useState(null);
  const [bulkCount, setBulkCount] = useState('50');
  const [smsStatuses, setSmsStatuses] = useState({});
  const [statusTick, setStatusTick] = useState(0);

  const selectedLeads = useMemo(
    () => leads.filter((lead) => selectedIds.has(lead.id)),
    [leads, selectedIds],
  );

  useEffect(() => {
    if (!leads.length) {
      setSmsStatuses({});
      return undefined;
    }
    let cancelled = false;
    const load = async () => {
      try {
        const data = await getSmsLeadStatuses(leads.map((l) => l.id));
        if (!cancelled) setSmsStatuses(data?.data || {});
      } catch {
        if (!cancelled) setSmsStatuses({});
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [leads, statusTick]);

  const allPageSelected =
    leads.length > 0 && leads.every((lead) => selectedIds.has(lead.id));

  const toggleAllPage = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allPageSelected) {
        leads.forEach((lead) => next.delete(lead.id));
      } else {
        leads.forEach((lead) => next.add(lead.id));
      }
      return next;
    });
  };

  const toggleOne = (leadId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(leadId)) next.delete(leadId);
      else next.add(leadId);
      return next;
    });
  };

  const handleView = (lead) => {
    selectLead(lead);
    const typeQuery = lead.type ? `?type=${encodeURIComponent(lead.type)}` : '';
    navigate(`/leads/${lead.id}${typeQuery}`);
  };

  const handleEdit = (lead) => setEditingLead(lead);
  const handleDelete = (lead) => console.log('Delete lead:', lead.id);

  const openBulkLimit = () => {
    const n = Math.min(500, Math.max(1, Number(bulkCount) || 0));
    if (!n) return;
    setSmsModal({ mode: 'bulk-limit', limit: n });
  };

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-sm text-brand-navy">
          <span className="font-medium">SMS first</span>
          <input
            type="number"
            min={1}
            max={500}
            value={bulkCount}
            onChange={(e) => setBulkCount(e.target.value)}
            className="w-20 rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
          />
        </label>
        <button
          type="button"
          onClick={openBulkLimit}
          className="rounded-xl bg-brand-navy px-3.5 py-2 text-sm font-semibold text-white"
        >
          Send SMS
        </button>
        <button
          type="button"
          disabled={selectedLeads.length === 0}
          onClick={() => setSmsModal({ mode: 'bulk-selected' })}
          className="rounded-xl border border-brand-navy/20 bg-white px-3.5 py-2 text-sm font-semibold text-brand-navy disabled:opacity-40"
        >
          SMS selected ({selectedLeads.length})
        </button>
        {selectedIds.size > 0 && (
          <button
            type="button"
            onClick={() => setSelectedIds(new Set())}
            className="text-sm text-brand-muted underline"
          >
            Clear selection
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-brand-yellow/40 bg-white shadow-sm">
        {loading && (
          <div className="px-5 py-10 text-center text-sm text-brand-muted">
            Loading leads...
          </div>
        )}

        {!loading && error && (
          <div className="px-5 py-10 text-center text-sm text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && leads.length === 0 && (
          <div className="px-5 py-10 text-center text-sm text-brand-muted">
            No leads found.
          </div>
        )}

        {!loading && !error && leads.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead>
                <tr className="border-b border-brand-yellow/30 bg-brand-cream">
                  <th className="px-4 py-3.5">
                    <input
                      type="checkbox"
                      checked={allPageSelected}
                      onChange={toggleAllPage}
                      aria-label="Select all on page"
                    />
                  </th>
                  {COLUMNS.map((col) => (
                    <th
                      key={col.key}
                      className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-brand-navy"
                    >
                      {col.label}
                    </th>
                  ))}
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-brand-navy">
                    Last SMS
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-brand-navy">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead, index) => (
                  <tr
                    key={lead.id}
                    className={`border-b border-slate-100 transition hover:bg-brand-yellow-soft/40 ${
                      index === leads.length - 1 ? 'border-b-0' : ''
                    }`}
                  >
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(lead.id)}
                        onChange={() => toggleOne(lead.id)}
                        aria-label={`Select ${lead.name}`}
                      />
                    </td>
                    <td className="px-5 py-4 text-brand-muted">
                      {(pagination.page - 1) * (pagination.limit || 10) + index + 1}
                    </td>
                    <td className="px-5 py-4 font-medium text-brand-navy">{lead.name}</td>
                    <td className="px-5 py-4">
                      <LeadTypeBadge lead={lead} />
                    </td>
                    <td className="px-5 py-4 text-brand-muted">{lead.contactNo}</td>
                    <td className="px-5 py-4 text-brand-muted">{lead.grade}</td>
                    <td className="px-5 py-4 text-brand-muted">{lead.board}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-full bg-brand-yellow/25 px-2.5 py-0.5 text-xs font-medium text-brand-navy">
                        {lead.source}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-brand-muted">
                      {lead.lastActivityAt || lead.createdAt}
                    </td>
                    <td className="px-5 py-4 text-brand-muted">{lead.createdAt}</td>
                    <td className="px-5 py-4">
                      {smsStatuses[lead.id] ? (
                        <div className="max-w-[180px]">
                          <p className="truncate text-xs font-semibold text-brand-navy">
                            {smsStatuses[lead.id].templateName}
                          </p>
                          <p
                            className={`mt-0.5 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              smsStatuses[lead.id].status === 'delivered'
                                ? 'bg-emerald-100 text-emerald-800'
                                : smsStatuses[lead.id].status === 'dnd_blocked'
                                  ? 'bg-orange-100 text-orange-900'
                                  : smsStatuses[lead.id].status === 'failed'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-amber-100 text-amber-900'
                            }`}
                          >
                            {smsStatuses[lead.id].status === 'delivered'
                              ? 'Delivered'
                              : smsStatuses[lead.id].status === 'dnd_blocked'
                                ? 'DND blocked'
                                : smsStatuses[lead.id].status === 'failed'
                                  ? 'Failed'
                                  : 'Pending'}
                          </p>
                          <p className="mt-0.5 text-[11px] text-brand-muted">
                            {smsStatuses[lead.id].sentAt
                              ? new Date(smsStatuses[lead.id].sentAt).toLocaleString()
                              : ''}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-brand-muted">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <ActionButton
                          label={`View ${lead.name}`}
                          onClick={() => handleView(lead)}
                          className="text-brand-navy hover:bg-brand-yellow/30"
                        >
                          <ViewIcon />
                        </ActionButton>
                        <ActionButton
                          label={`Edit ${lead.name}`}
                          onClick={() => handleEdit(lead)}
                          className="text-brand-navy hover:bg-brand-yellow/30"
                        >
                          <EditIcon />
                        </ActionButton>
                        <ActionButton
                          label={`Delete ${lead.name}`}
                          onClick={() => handleDelete(lead)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <DeleteIcon />
                        </ActionButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-brand-yellow/30 bg-brand-cream px-5 py-3">
            <p className="text-sm text-brand-muted">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} leads)
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => goToPage(pagination.page - 1)}
                disabled={!pagination.hasPrevPage}
                className="rounded-lg border border-brand-yellow/40 px-3 py-1.5 text-sm font-medium text-brand-navy transition hover:bg-brand-yellow/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => goToPage(pagination.page + 1)}
                disabled={!pagination.hasNextPage}
                className="rounded-lg border border-brand-yellow/40 px-3 py-1.5 text-sm font-medium text-brand-navy transition hover:bg-brand-yellow/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {editingLead && (
        <LeadEditModal
          lead={editingLead}
          onClose={() => setEditingLead(null)}
          onSaved={updateLeadInList}
        />
      )}

      {smsModal && (
        <SmsSendModal
          isOpen
          onClose={() => setSmsModal(null)}
          mode={smsModal.mode}
          initialLimit={smsModal.limit || 50}
          selectedLeads={selectedLeads}
          filters={appliedFilters}
          onComplete={() => setStatusTick((n) => n + 1)}
        />
      )}
    </>
  );
};

export default LeadTable;
