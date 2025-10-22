import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
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
  selectSession: (session: ChatSession) => void;
  clearMessages: () => void;
  getMessagesForChatType: (chatType: 'general' | 'custom') => ChatMessage[];
  clearMessagesForChatType: (chatType: 'general' | 'custom') => void;
  deleteSession: (sessionId: number) => Promise<void>;
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
      if (responseData.sessionId) {
        // Always update the current session with the response sessionId
        setCurrentSession({
          id: responseData.sessionId,
          chat_type: chatType,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        // Refresh sessions list to show the new session
        loadSessions();
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

  const loadSessions = useCallback(async () => {
    try {
      const response = await chatService.getSessions();
      setSessions(response as ChatSession[]);
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  }, []); // Empty dependency array since it doesn't depend on any props or state

  const loadSessionMessages = useCallback(async (sessionId: number, chatType?: 'general' | 'custom') => {
    try {
      const response = await chatService.getSessionMessages(sessionId);
      const messages = response as ChatMessage[];
      
      // Use provided chatType or find the session to determine chat type
      let sessionChatType = chatType;
      if (!sessionChatType) {
        const session = sessions.find(s => s.id === sessionId);
        sessionChatType = session?.chat_type;
      }
      
      // Clear all message states first
      setMessages([]);
      setGeneralMessages([]);
      setRagMessages([]);
      
      // Then set the messages for the correct chat type
      if (sessionChatType) {
        if (sessionChatType === 'general') {
          setGeneralMessages(messages);
        } else {
          setRagMessages(messages);
        }
      }
      
      // Also set the main messages for backward compatibility
      setMessages(messages);
    } catch (error) {
      console.error('Error loading session messages:', error);
    }
  }, [sessions]); // Depends on sessions array

  const createNewSession = useCallback(async (chatType: 'general' | 'custom') => {
    // Clear the current session and all messages
    setCurrentSession(null);
    setMessages([]);
    setGeneralMessages([]);
    setRagMessages([]);
  }, []); // No dependencies needed

  const selectSession = async (session: ChatSession) => {
    setCurrentSession(session);
    // Load messages for the selected session with the correct chat type
    await loadSessionMessages(session.id, session.chat_type);
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

  // Delete a session
  const deleteSession = useCallback(async (sessionId: number) => {
    try {
      await chatService.deleteSession(sessionId);
      
      // Remove session from sessions list
      setSessions(prev => prev.filter(session => session.id !== sessionId));
      
      // If the deleted session was the current session, clear it
      if (currentSession && currentSession.id === sessionId) {
        setCurrentSession(null);
        setMessages([]);
        setGeneralMessages([]);
        setRagMessages([]);
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      throw error; // Re-throw so UI can handle the error
    }
  }, [currentSession]);

  const value = {
    messages,
    sessions,
    currentSession,
    loading,
    sendMessage,
    loadSessions,
    loadSessionMessages,
    createNewSession,
    selectSession,
    clearMessages,
    getMessagesForChatType,
    clearMessagesForChatType,
    deleteSession,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
