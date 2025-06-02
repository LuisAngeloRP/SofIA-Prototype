import React from 'react';
import { AgentStats } from '@/types';

interface StatusIndicatorProps {
  isConnected: boolean;
  agentStats: AgentStats | null;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ isConnected, agentStats }) => {
  return (
    <div className="flex items-center space-x-2">
      {/* Connection Status */}
      <div className="flex items-center space-x-1">
        <div className={`w-2 h-2 rounded-full ${
          isConnected ? 'bg-green-500' : 'bg-red-500'
        }`} />
        <span className="text-xs text-gray-500">
          {isConnected ? 'Conectado' : 'Desconectado'}
        </span>
      </div>

      {/* AI Status */}
      {agentStats && (
        <div className="flex items-center space-x-1">
          <div className="text-xs text-gray-500">•</div>
          <div className={`w-2 h-2 rounded-full ${
            agentStats.perplexityConfigured ? 'bg-blue-500' : 'bg-yellow-500'
          }`} />
          <span className="text-xs text-gray-500" title={
            agentStats.perplexityConfigured 
              ? 'IA Perplexity activada' 
              : 'Modo local'
          }>
            {agentStats.perplexityConfigured ? 'IA Pro' : 'IA Local'}
          </span>
        </div>
      )}

      {/* Image Recognition Status */}
      {agentStats?.imageRecognitionConfigured && (
        <div className="flex items-center space-x-1">
          <span className="text-xs" title="Reconocimiento de imágenes activado">
            📷
          </span>
        </div>
      )}
    </div>
  );
};

export default StatusIndicator; 