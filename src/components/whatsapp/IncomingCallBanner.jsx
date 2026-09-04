import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { FaPhone, FaPhoneSlash } from 'react-icons/fa';
import { openWhatsAppGlobalStream } from '../../api/whatsappEventStream';
import {
  acceptCall,
  fetchActiveIncomingCalls,
  preAcceptCall,
  rejectCall,
  terminateCall,
} from '../../api/whatsappApi';
import {
  attachLocalAudio,
  createAudioPeerConnection,
  normalizeWhatsAppSdp,
  playRemoteStream,
  stopMediaStream,
  waitForIceGathering,
} from '../../utils/webrtcCall';

const ENDED_STATUSES = new Set([
  'rejected',
  'terminated',
  'failed',
  'completed',
  'ended',
]);

const isIncomingRinging = (event) => {
  const call = event?.call;
  if (!call?.id) return false;

  const direction = String(call.direction || '').toUpperCase();
  if (direction && direction !== 'USER_INITIATED') return false;

  const status = String(call.status || '').toLowerCase();

  if (event.type === 'incoming_call') {
    return !status || status === 'ringing' || status === 'connect';
  }

  if (event.type === 'call_status_update') {
    return status === 'ringing' || status === 'connect';
  }

  return false;
};

const IncomingCallBanner = () => {
  const { pathname } = useLocation();
  const [incomingCall, setIncomingCall] = useState(null);
  const [callState, setCallState] = useState('idle');
  const [error, setError] = useState('');
  const [isActing, setIsActing] = useState(false);

  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const activeCallIdRef = useRef(null);

  const cleanupMedia = () => {
    peerRef.current?.close();
    peerRef.current = null;
    stopMediaStream(localStreamRef.current);
    localStreamRef.current = null;
  };

  const clearCall = () => {
    cleanupMedia();
    activeCallIdRef.current = null;
    setIncomingCall(null);
    setCallState('idle');
    setError('');
    setIsActing(false);
  };

  useEffect(() => {
    const closeStream = openWhatsAppGlobalStream((event) => {
      if (isIncomingRinging(event)) {
        activeCallIdRef.current = event.call.id;
        setIncomingCall((current) => ({
          ...(current?.id === event.call.id ? current : {}),
          ...event.call,
          sdp: event.call.sdp || current?.sdp,
        }));
        setCallState((current) =>
          current === 'connected' || current === 'connecting' ? current : 'ringing',
        );
        return;
      }

      const callId = event.call?.id;
      if (activeCallIdRef.current && callId && callId !== activeCallIdRef.current) {
        return;
      }

      if (event.type === 'call_ended') {
        clearCall();
        return;
      }

      if (event.type === 'call_status_update') {
        const status = String(event.call?.status || '').toLowerCase();
        if (ENDED_STATUSES.has(status)) {
          clearCall();
        } else if (status === 'accepted') {
          setCallState('connected');
        }
      }
    });

    return closeStream;
  }, []);

  useEffect(() => {
    let cancelled = false;

    const syncFromDb = async () => {
      try {
        const data = await fetchActiveIncomingCalls();
        if (cancelled) return;

        const call = data?.calls?.[0];
        if (!call?.id) return;

        activeCallIdRef.current = call.id;
        setIncomingCall((current) => {
          if (current?.id === call.id) {
            return {
              ...current,
              ...call,
              sdp: call.sdp || current.sdp,
            };
          }
          return call;
        });
        setCallState((current) =>
          current === 'connected' || current === 'connecting' ? current : 'ringing',
        );
      } catch {
        // Ignore transient errors.
      }
    };

    syncFromDb();

    const onVisible = () => {
      if (document.visibilityState === 'visible') syncFromDb();
    };

    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', syncFromDb);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', syncFromDb);
    };
  }, []);

  useEffect(
    () => () => {
      cleanupMedia();
    },
    [],
  );

  const handleReject = async () => {
    if (!incomingCall?.id) return;
    setIsActing(true);
    try {
      await rejectCall({ callId: incomingCall.id });
    } catch (rejectError) {
      console.error('Failed to reject call:', rejectError.message);
    } finally {
      clearCall();
    }
  };

  const handleAccept = async () => {
    if (!incomingCall?.id) return;

    if (!incomingCall.sdp) {
      setError('Incoming call is missing the WebRTC offer. Wait a moment and try again.');
      return;
    }

    setIsActing(true);
    setError('');
    setCallState('connecting');

    try {
      const peerConnection = createAudioPeerConnection();
      peerRef.current = peerConnection;
      activeCallIdRef.current = incomingCall.id;

      peerConnection.ontrack = (event) => {
        playRemoteStream(remoteAudioRef.current, event);
      };

      const localStream = await attachLocalAudio(peerConnection);
      localStreamRef.current = localStream;

      await peerConnection.setRemoteDescription({
        type: 'offer',
        sdp: incomingCall.sdp,
      });

      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      const localDescription = await waitForIceGathering(peerConnection);
      const answerSdp = normalizeWhatsAppSdp(
        localDescription?.sdp || answer.sdp,
      );

      try {
        await preAcceptCall({
          callId: incomingCall.id,
          sdp: answerSdp,
        });
      } catch (preAcceptError) {
        // pre_accept is recommended but not always required — continue to accept.
        console.warn('pre_accept failed, continuing with accept:', preAcceptError.message);
      }

      await acceptCall({
        callId: incomingCall.id,
        sdp: answerSdp,
      });

      setCallState('connected');
    } catch (acceptError) {
      cleanupMedia();
      setError(acceptError.message || 'Failed to accept WhatsApp call');
      setCallState('failed');
    } finally {
      setIsActing(false);
    }
  };

  const handleEnd = async () => {
    const callId = activeCallIdRef.current || incomingCall?.id;
    setIsActing(true);
    try {
      if (callId) {
        await terminateCall({ callId });
      }
    } catch (endError) {
      console.error('Failed to end call:', endError.message);
    } finally {
      clearCall();
    }
  };

  if (pathname.startsWith('/website-intelligence')) return null;
  if (!incomingCall || typeof document === 'undefined') return null;

  const statusLabel =
    callState === 'connecting'
      ? 'Connecting…'
      : callState === 'connected'
        ? 'Connected'
        : callState === 'failed'
          ? 'Call failed'
          : 'Incoming WhatsApp call';

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366]/15 text-[#25D366]">
          <FaPhone className="h-6 w-6 animate-pulse" />
        </div>
        <p className="text-center text-lg font-semibold text-brand-navy">{statusLabel}</p>
        <p className="mt-1 text-center text-sm text-brand-muted">
          From: {incomingCall.from || 'Unknown number'}
        </p>

        {error && (
          <p className="mt-3 text-center text-xs text-red-600">{error}</p>
        )}

        <div className="mt-6 flex gap-3">
          {callState === 'connected' ? (
            <button
              type="button"
              onClick={handleEnd}
              disabled={isActing}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-red-500 px-3 py-2.5 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-60"
            >
              <FaPhoneSlash className="h-3.5 w-3.5" />
              End call
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleReject}
                disabled={isActing}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-red-500 px-3 py-2.5 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-60"
              >
                <FaPhoneSlash className="h-3.5 w-3.5" />
                Decline
              </button>
              <button
                type="button"
                onClick={handleAccept}
                disabled={isActing || callState === 'connecting' || !incomingCall.sdp}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#25D366] px-3 py-2.5 text-sm font-medium text-white hover:bg-[#1fb85a] disabled:opacity-60"
              >
                <FaPhone className="h-3.5 w-3.5" />
                {callState === 'connecting' ? 'Connecting…' : 'Accept'}
              </button>
            </>
          )}
        </div>

        <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />
      </div>
    </div>,
    document.body,
  );
};

export default IncomingCallBanner;
