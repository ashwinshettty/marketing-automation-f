import { useEffect, useMemo, useState } from 'react';
import { fetchBoards, fetchGrades } from '../../api/lookupApi';
import { updateStudent } from '../../api/studentApi';
import { mapStudentToLead } from '../../utils/mapStudentToLead';
import {
  buildStudentUpdatePayload,
  leadToEditForm,
} from '../../utils/buildStudentUpdatePayload';

const inputClassName =
  'w-full rounded-xl border border-brand-yellow/40 bg-white px-4 py-2.5 text-sm text-brand-navy outline-none transition focus:border-brand-navy';

const TEXT_FIELDS = [
  { key: 'name', label: 'Student Name', required: true },
  { key: 'contactNo', label: 'Contact No', required: true },
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'source', label: 'Source' },
  { key: 'parentName', label: 'Parent Name' },
  { key: 'city', label: 'City' },
];

const withCurrentValue = (options, currentValue) => {
  const normalized = options.filter(Boolean);
  if (currentValue && !normalized.includes(currentValue)) {
    return [currentValue, ...normalized];
  }
  return normalized;
};

const LeadEditModal = ({ lead, onClose, onSaved }) => {
  const [form, setForm] = useState(() => leadToEditForm(lead));
  const [boards, setBoards] = useState([]);
  const [grades, setGrades] = useState([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setForm(leadToEditForm(lead));
    setError('');
  }, [lead]);

  useEffect(() => {
    let isMounted = true;

    const loadOptions = async () => {
      try {
        setIsLoadingOptions(true);
        const [boardsData, gradesData] = await Promise.all([
          fetchBoards(),
          fetchGrades(),
        ]);

        if (!isMounted) return;

        setBoards(boardsData.map((board) => board.name).filter(Boolean));
        setGrades(gradesData);
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load grade and board options');
        }
      } finally {
        if (isMounted) {
          setIsLoadingOptions(false);
        }
      }
    };

    loadOptions();

    return () => {
      isMounted = false;
    };
  }, []);

  const gradeOptions = useMemo(
    () => withCurrentValue(grades, form.grade),
    [grades, form.grade],
  );

  const boardOptions = useMemo(
    () => withCurrentValue(boards, form.board),
    [boards, form.board],
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSaving(true);

    try {
      const payload = buildStudentUpdatePayload(lead, form);
      const data = await updateStudent(lead.id, payload, { type: lead.type });

      if (!data?.lead && !data?.student) {
        throw new Error(data?.message || 'Failed to update lead');
      }

      onSaved(mapStudentToLead(data.lead) || mapStudentToLead(data.student));
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update lead');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-navy/40 p-4">
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-brand-yellow/40 bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-lead-title"
      >
        <div className="border-b border-brand-yellow/30 bg-brand-cream px-6 py-4">
          <h2 id="edit-lead-title" className="text-xl font-semibold text-brand-navy">
            Edit Lead
          </h2>
          <p className="mt-1 text-sm text-brand-muted">
            Update student details for {lead.name}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {TEXT_FIELDS.map(({ key, label, type = 'text', required = false }) => (
              <div key={key} className={key === 'name' ? 'sm:col-span-2' : ''}>
                <label
                  htmlFor={`edit-lead-${key}`}
                  className="mb-1.5 block text-sm font-medium text-brand-navy"
                >
                  {label}
                </label>
                <input
                  id={`edit-lead-${key}`}
                  name={key}
                  type={type}
                  required={required}
                  value={form[key]}
                  onChange={handleChange}
                  className={inputClassName}
                />
              </div>
            ))}

            <div>
              <label
                htmlFor="edit-lead-grade"
                className="mb-1.5 block text-sm font-medium text-brand-navy"
              >
                Grade
              </label>
              <select
                id="edit-lead-grade"
                name="grade"
                required
                value={form.grade}
                onChange={handleChange}
                disabled={isLoadingOptions}
                className={inputClassName}
              >
                <option value="">
                  {isLoadingOptions ? 'Loading grades...' : 'Select grade'}
                </option>
                {gradeOptions.map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="edit-lead-board"
                className="mb-1.5 block text-sm font-medium text-brand-navy"
              >
                Board
              </label>
              <select
                id="edit-lead-board"
                name="board"
                required
                value={form.board}
                onChange={handleChange}
                disabled={isLoadingOptions}
                className={inputClassName}
              >
                <option value="">
                  {isLoadingOptions ? 'Loading boards...' : 'Select board'}
                </option>
                {boardOptions.map((board) => (
                  <option key={board} value={board}>
                    {board}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="edit-lead-notes"
              className="mb-1.5 block text-sm font-medium text-brand-navy"
            >
              Notes
            </label>
            <textarea
              id="edit-lead-notes"
              name="notes"
              rows={3}
              value={form.notes}
              onChange={handleChange}
              className={inputClassName}
            />
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-xl border border-brand-yellow/40 px-4 py-2.5 text-sm font-medium text-brand-navy transition hover:bg-brand-cream disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || isLoadingOptions}
              className="rounded-xl bg-brand-navy px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-navy-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeadEditModal;
