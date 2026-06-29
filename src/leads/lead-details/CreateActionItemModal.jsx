import { useEffect, useState } from 'react';
import { createEvent } from '../../api/eventApi';
import { fetchCounsellors } from '../../api/lookupApi';
import { buildActionItemPayload } from '../../utils/buildActionItemPayload';
import {
  buildActionItemFormFromLead,
  CONTACT_TYPE_OPTIONS,
  EVENT_TYPE_OPTIONS,
  PRIORITY_OPTIONS,
  STATUS_OPTIONS,
  URGENCY_OPTIONS,
} from './actionItemOptions';

const inputClassName =
  'h-11 w-full rounded-xl border border-brand-yellow/40 bg-brand-cream/40 px-4 text-sm text-brand-navy outline-none transition placeholder:text-brand-muted/70 focus:border-brand-navy focus:bg-white';

const textareaClassName =
  'w-full rounded-xl border border-brand-yellow/40 bg-brand-cream/40 px-4 py-3 text-sm text-brand-navy outline-none transition placeholder:text-brand-muted/70 focus:border-brand-navy focus:bg-white';

const labelClassName = 'mb-2 block text-xs font-semibold uppercase tracking-wide text-brand-muted';

const RequiredMark = () => <span className="text-red-500">*</span>;

const FormSection = ({ title, description, children }) => (
  <section className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-5">
    <div className="mb-4 border-b border-brand-yellow/20 pb-3">
      <h3 className="text-sm font-semibold text-brand-navy">{title}</h3>
      {description ? (
        <p className="mt-1 text-xs text-brand-muted">{description}</p>
      ) : null}
    </div>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-x-5 sm:gap-y-4">
      {children}
    </div>
  </section>
);

const Field = ({ label, required = false, children, className = '' }) => (
  <div className={`min-w-0 ${className}`}>
    <label className={labelClassName}>
      {label} {required ? <RequiredMark /> : null}
    </label>
    {children}
  </div>
);

const SelectField = ({
  label,
  required,
  name,
  value,
  onChange,
  options,
  className = '',
  disabled = false,
}) => (
  <Field label={label} required={required} className={className}>
    <select
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      className={`${inputClassName} disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {options.map((option) => (
        <option key={option.value || option.label} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </Field>
);

const CreateActionItemModal = ({ lead, onClose, onSaved }) => {
  const [form, setForm] = useState(() => buildActionItemFormFromLead(lead));
  const [counsellors, setCounsellors] = useState([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setForm(buildActionItemFormFromLead(lead));
    setError('');
  }, [lead]);

  useEffect(() => {
    let isMounted = true;

    const loadOptions = async () => {
      try {
        setIsLoadingOptions(true);
        const counsellorList = await fetchCounsellors();

        if (!isMounted) return;

        setCounsellors(counsellorList);
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load counsellors');
          setCounsellors([]);
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

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSaving(true);

    try {
      const payload = buildActionItemPayload(lead, form);
      const data = await createEvent(payload);

      if (!data?.event) {
        throw new Error(data?.message || 'Failed to create action item');
      }

      onSaved?.(data.event);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create action item');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-brand-navy/50 p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        className="flex w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-brand-yellow/40 bg-brand-cream/30 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-action-item-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-brand-yellow/30 bg-white px-6 py-5">
          <div>
            <h2 id="create-action-item-title" className="text-xl font-semibold text-brand-navy">
              Create Action Item
            </h2>
            <p className="mt-1 text-sm text-brand-muted">
              Schedule a follow-up or sales activity for {lead?.name || 'this lead'}.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-lg p-2 text-brand-muted transition hover:bg-brand-yellow/20 hover:text-brand-navy"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <form
          id="create-action-item-form"
          onSubmit={handleSubmit}
          className="max-h-[calc(100vh-11rem)] overflow-y-auto px-4 py-4 sm:px-6 sm:py-5"
        >
          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <FormSection title="Event details" description="Basic information about the action item.">
              <Field label="Title" required>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  placeholder="Enter event title"
                  className={inputClassName}
                />
              </Field>

              <SelectField
                label="Event Type"
                required
                name="type"
                value={form.type}
                onChange={handleChange}
                options={EVENT_TYPE_OPTIONS}
              />
            </FormSection>

            <FormSection title="Schedule" description="When should this action take place?">
              <Field label="Date" required>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                  className={inputClassName}
                />
              </Field>

              <Field label="Time" required>
                <input
                  type="time"
                  name="time"
                  value={form.time}
                  onChange={handleChange}
                  required
                  className={inputClassName}
                />
              </Field>
            </FormSection>

            <FormSection title="Classification" description="Set priority, status, and urgency.">
              <SelectField
                label="Priority"
                name="priority"
                value={form.priority}
                onChange={handleChange}
                options={PRIORITY_OPTIONS}
              />
              <SelectField
                label="Status"
                name="status"
                value={form.status}
                onChange={handleChange}
                options={STATUS_OPTIONS}
              />
              <SelectField
                label="Urgency"
                name="urgency"
                value={form.urgency}
                onChange={handleChange}
                options={URGENCY_OPTIONS}
              />
            </FormSection>

            <FormSection title="Student & counsellor" description="Who is this event for?">
              <Field label="Student Name">
                <input
                  type="text"
                  name="studentName"
                  value={form.studentName}
                  disabled
                  className={`${inputClassName} cursor-not-allowed opacity-70`}
                />
              </Field>

              <Field label="Counsellor">
                <select
                  name="salesuser"
                  value={form.salesuser}
                  onChange={handleChange}
                  disabled={isLoadingOptions}
                  className={`${inputClassName} disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  <option value="">
                    {isLoadingOptions ? 'Loading counsellors...' : 'Select Counsellor'}
                  </option>
                  {counsellors.map((counsellor, index) => (
                    <option key={counsellor.id || index} value={counsellor.id}>
                      {counsellor.name}
                    </option>
                  ))}
                </select>
              </Field>
            </FormSection>

            <FormSection title="Contact details" description="How will you reach out?">
              <Field label="Contact Number">
                <input
                  type="text"
                  name="contactNumber"
                  value={form.contactNumber}
                  onChange={handleChange}
                  className={inputClassName}
                />
              </Field>

              <Field label="Contact Name">
                <input
                  type="text"
                  name="contactName"
                  value={form.contactName}
                  onChange={handleChange}
                  className={inputClassName}
                />
              </Field>

              <SelectField
                label="Contact Type"
                name="contactType"
                value={form.contactType}
                onChange={handleChange}
                options={CONTACT_TYPE_OPTIONS}
              />
            </FormSection>

            <FormSection title="Additional information">
              <Field label="Location" className="sm:col-span-2">
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Branch, meeting room, or address"
                  className={inputClassName}
                />
              </Field>

              <Field label="Description" className="sm:col-span-2">
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Add notes or context for this action item"
                  className={`${textareaClassName} min-h-[88px] resize-none`}
                />
              </Field>
            </FormSection>
          </div>
        </form>

        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-brand-yellow/30 bg-white px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="min-w-[96px] rounded-xl border border-brand-yellow/40 px-4 py-2.5 text-sm font-medium text-brand-navy transition hover:bg-brand-cream disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-action-item-form"
            disabled={isSaving || isLoadingOptions}
            className="min-w-[96px] rounded-xl bg-brand-navy px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-navy-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateActionItemModal;
