import { useCallback, useEffect, useRef, useState } from 'react';
import { initiateWhatsAppCall, terminateCall } from '../api/whatsappApi';
import { openWhatsAppConversationStream } from '../api/whatsappEventStream';
import { normalizePhoneNumber } from '../utils/normalizePhone';

const ICE_SERVERS = [{ urls: 'stun:stun.l.google.com:19302' }];
const ICE_GATHER_TIMEOUT_MS = 3000;

const waitForIceGathering = (peerConnection) =>
  new Promise((resolve) => {
    if (peerConnection.iceGatheringState === 'complete') {
      resolve(peerConnection.localDescription);
      return;
    }

    const finish = () => {
      peerConnection.removeEventListener('icegatheringstatechange', onStateChange);
      clearTimeout(timeoutId);
      resolve(peerConnection.localDescription);
    };

    const onStateChange = () => {
      if (peerConnection.iceGatheringState === 'complete') {
        finish();
      }
    };

    const timeoutId = window.setTimeout(finish, ICE_GATHER_TIMEOUT_MS);
    peerConnection.addEventListener('icegatheringstatechange', onStateChange);
  });

export const useWhatsAppOutboundCall = ({ phoneNumber, leadId }) => {
  const [callState, setCallState] = useState('idle');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const activeCallIdRef = useRef(null);
  const conversationId = phoneNumber ? normalizePhoneNumber(phoneNumber) : '';

  const cleanup = useCallback(() => {
    peerRef.current?.close();
    peerRef.current = null;
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    activeCallIdRef.current = null;
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

  const startCall = useCallback(async () => {
    if (!phoneNumber || !conversationId) return;

    setError('');
    setNotice('');
    setCallState('calling');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      localStreamRef.current = stream;

      const peerConnection = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      peerRef.current = peerConnection;

      stream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, stream);
      });

      peerConnection.ontrack = (event) => {
        const [remoteStream] = event.streams;

        if (remoteAudioRef.current && remoteStream) {
          remoteAudioRef.current.srcObject = remoteStream;
          remoteAudioRef.current.play().catch(() => {});
        }
      };

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      const localDescription = await waitForIceGathering(peerConnection);
      const result = await initiateWhatsAppCall({
        phoneNumber,
        leadId,
        sdp: localDescription?.sdp || offer.sdp,
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

      if (
        event.type === 'outbound_call_connect' &&
        call.sdp &&
        call.sdpType === 'answer'
      ) {
        try {
          const peerConnection = peerRef.current;
          if (!peerConnection) return;

          await peerConnection.setRemoteDescription({
            type: 'answer',
            sdp: call.sdp,
          });
          setCallState('connected');
        } catch (connectError) {
          setError(connectError.message || 'Failed to connect WhatsApp call');
          setCallState('failed');
          cleanup();
        }
        return;
      }

      if (
        event.type === 'call_ended' ||
        call.status === 'rejected' ||
        call.status === 'terminated'
      ) {
        cleanup();
        setCallState('ended');
        return;
      }

      if (call.status === 'accepted') {
        setCallState('connected');
      } else if (call.status === 'ringing') {
        setCallState('ringing');
      }
    });

    return closeStream;
  }, [phoneNumber, conversationId, cleanup]);

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
