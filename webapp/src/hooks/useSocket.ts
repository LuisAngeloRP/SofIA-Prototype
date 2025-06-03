'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Message, AgentStats } from '@/types';

interface UseSocketProps {
  sessionId: string;
  onMessage?: (message: Message) => void;
  onAgentStatus?: (stats: AgentStats) => void;
  onError?: (error: { message: string }) => void;
}

export const useSocket = ({
  sessionId,
  onMessage,
  onAgentStatus,
  onError,
}: UseSocketProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [agentStats, setAgentStats] = useState<AgentStats | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Crear callbacks estables para evitar reconexiones innecesarias
  const stableOnMessage = useCallback((message: Message) => {
    console.log('📨 Mensaje recibido:', message);
    onMessage?.(message);
  }, [onMessage]);

  const stableOnAgentStatus = useCallback((stats: AgentStats) => {
    console.log('🤖 Estado del agente:', stats);
    setAgentStats(stats);
    onAgentStatus?.(stats);
  }, [onAgentStatus]);

  const stableOnError = useCallback((error: { message: string }) => {
    console.error('❌ Error del socket:', error);
    onError?.(error);
  }, [onError]);

  useEffect(() => {
    // Solo crear una nueva conexión si no existe
    if (socketRef.current?.connected) {
      console.log('🔄 Socket ya conectado, reutilizando conexión');
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    console.log('🔌 Creando nueva conexión socket a:', apiUrl);
    
    // Crear conexión socket con configuraciones optimizadas
    socketRef.current = io(apiUrl, {
      transports: ['websocket', 'polling'],
      // Reducir la frecuencia de reconexión automática
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
      reconnectionAttempts: 5,
      timeout: 20000,
      // Configuración para evitar spam
      forceNew: false,
      autoConnect: true,
    });

    const socket = socketRef.current;

    // Event listeners
    socket.on('connect', () => {
      console.log('✅ Conectado al socket:', socket.id);
      setIsConnected(true);
      
      // Unirse a la sesión
      socket.emit('join-session', sessionId);
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Desconectado del socket, razón:', reason);
      setIsConnected(false);
    });

    socket.on('message', stableOnMessage);
    socket.on('agent-status', stableOnAgentStatus);
    socket.on('error', stableOnError);

    socket.on('connect_error', (error: Error) => {
      console.error('❌ Error de conexión:', error.message);
      setIsConnected(false);
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Reconectado después de', attemptNumber, 'intentos');
      setIsConnected(true);
      // Re-unirse a la sesión después de reconexión
      socket.emit('join-session', sessionId);
    });

    socket.on('reconnect_error', (error) => {
      console.error('❌ Error de reconexión:', error.message);
    });

    socket.on('reconnect_failed', () => {
      console.error('❌ Falló la reconexión después de todos los intentos');
      setIsConnected(false);
    });

    // Cleanup
    return () => {
      console.log('🧹 Limpiando conexión socket');
      if (socket) {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('message');
        socket.off('agent-status');
        socket.off('error');
        socket.off('connect_error');
        socket.off('reconnect');
        socket.off('reconnect_error');
        socket.off('reconnect_failed');
        socket.disconnect();
      }
    };
  }, [sessionId, stableOnMessage, stableOnAgentStatus, stableOnError]);

  const sendMessage = useCallback((message: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('send-message', {
        message,
        sessionId,
      });
    } else {
      console.warn('⚠️ Socket no conectado, no se puede enviar mensaje');
    }
  }, [isConnected, sessionId]);

  const reconnect = useCallback(() => {
    if (socketRef.current) {
      console.log('🔄 Intentando reconectar manualmente...');
      socketRef.current.connect();
    }
  }, []);

  return {
    isConnected,
    agentStats,
    sendMessage,
    reconnect,
    socket: socketRef.current,
  };
}; 