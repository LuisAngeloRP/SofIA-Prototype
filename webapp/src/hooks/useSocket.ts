'use client';

import { useEffect, useRef, useState } from 'react';
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

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    // Crear conexión socket
    socketRef.current = io(apiUrl, {
      transports: ['websocket', 'polling'],
    });

    const socket = socketRef.current;

    // Event listeners
    socket.on('connect', () => {
      console.log('✅ Conectado al socket:', socket.id);
      setIsConnected(true);
      
      // Unirse a la sesión
      socket.emit('join-session', sessionId);
    });

    socket.on('disconnect', () => {
      console.log('❌ Desconectado del socket');
      setIsConnected(false);
    });

    socket.on('message', (message: Message) => {
      console.log('📨 Mensaje recibido:', message);
      onMessage?.(message);
    });

    socket.on('agent-status', (stats: AgentStats) => {
      console.log('🤖 Estado del agente:', stats);
      setAgentStats(stats);
      onAgentStatus?.(stats);
    });

    socket.on('error', (error: { message: string }) => {
      console.error('❌ Error del socket:', error);
      onError?.(error);
    });

    socket.on('connect_error', (error: Error) => {
      console.error('❌ Error de conexión:', error);
      setIsConnected(false);
    });

    // Cleanup
    return () => {
      console.log('🧹 Limpiando conexión socket');
      socket.disconnect();
    };
  }, [sessionId, onMessage, onAgentStatus, onError]);

  const sendMessage = (message: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('send-message', {
        message,
        sessionId,
      });
    } else {
      console.warn('⚠️ Socket no conectado, no se puede enviar mensaje');
    }
  };

  const reconnect = () => {
    if (socketRef.current) {
      socketRef.current.connect();
    }
  };

  return {
    isConnected,
    agentStats,
    sendMessage,
    reconnect,
    socket: socketRef.current,
  };
}; 