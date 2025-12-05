import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export type UserRole = 'volunteer' | 'ngo' | 'admin' | null;

export interface User {
  id: string;
  name?: string;
  email: string;
  role: UserRole;
  isEmailVerified?: boolean;
  avatar?: string;
  createdAt?: string;
}

interface AuthState {
  // State
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;

  // Actions
  setAuth: (accessToken: string, user: User) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<User>) => void;
  setRole: (role: UserRole) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
}

// Create the auth store with Zustand
export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        accessToken: null,
        user: null,
        isAuthenticated: false,
        _hasHydrated: false,

        // Set authentication (on login or refresh)
        setAuth: (accessToken, user) =>
          set(
            {
              accessToken,
              user,
              isAuthenticated: true,
            },
            false,
            'setAuth'
          ),

        // Clear authentication (on logout or auth failure)
        clearAuth: () =>
          set(
            {
              accessToken: null,
              user: null,
              isAuthenticated: false,
            },
            false,
            'clearAuth'
          ),

        // Update user information
        updateUser: (updatedFields) =>
          set(
            (state) => ({
              user: state.user ? { ...state.user, ...updatedFields } : null,
            }),
            false,
            'updateUser'
          ),

        // Update user role
        setRole: (role) =>
          set(
            (state) => ({
              user: state.user ? { ...state.user, role } : null,
            }),
            false,
            'setRole'
          ),

        // Set hydration status
        setHasHydrated: (hasHydrated) =>
          set(
            {
              _hasHydrated: hasHydrated,
            },
            false,
            'setHasHydrated'
          ),
      }),
      {
        name: 'auth-storage', // localStorage key
        onRehydrateStorage: () => (state) => {
          state?.setHasHydrated(true);
        },
      }
    ),
    {
      name: 'AuthStore',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

// Selector hooks for better performance
export const useAccessToken = () => useAuthStore((state) => state.accessToken);
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);

export default useAuthStore;
