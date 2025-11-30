# Auth Infrastructure Documentation

This document describes the core authentication and API client infrastructure built with Axios, React Query, and Zustand.

## Overview

The authentication system provides:
- **Axios instance** with automatic token injection and refresh
- **React Query** integration for data fetching and caching
- **Zustand store** for in-memory auth state management
- **useAuth hook** for easy auth operations

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Application Layer                      │
│                  (Components using useAuth)                  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                       useAuth Hook                          │
│  • login(credentials)                                       │
│  • logout()                                                 │
│  • refresh()                                                │
│  • getUser()                                                │
└─────────────────────────────────────────────────────────────┘
        ↓                                   ↓
┌──────────────────────┐      ┌────────────────────────────┐
│   React Query        │      │    Zustand Auth Store      │
│   • Mutations        │◄────►│    • accessToken           │
│   • Queries          │      │    • user                  │
│   • Cache mgmt       │      │    • isAuthenticated       │
└──────────────────────┘      └────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────────┐
│                     Axios Instance                          │
│  Request Interceptor: Add Authorization header              │
│  Response Interceptor: Handle 401 + refresh                 │
└─────────────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────────┐
│                         API Server                          │
│  • POST /api/auth/login                                     │
│  • POST /api/auth/refresh                                   │
│  • POST /api/auth/logout                                    │
│  • GET  /api/auth/me                                        │
└─────────────────────────────────────────────────────────────┘
```

## Files Structure

```
user-clients/
├── lib/
│   ├── axios.ts              # Axios instance + interceptors
│   └── queryClient.ts        # React Query configuration
├── stores/
│   └── authStore.ts          # Zustand auth state
├── hooks/
│   └── useAuth.ts            # Auth operations hook
├── components/
│   └── providers/
│       └── Providers.tsx     # App-level providers
└── __tests__/
    ├── lib/
    │   └── axios.test.ts     # Axios interceptor tests
    ├── stores/
    │   └── authStore.test.ts # Auth store tests
    └── hooks/
        └── useAuth.test.ts   # useAuth hook tests
```

## API Contracts

### POST /api/auth/login

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "volunteer"
  }
}
```

**Cookie Set:** `refresh_token` (HttpOnly, Secure, SameSite)

### POST /api/auth/refresh

**Request:** No body (uses refresh_token cookie)

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "volunteer"
  }
}
```

### POST /api/auth/logout

**Request:** No body

**Response:** 200 OK

**Effect:** Clears refresh_token cookie

### GET /api/auth/me

**Request:** No body (uses Authorization header)

**Response:**
```json
{
  "id": "123",
  "name": "John Doe",
  "email": "user@example.com",
  "role": "volunteer",
  "avatar": "https://..."
}
```

## Usage Examples

### Basic Login Flow

```tsx
import { useAuth } from '@/hooks/useAuth';

