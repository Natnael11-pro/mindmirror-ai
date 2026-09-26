// src/store/chatStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Message } from '../services/aiService';
import { getAIResponse, detectEmotion, checkSafety } from '../services/aiService';

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
  personality: string; // New state for communication style
  
  // Actions
  addMessage: (message: Message) => void;
  sendMessage: (content: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setEmotion: (emotion: string) => void;
  setPersonality: (personality: string) => void; // New action
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
      activeConversationId: null,
      isLoading: false,
      currentEmotion: 'neutral',
      sidebarOpen: true,
      personality: 'empathetic', // Default personality

      getActiveConversation: () => {
        const state = get();
        return state.conversations.find(c => c.id === state.activeConversationId) || null;
      },

      addMessage: (message) => set((state) => {
        const updatedConversations = state.conversations.map(conv => {
          if (conv.id === state.activeConversationId) {
            let newTitle = conv.title;
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

      setPersonality: (personality) => set({ personality }), // New action implementation

      sendMessage: async (content: string) => {
        const userMessage: Message = { role: 'user', content };
        
        // 1. Check for safety/crisis FIRST
        const safetyCheck = checkSafety(content);
        
        get().addMessage(userMessage);
        get().setLoading(true);

        try {
          if (safetyCheck.isCrisis) {
            // If it's a crisis, bypass the AI and send the safety message
            await new Promise(resolve => setTimeout(resolve, 1000)); // Fake delay for realism
            get().addMessage({ role: 'assistant', content: safetyCheck.message });
          } else {
            // Normal AI flow
            const detectedEmotion = detectEmotion(content);
            get().setEmotion(detectedEmotion);

            const activeConv = get().getActiveConversation();
            if (!activeConv) return;

            // Pass the current personality to the AI
            const aiText = await getAIResponse(activeConv.messages, get().personality);
            get().addMessage({ role: 'assistant', content: aiText });
          }
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
          sidebarOpen: true
        };
      }),

      selectConversation: (id) => set((state) => {
        const conversation = state.conversations.find(c => c.id === id);
        return {
          activeConversationId: id,
          currentEmotion: conversation?.emotion || 'neutral',
          sidebarOpen: window.innerWidth < 1024 ? false : state.sidebarOpen
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
      name: 'mindmirror-storage',
      partialize: (state) => ({ 
        conversations: state.conversations, 
        activeConversationId: state.activeConversationId,
        personality: state.personality // Save personality preference
      }),
    }
  )
);

const initialState = useChatStore.getState();
if (!initialState.activeConversationId && initialState.conversations.length > 0) {
  useChatStore.setState({ activeConversationId: initialState.conversations[0].id });
}