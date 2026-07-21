const ICE_SERVERS = [{ urls: 'stun:stun.l.google.com:19302' }];
const ICE_GATHER_TIMEOUT_MS = 8000;

export const createAudioPeerConnection = () =>
  new RTCPeerConnection({ iceServers: ICE_SERVERS });

/**
 * Meta WhatsApp Calling rejects lowercase fingerprint algorithms (sha-256).
 * Browsers emit lowercase; normalize to SHA-256 and drop sha-384/sha-512 lines.
 */
export const normalizeWhatsAppSdp = (sdp) => {
  if (!sdp || typeof sdp !== 'string') return sdp;

  return sdp
    .split(/\r?\n/)
    .filter((line) => {
      const lower = line.toLowerCase();
      return (
        !lower.startsWith('a=fingerprint:sha-384') &&
        !lower.startsWith('a=fingerprint:sha-512')
      );
    })
    .map((line) => {
      const match = line.match(/^a=fingerprint:(sha-256)(\s+.+)$/i);
      if (match) {
        return `a=fingerprint:SHA-256${match[2]}`;
      }
      return line;
    })
    .join('\r\n');
};

export const waitForIceGathering = (peerConnection) =>
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

export const attachLocalAudio = async (peerConnection) => {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: false,
  });

  stream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, stream);
  });

  return stream;
};

export const playRemoteStream = (audioElement, event) => {
  const remoteStream =
    event.streams?.[0] ||
    (event.track ? new MediaStream([event.track]) : null);

  if (!audioElement || !remoteStream) return;

  audioElement.srcObject = remoteStream;
  audioElement.play().catch(() => {});
};

export const stopMediaStream = (stream) => {
  stream?.getTracks().forEach((track) => track.stop());
};
