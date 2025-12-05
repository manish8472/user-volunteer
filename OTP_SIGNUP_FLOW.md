# OTP Verification Flow for Signup

## Overview
The signup process now includes email verification via OTP (One-Time Password) before user registration is completed.

## User Flow

### 1. **Signup Form Submission**
- User fills out signup form (Volunteer or NGO)
- On submit:
  - OTP is sent to their email
  - Signup data is stored in sessionStorage
  - User is redirected to OTP verification page

### 2. **OTP Verification**
- User receives 6-digit OTP via email (expires in 10 minutes)
- User enters OTP on verification page
- Features:
  - Auto-focus next input
  - Paste support for 6-digit codes
  - Resend OTP (with 60-second cooldown)
  - Max 5 verification attempts

### 3. **Registration Completion**
- After successful OTP verification:
  - Verification token is received from backend
  - Registration is completed with verification token
  - User data is saved in database
  - User is redirected to login page

## Technical Implementation

### Frontend (user-clients)

#### New Files Created:
1. **`services/otp.api.ts`**
   - `sendOtp()` - Send OTP to email
   - `verifyOtp()` - Verify OTP code

2. **`components/forms/OtpVerificationForm.tsx`**
   - 6-digit OTP input component
   - Auto-focus and paste support
   - Resend functionality with cooldown
   - Error handling

3. **`app/auth/verify-otp/page.tsx`**
   - OTP verification page
   - Handles OTP verification flow
   - Completes registration after verification
   - Redirects to login

#### Modified Files:
1. **`components/forms/VolunteerSignupForm.tsx`**
   - Changed to send OTP instead of immediate registration
   - Stores signup data in sessionStorage
   - Redirects to OTP verification page

2. **`components/forms/NgoSignupForm.tsx`**
   - Same changes as VolunteerSignupForm
   - Note: Document files cannot be stored in sessionStorage

### Backend (server)

#### Existing API Endpoints Used:
1. **POST `/api/auth/otp/send`**
   - Sends OTP to email
   - Request: `{ email, purpose: 'signup' }`
   - Response: `{ message }`

2. **POST `/api/auth/otp/verify`**
   - Verifies OTP code
   - Request: `{ email, otp, purpose: 'signup' }`
   - Response: `{ success, message, verificationToken, email, purpose }`

3. **POST `/api/auth/register/volunteer`**
   - Completes volunteer registration
   - Now accepts optional `verificationToken` field
   - If provided, marks email as verified

4. **POST `/api/auth/register/ngo`**
   - Completes NGO registration
   - Now accepts optional `verificationToken` field
   - If provided, marks email as verified

## Data Flow

```
┌─────────────────┐
│  Signup Form    │
│  (Volunteer/NGO)│
└────────┬────────┘
         │
         ├─ Send OTP to email
         │  POST /api/auth/otp/send
         │
         ├─ Store data in sessionStorage
         │  - pendingSignup (JSON)
         │  - pendingEmail (string)
         │  - pendingUserType ('volunteer'|'ngo')
         │
         ▼
┌─────────────────┐
│  OTP Verify     │
│  Page           │
└────────┬────────┘
         │
         ├─ User enters OTP
         │  POST /api/auth/otp/verify
         │  ← verificationToken
         │
         ├─ Complete registration
         │  POST /api/auth/register/{volunteer|ngo}
         │  with verificationToken
         │
         ├─ Clear sessionStorage
         │
         ▼
┌─────────────────┐
│  Login Page     │
│  ?registered=true
└─────────────────┘
```

## Session Storage Schema

```typescript
// Stored in sessionStorage during signup flow
pendingSignup: {
  // Volunteer
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  location: {
    city: string;
    state: string;
    country: string;
  };
  
  // OR NGO
  name: string;  // organization name
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  website?: string;
  description: string;
  registrationNumber?: string;
  slug: string;
  address: { ... };
  contactPerson: { ... };
  // Note: documents are NOT stored (can't serialize Files)
}

pendingEmail: string;  // email address
pendingUserType: 'volunteer' | 'ngo';
```

## Security Features

1. **OTP Storage**: OTPs are hashed (SHA-256) before storage in database
2. **Rate Limiting**: 
   - OTP send: Limited per IP/email
   - OTP verify: Limited per IP/email
3. **Expiration**: OTPs expire after 10 minutes
4. **Max Attempts**: Maximum 5 verification attempts per OTP
5. **One-time Use**: OTPs are marked as verified after successful use
6. **Verification Token**: Short-lived JWT token (15 min) used to complete registration

## Known Limitations

1. **Document Files (NGO)**: 
   - Document files cannot be stored in sessionStorage
   - Users may need to re-upload documents after OTP verification
   - Future enhancement: Consider converting small files to base64 for storage

## User Experience

### Success Path:
1. Fill signup form → "Create Account"
2. See success message: "OTP sent to your email"
3. Receive email with 6-digit code
4. Enter code on verification page
5. Automatic registration completion
6. Redirect to login with success message

### Error Handling:
- Invalid OTP: Clear inputs, show error message
- Expired OTP: Allow resend
- Max attempts exceeded: Must request new OTP
- Network errors: Show appropriate error messages
- Session data missing: Redirect back to signup

## Testing Checklist

- [ ] Volunteer signup sends OTP
- [ ] NGO signup sends OTP
- [ ] OTP email is received
- [ ] OTP verification succeeds with correct code
- [ ] OTP verification fails with incorrect code
- [ ] Resend OTP works (with cooldown)
- [ ] Registration completes after verification
- [ ] User redirected to login page
- [ ] Email is marked as verified in database
- [ ] Session storage is cleared after success
- [ ] Back button returns to signup form
- [ ] Error messages display correctly
