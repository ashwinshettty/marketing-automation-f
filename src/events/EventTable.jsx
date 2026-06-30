import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCounsellors } from '../api/lookupApi';
import { deleteEvent } from '../api/eventApi';
import ConfirmModal from '../components/ConfirmModal';
import EditEventModal from './EditEventModal';

const ActionButton = ({ label, onClick, children, className = '', disabled = false }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    disabled={disabled}
    className={`rounded-lg p-2 transition ${className}`}
  >
    {children}
  </button>
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
  { key: 'title', label: 'Title', className: 'w-[12%]' },
  { key: 'type', label: 'Type', className: 'w-[8%]' },
  { key: 'date', label: 'Date', className: 'w-[9%]' },
  { key: 'time', label: 'Time', className: 'w-[7%]' },
  { key: 'studentName', label: 'Student', className: 'w-[10%]' },
  { key: 'salesuserName', label: 'Sales User', className: 'w-[11%]' },
  { key: 'status', label: 'Status', className: 'w-[8%]' },
  { key: 'priority', label: 'Priority', className: 'w-[8%]' },
];

const formatDate = (value) => {
  if (!value) return '-';

  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const formatLabel = (value) => {
  if (!value) return '-';

  const text = String(value);
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const getStudentId = (event) => {
  const id = event.studentId?._id || event.studentId;
  return id ? String(id) : '';
};

const getSalesuserId = (event) => {
  const id = event.salesuser?._id || event.salesuser;
  return id ? String(id) : '';
};

const EventTable = ({
  events,
  loading,
  error,
  pagination,
  onPageChange,
  onReload,
  hideStudentColumn = false,
}) => {
  const navigate = useNavigate();
  const columns = hideStudentColumn
    ? COLUMNS.filter((col) => col.key !== 'studentName')
    : COLUMNS;
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [deletingId, setDeletingId] = useState('');
  const [actionError, setActionError] = useState('');
  const [salesuserMap, setSalesuserMap] = useState({});

  useEffect(() => {
    let isMounted = true;

    const loadSalesusers = async () => {
      try {
        const counsellors = await fetchCounsellors();

        if (!isMounted) return;

        const map = counsellors.reduce((accumulator, counsellor) => {
          if (counsellor?.id) {
            accumulator[String(counsellor.id)] = counsellor.name;
          }

          return accumulator;
        }, {});

        setSalesuserMap(map);
      } catch {
        if (isMounted) {
          setSalesuserMap({});
        }
      }
    };

    loadSalesusers();

    return () => {
      isMounted = false;
    };
  }, []);

  const getCellValue = (event, key) => {
    switch (key) {
      case 'date':
        return formatDate(event.date);
      case 'type':
      case 'status':
      case 'priority':
        return formatLabel(event[key]);
      case 'salesuserName': {
        const salesuserId = getSalesuserId(event);
        return salesuserMap[salesuserId] || '-';
      }
      default:
        return event[key] || '-';
    }
  };

  const showTable = !loading && !error && events.length > 0;
  const showPagination = !loading && !error && pagination.totalPages > 0;

  const handleStudentClick = (event) => {
    const studentId = getStudentId(event);

    if (studentId) {
      navigate(`/leads/${studentId}`);
    }
  };

  const handleDeleteClick = (event) => {
    setActionError('');
    setEventToDelete(event);
  };

  const handleDeleteConfirm = async () => {
    if (!eventToDelete) return;

    try {
      setDeletingId(eventToDelete._id);
      setActionError('');
      await deleteEvent(eventToDelete._id);
      setEventToDelete(null);
      onReload();
    } catch (err) {
      setActionError(err.message || 'Failed to delete event');
    } finally {
      setDeletingId('');
    }
  };

  return (
    <>
      <div className="flex h-full min-h-[420px] max-h-[calc(100vh-17rem)] flex-col overflow-hidden rounded-2xl border border-brand-yellow/40 bg-white shadow-sm">
        {actionError && (
          <div className="shrink-0 border-b border-red-100 bg-red-50 px-5 py-3 text-sm text-red-600">
            {actionError}
          </div>
        )}

        {loading && (
          <div className="px-5 py-10 text-center text-sm text-brand-muted">
            Loading events...
          </div>
        )}

        {!loading && error && (
          <div className="px-5 py-10 text-center text-sm text-red-600">{error}</div>
        )}

        {!loading && !error && events.length === 0 && (
          <div className="px-5 py-10 text-center text-sm text-brand-muted">
            No events found.
          </div>
        )}

        {showTable && (
          <div className="min-h-0 flex-1 overflow-auto">
            <table className="w-full table-fixed text-left text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="border-b border-brand-yellow/30 bg-brand-cream shadow-sm">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={`px-3 py-3.5 text-xs font-semibold uppercase tracking-wide text-brand-navy ${col.className}`}
                    >
                      {col.label}
                    </th>
                  ))}
                  <th className="w-[9%] px-3 py-3.5 text-xs font-semibold uppercase tracking-wide text-brand-navy">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {events.map((event, index) => (
                  <tr
                    key={event._id || index}
                    className={`border-b border-slate-100 transition hover:bg-brand-cream/40 ${
                      index === events.length - 1 ? 'border-b-0' : ''
                    }`}
                  >
                    {columns.map((col) => (
                      <td key={col.key} className="px-3 py-4 text-brand-navy">
                        <div className="truncate" title={String(getCellValue(event, col.key))}>
                          {col.key === 'studentName' && getStudentId(event) ? (
                            <button
                              type="button"
                              onClick={() => handleStudentClick(event)}
                              className="truncate font-medium text-brand-navy underline-offset-2 hover:underline"
                            >
                              {getCellValue(event, col.key)}
                            </button>
                          ) : (
                            getCellValue(event, col.key)
                          )}
                        </div>
                      </td>
                    ))}
                    <td className="px-3 py-4">
                      <div className="flex items-center gap-1">
                        <ActionButton
                          label={`Edit ${event.title}`}
                          onClick={() => setEditingEvent(event)}
                          className="text-brand-navy hover:bg-brand-yellow/30"
                        >
                          <EditIcon />
                        </ActionButton>
                        <ActionButton
                          label={`Delete ${event.title}`}
                          onClick={() => handleDeleteClick(event)}
                          disabled={deletingId === event._id}
                          className="text-red-600 hover:bg-red-50 disabled:opacity-50"
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

        {showPagination && (
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-brand-yellow/30 bg-brand-cream px-5 py-3">
            <p className="text-sm text-brand-muted">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} events)
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={!pagination.hasPrevPage}
                className="rounded-lg border border-brand-yellow/40 px-3 py-1.5 text-sm font-medium text-brand-navy transition hover:bg-brand-yellow/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={!pagination.hasNextPage}
                className="rounded-lg border border-brand-yellow/40 px-3 py-1.5 text-sm font-medium text-brand-navy transition hover:bg-brand-yellow/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {editingEvent && (
        <EditEventModal
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
          onSaved={() => {
            setEditingEvent(null);
            onReload();
          }}
        />
      )}

      {eventToDelete && (
        <ConfirmModal
          title="Delete Event"
          message={`Are you sure you want to delete "${eventToDelete.title}"? This Event cannot be undone.`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          isLoading={deletingId === eventToDelete._id}
          onConfirm={handleDeleteConfirm}
          onCancel={() => {
            if (!deletingId) {
              setEventToDelete(null);
            }
          }}
        />
      )}
    </>
  );
};

export default EventTable;
