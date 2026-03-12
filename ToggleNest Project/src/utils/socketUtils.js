import { io } from 'socket.io-client';

let socket = null;
const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');

export const getSocket = (token) => {
  if (!socket) {
    socket = io(API_BASE_URL, {
      auth: token ? { token } : undefined,
      withCredentials: true
    });
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

