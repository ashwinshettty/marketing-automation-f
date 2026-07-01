const STATUS_LABELS = {
  sent: 'Sent',
  delivered: 'Delivered',
  read: 'Read',
  failed: 'Failed',
  received: 'Received',
};

const MessageStatusIcon = ({ status, direction }) => {
  if (direction !== 'outbound' || !status) return null;

  const label = STATUS_LABELS[status] || status;

  if (status === 'read') {
    return (
      <span className="ml-1 text-[10px] font-medium text-blue-500" title={label}>
        ✓✓
      </span>
    );
  }

  if (status === 'delivered') {
    return (
      <span className="ml-1 text-[10px] font-medium text-slate-500" title={label}>
        ✓✓
      </span>
    );
  }

  if (status === 'sent') {
    return (
      <span className="ml-1 text-[10px] font-medium text-slate-400" title={label}>
        ✓
      </span>
    );
  }

  if (status === 'failed') {
    return (
      <span className="ml-1 text-[10px] font-medium text-red-500" title={label}>
        !
      </span>
    );
  }

  return null;
};

export default MessageStatusIcon;
