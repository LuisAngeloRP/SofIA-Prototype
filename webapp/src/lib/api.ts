import { ApiResponse, HealthCheckResponse, ConversationHistory } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  async healthCheck(): Promise<HealthCheckResponse> {
    return this.request<HealthCheckResponse>('/health');
  }

  async sendMessage(message: string, sessionId: string): Promise<ApiResponse> {
    return this.request<ApiResponse>('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message, sessionId }),
    });
  }

  async sendImage(
    imageData: string,
    message: string = '',
    sessionId: string,
    isBase64: boolean = true
  ): Promise<ApiResponse> {
    return this.request<ApiResponse>('/api/chat/image', {
      method: 'POST',
      body: JSON.stringify({ imageData, message, sessionId, isBase64 }),
    });
  }

  async getConversationHistory(sessionId: string): Promise<ConversationHistory> {
    return this.request<ConversationHistory>(`/api/conversation/${sessionId}`);
  }

  async clearConversation(sessionId: string): Promise<{ message: string; timestamp: string }> {
    return this.request(`/api/conversation/${sessionId}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();
export default apiClient; 