import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AuthState {
  isAuthenticated: boolean;
  user: {
    id: string;
    name: string;
    phone: string;
    role: string;
  } | null;
  token: string | null;
  login: (token: string, user: any) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      login: (token, user) => {
        localStorage.setItem('token', token);
        set({ isAuthenticated: true, token, user });
      },
      logout: () => {
        localStorage.removeItem('token');
        set({ isAuthenticated: false, token: null, user: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);

interface AppState {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
}));
