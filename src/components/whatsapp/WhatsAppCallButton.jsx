import { FaPhone, FaPhoneSlash } from 'react-icons/fa';
import { useWhatsAppOutboundCall } from '../../hooks/useWhatsAppOutboundCall';
import { normalizePhoneNumber } from '../../utils/normalizePhone';

const WhatsAppCallButton = ({
  phoneNumber,
  leadId,
  className = '',
  label = 'Call',
}) => {
  const {
    callState,
    error,
    notice,
    remoteAudioRef,
    startCall,
    endCall,
    resetCall,
    isInCall,
  } = useWhatsAppOutboundCall({ phoneNumber, leadId });

  if (!normalizePhoneNumber(phoneNumber)) {
    return null;
  }

  const handleClick = async () => {
    if (isInCall) {
      await endCall();
      return;
    }

    if (callState === 'failed' || callState === 'ended') {
      resetCall();
    }

    await startCall();
  };

  const buttonLabel =
    callState === 'calling'
      ? 'Calling...'
      : callState === 'ringing'
        ? 'Ringing...'
        : callState === 'connected'
          ? 'End call'
          : callState === 'permission_pending'
            ? 'Call'
            : label;

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={callState === 'calling'}
        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-70 ${
          isInCall
            ? 'bg-red-500 hover:bg-red-600'
            : 'bg-[#25D366] hover:bg-[#1fb85a]'
        } ${className}`}
        title={`Call ${phoneNumber} on WhatsApp`}
        aria-label={`Call ${phoneNumber} on WhatsApp`}
      >
        {isInCall ? (
          <FaPhoneSlash className="h-3.5 w-3.5" />
        ) : (
          <FaPhone className="h-3.5 w-3.5" />
        )}
        {buttonLabel}
      </button>

      {notice && (
        <p className="max-w-[240px] text-right text-[11px] text-amber-100">{notice}</p>
      )}

      {error && (
        <p className="max-w-[220px] text-right text-[11px] text-red-200">{error}</p>
      )}

      <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />
    </div>
  );
};

export default WhatsAppCallButton;