function LoginForm() {
  const { login, isLoggingIn, loginError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await login({
        email: 'user@example.com',
        password: 'password123',
      });
      // Login successful, user is now authenticated
    } catch (error) {
      // Error is available in loginError
      console.error('Login failed:', loginError);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button disabled={isLoggingIn}>
        {isLoggingIn ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

### Checking Auth State

```tsx
import { useAuth } from '@/hooks/useAuth';

function Profile() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <h1>Welcome, {user?.name}</h1>
      <p>Email: {user?.email}</p>
      <p>Role: {user?.role}</p>
    </div>
  );
}
```

### Logout

```tsx
import { useAuth } from '@/hooks/useAuth';

function LogoutButton() {
  const { logout, isLoggingOut } = useAuth();

  return (
    <button onClick={logout} disabled={isLoggingOut}>
      {isLoggingOut ? 'Logging out...' : 'Logout'}
    </button>
  );
}
```

### Making Authenticated API Calls

```tsx
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';

function UserData() {
  const { data, isLoading } = useQuery({
    queryKey: ['userData'],
    queryFn: async () => {
      // Token automatically attached by axios interceptor
      const response = await axiosInstance.get('/api/user/data');
      return response.data;
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return <div>{JSON.stringify(data)}</div>;
}
```

### Manual Refresh

```tsx
import { useAuth } from '@/hooks/useAuth';

function RefreshButton() {
  const { refresh, isRefreshing } = useAuth();

  return (
    <button onClick={refresh} disabled={isRefreshing}>
      {isRefreshing ? 'Refreshing...' : 'Refresh Token'}
    </button>
  );
}
```

## Axios Interceptor Behavior

### Request Interceptor

1. Reads `accessToken` from Zustand store
2. If token exists, adds `Authorization: Bearer <token>` header
3. Allows request to proceed

### Response Interceptor (401 Handling)

1. **On 401 response:**
   - Marks original request as `_retry`
   - If already refreshing, queues the request
   - If not refreshing, calls `/api/auth/refresh`
   
2. **On successful refresh:**
   - Updates store with new token
   - Processes all queued requests
   - Retries original request with new token
   
3. **On failed refresh:**
   - Clears auth store
   - Rejects all queued requests
   - User is logged out

4. **Special cases:**
   - Refresh endpoint itself never retries on 401
   - Non-401 errors pass through unchanged
   - Only retries once per request

### Concurrent Request Handling

Multiple concurrent requests receiving 401 will:
1. First request triggers refresh
2. Other requests queue and wait
3. All retry with new token after refresh succeeds
4. **Only one refresh call is made**

## Auth Store

### State

```typescript
{
  accessToken: string | null;      // JWT access token (in-memory only)
  user: User | null;               // User object
  isAuthenticated: boolean;        // Computed from token + user
}
```

### Methods

- `setAuth(token, user)` - Set authentication state
- `clearAuth()` - Clear all auth state
- `updateUser(fields)` - Update user fields
- `setRole(role)` - Update user role

### Security Notes

- **Access token is stored in-memory only** (not persisted to localStorage)
- **Refresh token is HttpOnly cookie** (not accessible to JavaScript)
- Token is lost on page refresh (app should call refresh on mount)
- This prevents XSS attacks from stealing tokens

## React Query Configuration

Default settings in `lib/queryClient.ts`:

```typescript
{
  queries: {
    staleTime: 5 * 60 * 1000,        // 5 minutes
    gcTime: 10 * 60 * 1000,          // 10 minutes cache
    retry: 3,                         // Retry failed requests 3 times
    refetchOnWindowFocus: true,      // Production only
    refetchOnReconnect: true,
  },
  mutations: {
    retry: 1,                         // Retry mutations once
  }
}
```

## Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run specific test file
pnpm test axios.test.ts
```

### Test Coverage

- **Axios Interceptor Tests** (`__tests__/lib/axios.test.ts`)
  - Token injection
  - 401 handling and refresh
  - Concurrent request queueing
  - Error handling

- **Auth Store Tests** (`__tests__/stores/authStore.test.ts`)
  - setAuth, clearAuth
  - updateUser, setRole
  - State persistence
  - Edge cases

- **useAuth Hook Tests** (`__tests__/hooks/useAuth.test.ts`)
  - Login flow
  - Logout flow
  - Refresh flow
  - Error handling
  - Integration scenarios

## Environment Variables

Required environment variables:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000  # API base URL
NODE_ENV=development|production
```

## Common Patterns

### Protected Route

```tsx
'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return <div>Redirecting...</div>;
  }

  return <div>Protected content</div>;
}
```

### Role-Based Access

```tsx
import { useAuth } from '@/hooks/useAuth';

function AdminPanel() {
  const { user } = useAuth();

  if (user?.role !== 'admin') {
    return <div>Access denied</div>;
  }

  return <div>Admin panel</div>;
}
```

### Optimistic Updates

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';

function UpdateProfile() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (newName: string) => {
      return axiosInstance.patch('/api/user/profile', { name: newName });
    },
    onMutate: async (newName) => {
      // Optimistically update cache
      await queryClient.cancelQueries({ queryKey: ['user'] });
      const previousUser = queryClient.getQueryData(['user']);
      queryClient.setQueryData(['user'], (old: any) => ({
        ...old,
        name: newName,
      }));
      return { previousUser };
    },
    onError: (err, newName, context) => {
      // Rollback on error
      queryClient.setQueryData(['user'], context?.previousUser);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  return mutation;
}
```

## Troubleshooting

### Token not being sent

- Check that `accessToken` is in the store: `useAuthStore.getState().accessToken`
- Verify axios interceptor is attached (should be automatic on import)
- Check network tab for `Authorization` header

### Infinite refresh loop

- Verify refresh endpoint doesn't return 401
- Check that refresh endpoint is excluded from retry logic
- Ensure cookies are being sent (`withCredentials: true`)

### Tests failing

- Mock adapter not resetting: Call `mock.reset()` in `beforeEach`
- Store state persisting: Call `useAuthStore.getState().clearAuth()` in `beforeEach`
- Async timing: Use `waitFor` for state changes

## Next Steps

1. **Implement API endpoints** matching the contracts
2. **Add token refresh on mount** to restore sessions
3. **Create auth context provider** if needed for SSR
4. **Add loading states** to components during auth operations
5. **Implement error boundaries** to catch auth errors
6. **Add analytics** for auth events

## Security Considerations

1. **Access tokens are short-lived** (recommend 15 minutes)
2. **Refresh tokens are long-lived** (recommend 7 days)
3. **Refresh tokens are HttpOnly cookies** (XSS protection)
4. **Use HTTPS in production** (required for secure cookies)
5. **Implement CSRF protection** for refresh endpoint
6. **Rate limit auth endpoints** to prevent brute force
7. **Log auth events** for security monitoring

## License

This implementation is part of the user-clients project.
