import { useEffect, useState } from 'react';
import { createVacancy, updateVacancy } from '../api/vacancyApi';
import {
  emptyVacancyForm,
  vacancyToForm,
  VACANCY_DEPARTMENT_OPTIONS,
  VACANCY_EMPLOYMENT_OPTIONS,
  VACANCY_ROLE_OPTIONS,
  VACANCY_STATUS_OPTIONS,
} from './vacancyOptions';

const inputClassName =
  'h-11 w-full rounded-xl border border-brand-yellow/40 bg-brand-cream/40 px-4 text-sm text-brand-navy outline-none transition focus:border-brand-navy focus:bg-white';

const textareaClassName =
  'w-full rounded-xl border border-brand-yellow/40 bg-brand-cream/40 px-4 py-3 text-sm text-brand-navy outline-none transition focus:border-brand-navy focus:bg-white';

const labelClassName = 'mb-2 block text-xs font-semibold uppercase tracking-wide text-brand-muted';

const VacancyModal = ({ vacancy, onClose, onSaved }) => {
  const isEdit = Boolean(vacancy?._id);
  const [form, setForm] = useState(() => (isEdit ? vacancyToForm(vacancy) : emptyVacancyForm()));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setForm(isEdit ? vacancyToForm(vacancy) : emptyVacancyForm());
    setError('');
  }, [vacancy, isEdit]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (submitEvent) => {
    submitEvent.preventDefault();
    setError('');
    setIsSaving(true);
    try {
      const data = isEdit
        ? await updateVacancy(vacancy._id, form)
        : await createVacancy(form);
      if (!data?.vacancy) {
        throw new Error(data?.message || 'Failed to save vacancy');
      }
      onSaved?.(data.vacancy);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save vacancy');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-navy/50 p-4">
      <div
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-brand-yellow/40 bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="vacancy-modal-title"
      >
        <div className="shrink-0 border-b border-brand-yellow/30 bg-brand-cream px-6 py-4">
          <h2 id="vacancy-modal-title" className="text-xl font-semibold text-brand-navy">
            {isEdit ? 'Edit vacancy' : 'Add vacancy'}
          </h2>
          <p className="mt-1 text-sm text-brand-muted">
            Job description here is what the agent uses to answer candidates and score resumes.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className={labelClassName}>Role title</span>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Physics Faculty — Class 11-12"
                  className={inputClassName}
                />
              </label>

              <label className="block">
                <span className={labelClassName}>Department</span>
                <select name="department" value={form.department} onChange={handleChange} className={inputClassName}>
                  {VACANCY_DEPARTMENT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className={labelClassName}>Role type</span>
                <select name="roleType" value={form.roleType} onChange={handleChange} className={inputClassName}>
                  {VACANCY_ROLE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className={labelClassName}>Employment</span>
                <select
                  name="employmentType"
                  value={form.employmentType}
                  onChange={handleChange}
                  className={inputClassName}
                >
                  {VACANCY_EMPLOYMENT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className={labelClassName}>Positions open</span>
                <input
                  type="number"
                  name="positionsOpen"
                  min={1}
                  step={1}
                  value={form.positionsOpen}
                  onChange={handleChange}
                  required
                  className={inputClassName}
                />
              </label>

              <label className="block">
                <span className={labelClassName}>Status</span>
                <select name="status" value={form.status} onChange={handleChange} className={inputClassName}>
                  {VACANCY_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className={labelClassName}>Location</span>
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Mumbai / Online / Kandivali"
                  className={inputClassName}
                />
              </label>

              <label className="block">
                <span className={labelClassName}>Subjects / skills</span>
                <input
                  name="subjects"
                  value={form.subjects}
                  onChange={handleChange}
                  placeholder="Physics, JEE / React, Node"
                  className={inputClassName}
                />
              </label>

              <label className="block">
                <span className={labelClassName}>Experience</span>
                <input
                  name="experience"
                  value={form.experience}
                  onChange={handleChange}
                  placeholder="2+ years teaching Class 10-12"
                  className={inputClassName}
                />
              </label>

              <label className="block">
                <span className={labelClassName}>Apply email</span>
                <input
                  name="applyEmail"
                  value={form.applyEmail}
                  onChange={handleChange}
                  className={inputClassName}
                />
              </label>

              <label className="block sm:col-span-2">
                <span className={labelClassName}>Job description</span>
                <textarea
                  name="jd"
                  value={form.jd}
                  onChange={handleChange}
                  required
                  rows={6}
                  placeholder="Write the JD the agent should learn from — duties, who should apply, what you look for."
                  className={textareaClassName}
                />
              </label>

              <label className="block sm:col-span-2">
                <span className={labelClassName}>Requirements</span>
                <textarea
                  name="requirements"
                  value={form.requirements}
                  onChange={handleChange}
                  rows={3}
                  className={textareaClassName}
                />
              </label>

              <label className="block sm:col-span-2">
                <span className={labelClassName}>Notes for candidates</span>
                <textarea
                  name="applyNotes"
                  value={form.applyNotes}
                  onChange={handleChange}
                  rows={2}
                  placeholder="e.g. Send resume on WhatsApp or email. CITP not required."
                  className={textareaClassName}
                />
              </label>
            </div>
          </div>

          <div className="flex shrink-0 items-center justify-end gap-3 border-t border-brand-yellow/30 bg-white px-6 py-4">
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
              disabled={isSaving}
              className="rounded-xl bg-brand-navy px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-navy-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? 'Saving...' : isEdit ? 'Save changes' : 'Create vacancy'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VacancyModal;
