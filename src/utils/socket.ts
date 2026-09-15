import { io, type Socket } from 'socket.io-client';

import { auth } from './auth';

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  if (typeof window === 'undefined') return null;

  const token = auth.getToken();
  if (!token) {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
    return null;
  }

  if (!socket || !socket.connected) {
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000';

    socket = io(backendUrl, {
      auth: { token },
      query: { token },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socket.on('connect', () => {
      // eslint-disable-next-line no-console
      console.log('⚡ Connected to TaskFlow WebSocket server');
    });

    socket.on('connect_error', (err) => {
      // eslint-disable-next-line no-console
      console.warn('⚠️ Socket connection error:', err.message);
    });
  }

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
