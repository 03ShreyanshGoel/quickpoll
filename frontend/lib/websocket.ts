const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws';

export type WebSocketMessageHandler = (data: any) => void;

class WebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000;
  private listeners: Map<string, Set<WebSocketMessageHandler>> = new Map();
  private isIntentionallyClosed = false;

  connect() {
    if (typeof window === 'undefined') {
      console.warn('⚠️ WebSocket only available in browser');
      return;
    }

    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('✅ WebSocket already connected');
      return;
    }

    if (this.ws?.readyState === WebSocket.CONNECTING) {
      console.log('⏳ WebSocket already connecting...');
      return;
    }

    this.isIntentionallyClosed = false;

    try {
      console.log(`🔌 Connecting to WebSocket: ${WS_URL}`);
      this.ws = new WebSocket(WS_URL);

      this.ws.onopen = () => {
        console.log('✅ WebSocket connected successfully!');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('📨 WebSocket message received:', message);
          this.notifyListeners(message.type, message.data);
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
      };

      this.ws.onclose = (event) => {
        console.log(`🔌 WebSocket disconnected (Code: ${event.code})`);
        this.ws = null;
        
        if (!this.isIntentionallyClosed) {
          this.attemptReconnect();
        }
      };
    } catch (error) {
      console.error('❌ Error creating WebSocket:', error);
      this.attemptReconnect();
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts && !this.isIntentionallyClosed) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * this.reconnectAttempts;
      console.log(`🔄 Reconnecting in ${delay}ms... (Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      setTimeout(() => this.connect(), delay);
    } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached');
    }
  }

  on(eventType: string, handler: WebSocketMessageHandler) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)?.add(handler);
    console.log(`👂 Listener registered for: "${eventType}" (Total: ${this.listeners.get(eventType)?.size})`);
  }

  off(eventType: string, handler: WebSocketMessageHandler) {
    this.listeners.get(eventType)?.delete(handler);
    console.log(`🔇 Listener removed for: "${eventType}"`);
  }

  private notifyListeners(eventType: string, data: any) {
    const handlers = this.listeners.get(eventType);
    if (handlers && handlers.size > 0) {
      console.log(`🔔 Notifying ${handlers.size} listener(s) for: "${eventType}"`);
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`❌ Error in listener for "${eventType}":`, error);
        }
      });
    } else {
      console.warn(`⚠️ No listeners for: "${eventType}"`);
    }
  }

  disconnect() {
    this.isIntentionallyClosed = true;
    if (this.ws) {
      console.log('👋 Closing WebSocket');
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const wsManager = new WebSocketManager();

// Auto-connect when module loads
if (typeof window !== 'undefined') {
  console.log('🚀 WebSocket module loaded - connecting...');
  wsManager.connect();
}