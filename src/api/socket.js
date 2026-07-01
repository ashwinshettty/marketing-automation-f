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
