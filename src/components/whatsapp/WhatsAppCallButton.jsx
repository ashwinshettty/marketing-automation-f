import { useState } from 'react';
import { FaHeadset, FaPhone, FaPhoneSlash, FaRobot } from 'react-icons/fa';
import { initiateAgentWhatsAppCall } from '../../api/whatsappApi';
import { useWhatsAppOutboundCall } from '../../hooks/useWhatsAppOutboundCall';
import { normalizePhoneNumber } from '../../utils/normalizePhone';

const WhatsAppCallButton = ({
  phoneNumber,
  leadId,
  subject = '',
  className = '',
  onAgentCallStarted,
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

  const [agentState, setAgentState] = useState('idle');
  const [agentError, setAgentError] = useState('');
  const [agentNotice, setAgentNotice] = useState('');

  if (!normalizePhoneNumber(phoneNumber)) {
    return null;
  }

  const handleHumanCall = async () => {
    if (isInCall) {
      await endCall();
      return;
    }

    if (callState === 'failed' || callState === 'ended') {
      resetCall();
    }

    await startCall();
  };

  const handleAgentCall = async () => {
    setAgentError('');
    setAgentNotice('');
    setAgentState('calling');

    try {
      const result = await initiateAgentWhatsAppCall({
        phoneNumber,
        leadId,
        subject,
      });

      if (result.permissionRequested || result.code === 'CALL_PERMISSION_REQUESTED') {
        setAgentNotice(
          result.message ||
            'Call permission request sent. Ask them to approve on WhatsApp, then try Agent Call again.',
        );
        setAgentState('permission_pending');
        onAgentCallStarted?.(result);
        return;
      }

      if (!result.success) {
        setAgentError(result.message || 'Failed to start agent call');
        setAgentState('failed');
        return;
      }

      setAgentNotice(result.message || 'Agent call started — Ash is calling.');
      setAgentState('started');
      onAgentCallStarted?.(result);
    } catch (err) {
      setAgentError(err.message || 'Failed to start agent call');
      setAgentState('failed');
    }
  };

  const humanLabel =
    callState === 'calling'
      ? 'Calling...'
      : callState === 'ringing'
        ? 'Ringing...'
        : callState === 'connected'
          ? 'End call'
          : 'Call';

  const agentLabel =
    agentState === 'calling' ? 'Starting...' : 'Agent Call';

  return (
    <div className={`flex flex-col items-end gap-1 ${className}`}>
      <div className="flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={handleHumanCall}
          disabled={callState === 'calling' || agentState === 'calling'}
          className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-70 ${
            isInCall
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-[#25D366] hover:bg-[#1fb85a]'
          }`}
          title={`Human call ${phoneNumber} on WhatsApp`}
          aria-label={`Call ${phoneNumber} on WhatsApp`}
        >
          {isInCall ? (
            <FaPhoneSlash className="h-3.5 w-3.5" />
          ) : (
            <FaPhone className="h-3.5 w-3.5" />
          )}
          {humanLabel}
        </button>

        <button
          type="button"
          onClick={handleAgentCall}
          disabled={
            agentState === 'calling' || isInCall || callState === 'calling'
          }
          className="inline-flex items-center gap-2 rounded-full bg-[#128c7e] px-3.5 py-2 text-sm font-medium text-white transition hover:bg-[#0f7a6e] disabled:cursor-not-allowed disabled:opacity-70"
          title={`AI agent call ${phoneNumber}`}
          aria-label={`Agent call ${phoneNumber}`}
        >
          {agentState === 'calling' ? (
            <FaHeadset className="h-3.5 w-3.5 animate-pulse" />
          ) : (
            <FaRobot className="h-3.5 w-3.5" />
          )}
          {agentLabel}
        </button>
      </div>

      {(notice || agentNotice) && (
        <p className="max-w-[280px] text-right text-[11px] text-amber-100">
          {agentNotice || notice}
        </p>
      )}

      {(error || agentError) && (
        <p className="max-w-[280px] text-right text-[11px] text-red-200">
          {agentError || error}
        </p>
      )}

      <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />
    </div>
  );
};

export default WhatsAppCallButton;
