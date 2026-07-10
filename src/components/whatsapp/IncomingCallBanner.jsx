import { useEffect, useState } from 'react';
import { openWhatsAppGlobalStream } from '../../api/whatsappEventStream';
import { acceptCall, rejectCall } from '../../api/whatsappApi';

const IncomingCallBanner = () => {
  const [incomingCall, setIncomingCall] = useState(null);
  const [isActing, setIsActing] = useState(false);

  useEffect(() => {
    const closeStream = openWhatsAppGlobalStream((event) => {
      if (event.type === 'incoming_call' && event.call?.status === 'ringing' && event.call?.direction === 'USER_INITIATED') {
        setIncomingCall(event.call);
        return;
      }

      if (event.type === 'call_ended' || event.type === 'call_status_update') {
        setIncomingCall((current) =>
          current && current.id === event.call?.id ? null : current,
        );
      }
    });

    return closeStream;
  }, []);

  const handleReject = async () => {
    if (!incomingCall?.id) return;
    setIsActing(true);
    try {
      await rejectCall({ callId: incomingCall.id });
      setIncomingCall(null);
    } catch (error) {
      console.error('Failed to reject call:', error.message);
    } finally {
      setIsActing(false);
    }
  };

  const handleAccept = async () => {
    if (!incomingCall?.id) return;
    setIsActing(true);
    try {
      await acceptCall({
        callId: incomingCall.id,
        sdp: incomingCall.sdp || '',
      });
      setIncomingCall(null);
    } catch (error) {
      console.error('Failed to accept call:', error.message);
      alert(
        'Call accept requires WebRTC SDP setup. The call event was received — wire your media client next.',
      );
    } finally {
      setIsActing(false);
    }
  };

  if (!incomingCall) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
      <p className="text-sm font-semibold text-brand-navy">Incoming WhatsApp call</p>
      <p className="mt-1 text-xs text-brand-muted">From: {incomingCall.from}</p>
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={handleReject}
          disabled={isActing}
          className="flex-1 rounded-full bg-red-500 px-3 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-60"
        >
          Decline
        </button>
        <button
          type="button"
          onClick={handleAccept}
          disabled={isActing}
          className="flex-1 rounded-full bg-[#25D366] px-3 py-2 text-sm font-medium text-white hover:bg-[#1fb85a] disabled:opacity-60"
        >
          Accept
        </button>
      </div>
    </div>
  );
};

export default IncomingCallBanner;
