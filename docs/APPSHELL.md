# AppShell Implementation

## Overview

This document describes the AppShell layout system and role-aware navigation implementation for VolunteerHub.

## Structure

### Components

#### `/components/layout/AppShell.tsx`
The main layout wrapper that provides consistent structure across all pages.
- Wraps pages with Header and Footer
- Provides flex layout (sticky header, flex-grow main, footer)
- Applies global background styling

#### `/components/layout/Header.tsx`
Role-aware navigation header with responsive design.
- **Logged Out**: Shows Login/Signup buttons and guest navigation
- **Volunteer**: My Dashboard, My Applications, Browse Opportunities
- **NGO**: Dashboard, My Opportunities, Volunteers
- **Admin**: Admin Dashboard, Users, NGOs
- Mobile responsive with hamburger menu
- User avatar and role badge when authenticated

#### `/components/layout/Footer.tsx`
Footer component with links and branding.
- Quick Links section
- For NGOs section
- Legal links
- Copyright and branding

#### `/components/ui/NavLink.tsx`
Navigation link component with active state detection.
- Uses Next.js `usePathname` for active detection
- Supports exact matching
- Customizable active/inactive styles

### Store

#### `/store/authStore.ts`
Zustand store for authentication state (stub/mock for now).
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: 'volunteer' | 'ngo' | 'admin' | null;
}
```

**Methods:**
- `login(user)` - Set authenticated user
- `logout()` - Clear user state
- `setRole(role)` - Change user role (for testing)

### Pages

#### `/app/layout.tsx`
Root layout with comprehensive SEO meta tags:
- OpenGraph tags
- Twitter Card tags
- Robots meta
- Viewport configuration
- Wraps all pages with AppShell

#### `/app/page.tsx`
Landing page with hero, features, and CTA sections.

#### `/app/error.tsx`
Error boundary page with reset functionality.

#### `/app/not-found.tsx`
404 page with navigation options.

## Usage

### Using AppShell

The AppShell is automatically applied to all pages through `layout.tsx`. No additional configuration needed.

### Testing Different Roles

Use the auth store to simulate different user states:

```typescript
import { useAuth } from '@/store/authStore';

// In a component
const { login, logout, setRole } = useAuth();

// Log in as volunteer
login({
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'volunteer'
});

// Change to NGO
setRole('ngo');

// Log out
logout();
```

### Adding New Routes

1. Create page in `/app` directory
2. Page will automatically be wrapped with AppShell
3. Navigation will adjust based on user role

## Navigation Behavior

### Guest (Not Logged In)
- Browse Opportunities
- About
- Contact
- Login / Sign Up buttons

### Volunteer Role
- Browse Opportunities
- My Dashboard (`/volunteer/dashboard`)
- My Applications (`/volunteer/applications`)
- User menu with logout

### NGO Role
- Dashboard (`/ngo/dashboard`)
- My Opportunities (`/ngo/opportunities`)
- Volunteers (`/ngo/volunteers`)
- User menu with logout

### Admin Role
- Admin Dashboard (`/admin/dashboard`)
- Users (`/admin/users`)
- NGOs (`/admin/ngos`)
- User menu with logout

## Responsive Design

### Desktop (≥768px)
- Full horizontal navigation
- User menu in header
- All links visible

### Mobile (<768px)
- Hamburger menu
- Slide-down navigation
- Touch-friendly buttons
- Simplified user info

## Testing

Run the Header component tests:

```bash
pnpm test
```

Tests cover:
- Logged out state rendering
- Volunteer role navigation
- NGO role navigation
- Admin role navigation
- Mobile menu toggle
- Logout functionality

## SEO Features

The root layout includes:
- Title and description
- Keywords
- OpenGraph tags for social sharing
- Twitter Card tags
- Robots directives
- Viewport configuration

## Color Scheme

The design uses the custom color palette defined in `tailwind.config.js`:
- **Primary**: Sky/Teal (`#0EA5E9`)
- **Secondary**: Emerald (`#10B981`)
- **Accent**: Amber (`#FBBF24`)
- **Danger**: Rose (`#FB7185`)
- **Neutrals**: Slate scale

## Next Steps

To integrate with real authentication:
1. Replace `authStore.ts` stub with real API calls
2. Add authentication context/provider
3. Implement protected routes
4. Add session persistence
5. Connect to backend authentication service
