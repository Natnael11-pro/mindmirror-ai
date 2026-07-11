// src/App.tsx
import { Menu, X } from 'lucide-react';
import { useChatStore } from './store/chatStore';
import { EmotionOrb } from './components/EmotionOrb';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { InputBar } from './components/InputBar';

function App() {
  const {
    sidebarOpen,
    toggleSidebar,
    conversations,
    activeConversationId,
    isLoading,
    currentEmotion,
    sendMessage,
    createNewConversation,
    selectConversation,
    deleteConversation,
    getActiveConversation
  } = useChatStore();

  const activeConversation = getActiveConversation();
  const messages = activeConversation?.messages || [];

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 overflow-hidden">
      
      {/* Sidebar - Visible on desktop, toggleable on mobile */}
      <div className={`${sidebarOpen ? 'block' : 'hidden'} lg:block w-80 flex-shrink-0`}>
        <Sidebar
          isOpen={sidebarOpen}
          onClose={toggleSidebar}
          conversations={conversations.map(conv => ({
            id: conv.id,
            title: conv.title,
            timestamp: new Date(conv.timestamp),
            messageCount: conv.messages.length
          }))}
          activeConversationId={activeConversationId}
          onSelectConversation={selectConversation}
          onNewConversation={createNewConversation}
          onDeleteConversation={deleteConversation}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        
        {/* Header */}
        <header className="h-16 border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm flex items-center justify-between px-4 lg:px-6 z-10">
          <div className="flex items-center gap-3">
            {/* Toggle Button for Mobile */}
            <button
              onClick={toggleSidebar}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors lg:hidden"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            
            {/* Desktop Toggle (Optional, keeps sidebar always open on large screens usually, but this allows hiding) */}
            <button
              onClick={toggleSidebar}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors hidden lg:block"
              title="Toggle Sidebar"
            >
              <Menu size={20} className="text-gray-400" />
            </button>

            <EmotionOrb emotion={currentEmotion} />
            <div>
              <h1 className="text-lg font-semibold text-gray-100">MindMirror AI</h1>
              <p className="text-xs text-gray-500 hidden sm:block">
                Your Emotional Companion
              </p>
            </div>
          </div>
        </header>

        {/* Chat Content */}
        <ChatWindow messages={messages} isLoading={isLoading} />
        <InputBar onSend={sendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
}

export default App;