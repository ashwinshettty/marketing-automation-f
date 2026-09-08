import { useState } from 'react';
import { FaPlus, FaTimes, FaUserPlus } from 'react-icons/fa';
import { createWhatsAppContact } from '../api/whatsappApi';

const inputClassName =
  'w-full rounded-xl border border-brand-yellow/40 bg-white px-4 py-2.5 text-sm text-brand-navy outline-none transition focus:border-brand-navy';

const emptyForm = {
  phoneNumber: '',
  name: '',
  subject: '',
};

const AddContact = ({ onCreated, compact = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const openModal = () => {
    setForm(emptyForm);
    setError('');
    setIsOpen(true);
  };

  const closeModal = () => {
    if (isSaving) return;
    setIsOpen(false);
    setError('');
  };

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

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
      const data = await createWhatsAppContact({
        phoneNumber,
        name: form.name.trim(),
        subject: form.subject.trim(),
      });

      const contact = data?.contact;
      if (!contact?.phoneNumber && !contact?.conversationId) {
        throw new Error('Contact was saved but response was incomplete');
      }

      onCreated?.(contact);
      setIsOpen(false);
      setForm(emptyForm);
    } catch (err) {
      setError(err.message || 'Failed to save contact');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className={
          compact
            ? 'inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-brand-navy px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-navy/90'
            : 'inline-flex items-center gap-2 rounded-xl bg-brand-navy px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-navy/90'
        }
      >
        <FaUserPlus className={compact ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
        {compact ? 'Add' : 'Add contact'}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-brand-navy/50 p-4 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl border border-brand-yellow/40 bg-white shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-contact-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-brand-yellow/30 bg-brand-cream px-5 py-4">
              <div>
                <h2
                  id="add-contact-title"
                  className="text-lg font-semibold text-brand-navy"
                >
                  Add WhatsApp contact
                </h2>
                <p className="mt-1 text-sm text-brand-muted">
                  Phone is required. Name and subject are optional.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
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
                  placeholder="e.g. 9876543210 or 919876543210"
                  className={inputClassName}
                  autoFocus
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
                  placeholder="Contact name (optional)"
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
                  placeholder="Enquiry subject (optional)"
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
                  onClick={closeModal}
                  disabled={isSaving}
                  className="rounded-xl border border-brand-yellow/40 px-4 py-2.5 text-sm font-medium text-brand-navy transition hover:bg-brand-cream disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1fb85a] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FaPlus className="h-3 w-3" />
                  {isSaving ? 'Saving...' : 'Save & open chat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AddContact;
