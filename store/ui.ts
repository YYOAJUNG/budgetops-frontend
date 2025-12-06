import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  sidebarCollapsed: boolean;
  aiChatOpen: boolean;
  mobileSidebarOpen: boolean;
  adminMode: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setAIChatOpen: (open: boolean) => void;
  toggleAIChat: () => void;
  setMobileSidebarOpen: (open: boolean) => void;
  toggleMobileSidebar: () => void;
  setAdminMode: (mode: boolean) => void;
  toggleAdminMode: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: true,
      aiChatOpen: false,
      mobileSidebarOpen: false,
      adminMode: false,
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setAIChatOpen: (open) => set({ aiChatOpen: open }),
      toggleAIChat: () => set((state) => ({ aiChatOpen: !state.aiChatOpen })),
      setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
      toggleMobileSidebar: () => set((state) => ({ mobileSidebarOpen: !state.mobileSidebarOpen })),
      setAdminMode: (mode) => set({ adminMode: mode }),
      toggleAdminMode: () => set((state) => ({ adminMode: !state.adminMode })),
    }),
    {
      name: 'budgetops-ui',
      partialize: (state) => ({ adminMode: state.adminMode }),
    }
  )
);

