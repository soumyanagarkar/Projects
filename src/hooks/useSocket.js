import { useEffect, useRef } from 'react';
import { getSocket } from '../utils/socketUtils';
import { useAuthStore } from '../stores/useStore';

// Generic hook to get a shared Socket.io instance wired to the current auth token.

export const useSocket = () => {
  const { token, user } = useAuthStore();
  const socketRef = useRef(null);

  useEffect(() => {
    const instance = getSocket(token);
    socketRef.current = instance;

    if (user?.id) {
      instance.emit('identify', user.id);
    }

    return () => {
      // We keep the singleton alive for the app lifetime, so no disconnect here.
    };
  }, [token, user?.id]);

  return socketRef.current;
};

