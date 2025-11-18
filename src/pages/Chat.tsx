import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../contexts/ChatContext';
import ChatSidebar from '../components/ChatSidebar';
import ConfirmationModal from '../components/ConfirmationModal';
import { ChatSession } from '../types';

const Chat: React.FC = () => {
  const [message, setMessage] = useState('');
  const [chatType, setChatType] = useState<'general' | 'custom'>('general');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<ChatSession | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { 
    loading, 
    isGenerating,
    cancelRequest,
    sendMessage, 
    getMessagesForChatType, 
    clearMessagesForChatType,
    sessions,
    currentSession,
    selectSession,
    createNewSession,
    loadSessions,
    deleteSession
  } = useChat();

  // Get messages for current chat type
  const currentMessages = getMessagesForChatType(chatType);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);

  useEffect(() => {
    // Load sessions when component mounts
    loadSessions();
  }, [loadSessions]); // Now safe to include loadSessions since it's memoized

  // Load sessions when chat type changes
  useEffect(() => {
    loadSessions();
  }, [chatType, loadSessions]); // Now safe to include loadSessions since it's memoized

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || loading) return;

    const messageToSend = message.trim();
    setMessage('');
    await sendMessage(messageToSend, chatType);
  };

  const handleClearChat = () => {
    clearMessagesForChatType(chatType);
  };

  const handleChatTypeChange = async (newChatType: 'general' | 'custom') => {
    // If switching chat types, create a new session for the new type
    setChatType(newChatType);
    await createNewSession(newChatType);
    // Refresh sessions to show the updated list
    await loadSessions();
  };

  const handleNewSession = async () => {
    // Create a new session (this will clear current messages and session)
    await createNewSession(chatType);
    // Refresh the sessions list to show the updated sessions
    await loadSessions();
  };

  const handleSessionSelect = async (session: ChatSession) => {
    // Update chat type to match the selected session
    setChatType(session.chat_type);
    // Select the session (this will load the messages)
    await selectSession(session);
  };

  const handleDeleteSession = (session: ChatSession) => {
    console.log('handleDeleteSession called with session:', session);
    setSessionToDelete(session);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!sessionToDelete) return;
    
    console.log('Confirming delete for session:', sessionToDelete);
    try {
      await deleteSession(sessionToDelete.id);
      console.log('Session deleted successfully');
      setShowDeleteModal(false);
      setSessionToDelete(null);
    } catch (error) {
      console.error('Failed to delete session:', error);
      setShowDeleteModal(false);
      setSessionToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setSessionToDelete(null);
  };

  return (
    <div className="flex h-[calc(100vh-8rem)]">
      {/* Sidebar */}
      <ChatSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sessions={sessions}
        currentSession={currentSession}
        onSessionSelect={handleSessionSelect}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
        chatType={chatType}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                title={sidebarOpen ? "Close Chat History" : "Open Chat History"}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-xl font-semibold text-gray-900">AI Chat</h1>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleChatTypeChange('general')}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    chatType === 'general'
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  General Chat
                </button>
                <button
                  onClick={() => handleChatTypeChange('custom')}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    chatType === 'custom'
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Document RAG
                </button>
              </div>
            </div>
          <button
            onClick={handleClearChat}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear Chat
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {currentMessages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-lg">Start a conversation with the AI</p>
            <p className="text-sm mt-2">
              {chatType === 'general' 
                ? 'Ask any general questions' 
                : 'Upload documents first, then ask questions about them'
              }
            </p>
          </div>
        ) : (
          currentMessages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-900'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                {msg.metadata && msg.metadata.length > 0 && (
                  <div className="mt-2 text-xs opacity-75">
                    <p>Sources: {msg.metadata.length}</p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-900 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-pulse">AI is thinking...</div>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="flex space-x-4">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Ask ${chatType === 'general' ? 'anything' : 'about your documents'}...`}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            disabled={loading}
          />
          {isGenerating && (
            <button
              onClick={cancelRequest}
              className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 6l12 12M6 18L18 6" />
        </svg>
        <span>Stop</span>
            </button>
          )}
          <button
            type="submit"
            disabled={!message.trim() || loading}
            className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium"
          >
            Send
          </button>
        </form>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Conversation"
        message={`Are you sure you want to delete "${sessionToDelete?.session_name || `Chat ${sessionToDelete?.id}`}"? This action cannot be undone and will permanently remove all messages in this conversation.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  </div>
  );
};

export default Chat;