# Authentication Module

This module implements the complete authentication system for the volunteer platform, including login, role-specific signup (volunteer & NGO), and Google OAuth integration.

## Features

- ✅ Login page with email/password authentication
- ✅ Volunteer signup with form validation
- ✅ NGO signup with extended fields and file upload placeholder
- ✅ Google OAuth integration for both roles
- ✅ Form validation using Zod schemas
- ✅ Beautiful UI using shadcn/ui components
- ✅ Comprehensive error handling
- ✅ Unit and integration tests

## File Structure

```
app/
├── auth/
│   ├── login/page.tsx              # Login page
│   ├── signup/
│   │   ├── volunteer/page.tsx      # Volunteer signup page
│   │   └── ngo/page.tsx            # NGO signup page
│   └── google-callback/page.tsx    # Google OAuth callback handler

components/
├── forms/
│   ├── LoginForm.tsx               # Login form component
│   ├── VolunteerSignupForm.tsx     # Volunteer signup form
│   └── NgoSignupForm.tsx           # NGO signup form
└── ui/
    ├── button.tsx                  # shadcn Button component
    ├── input.tsx                   # shadcn Input component
    ├── label.tsx                   # shadcn Label component
    ├── textarea.tsx                # shadcn Textarea component
    ├── form-input.tsx              # Custom FormInput wrapper with error handling
    └── form-textarea.tsx           # Custom FormTextarea wrapper with error handling

lib/
├── validations/
│   └── auth.schema.ts              # Zod validation schemas
└── axios.ts                        # Axios instance with interceptors

services/
└── auth.api.ts                     # Auth API wrapper functions

stores/
└── authStore.ts                    # Zustand auth state management

__tests__/
├── validations/
│   └── auth.schema.test.ts         # Validation schema tests
├── components/forms/
│   ├── LoginForm.test.tsx          # Login form integration tests
│   └── VolunteerSignupForm.test.tsx # Signup form integration tests
└── pages/auth/
    └── google-callback.test.tsx    # OAuth callback tests
```

## API Endpoints

### Backend Requirements

The following API endpoints must be implemented in the backend:

#### Registration

- **POST** `/api/auth/register/volunteer`
  - Body: `{ name, email, password, confirmPassword, phone? }`
  - Response: `{ accessToken, user }`

- **POST** `/api/auth/register/ngo`
  - Body: `{ organizationName, email, password, confirmPassword, phone?, website?, description?, registrationNumber?, documents? }`
  - Response: `{ accessToken, user }`

#### Login

- **POST** `/api/auth/login`
  - Body: `{ email, password }`
  - Response: `{ accessToken, user }`
  - Sets `refresh_token` cookie (HttpOnly, Secure, SameSite)

#### Token Refresh

- **POST** `/api/auth/refresh`
  - Cookies: `refresh_token`
  - Response: `{ accessToken, user }`
  - Refreshes the `refresh_token` cookie

#### Google OAuth

- **GET** `/api/auth/google?role=<volunteer|ngo>`
  - Initiates Google OAuth flow
  - Redirects to Google authentication
  - After success, redirects to `FRONTEND_URL/auth/google-callback`
  - Sets `refresh_token` cookie upon successful authentication

#### Logout

- **POST** `/api/auth/logout`
  - Clears `refresh_token` cookie
  - Response: `204 No Content`

## Usage

### Login

```tsx
import { LoginForm } from '@/components/forms/LoginForm';

<LoginForm 
  redirectTo="/dashboard"  // Optional, defaults to /dashboard
  onSuccess={() => {}}     // Optional callback
/>
```

### Volunteer Signup

```tsx
import { VolunteerSignupForm } from '@/components/forms/VolunteerSignupForm';

<VolunteerSignupForm 
  redirectTo="/onboarding"  // Optional
  onSuccess={() => {}}      // Optional
/>
```

### NGO Signup

```tsx
import { NgoSignupForm } from '@/components/forms/NgoSignupForm';

<NgoSignupForm 
  redirectTo="/ngo-onboarding"  // Optional
  onSuccess={() => {}}          // Optional
/>
```

### Google OAuth

The forms include Google OAuth buttons. When clicked:
1. User is redirected to backend `/api/auth/google?role=<role>`
2. Backend redirects to Google for authentication
3. After Google auth, backend redirects to `/auth/google-callback`
4. Callback page calls `/api/auth/refresh` to get tokens
5. User is redirected to dashboard or specified path

## Validation Rules

### Email
- Must be a valid email format

### Password
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

### Phone (Optional)
- Must match international phone number format
- E.g., `+1234567890`

### NGO Specific
- Organization name: Minimum 2 characters
- Website: Must be a valid URL (if provided)
- Description: Minimum 10 characters (if provided)

## State Management

Authentication state is managed using Zustand:

```tsx
import { useAuthStore } from '@/stores/authStore';

// In components
const { user, isAuthenticated, setAuth, clearAuth } = useAuthStore();
```

## Token Management

- **Access Token**: Short-lived JWT stored in memory (Zustand store)
- **Refresh Token**: Long-lived token stored in HTTP-only cookie
- Automatic token refresh on 401 errors via axios interceptor
- All API calls automatically include access token in Authorization header

## Error Handling

All forms display error messages in three layers:

1. **Client-side validation** (Zod schemas) - Inline field errors
2. **API errors** - Error banner at top of form
3. **Network errors** - Generic error message

Example error display:
```tsx
{apiError && (
  <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
    {apiError}
  </div>
)}
```

## Testing

### Run all tests
```bash
pnpm test
```

### Run specific test file
```bash
pnpm test LoginForm.test.tsx
```

### Run tests in watch mode
```bash
pnpm test:watch
```

### Test Coverage

- ✅ Form validation edge cases
- ✅ Successful signup/login flows
- ✅ API error handling
- ✅ Store updates
- ✅ Redirects
- ✅ Google OAuth callback handling

## File Upload (NGO Signup)

The NGO signup form includes a file upload section for supporting documents. Currently, this is a **placeholder** that stores files in component state.

**Note**: Full implementation with signed URLs will be completed in Module 7.

Current behavior:
- Users can select files
- Files are displayed in UI
- Files can be removed
- On form submit, files array is sent (backend should handle or reject for now)

## Security Considerations

1. **HTTPS Only**: Cookies should only be sent over HTTPS in production
2. **CSRF Protection**: Backend should implement CSRF protection
3. **Rate Limiting**: Implement rate limiting on auth endpoints
4. **Password Requirements**: Strong password validation enforced
5. **XSS Protection**: All user input is sanitized by React by default
6. **Token Expiry**: Access tokens should expire in 15 minutes, refresh tokens in 7 days

## Future Enhancements

- [ ] Email verification flow
- [ ] Password reset functionality
- [ ] Two-factor authentication (2FA)
- [ ] Social login (Facebook, GitHub, etc.)
- [ ] Remember me functionality
- [ ] Session management (view/revoke active sessions)
- [ ] Complete file upload with signed URLs (Module 7)

## Troubleshooting

### "Cannot find module" errors
Ensure all dependencies are installed:
```bash
pnpm install
```

### Form validation not working
Check that Zod schemas are imported correctly and `@hookform/resolvers` is installed.

### Google OAuth redirect issues
1. Verify `NEXT_PUBLIC_API_URL` environment variable is set
2. Check backend OAuth configuration
3. Ensure redirect URL is allowlisted in Google Console

### Tests failing
1. Clear test cache: `pnpm test --clearCache`
2. Ensure all mocks are properly configured
3. Check that test setup file is loaded

## Support

For issues or questions, please refer to the main project documentation or create an issue in the repository.
