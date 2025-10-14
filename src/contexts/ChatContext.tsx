import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ChatMessage, ChatSession, ChatRequest } from '../types';
import { chatService } from '../services/api';

interface ChatContextType {
  messages: ChatMessage[];
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  loading: boolean;
  sendMessage: (message: string, chatType: 'general' | 'custom') => Promise<void>;
  loadSessions: () => Promise<void>;
  loadSessionMessages: (sessionId: number) => Promise<void>;
  createNewSession: (chatType: 'general' | 'custom') => void;
  clearMessages: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (message: string, chatType: 'general' | 'custom') => {
    setLoading(true);
    
    // Add user message to UI immediately
    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const request: ChatRequest = {
        message,
        sessionId: currentSession?.id,
        chatType,
      };

      const response = chatType === 'general' 
        ? await chatService.sendGeneralMessage(request)
        : await chatService.sendCustomMessage(request);

      // Add assistant response
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.message,
        timestamp: new Date().toISOString(),
        metadata: response.metadata,
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Update current session if new one was created
      if (response.sessionId && !currentSession) {
        setCurrentSession({
          id: response.sessionId,
          chat_type: chatType,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove the user message on error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const loadSessions = async () => {
    try {
      const response = await chatService.getSessions();
      setSessions(response);
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const loadSessionMessages = async (sessionId: number) => {
    try {
      const response = await chatService.getSessionMessages(sessionId);
      setMessages(response);
    } catch (error) {
      console.error('Error loading session messages:', error);
    }
  };

  const createNewSession = (chatType: 'general' | 'custom') => {
    setCurrentSession(null);
    setMessages([]);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const value = {
    messages,
    sessions,
    currentSession,
    loading,
    sendMessage,
    loadSessions,
    loadSessionMessages,
    createNewSession,
    clearMessages,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
