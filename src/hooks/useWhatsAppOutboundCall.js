import { useCallback, useEffect, useRef, useState } from 'react';
import { initiateWhatsAppCall, terminateCall } from '../api/whatsappApi';
import { openWhatsAppConversationStream } from '../api/whatsappEventStream';
import { normalizePhoneNumber } from '../utils/normalizePhone';
import {
  createAudioPeerConnection,
  normalizeWhatsAppSdp,
  playRemoteStream,
  stopMediaStream,
  waitForIceGathering,
} from '../utils/webrtcCall';

const isAnswerSdp = (call) => {
  if (!call?.sdp) return false;
  const type = String(call.sdpType || '').toLowerCase();
  return !type || type === 'answer';
};

export const useWhatsAppOutboundCall = ({ phoneNumber, leadId }) => {
  const [callState, setCallState] = useState('idle');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const activeCallIdRef = useRef(null);
  const answerAppliedRef = useRef(false);
  const conversationId = phoneNumber ? normalizePhoneNumber(phoneNumber) : '';

  const cleanup = useCallback(() => {
    peerRef.current?.close();
    peerRef.current = null;
    stopMediaStream(localStreamRef.current);
    localStreamRef.current = null;
    activeCallIdRef.current = null;
    answerAppliedRef.current = false;
  }, []);

  const resetCall = useCallback(() => {
    cleanup();
    setCallState('idle');
    setError('');
    setNotice('');
  }, [cleanup]);

  const endCall = useCallback(async () => {
    const callId = activeCallIdRef.current;

    if (callId) {
      try {
        await terminateCall({ callId });
      } catch (terminateError) {
        console.error('Failed to terminate WhatsApp call:', terminateError.message);
      }
    }

    cleanup();
    setCallState('ended');
  }, [cleanup]);

  const applyRemoteAnswer = useCallback(
    async (call) => {
      const peerConnection = peerRef.current;
      if (!peerConnection || !call?.sdp || answerAppliedRef.current) return false;

      await peerConnection.setRemoteDescription({
        type: 'answer',
        sdp: call.sdp,
      });
      answerAppliedRef.current = true;
      setCallState('connected');
      return true;
    },
    [],
  );

  const startCall = useCallback(async () => {
    if (!phoneNumber || !conversationId) return;

    setError('');
    setNotice('');
    setCallState('calling');
    answerAppliedRef.current = false;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      localStreamRef.current = stream;

      const peerConnection = createAudioPeerConnection();
      peerRef.current = peerConnection;

      stream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, stream);
      });

      peerConnection.ontrack = (event) => {
        playRemoteStream(remoteAudioRef.current, event);
      };

      const offer = await peerConnection.createOffer({
        offerToReceiveAudio: true,
      });
      await peerConnection.setLocalDescription(offer);

      const localDescription = await waitForIceGathering(peerConnection);
      const sdp = normalizeWhatsAppSdp(localDescription?.sdp || offer.sdp);

      const result = await initiateWhatsAppCall({
        phoneNumber,
        leadId,
        sdp,
      });

      if (result.code === 'CALL_PERMISSION_REQUESTED' || result.permissionRequested) {
        cleanup();
        setNotice(
          result.message ||
            'Call permission request sent on WhatsApp. Ask the recipient to approve it, then call again.',
        );
        setCallState('permission_pending');
        return;
      }

      if (!result.success) {
        cleanup();
        if (
          result.code === 'CALL_PERMISSION_REQUIRED' ||
          result.code === 'CALL_PERMISSION_CSW_REQUIRED'
        ) {
          setNotice(
            result.message ||
              'Recipient has not approved WhatsApp calls yet. Try again after they accept the permission request.',
          );
          setCallState('permission_pending');
        } else {
          setError(result.message || 'Failed to start WhatsApp call');
          setCallState('failed');
        }
        return;
      }

      activeCallIdRef.current = result.callId;
      setCallState('ringing');
    } catch (startError) {
      cleanup();
      setError(startError.message || 'Failed to start WhatsApp call');
      setCallState('failed');
    }
  }, [phoneNumber, leadId, conversationId, cleanup]);

  useEffect(() => {
    if (!phoneNumber || !conversationId) return undefined;

    const closeStream = openWhatsAppConversationStream(phoneNumber, async (event) => {
      const call = event.call;

      if (event.type === 'call_permission_update') {
        if (event.call?.permissionStatus === 'granted') {
          setError('');
          setNotice('Call permission approved. You can call now.');
          setCallState('idle');
        } else if (event.call?.permissionStatus === 'denied') {
          setNotice('Call permission was declined on WhatsApp.');
          setCallState('permission_pending');
        }
        return;
      }

      if (!call?.id) return;
      if (activeCallIdRef.current && call.id !== activeCallIdRef.current) return;

      // Meta sends the SDP answer on connect (BIC). Also accept answer on status updates.
      if (
        (event.type === 'outbound_call_connect' ||
          event.type === 'call_status_update' ||
          event.type === 'call_initiated') &&
        isAnswerSdp(call)
      ) {
        try {
          const applied = await applyRemoteAnswer(call);
          if (applied) return;
        } catch (connectError) {
          setError(connectError.message || 'Failed to connect WhatsApp call');
          setCallState('failed');
          cleanup();
          return;
        }
      }

      if (
        event.type === 'call_ended' ||
        call.status === 'rejected' ||
        call.status === 'terminated' ||
        call.status === 'failed'
      ) {
        cleanup();
        setCallState('ended');
        return;
      }

      if (call.status === 'accepted') {
        // Only mark connected if answer SDP was applied — otherwise stay ringing.
        if (answerAppliedRef.current) {
          setCallState('connected');
        } else if (isAnswerSdp(call)) {
          try {
            await applyRemoteAnswer(call);
          } catch (connectError) {
            setError(connectError.message || 'Failed to connect WhatsApp call');
            setCallState('failed');
            cleanup();
          }
        }
      } else if (call.status === 'ringing') {
        setCallState('ringing');
      }
    });

    return closeStream;
  }, [phoneNumber, conversationId, cleanup, applyRemoteAnswer]);

  useEffect(
    () => () => {
      cleanup();
    },
    [cleanup],
  );

  return {
    callState,
    error,
    notice,
    remoteAudioRef,
    startCall,
    endCall,
    resetCall,
    isInCall:
      callState === 'calling' ||
      callState === 'ringing' ||
      callState === 'connected',
  };
};
