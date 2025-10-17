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
  getMessagesForChatType: (chatType: 'general' | 'custom') => ChatMessage[];
  clearMessagesForChatType: (chatType: 'general' | 'custom') => void;
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
  
  // Separate message states for different chat types
  const [generalMessages, setGeneralMessages] = useState<ChatMessage[]>([]);
  const [ragMessages, setRagMessages] = useState<ChatMessage[]>([]);

  const sendMessage = async (message: string, chatType: 'general' | 'custom') => {
    setLoading(true);
    
    // Add user message to UI immediately
    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };
    
    // Add to appropriate message state based on chat type
    if (chatType === 'general') {
      setGeneralMessages(prev => [...prev, userMessage]);
    } else {
      setRagMessages(prev => [...prev, userMessage]);
    }

    try {
      const request: ChatRequest = {
        message,
        sessionId: currentSession?.id?.toString(),
        chatType,
      };

      const response = chatType === 'general' 
        ? await chatService.sendGeneralMessage(request)
        : await chatService.sendRagMessage(request);

        const responseData = response as { response: string; sessionId: number; sources?: any[]};

      // Add assistant response
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: responseData.response,
        timestamp: new Date().toISOString(),
        metadata: responseData.sources,
      };
      
      // Add to appropriate message state based on chat type
      if (chatType === 'general') {
        setGeneralMessages(prev => [...prev, assistantMessage]);
      } else {
        setRagMessages(prev => [...prev, assistantMessage]);
      }
      
      // Update current session if new one was created
      if (responseData.sessionId && (!currentSession || currentSession.chat_type !== chatType)) {
        setCurrentSession({
          id: responseData.sessionId,
          chat_type: chatType,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove the user message on error
      if (chatType === 'general') {
        setGeneralMessages(prev => prev.slice(0, -1));
      } else {
        setRagMessages(prev => prev.slice(0, -1));
      }
    } finally {
      setLoading(false);
    }
  };

  const loadSessions = async () => {
    try {
      const response = await chatService.getSessions();
      setSessions(response as ChatSession[]);
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const loadSessionMessages = async (sessionId: number) => {
    try {
      const response = await chatService.getSessionMessages(sessionId);
      setMessages(response as ChatMessage[]);
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
    setGeneralMessages([]);
    setRagMessages([]);
  };

  // Get messages for current chat type
  const getMessagesForChatType = (chatType: 'general' | 'custom') => {
    return chatType === 'general' ? generalMessages : ragMessages;
  };

  // Clear messages for specific chat type
  const clearMessagesForChatType = (chatType: 'general' | 'custom') => {
    if (chatType === 'general') {
      setGeneralMessages([]);
    } else {
      setRagMessages([]);
    }
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
    getMessagesForChatType,
    clearMessagesForChatType,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
