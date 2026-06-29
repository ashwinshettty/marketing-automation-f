const ConfirmModal = ({
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    isLoading = false,
    onConfirm,
    onCancel,
  }) => {
    return (
      <div
        className="fixed inset-0 z-[60] flex items-center justify-center bg-brand-navy/50 p-4"
        onClick={onCancel}
      >
        <div
          className="w-full max-w-md rounded-2xl border border-brand-yellow/40 bg-white shadow-2xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-modal-title"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="border-b border-brand-yellow/30 px-6 py-5">
            <h2 id="confirm-modal-title" className="text-lg font-semibold text-brand-navy">
              {title}
            </h2>
            <p className="mt-2 text-sm text-brand-muted">{message}</p>
          </div>
  
          <div className="flex items-center justify-end gap-3 px-6 py-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="min-w-[96px] rounded-xl border border-brand-yellow/40 px-4 py-2.5 text-sm font-medium text-brand-navy transition hover:bg-brand-cream disabled:opacity-60"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className="min-w-[96px] rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? 'Deleting...' : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  export default ConfirmModal;
  