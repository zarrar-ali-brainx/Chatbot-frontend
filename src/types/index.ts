export interface User {
  id: number;
  email: string;
  name: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface ChatMessage {
  id?: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  metadata?: Record<string, any>;
}

export interface ChatSession {
  id: number;
  session_name?: string;
  chat_type: 'general' | 'custom';
  created_at: string;
  updated_at: string;
  lastMessage?: {
    id: number;
    content: string;
    role: string;
    created_at: string;
  };
}

export interface Document {
  id: number;
  original_name: string;
  file_type: string;
  file_size: number;
  created_at: string;
}

export interface ChatRequest {
  message: string;
  sessionId?: string;
  chatType: 'general' | 'custom';
}
