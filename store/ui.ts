import { create } from 'zustand';

interface UIState {
  sidebarCollapsed: boolean;
  aiChatOpen: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setAIChatOpen: (open: boolean) => void;
  toggleAIChat: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  aiChatOpen: false,
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setAIChatOpen: (open) => set({ aiChatOpen: open }),
  toggleAIChat: () => set((state) => ({ aiChatOpen: !state.aiChatOpen })),
}));

