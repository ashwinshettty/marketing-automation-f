import { useEffect, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { updateWhatsAppContact } from '../api/whatsappApi';

const inputClassName =
  'w-full rounded-xl border border-brand-yellow/40 bg-white px-4 py-2.5 text-sm text-brand-navy outline-none transition focus:border-brand-navy';

const EditContactModal = ({ lead, onClose, onSaved }) => {
  const [form, setForm] = useState({
    phoneNumber: lead?.contactNo || lead?.phoneNumber || '',
    name: lead?.name || '',
    subject: lead?.subject || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setForm({
      phoneNumber: lead?.contactNo || lead?.phoneNumber || '',
      name: lead?.name || '',
      subject: lead?.subject || '',
    });
    setError('');
  }, [lead]);

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const leadId = lead?.leadId || lead?.id;
    if (!leadId) {
      setError('Missing contact id');
      return;
    }

    const phoneNumber = form.phoneNumber.trim();
    if (!phoneNumber) {
      setError('Phone number is required');
      return;
    }

    const digits = phoneNumber.replace(/\D/g, '');
    if (digits.length < 10) {
      setError('Enter a valid phone number with at least 10 digits');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const data = await updateWhatsAppContact({
        leadId,
        phoneNumber,
        name: form.name.trim(),
        subject: form.subject.trim(),
      });

      const contact = data?.contact;
      if (!contact) {
        throw new Error('Contact update response was incomplete');
      }

      onSaved?.(contact);
      onClose?.();
    } catch (err) {
      setError(err.message || 'Failed to update contact');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-brand-navy/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-brand-yellow/40 bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-contact-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-brand-yellow/30 bg-brand-cream px-5 py-4">
          <div>
            <h2
              id="edit-contact-title"
              className="text-lg font-semibold text-brand-navy"
            >
              Edit contact info
            </h2>
            <p className="mt-1 text-sm text-brand-muted">
              Update name, phone, or subject for this chat.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-lg p-1.5 text-brand-muted transition hover:bg-white hover:text-brand-navy disabled:opacity-60"
            aria-label="Close"
          >
            <FaTimes className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-brand-muted">
              Phone number <span className="text-red-500">*</span>
            </span>
            <input
              type="tel"
              value={form.phoneNumber}
              onChange={(event) => updateField('phoneNumber', event.target.value)}
              className={inputClassName}
              required
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-brand-muted">
              Name
            </span>
            <input
              type="text"
              value={form.name}
              onChange={(event) => updateField('name', event.target.value)}
              placeholder="Contact name"
              className={inputClassName}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-brand-muted">
              Subject
            </span>
            <textarea
              value={form.subject}
              onChange={(event) => updateField('subject', event.target.value)}
              placeholder="Enquiry subject"
              rows={3}
              className={`${inputClassName} resize-none`}
            />
          </label>

          {error && (
            <p className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-brand-yellow/30 pt-4">
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
              className="rounded-xl bg-brand-navy px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-navy/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditContactModal;
