import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../contexts/ChatContext';

const Chat: React.FC = () => {
  const [message, setMessage] = useState('');
  const [chatType, setChatType] = useState<'general' | 'custom'>('general');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { loading, sendMessage, getMessagesForChatType, clearMessagesForChatType } = useChat();

  // Get messages for current chat type
  const currentMessages = getMessagesForChatType(chatType);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);

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

  const handleChatTypeChange = (newChatType: 'general' | 'custom') => {
    setChatType(newChatType);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
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
                {msg.timestamp && (
                  <p className={`text-xs mt-1 ${
                    msg.role === 'user' ? 'text-primary-100' : 'text-gray-500'
                  }`}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
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

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <form onSubmit={handleSubmit} className="flex space-x-4">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={
              chatType === 'general' 
                ? 'Ask a question...' 
                : 'Ask about your documents...'
            }
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!message.trim() || loading}
            className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
