# 🔐 Access & Refresh Token System - Complete Guide

## Token Overview

Your application uses a **dual-token authentication system**:

| Token | Access Token | Refresh Token |
|-------|-------------|---------------|
| **Purpose** | Grants API access | Renews access tokens |
| **Lifespan** | 15 minutes | 15 days |
| **Storage** | localStorage (client) | httpOnly Cookie (browser) |
| **Usage** | Every API request | Only for token refresh |
| **Security** | Accessible by JS | NOT accessible by JS |
| **Format** | JWT | JWT |

---

## 📍 Where Tokens Are Stored

### 1. Access Token Storage

**Location**: `localStorage` via Zustand state management

**File**: `stores/authStore.ts`

```typescript
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,  // ← Access token stored here
      user: null,
      isAuthenticated: false,

      setAuth: (accessToken, user) => set({
        accessToken,      // ← Saved to state + localStorage
        user,
        isAuthenticated: true,
      }),
    }),
    {
      name: 'auth-storage',  // ← localStorage key name
    }
  )
);
```

**Browser Storage**:
```
Application → Local Storage → http://localhost:3001
Key: "auth-storage"
Value: {
  "state": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { "id": "...", "email": "...", "role": "volunteer" },
    "isAuthenticated": true
  }
}
```

### 2. Refresh Token Storage

**Location**: `httpOnly` cookie set by server

**File**: `server/src/routes/auth.routes.ts`

```typescript
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,        // ← JavaScript CANNOT access this
  secure: true,          // ← HTTPS only in production
  sameSite: 'strict',    // ← CSRF protection
  path: '/auth/refresh', // ← Only sent to refresh endpoint
  maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
};

// Server sets cookie after login
res.cookie('refresh_token', refreshToken, REFRESH_COOKIE_OPTIONS);
```

**Browser Storage**:
```
Application → Cookies → http://localhost:3000
Name: refresh_token
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
HttpOnly: ✓
Secure: ✓
SameSite: Strict
Path: /auth/refresh
Expires: (15 days from now)
```

---

## 🔄 Complete Token Flow

### Step 1: Login & Token Creation

**Client**: User submits login form

**File**: `components/forms/LoginForm.tsx`
```typescript
const onSubmit = async (data: LoginFormData) => {
  // 1. Send credentials to server
  const response = await login(data);
  // response = {
  //   accessToken: "eyJ...",
  //   user: { id, email, role }
  // }
  
  // 2. Store access token in localStorage
  setAuth(response.accessToken, response.user);
  
  // 3. Navigate to dashboard
  router.push('/dashboard');
};
```

**Server**: Generates both tokens

**File**: `server/src/routes/auth.routes.ts`
```typescript
router.post('/login', async (req, res) => {
  // Validate credentials
  const user = await User.findOne({ email });
  const isMatch = await user.comparePassword(password);
  
  // 1. Create ACCESS TOKEN (15 min)
  const accessToken = signAccessToken({
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  });
  
  // 2. Create REFRESH TOKEN (15 days) in database
  const { token: refreshToken } = await createRefreshToken(
    user._id.toString(),
    { userAgent: req.get('user-agent'), ip: req.ip }
  );
  
  // 3. Set refresh token as httpOnly cookie
  res.cookie('refresh_token', refreshToken, REFRESH_COOKIE_OPTIONS);
  
  // 4. Return access token in JSON
  res.json({
    accessToken,  // ← Client stores this
    user: { id, email, role }
  });
});
```

**Result**:
- ✅ Access token → localStorage
- ✅ Refresh token → httpOnly cookie
- ✅ User logged in

---

### Step 2: Using Access Token for API Requests

**Every API request automatically includes access token**

**File**: `lib/axios.ts` (Request Interceptor)
```typescript
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 1. Get access token from Zustand store (which reads from localStorage)
    const accessToken = useAuthStore.getState().accessToken;
    
    // 2. Add to Authorization header
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    
    return config;
  }
);
```

