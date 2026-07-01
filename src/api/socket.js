import { io } from 'socket.io-client';

const SOCKET_URL =
  import.meta.env.VITE_MARKETING_AUTOMATION_SOCKET_URL ||
  import.meta.env.VITE_MARKETING_AUTOMATION_API_URL?.replace(/\/api\/?$/, '') ||
  'http://localhost:3000';

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });
  }

  return socket;
};
