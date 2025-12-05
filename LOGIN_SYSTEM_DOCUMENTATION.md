# Login System Documentation - Volunteer & NGO

## Overview
This document explains how the volunteer and NGO login system works in the application, covering both the client-side (Next.js) and server-side (Node.js/Express) flows.

---

## Table of Contents
1. [Authentication Architecture](#authentication-architecture)
2. [Client-Side Flow](#client-side-flow)
3. [Server-Side Flow](#server-side-flow)
4. [Role-Based Access](#role-based-access)
5. [Security Features](#security-features)
6. [Key Components](#key-components)

---

## Authentication Architecture

### Token-Based Authentication
- **Access Token**: Short-lived JWT stored in `localStorage` (via Zustand store)
- **Refresh Token**: Long-lived token stored in `httpOnly` cookies
- **Role-Based**: Users have roles: `volunteer`, `ngo`, or `admin`

### State Management
- **Zustand Store** (`authStore.ts`): Client-side auth state management with persistence
- **React Query**: Handles async auth operations (login, logout, refresh)

---

## Client-Side Flow

### 1. Login Form Component (`LoginForm.tsx`)

**Location**: `components/forms/LoginForm.tsx`

#### Features:
- Single login form for **both volunteers and NGOs**
- Email/password authentication
- Google OAuth option (defaults to volunteer role for login)
- Form validation using `react-hook-form` + `zod`
- Error handling and loading states

#### Login Process:
```typescript
1. User enters email & password
2. Form validates input using loginSchema
3. Calls login() API service
4. On success:
   - Stores accessToken and user in Zustand store
   - Persists to localStorage
   - Redirects to dashboard
5. On error:
   - Displays error message
```

#### Code Flow:
```typescript
const onSubmit = async (data: LoginFormData) => {
  // Call backend API
  const response = await login(data);
  
  // Store auth state
  setAuth(response.accessToken, response.user);
  
  // Wait for localStorage persistence
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Redirect to dashboard
  router.push(redirectTo);
};
```

---

### 2. Auth Store (`authStore.ts`)

**Location**: `stores/authStore.ts`

#### State:
- `accessToken`: JWT token for API requests
- `user`: User object with `{ id, email, role, isEmailVerified, avatar }`
- `isAuthenticated`: Boolean flag
- `_hasHydrated`: Tracks localStorage sync

#### Actions:
- `setAuth(token, user)`: Sets authentication state
- `clearAuth()`: Clears authentication (logout)
- `updateUser(fields)`: Updates user fields
- `setRole(role)`: Changes user role

#### Persistence:
- Uses Zustand's `persist` middleware
- Stores in `localStorage` under key `'auth-storage'`
- Auto-rehydrates on app load

---

### 3. Auth Hooks

#### `useAuth.ts`
**Purpose**: Provides auth operations using React Query

**Methods**:
- `login(credentials)`: Login mutation
- `logout()`: Logout mutation  
- `refresh()`: Refresh access token
- `getUser()`: Get current user data

**States**:
- `isLoggingIn`, `isLoggingOut`, `isRefreshing`
- `loginError`, `logoutError`, `refreshError`

#### `useRequireAuth.ts`
**Purpose**: Protects routes and components

**Options**:
- `requiredRoles`: Array of allowed roles (optional)
- `redirectTo`: Custom redirect path (default: `/auth/login`)
- `passiveMode`: No auto-redirect, just return auth state

**Returns**:
- `isAuthenticated`: Boolean
- `isAuthorized`: Boolean (based on roles)
- `isLoading`: Boolean
- `user`: User object

**Usage**:
```typescript
// Protect any authenticated user
const { isLoading } = useRequireAuth();

// Protect with specific roles
const { isAuthorized } = useRequireAuth({ 
  requiredRoles: ['ngo', 'admin'] 
});

// Passive mode (no redirect)
const { isAuthenticated } = useRequireAuth({ 
  passiveMode: true 
});
```

---

### 4. Auth Guard Component (`AuthGuard.tsx`)

**Location**: `components/layout/AuthGuard.tsx`

**Purpose**: Wraps protected pages/components

**How it works**:
1. Checks `localStorage` for auth state
2. Validates user and token existence
3. Checks role permissions (if specified)
4. Redirects to login if unauthorized
5. Shows loading spinner during check
6. Renders children if authorized

**Usage**:
```tsx
<AuthGuard>
  <ProtectedContent />
</AuthGuard>

<AuthGuard authorize={['ngo']}>
  <NgoOnlyContent />
</AuthGuard>
```

---

### 5. Middleware (`middleware.ts`)

**Location**: `middleware.ts`

**Purpose**: Server-side route protection (Next.js middleware)

#### Protected Routes:
- `/dashboard`
- `/profile`
- `/settings`

#### Auth Routes (redirect if logged in):
- `/auth/login`
- `/auth/signup`
- `/auth/forgot-password`

**How it works**:
1. Checks for `accessToken` cookie
2. Redirects unauthenticated users to login with `returnUrl` param
3. Redirects authenticated users from auth pages to dashboard

---

## Server-Side Flow

### 1. Login Endpoint

**Route**: `POST /api/auth/login`  
**File**: `server/src/routes/auth.routes.ts`

#### Process:
```typescript
1. Receive { email, password }
2. Find user in database by email
3. Verify password using argon2.verify()
4. Generate JWT access token (15min expiry)
5. Create refresh token in DB (15 days)
6. Set httpOnly cookie with refresh token
7. Return { accessToken, user }
```

#### Response:
```json
{
  "accessToken": "eyJhbGc...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "role": "volunteer",
    "isEmailVerified": true
  }
}
```

---

### 2. Registration Endpoints

#### Volunteer Registration
**Route**: `POST /api/auth/register/volunteer`  
**File**: `server/src/routes/auth.register.routes.ts`

**Required Fields**:
- `email`, `password`, `name`, `location`
- Optional: `verificationToken` (from OTP)

**Creates**:
1. `User` record with role `'volunteer'`
2. `Volunteer` profile with name, location, skills, etc.

#### NGO Registration
**Route**: `POST /api/auth/register/ngo`

**Required Fields**:
- `email`, `password`, `name`, `slug`, `contactPerson`, `address`, `description`
- Optional: `verificationToken`, `registrationDocs`

**Creates**:
1. `User` record with role `'ngo'`
2. `Ngo` organization with status `'pending'` (requires admin approval)

**Key Difference**: NGOs have a `pending` status and require admin verification before full access.

---

### 3. Refresh Token Endpoint

**Route**: `POST /api/auth/refresh`

**Process**:
1. Read `refresh_token` from httpOnly cookie
2. Verify and rotate refresh token
3. Revoke old token, create new one
4. Fetch user from database
5. Generate new access token
6. Set new refresh cookie
7. Return new access token

---

### 4. Authentication Middleware

**File**: `server/src/middleware/authenticate.ts`

**Purpose**: Validates JWT on protected routes

```typescript
export const authenticate = (req, res, next) => {
  // Extract token from Authorization header
  const token = req.headers.authorization?.split(' ')[1];
  
  // Verify JWT
  const payload = verifyAccessToken(token);
  
  // Attach user to request
  req.user = payload; // { userId, email, role }
  
  next();
};
```

---

## Role-Based Access

### User Roles
1. **volunteer**: Individual volunteers
2. **ngo**: NGO organizations
3. **admin**: Platform administrators

### Dashboard Access
Both volunteers and NGOs access the same `/dashboard` route initially, but content can differ:

```tsx
// Dashboard shows role-specific content
{user?.role === 'volunteer' && (
  <a href="/dashboard/volunteer/applications">
    My Applications
  </a>
)}

{user?.role === 'ngo' && (
  <a href="/dashboard/ngo/jobs">
    Posted Jobs
  </a>
)}
```

### Role-Specific Routes
- **Volunteers**: `/dashboard/volunteer/*`
  - `/applications`: View volunteer applications
  - `/profile`: Edit profile and upload resume

- **NGOs**: `/dashboard/ngo/*`
  - `/jobs`: Manage job postings
  - `/applicants`: Review applications

---

## Security Features

### Password Security
- **Hashing**: Argon2 (industry standard, better than bcrypt)
- **Validation**: Minimum 8 characters
- **Storage**: Never stored in plaintext

### Token Security
- **Access Token**: Short-lived (15 minutes), stored in localStorage
- **Refresh Token**: Long-lived (15 days), httpOnly cookie with:
  - `secure: true` in production (HTTPS only)
  - `sameSite: 'strict'` in production (CSRF protection)
  - `httpOnly: true` (prevents XSS access)
  - `path: '/auth/refresh'` (limited scope)

### CSRF Protection
- Refresh tokens use httpOnly cookies with sameSite
- Access tokens in headers (not vulnerable to CSRF)

### XSS Protection
- Refresh tokens not accessible via JavaScript
- Input validation with Zod schemas
- React's built-in XSS protection

### Rate Limiting
- OTP endpoints have rate limiters
- Prevents brute force attacks

---

## Key Components

### Client-Side Structure
```
user-clients/
├── components/
│   ├── forms/
│   │   ├── LoginForm.tsx          # Unified login form
│   │   ├── VolunteerSignupForm.tsx # Volunteer registration
│   │   └── NgoSignupForm.tsx       # NGO registration
│   └── layout/
│       └── AuthGuard.tsx           # Route protection component
├── hooks/
│   ├── useAuth.ts                  # Auth operations hook
│   └── useRequireAuth.ts           # Route protection hook
├── stores/
│   └── authStore.ts                # Zustand auth state
├── services/
│   └── auth.api.ts                 # API client functions
├── middleware.ts                   # Next.js middleware
└── app/
    ├── auth/
    │   ├── login/page.tsx
    │   ├── signup/volunteer/page.tsx
    │   └── signup/ngo/page.tsx
    └── dashboard/
        ├── page.tsx                # Main dashboard
        ├── volunteer/              # Volunteer-only routes
        └── ngo/                    # NGO-only routes
```

### Server-Side Structure
```
server/src/
├── routes/
│   ├── auth.routes.ts              # Login, logout, refresh, me
│   ├── auth.register.routes.ts     # Volunteer & NGO registration
│   ├── auth.password.routes.ts     # Password reset
│   ├── auth.otp.routes.ts          # OTP verification
│   └── auth.google.routes.ts       # Google OAuth
├── middleware/
│   ├── authenticate.ts             # JWT verification
│   └── authorize.ts                # Role-based access control
├── services/
│   ├── jwt.service.ts              # JWT signing/verification
│   └── token.service.ts            # Refresh token management
└── models/
    ├── User.ts                     # User model (auth credentials)
    ├── Volunteer.ts                # Volunteer profile
    └── Ngo.ts                      # NGO organization
```

---

## Common Flows

### First-Time Login Flow
```
1. User fills LoginForm
2. POST /api/auth/login
3. Server validates credentials
4. Returns { accessToken, user }
5. Client stores in Zustand + localStorage
6. Middleware checks cookie for accessToken
7. User redirected to /dashboard
```

### Protected Page Access
```
1. User navigates to /dashboard
2. Middleware checks accessToken cookie
3. If missing → redirect to /auth/login?returnUrl=/dashboard
4. If present → AuthGuard checks localStorage
5. AuthGuard validates user role
6. Renders page content
```

### Token Refresh Flow
```
1. Access token expires (15 min)
2. API request fails with 401
3. Axios interceptor calls POST /api/auth/refresh
4. Server rotates refresh token
5. Returns new accessToken
6. Retry original request
7. Update Zustand store
```

### Logout Flow
```
1. User clicks logout button
2. Call logout() from useAuth
3. POST /api/auth/logout
4. Server revokes refresh token
5. Clear refresh cookie
6. Client clearAuth() in Zustand
7. Redirect to homepage
```

---

## Environment Variables

### Client (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3001
```

### Server (`.env`)
```env
JWT_SECRET=your_secret_key_here
JWT_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=15d
NODE_ENV=development
```

---

## Debugging Tips

### Check Auth State
```javascript
// In browser console
localStorage.getItem('auth-storage')
```

### Check Tokens
```javascript
// In browser console
document.cookie
```

### Enable Zustand DevTools
- Auth store has devtools enabled in development
- Use Redux DevTools extension

### Server Logs
```bash
# Check authentication failures
tail -f logs/app.log | grep "authentication_failed"
```

---

## Future Enhancements

1. **Email Verification Required**: Force email verification before full access
2. **2FA Support**: Add two-factor authentication option
3. **Session Management**: View and revoke active sessions
4. **Password Policies**: Enforce stronger password requirements
5. **Social Login**: Add more OAuth providers (GitHub, LinkedIn)
6. **Biometric Auth**: Support WebAuthn for passwordless login

---

## Troubleshooting

### "Invalid credentials" error
- Check password in database is hashed correctly
- Verify email case sensitivity (stored as lowercase)

### Infinite redirect loop
- Check middleware and AuthGuard for conflicts
- Verify accessToken cookie is being set
- Check returnUrl parameter handling

### Token expired immediately
- Verify JWT_EXPIRY environment variable
- Check server/client time synchronization
- Ensure JWT_SECRET matches between sessions

### Can't access protected routes
- Verify role matches required roles
- Check AuthGuard authorize prop
- Ensure Zustand store has hydrated

---

## API Endpoints Summary

| Endpoint | Method | Auth Required | Purpose |
|----------|--------|---------------|---------|
| `/api/auth/login` | POST | No | Login with email/password |
| `/api/auth/register/volunteer` | POST | No | Register as volunteer |
| `/api/auth/register/ngo` | POST | No | Register as NGO |
| `/api/auth/refresh` | POST | Yes (Cookie) | Refresh access token |
| `/api/auth/logout` | POST | No | Revoke refresh token |
| `/api/auth/me` | GET | Yes | Get current user |
| `/api/auth/whoami` | GET | Yes | Get detailed user info |
| `/api/auth/forgot-password` | POST | No | Request password reset OTP |
| `/api/auth/reset-password` | POST | No | Reset password with OTP |
| `/api/auth/google` | GET | No | Initiate Google OAuth |

---

## Conclusion

The login system provides a **unified authentication flow** for both volunteers and NGOs, with role-based access control throughout the application. The system uses industry-standard security practices including:

- JWT-based authentication
- HttpOnly cookies for refresh tokens
- Argon2 password hashing
- Role-based authorization
- Client and server-side route protection

The architecture separates concerns between authentication (login/logout) and authorization (role-based access), making it easy to add new roles or permissions in the future.