**HTTP Request**:
```http
GET /api/user/profile HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Cookie: refresh_token=eyJhbGciOiJIUzI1NiIsInR5cCI...
```

**Server Validation**:

**File**: `server/src/middleware/authenticate.ts`
```typescript
export const authenticate = (req, res, next) => {
  // 1. Extract token from header
  const authHeader = req.headers.authorization;
  const token = authHeader.split(' ')[1];
  
  // 2. Verify JWT (checks signature + expiry)
  const payload = verifyAccessToken(token);
  // Throws error if: expired, invalid signature, tampered
  
  // 3. Attach user to request
  req.user = payload; // { userId, email, role }
  next();
};
```

---

### Step 3: Access Token Expires (After 15 Minutes)

**Timeline**:
```
00:00 - Login → Access token valid ✅
00:14 - Still valid ✅
00:15 - Access token EXPIRED ❌
00:16 - User makes API request...
```

**What Happens**:

1️⃣ **Client sends expired token**:
```http
GET /api/user/profile
Authorization: Bearer <expired_token>
```

2️⃣ **Server rejects**:
```typescript
// authenticate middleware
verifyAccessToken(token) 
// ↑ Throws: TokenExpiredError: jwt expired

// Returns:
HTTP/1.1 401 Unauthorized
{ "error": "Unauthorized", "message": "jwt expired" }
```

3️⃣ **Axios interceptor catches 401**:

**File**: `lib/axios.ts` (Response Interceptor)
```typescript
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    // Detect 401 error
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }
    
    // Don't retry if already retried
    if (originalRequest._retry) {
      return Promise.reject(error);
    }
    
    // If refreshing the refresh endpoint fails, logout
    if (originalRequest.url?.includes('/api/auth/refresh')) {
      useAuthStore.getState().clearAuth();
      return Promise.reject(error);
    }
    
    originalRequest._retry = true;
    
    // 🔄 TRIGGER TOKEN REFRESH
    try {
      const response = await axiosInstance.post(
        '/api/auth/refresh',
        {},
        { withCredentials: true }  // ← Sends refresh_token cookie
      );
      
      const { accessToken, user } = response.data;
      
      // Update store with NEW access token
      useAuthStore.getState().setAuth(accessToken, user);
      
      // Retry original request with new token
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return axiosInstance(originalRequest);
      
    } catch (refreshError) {
      // Refresh failed → logout user
      useAuthStore.getState().clearAuth();
      return Promise.reject(refreshError);
    }
  }
);
```

---

### Step 4: Refresh Token Process

**Client sends refresh request**:
```http
POST /api/auth/refresh HTTP/1.1
Host: localhost:3000
Cookie: refresh_token=eyJhbGciOiJIUzI1NiIsInR5cCI...
Content-Type: application/json
```

**Server processes refresh**:

**File**: `server/src/routes/auth.routes.ts`
```typescript
router.post('/refresh', async (req, res) => {
  // 1. Get refresh token from httpOnly cookie
  const refreshToken = req.cookies.refresh_token;
  
  if (!refreshToken) {
    throw new UnauthorizedError('No refresh token');
  }
  
  // 2. Verify refresh token validity
  // 3. Rotate refresh token (revoke old, create new)
  const { token: newRefreshToken } = await rotateRefreshToken(
    refreshToken,
    { userAgent: req.get('user-agent'), ip: req.ip }
  );
  
  // 4. Get user from database
  const payload = jwt.decode(newRefreshToken);
  const user = await User.findById(payload.userId);
  
  // 5. Generate NEW access token (fresh 15 min)
  const newAccessToken = signAccessToken({
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  });
  
  // 6. Set new refresh cookie
  res.cookie('refresh_token', newRefreshToken, REFRESH_COOKIE_OPTIONS);
  
  // 7. Return new access token
  res.json({ 
    accessToken: newAccessToken,
    user: { id, email, role }
  });
});
```

**Token Rotation in Database**:

