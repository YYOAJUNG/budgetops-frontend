import { create } from 'zustand';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string; // ISO string or human-readable
  isRead: boolean;
  importance?: 'low' | 'normal' | 'high';
  service?: string; // 서비스 구분 (예: 'AWS EC2', 'GCP Compute', 'Cost')
  provider?: 'AWS' | 'GCP' | 'Azure' | 'NCP'; // 클라우드 제공자
}

interface NotificationsState {
  notifications: AppNotification[];
  setNotifications: (items: AppNotification[]) => void;
  markAllRead: () => void;
  markReadById: (id: string) => void;
  unreadCount: () => number;
  loadFromStorage: () => void;
  persistToStorage: () => void;
}

const STORAGE_KEY = 'budgetops.notifications';

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  setNotifications: (items: AppNotification[]) => {
    set({ notifications: items });
    get().persistToStorage();
  },
  markAllRead: () => {
    set(state => ({
      notifications: state.notifications.map(n => ({ ...n, isRead: true })),
    }));
    get().persistToStorage();
  },
  markReadById: (id: string) => {
    set(state => ({
      notifications: state.notifications.map(n =>
        n.id === id ? { ...n, isRead: true } : n
      ),
    }));
    get().persistToStorage();
  },
  unreadCount: () => {
    return get().notifications.filter(n => !n.isRead).length;
  },
  loadFromStorage: () => {
    try {
      if (typeof window === 'undefined') return;
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as AppNotification[];
      set({ notifications: parsed });
    } catch {
      // ignore storage parse errors
    }
  },
  persistToStorage: () => {
    try {
      if (typeof window === 'undefined') return;
      const toSave = JSON.stringify(get().notifications);
      window.localStorage.setItem(STORAGE_KEY, toSave);
    } catch {
      // ignore storage write errors
    }
  },
}));


