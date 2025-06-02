import React from 'react';
import { Message } from '@/types';
import { formatDate } from '@/lib/utils';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.type === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl`}>
        {!isUser && (
          <div className="flex items-center mb-1 space-x-2">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
              S
            </div>
            <span className="text-xs text-gray-500 font-medium">SofIA</span>
          </div>
        )}
        
        <div
          className={`rounded-2xl px-4 py-3 shadow-sm border ${
            isUser
              ? 'bg-blue-500 text-white ml-4'
              : 'bg-white text-gray-900 mr-4'
          }`}
        >
          {message.isImage && message.imageData && (
            <div className="mb-2">
              <img
                src={message.imageData}
                alt="Imagen enviada"
                className="max-w-full h-auto rounded-lg"
                style={{ maxHeight: '200px' }}
              />
            </div>
          )}
          
          <div className="whitespace-pre-wrap break-words">
            {message.content}
          </div>
          
          <div className={`text-xs mt-2 ${
            isUser ? 'text-blue-100' : 'text-gray-400'
          }`}>
            {formatDate(message.timestamp)}
          </div>
        </div>
        
        {isUser && (
          <div className="flex justify-end mt-1">
            <span className="text-xs text-gray-500">Tú</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble; 