**File**: `server/src/services/token.service.ts`
```typescript
export const rotateRefreshToken = async (
  oldToken: string,
  metadata: TokenMetadata
): Promise<TokenResult> => {
  // 1. Verify old token
  const payload = jwt.verify(oldToken, config.jwtSecret);
  
  // 2. Find token in database
  const tokenDoc = await RefreshToken.findOne({ 
    jti: payload.jti,
    revoked: false 
  });
  
  if (!tokenDoc) {
    throw new UnauthorizedError('Invalid refresh token');
  }
  
  // 3. Revoke old token
  tokenDoc.revoked = true;
  tokenDoc.revokedAt = new Date();
  await tokenDoc.save();
  
  // 4. Create new refresh token
  const newToken = await createRefreshToken(
    payload.userId,
    metadata
  );
  
  return newToken;
};
```

**Result**:
- ✅ Old refresh token revoked in database
- ✅ New refresh token created (extends 15 days)
- ✅ New access token issued (fresh 15 min)
- ✅ Client auto-updates localStorage
- ✅ Original API request retried successfully

---

## 🔍 Token Comparison

### Access Token

**Payload**:
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "role": "volunteer",
  "iat": 1701734400,
  "exp": 1701735300,  // 15 min later
  "iss": "volunteer-platform",
  "aud": "api-users"
}
```

**Where Used**:
- ✅ Every protected API request
- ✅ Sent in `Authorization` header
- ✅ Checked by `authenticate` middleware

**Characteristics**:
- Short-lived (15 min)
- Can be decoded by anyone (public claims)
- Signature prevents tampering
- Stored in localStorage (accessible by JS)

### Refresh Token

**Payload**:
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "jti": "unique-token-id-12345",  // Token ID for database tracking
  "iat": 1701734400,
  "exp": 1703030400,  // 15 days later
  "iss": "volunteer-platform"
}
```

**Where Used**:
- ✅ Only at `/api/auth/refresh` endpoint
- ✅ Automatically sent in cookie
- ✅ Never manually handled by client code

**Characteristics**:
- Long-lived (15 days)
- Tracked in database (can be revoked)
- Stored in httpOnly cookie (NOT accessible by JS)
- Rotated on every use (one-time use)

---

## 🛡️ Security Features

### 1. Access Token in localStorage
**Pros**:
- ✅ Works with SPA architecture
- ✅ Survives page refresh
- ✅ Easy to access for API calls

**Cons**:
- ⚠️ Vulnerable to XSS attacks
- ⚠️ Accessible by any JavaScript code

**Mitigation**:
- ✅ Short lifespan (15 min)
- ✅ Input sanitization prevents XSS
- ✅ React escapes user input automatically

### 2. Refresh Token in httpOnly Cookie
**Pros**:
- ✅ NOT accessible by JavaScript (XSS protection)
- ✅ Automatically sent by browser
- ✅ CSRF protection with SameSite

**Cons**:
- ⚠️ Cannot be read by client code
- ⚠️ Needs server endpoint for usage

**Security Features**:
- ✅ `httpOnly: true` - XSS cannot steal it
- ✅ `secure: true` - HTTPS only in production
- ✅ `sameSite: 'strict'` - CSRF protection
- ✅ `path: '/auth/refresh'` - Limited scope
- ✅ Database tracking - Can be revoked
- ✅ Token rotation - One-time use

### 3. Token Rotation
Every refresh generates a new refresh token and revokes the old one:

```
Login → RefreshToken_1 (15 days)
  ↓
15 min later → Access expired
  ↓
Refresh → RevokRefreshToken_1, Create RefreshToken_2 (new 15 days)
  ↓
15 min later → Access expired
  ↓
Refresh → Revoke RefreshToken_2, Create RefreshToken_3 (new 15 days)
```

**Benefits**:
- ✅ Stolen refresh tokens expire after one use
- ✅ Limits damage from token theft
- ✅ Admin can track all active sessions

---

## 📊 Token Lifecycle Visual

