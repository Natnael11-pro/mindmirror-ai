// src/store/chatStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Message } from '../services/aiService';
import { getAIResponse, detectEmotion } from '../services/aiService';

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  timestamp: number;
  emotion: string;
}

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  isLoading: boolean;
  currentEmotion: string;
  sidebarOpen: boolean;
  
  // Actions
  addMessage: (message: Message) => void;
  sendMessage: (content: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setEmotion: (emotion: string) => void;
  createNewConversation: () => void;
  selectConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  toggleSidebar: () => void;
  getActiveConversation: () => Conversation | null;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

const createInitialConversation = (): Conversation => ({
  id: generateId(),
  title: 'New Conversation',
  messages: [
    { 
      role: 'assistant', 
      content: "Hello. I'm here to listen. How are you feeling in this exact moment?" 
    }
  ],
  timestamp: Date.now(),
  emotion: 'neutral'
});

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [createInitialConversation()],
      activeConversationId: null, // Will be set in initialization
      isLoading: false,
      currentEmotion: 'neutral',
      sidebarOpen: true, // Open sidebar by default on desktop

      getActiveConversation: () => {
        const state = get();
        return state.conversations.find(c => c.id === state.activeConversationId) || null;
      },

      addMessage: (message) => set((state) => {
        const updatedConversations = state.conversations.map(conv => {
          if (conv.id === state.activeConversationId) {
            let newTitle = conv.title;
            // Auto-title based on first user message
            if (conv.messages.length === 1 && message.role === 'user') {
              newTitle = message.content.slice(0, 30) + (message.content.length > 30 ? '...' : '');
            }
            
            return {
              ...conv,
              title: newTitle,
              messages: [...conv.messages, message],
              timestamp: Date.now()
            };
          }
          return conv;
        });

        return { conversations: updatedConversations };
      }),

      setLoading: (loading) => set({ isLoading: loading }),

      setEmotion: (emotion) => set((state) => {
        const updatedConversations = state.conversations.map(conv => {
          if (conv.id === state.activeConversationId) {
            return { ...conv, emotion };
          }
          return conv;
        });
        return { conversations: updatedConversations, currentEmotion: emotion };
      }),

      sendMessage: async (content: string) => {
        const userMessage: Message = { role: 'user', content };
        
        const detectedEmotion = detectEmotion(content);
        get().setEmotion(detectedEmotion);
        
        get().addMessage(userMessage);
        get().setLoading(true);

        try {
          const activeConv = get().getActiveConversation();
          if (!activeConv) return;

          const aiText = await getAIResponse(activeConv.messages);
          get().addMessage({ role: 'assistant', content: aiText });
        } catch (error) {
          console.error("AI Error:", error);
          get().addMessage({ role: 'assistant', content: "I'm having a little trouble connecting right now. Please try again." });
        } finally {
          get().setLoading(false);
        }
      },

      createNewConversation: () => set((state) => {
        const newConversation = createInitialConversation();
        return {
          conversations: [newConversation, ...state.conversations],
          activeConversationId: newConversation.id,
          currentEmotion: 'neutral',
          sidebarOpen: true // Open sidebar when creating new chat
        };
      }),

      selectConversation: (id) => set((state) => {
        const conversation = state.conversations.find(c => c.id === id);
        return {
          activeConversationId: id,
          currentEmotion: conversation?.emotion || 'neutral',
          sidebarOpen: window.innerWidth < 1024 ? false : state.sidebarOpen // Close on mobile after select
        };
      }),

      deleteConversation: (id) => set((state) => {
        const updatedConversations = state.conversations.filter(c => c.id !== id);
        
        let newActiveId = state.activeConversationId;
        if (state.activeConversationId === id) {
          if (updatedConversations.length > 0) {
            newActiveId = updatedConversations[0].id;
          } else {
            const newConv = createInitialConversation();
            updatedConversations.push(newConv);
            newActiveId = newConv.id;
          }
        }

        return {
          conversations: updatedConversations,
          activeConversationId: newActiveId
        };
      }),

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen }))
    }),
    {
      name: 'mindmirror-storage', // Name of the item in Local Storage
      partialize: (state) => ({ 
        conversations: state.conversations, 
        activeConversationId: state.activeConversationId 
      }), // Only save these specific parts
    }
  )
);

// Initialize: If no active conversation is set (e.g., on first load), set it to the first one
const initialState = useChatStore.getState();
if (!initialState.activeConversationId && initialState.conversations.length > 0) {
  useChatStore.setState({ activeConversationId: initialState.conversations[0].id });
}