import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  { key: 'name', label: 'Student Name' },
  { key: 'contactNo', label: 'Contact No' },
  { key: 'grade', label: 'Grade' },
  { key: 'board', label: 'Board' },
  { key: 'source', label: 'Source' },
];

const LeadTable = () => {
  const navigate = useNavigate();
  const { leads, loading, error, pagination, goToPage, selectLead, updateLeadInList } =
    useLead();
  const [editingLead, setEditingLead] = useState(null);

  const handleView = (lead) => {
    selectLead(lead);
    navigate(`/leads/${lead.id}`);
  };

  const handleEdit = (lead) => setEditingLead(lead);
  const handleDelete = (lead) => console.log('Delete lead:', lead.id);

  return (
    <>
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
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-brand-yellow/30 bg-brand-cream">
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-brand-navy"
                >
                  {col.label}
                </th>
              ))}
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
                <td className="px-5 py-4 font-medium text-brand-navy">{lead.name}</td>
                <td className="px-5 py-4 text-brand-muted">{lead.contactNo}</td>
                <td className="px-5 py-4 text-brand-muted">{lead.grade}</td>
                <td className="px-5 py-4 text-brand-muted">{lead.board}</td>
                <td className="px-5 py-4">
                  <span className="inline-flex rounded-full bg-brand-yellow/25 px-2.5 py-0.5 text-xs font-medium text-brand-navy">
                    {lead.source}
                  </span>
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
    </>
  );
};

export default LeadTable;
