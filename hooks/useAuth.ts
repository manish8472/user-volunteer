import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore, User } from '@/stores/authStore';
import axiosInstance from '@/lib/axios';
import { AxiosError } from 'axios';

// Types for API requests/responses
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface RefreshResponse {
  accessToken: string;
  user: User;
}

export interface AuthError {
  message: string;
  code?: string;
}

/**
 * Custom hook that provides authentication functionality
 * Wraps the auth store and provides login, logout, refresh, and user queries
 */
export const useAuth = () => {
  const queryClient = useQueryClient();
  const { user, accessToken, isAuthenticated, setAuth, clearAuth } = useAuthStore();

  // Login mutation
  const loginMutation = useMutation<LoginResponse, AxiosError<AuthError>, LoginCredentials>({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await axiosInstance.post<LoginResponse>('/api/auth/login', credentials);
      return response.data;
    },
    onSuccess: (data) => {
      // Update auth store with token and user
      setAuth(data.accessToken, data.user);
      
      // Invalidate and refetch any queries that depend on auth
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error) => {
      // Clear any stale auth state on login failure
      clearAuth();
    },
  });

  // Logout mutation
  const logoutMutation = useMutation<void, AxiosError<AuthError>, void>({
    mutationFn: async () => {
      await axiosInstance.post('/api/auth/logout');
    },
    onSuccess: () => {
      // Clear auth state
      clearAuth();
      
      // Clear all queries on logout
      queryClient.clear();
    },
    onError: () => {
      // Even if API call fails, clear local state
      clearAuth();
      queryClient.clear();
    },
  });

  // Refresh token mutation
  const refreshMutation = useMutation<RefreshResponse, AxiosError<AuthError>, void>({
    mutationFn: async () => {
      const response = await axiosInstance.post<RefreshResponse>('/api/auth/refresh');
      return response.data;
    },
    onSuccess: (data) => {
      // Update auth store with new token and user
      setAuth(data.accessToken, data.user);
    },
    onError: () => {
      // Clear auth if refresh fails
      clearAuth();
    },
  });

  // Get current user query (useful for fetching fresh user data)
  const userQuery = useQuery<User, AxiosError<AuthError>>({
    queryKey: ['user', user?.id],
    queryFn: async () => {
      const response = await axiosInstance.get<User>('/api/auth/me');
      return response.data;
    },
    enabled: isAuthenticated && !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Wrapper functions for cleaner API
  const login = async (credentials: LoginCredentials) => {
    return loginMutation.mutateAsync(credentials);
  };

  const logout = async () => {
    return logoutMutation.mutateAsync();
  };

  const refresh = async () => {
    return refreshMutation.mutateAsync();
  };

  const getUser = () => {
    return userQuery.data || user;
  };

  return {
    // State
    user,
    accessToken,
    isAuthenticated,
    
    // Actions
    login,
    logout,
    refresh,
    getUser,
    
    // Mutation/Query states
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isRefreshing: refreshMutation.isPending,
    isFetchingUser: userQuery.isFetching,
    
    loginError: loginMutation.error,
    logoutError: logoutMutation.error,
    refreshError: refreshMutation.error,
    userError: userQuery.error,
    
    // Reset errors
    resetLoginError: loginMutation.reset,
    resetLogoutError: logoutMutation.reset,
    resetRefreshError: refreshMutation.reset,
  };
};

export default useAuth;
