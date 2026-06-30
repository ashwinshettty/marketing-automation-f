import { FaTimes } from 'react-icons/fa';
import { secondaryBtnClass } from './templateUi';

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Delete',
  message = 'Are you sure you want to delete this item? This action cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-navy/40 p-4 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-2xl border border-brand-yellow/40 bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-brand-navy">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-brand-muted transition hover:bg-brand-cream hover:text-brand-navy"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-6 text-sm text-brand-muted">{message}</p>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className={secondaryBtnClass}>
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
