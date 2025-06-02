'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Message } from '@/types';
import { useSocket } from '@/hooks/useSocket';
import { apiClient } from '@/lib/api';
import { generateSessionId } from '@/lib/utils';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import StatusIndicator from './StatusIndicator';

interface ChatInterfaceProps {
  className?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ className = '' }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId] = useState(() => generateSessionId());
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { isConnected, agentStats, sendMessage: sendSocketMessage } = useSocket({
    sessionId,
    onMessage: (message: Message) => {
      setMessages(prev => [...prev, message]);
      setIsLoading(false);
    },
    onError: (error) => {
      console.error('Socket error:', error);
      setIsLoading(false);
    },
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load conversation history on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await apiClient.getConversationHistory(sessionId);
        if (history.messages) {
          setMessages(history.messages);
        }
      } catch (error) {
        console.error('Error loading conversation history:', error);
      }
    };

    loadHistory();
  }, [sessionId]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      if (isConnected) {
        // Use WebSocket if connected
        sendSocketMessage(content.trim());
      } else {
        // Fallback to HTTP API
        const response = await apiClient.sendMessage(content.trim(), sessionId);
        if (response.response) {
          const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: 'bot',
            content: response.response,
            timestamp: response.timestamp,
          };
          setMessages(prev => [...prev, botMessage]);
        }
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'Lo siento, hubo un error procesando tu mensaje. ¿Podrías intentarlo de nuevo?',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
    }
  };

  const handleSendImage = async (imageFile: File, caption?: string) => {
    setIsLoading(true);

    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target?.result as string;
        
        const userMessage: Message = {
          id: Date.now().toString(),
          type: 'user',
          content: caption || 'Imagen enviada',
          timestamp: new Date().toISOString(),
          isImage: true,
          imageData: base64Data,
        };

        setMessages(prev => [...prev, userMessage]);

        try {
          const response = await apiClient.sendImage(
            base64Data,
            caption || '',
            sessionId,
            true
          );

          if (response.response) {
            const botMessage: Message = {
              id: (Date.now() + 1).toString(),
              type: 'bot',
              content: response.response,
              timestamp: response.timestamp,
            };
            setMessages(prev => [...prev, botMessage]);
          }
        } catch (error) {
          console.error('Error sending image:', error);
          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: 'bot',
            content: 'Lo siento, no pude procesar tu imagen. ¿Podrías intentarlo de nuevo?',
            timestamp: new Date().toISOString(),
          };
          setMessages(prev => [...prev, errorMessage]);
        }

        setIsLoading(false);
      };

      reader.readAsDataURL(imageFile);
    } catch (error) {
      console.error('Error processing image:', error);
      setIsLoading(false);
    }
  };

  const handleClearChat = async () => {
    try {
      await apiClient.clearConversation(sessionId);
      setMessages([]);
    } catch (error) {
      console.error('Error clearing conversation:', error);
    }
  };

  return (
    <div className={`flex flex-col h-full bg-gray-50 ${className}`}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
              S
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">SofIA Finance Advisor</h1>
              <p className="text-sm text-gray-500">Tu asesora financiera personal con IA</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <StatusIndicator
              isConnected={isConnected}
              agentStats={agentStats}
            />
            <button
              onClick={handleClearChat}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              title="Limpiar conversación"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
              💰
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              ¡Hola! Soy SofIA 👋
            </h2>
            <p className="text-gray-500 max-w-md mx-auto">
              Tu asesora financiera personal con inteligencia artificial. 
              Puedo ayudarte con presupuestos, análisis de gastos, consejos de inversión y más. 
              También puedo analizar imágenes de recibos y estados de cuenta.
            </p>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
              <button
                onClick={() => handleSendMessage('¿Cómo puedes ayudarme con mis finanzas?')}
                className="p-3 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
              >
                ¿Cómo puedes ayudarme?
              </button>
              <button
                onClick={() => handleSendMessage('Quiero hacer un presupuesto mensual')}
                className="p-3 text-sm bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors"
              >
                Crear presupuesto
              </button>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white p-4">
        <MessageInput
          onSendMessage={handleSendMessage}
          onSendImage={handleSendImage}
          disabled={isLoading}
          placeholder="Escribe tu mensaje o sube una imagen financiera..."
        />
      </div>
    </div>
  );
};

export default ChatInterface; 