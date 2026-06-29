import { useEffect, useState } from 'react';
import { fetchCounsellors } from '../api/lookupApi';
import { updateEvent } from '../api/eventApi';
import {
  buildEventUpdatePayload,
  eventToEditForm,
} from '../utils/buildEventUpdatePayload';
import {
  CONTACT_TYPE_OPTIONS,
  EVENT_TYPE_OPTIONS,
  PRIORITY_OPTIONS,
  STATUS_OPTIONS,
  URGENCY_OPTIONS,
} from '../leads/lead-details/actionItemOptions';

const inputClassName =
  'h-11 w-full rounded-xl border border-brand-yellow/40 bg-brand-cream/40 px-4 text-sm text-brand-navy outline-none transition focus:border-brand-navy focus:bg-white';

const textareaClassName =
  'w-full rounded-xl border border-brand-yellow/40 bg-brand-cream/40 px-4 py-3 text-sm text-brand-navy outline-none transition focus:border-brand-navy focus:bg-white';

const labelClassName = 'mb-2 block text-xs font-semibold uppercase tracking-wide text-brand-muted';

const EditEventModal = ({ event, onClose, onSaved }) => {
  const [form, setForm] = useState(() => eventToEditForm(event));
  const [counsellors, setCounsellors] = useState([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setForm(eventToEditForm(event));
    setError('');
  }, [event]);

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

  const handleChange = (eventTarget) => {
    const { name, value } = eventTarget.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (submitEvent) => {
    submitEvent.preventDefault();
    setError('');
    setIsSaving(true);

    try {
      const payload = buildEventUpdatePayload(form);
      const data = await updateEvent(event._id, payload);

      if (!data?.event) {
        throw new Error(data?.message || 'Failed to update event');
      }

      onSaved?.(data.event);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update event');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-navy/50 p-4">
      <div
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-brand-yellow/40 bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-event-title"
      >
        <div className="shrink-0 border-b border-brand-yellow/30 bg-brand-cream px-6 py-4">
          <h2 id="edit-event-title" className="text-xl font-semibold text-brand-navy">
            Edit Event
          </h2>
          <p className="mt-1 text-sm text-brand-muted">Update event details for {event.title}</p>
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
              <span className={labelClassName}>Title</span>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                className={inputClassName}
              />
            </label>

            <label className="block">
              <span className={labelClassName}>Event Type</span>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                required
                className={inputClassName}
              >
                {EVENT_TYPE_OPTIONS.map((option) => (
                  <option key={option.value || option.label} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className={labelClassName}>Counsellor</span>
              <select
                name="salesuser"
                value={form.salesuser}
                onChange={handleChange}
                disabled={isLoadingOptions}
                className={inputClassName}
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
            </label>

            <label className="block">
              <span className={labelClassName}>Date</span>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
                className={inputClassName}
              />
            </label>

            <label className="block">
              <span className={labelClassName}>Time</span>
              <input
                type="time"
                name="time"
                value={form.time}
                onChange={handleChange}
                required
                className={inputClassName}
              />
            </label>

            <label className="block">
              <span className={labelClassName}>Priority</span>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className={inputClassName}
              >
                {PRIORITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className={labelClassName}>Status</span>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className={inputClassName}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className={labelClassName}>Urgency</span>
              <select
                name="urgency"
                value={form.urgency}
                onChange={handleChange}
                className={inputClassName}
              >
                {URGENCY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className={labelClassName}>Student Name</span>
              <input
                name="studentName"
                value={form.studentName}
                onChange={handleChange}
                className={inputClassName}
              />
            </label>

            <label className="block">
              <span className={labelClassName}>Location</span>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                className={inputClassName}
              />
            </label>

            <label className="block">
              <span className={labelClassName}>Contact Number</span>
              <input
                name="contactNumber"
                value={form.contactNumber}
                onChange={handleChange}
                className={inputClassName}
              />
            </label>

            <label className="block">
              <span className={labelClassName}>Contact Name</span>
              <input
                name="contactName"
                value={form.contactName}
                onChange={handleChange}
                className={inputClassName}
              />
            </label>

            <label className="block">
              <span className={labelClassName}>Contact Type</span>
              <select
                name="contactType"
                value={form.contactType}
                onChange={handleChange}
                className={inputClassName}
              >
                {CONTACT_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block sm:col-span-2">
              <span className={labelClassName}>Description</span>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
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

export default EditEventModal;