```
┌─────────────────────────────────────────────────────────────┐
│                         LOGIN                               │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
┌─────────────────┐          ┌─────────────────┐
│  Access Token   │          │ Refresh Token   │
│  (15 minutes)   │          │  (15 days)      │
│                 │          │                 │
│  Stored in:     │          │  Stored in:     │
│  localStorage   │          │  httpOnly       │
│                 │          │  Cookie         │
└────────┬────────┘          └────────┬────────┘
         │                            │
         │                            │
         ▼                            │
┌──────────────────────────────────┐  │
│   Used for ALL API Requests      │  │
│   Authorization: Bearer <token>  │  │
└────────┬─────────────────────────┘  │
         │                             │
         │ After 15 min...             │
         │                             │
         ▼                             │
   ┌─────────┐                         │
   │ EXPIRED │                         │
   └────┬────┘                         │
        │                              │
        ▼                              │
┌──────────────────┐                   │
│  401 Error       │                   │
│  Interceptor     │                   │
│  Triggers        │                   │
│  Auto-Refresh    │                   │
└────────┬─────────┘                   │
         │                             │
         │  POST /api/auth/refresh     │
         │  (sends refresh_token) ─────┘
         │
         ▼
┌────────────────────────────────────┐
│  Server validates refresh_token    │
│  - Checks database                 │
│  - Verifies expiry                 │
│  - Revokes old token               │
│  - Creates new tokens              │
└────────┬───────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Returns NEW access token           │
│  Sets NEW refresh_token cookie      │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Client updates localStorage        │
│  Retries original request           │
│  User never notices!                │
└─────────────────────────────────────┘
```

---

## 🔧 Key Files Reference

### Client-Side

| File | Purpose |
|------|---------|
| `stores/authStore.ts` | Stores access token in localStorage |
| `lib/axios.ts` | Adds access token to requests, handles refresh |
| `components/forms/LoginForm.tsx` | Initiates login, stores tokens |
| `components/layout/AuthGuard.tsx` | Protects routes using stored token |

### Server-Side

| File | Purpose |
|------|---------|
| `routes/auth.routes.ts` | Login, refresh, logout endpoints |
| `routes/auth.register.routes.ts` | Registration with token generation |
| `services/jwt.service.ts` | Signs and verifies JWT tokens |
| `services/token.service.ts` | Manages refresh tokens in database |
| `middleware/authenticate.ts` | Validates access tokens on API routes |

---

## 🧪 Debug Token Issues

### Check Access Token:
```javascript
// In browser console
const store = localStorage.getItem('auth-storage');
const data = JSON.parse(store);
console.log('Access Token:', data.state.accessToken);

// Decode JWT (without verification)
const payload = JSON.parse(atob(data.state.accessToken.split('.')[1]));
console.log('Expires:', new Date(payload.exp * 1000));
```

### Check Refresh Token:
```javascript
// In browser console
document.cookie.split(';').find(c => c.includes('refresh_token'))
// Note: Will be empty because httpOnly prevents JS access!
// Use DevTools → Application → Cookies instead
```

### Force Token Refresh:
```javascript
// In browser console
const axios = require('./lib/axios');
await axios.post('/api/auth/refresh', {}, { withCredentials: true });
```

---

## ✅ Summary

**Access Token**:
- 📍 Stored: localStorage (Zustand)
- ⏱️ Expires: 15 minutes
- 🎯 Used: Every API request
- 🔓 Security: Short lifespan mitigates XSS risk

**Refresh Token**:
- 📍 Stored: httpOnly Cookie
- ⏱️ Expires: 15 days
- 🎯 Used: Only for refreshing access token
- 🔐 Security: Cannot be accessed by JavaScript

**Together They Provide**:
- ✅ Secure authentication
- ✅ Automatic token refresh (seamless UX)
- ✅ Protection against XSS and CSRF
- ✅ Revocable sessions (via database)
- ✅ Industry-standard security practices

Your token system follows **OAuth 2.0 best practices** with JWT tokens! 🎉
