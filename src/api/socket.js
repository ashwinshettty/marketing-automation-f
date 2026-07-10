import { io } from 'socket.io-client';
import { getAuthSession } from '../utils/authStorage';

const SOCKET_URL =
  import.meta.env.VITE_MARKETING_AUTOMATION_SOCKET_URL ||
  import.meta.env.VITE_MARKETING_AUTOMATION_API_URL?.replace(/\/api\/?$/, '') ||
  'http://localhost:3000';

let socket = null;

export const getSocket = () => {
  const { token } = getAuthSession();

  if (!token) {
    return null;
  }

  if (!socket) {
    socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 500,
      reconnectionDelayMax: 5000,
    });

    socket.on('connect', () => {
      console.log('[socket] connected', socket.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('[socket] disconnected', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('[socket] connect error:', error.message);
    });
  } else if (socket.auth?.token !== token) {
    socket.auth = { token };

    if (socket.connected) {
      socket.disconnect();
    }

    socket.connect();
  }

  return socket;
};
