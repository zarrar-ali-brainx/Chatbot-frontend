import React, { useState, useRef, useEffect } from 'react';
import { ChatSession } from '../types';

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  onSessionSelect: (session: ChatSession) => void;
  onNewSession: () => void;
  onDeleteSession: (session: ChatSession) => void;
  chatType: 'general' | 'custom';
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  isOpen,
  onClose,
  sessions,
  currentSession,
  onSessionSelect,
  onNewSession,
  onDeleteSession,
  chatType
}) => {
  const [hoveredSession, setHoveredSession] = useState<number | null>(null);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const ellipsesButtonRef = useRef<HTMLButtonElement>(null);
  
  // Filter sessions by current chat type
  const filteredSessions = sessions.filter(session => session.chat_type === chatType);

  // Close dropdown when clicking outside - temporarily disabled for debugging
  // useEffect(() => {
  //   const handleClickOutside = (event: MouseEvent) => {
  //     const target = event.target as Node;
  //     const isClickInsideDropdown = dropdownRef.current && dropdownRef.current.contains(target);
  //     const isClickOnEllipses = ellipsesButtonRef.current && ellipsesButtonRef.current.contains(target);
      
  //     if (!isClickInsideDropdown && !isClickOnEllipses) {
  //       console.log('Clicking outside dropdown, closing it');
  //       setOpenDropdown(null);
  //     }
  //   };

  //   if (openDropdown !== null) {
  //     document.addEventListener('mousedown', handleClickOutside);
  //   }

  //   return () => {
  //     document.removeEventListener('mousedown', handleClickOutside);
  //   };
  // }, [openDropdown]);

  const handleDropdownToggle = (sessionId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Ellipses clicked for session:', sessionId);
    setOpenDropdown(openDropdown === sessionId ? null : sessionId);
  };

  const handleDeleteClick = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Delete clicked for session:', session);
    setOpenDropdown(null);
    onDeleteSession(session);
  };

  return (
    <>
      {/* Backdrop removed - allows interaction with chat area */}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-slate-50 border-r border-slate-200 text-slate-800 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 bg-white">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">
                {chatType === 'general' ? 'General Chat' : 'Document RAG'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* New Chat Button */}
          <div className="p-4">
            <button
              onClick={onNewSession}
              className="w-full flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-3 rounded-lg transition-colors shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>New Chat</span>
            </button>
          </div>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto px-4">
            {filteredSessions.length === 0 ? (
              <div className="text-center text-slate-500 py-8">
                <div className="text-4xl mb-2">💬</div>
                <p className="text-sm">No conversations yet</p>
                <p className="text-xs mt-1">Start a new chat to see it here</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredSessions.map((session) => (
                  <div
                    key={session.id}
                    className={`relative flex items-center justify-between p-3 rounded-lg transition-colors ${
                      currentSession?.id === session.id
                        ? 'bg-primary-50 border border-primary-200 text-primary-900'
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                    onMouseEnter={() => setHoveredSession(session.id)}
                    onMouseLeave={() => setHoveredSession(null)}
                  >
                    <button
                      onClick={() => onSessionSelect(session)}
                      className="flex-1 text-left flex items-center space-x-3"
                    >
                      <div className="flex-shrink-0 w-6 h-6 bg-slate-200 rounded flex items-center justify-center text-xs">
                        💬
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {session.session_name || `Chat ${session.id}`}
                        </p>
                      </div>
                    </button>
                    
                    {/* Ellipses Dropdown Button */}
                    <div className="relative flex items-center" ref={dropdownRef}>
                      <button
                        ref={ellipsesButtonRef}
                        onClick={(e) => handleDropdownToggle(session.id, e)}
                        className={`p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded transition-all duration-200 flex-shrink-0 ${
                          hoveredSession === session.id ? 'opacity-100' : 'opacity-50'
                        }`}
                        title="More options"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>
                      
                      {/* Dropdown Menu */}
                      {openDropdown === session.id && (
                        <div className="absolute right-0 top-10 w-48 bg-white rounded-md shadow-xl z-[9999] border border-slate-200">
                          <div className="py-1">
                            <div className="px-4 py-2 text-xs text-slate-500 border-b border-slate-200">
                              Session ID: {session.id}
                            </div>
                            <button
                              onClick={(e) => handleDeleteClick(session, e)}
                              className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                            >
                              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete conversation
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 bg-white">
            <div className="text-xs text-slate-500 text-center">
              {filteredSessions.length} conversation{filteredSessions.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatSidebar;
