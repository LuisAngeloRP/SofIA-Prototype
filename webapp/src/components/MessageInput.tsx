'use client';

import React, { useState, useRef } from 'react';
import { isValidImageFile } from '@/lib/utils';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  onSendImage: (file: File, caption?: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onSendImage,
  disabled = false,
  placeholder = 'Escribe tu mensaje...'
}) => {
  const [message, setMessage] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileSelect = (file: File) => {
    if (isValidImageFile(file)) {
      onSendImage(file, message.trim() || undefined);
      setMessage('');
    } else {
      alert('Por favor selecciona una imagen válida (JPG, PNG, GIF, WebP) menor a 10MB');
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="flex items-end space-x-2">
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className={`w-full px-4 py-3 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
              isDragOver ? 'border-blue-500 bg-blue-50' : ''
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={{
              minHeight: '48px',
              maxHeight: '120px',
              overflowY: message.split('\n').length > 2 ? 'scroll' : 'hidden'
            }}
          />
          
          {isDragOver && (
            <div className="absolute inset-0 bg-blue-100 bg-opacity-75 rounded-2xl flex items-center justify-center">
              <div className="text-blue-600 font-medium">
                📎 Suelta tu imagen aquí
              </div>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className={`p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          title="Subir imagen"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>

        <button
          type="submit"
          disabled={disabled || !message.trim()}
          className={`p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
            disabled || !message.trim() ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          title="Enviar mensaje"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>

      {/* Hint text */}
      <div className="mt-2 text-xs text-gray-400 text-center">
        Presiona Enter para enviar • Arrastra una imagen • Máx. 10MB
      </div>
    </div>
  );
};

export default MessageInput; 