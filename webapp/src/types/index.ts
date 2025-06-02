export interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: string;
  isImage?: boolean;
  imageData?: string;
}

export interface ChatSession {
  sessionId: string;
  messages: Message[];
  isConnected: boolean;
}

export interface ApiResponse<T = any> {
  response?: string;
  timestamp: string;
  error?: string;
  data?: T;
}

export interface AgentStats {
  perplexityConfigured: boolean;
  imageRecognitionConfigured: boolean;
  serviceStats?: {
    model: string;
    searchContextSize: number;
  };
  imageServiceStats?: {
    model: string;
    supportedFormats: string[];
    maxImageSize: string;
  };
}

export interface HealthCheckResponse {
  status: string;
  platform: string;
  version: string;
  ai: {
    perplexityConfigured: boolean;
    imageRecognitionConfigured: boolean;
  };
}

export interface ConversationHistory {
  sessionId: string;
  messages: Message[];
  timestamp: string;
} 