# Profile Pages & Resume Management

## Overview

This implementation provides comprehensive profile editing capabilities for both volunteers and NGOs, including resume/document uploads, profile completeness tracking, and a reusable tag input component.

## Files Created

### Services & API Layer (1 file)
- **`services/users.api.ts`**: Complete user profile API with:
  - User profile management (getMe, updateProfile)
  - NGO profile management
  - File upload helpers (signed URLs)
  - Resume and avatar upload functions
  - Profile completeness calculator
  - Profile suggestions generator

### Components (1 file)
- **`components/forms/TagInput.tsx`**: Reusable tag input component with:
  - Add/remove tags
  - Keyboard navigation (Enter to add, Backspace to remove)
  - Suggestions dropdown
  - Max tags limit
  - Real-time filtering
  - Accessibility features

### Pages (2 files)
- **`app/dashboard/volunteer/profile/page.tsx`**: Volunteer profile editor
  - Personal information form
  - Skills tag input with suggestions
  - Resume upload (PDF, max 5MB)
  - Avatar upload (images, max 2MB)
  - Profile completeness indicator
  - Inline suggestions
  - Experience and education fields
  - Availability scheduling

- **`app/ngos/[slug]/edit/page.tsx`**: NGO profile editor
  - Organization details form  - Logo upload
  - Areas of work tag input
  - Social media links
  - Registration documents viewer (read-only)
  - Contact information
  - Mission and description
  - Founded year and team size

### Tests (2 files)
- **`__tests__/components/forms/TagInput.test.tsx`**: Unit tests for TagInput
  - Basic add/remove functionality
  - Keyboard interactions
  - Suggestions filtering
  - Max tags limit
  - Disabled state
  - Accessibility

- **`__tests__/integration/profile-save.test.tsx`**: Integration tests
  - Profile loading and display
  - Profile updates with API calls
  - Resume upload flow
  - Avatar upload flow
  - File validation (type, size)
  - Error handling
  - Loading states

## Key Features

### Volunteer Profile Editor

**Profile Completeness Tracking**
- ✅ Real-time completeness percentage calculation
- ✅ Progress bar visualization
- ✅ Inline suggestions for missing fields
- ✅ Smart field prioritization

**File Uploads**
- ✅ Resume upload (PDF only, max 5MB)
- ✅ Avatar upload (images only, max 2MB)
- ✅ Signed URL flow for secure uploads
- ✅ Upload progress indicators
- ✅ File validation (type and size)
- ✅ Resume preview/download

**Skills Management**
- ✅ Tag input with common skills suggestions
- ✅ Add/remove skills easily
- ✅ Max 20 skills limit
- ✅ Keyboard-friendly interface

**Form Fields**
- ✅ Name, email, phone, location
- ✅ Bio/about me
- ✅ Work experience
- ✅ Education
- ✅ Availability

### NGO Profile Editor

**Organization Details**
- ✅ Name, mission, description
- ✅ Founded year, team size
- ✅ Contact information
- ✅ Address (city, state, country)

**Branding**
- ✅ Logo upload (images, max 2MB)
- ✅ Instant preview

**Areas of Work**
- ✅ Tag input with common causes
- ✅ Up to 10 focus areas
- ✅ Suggestions dropdown

**Social Media Integration**
- ✅ Facebook, Twitter, LinkedIn, Instagram links
- ✅ Link validation

**Registration Documents**
- ✅ View registration number
- ✅ Download registration documents
- ✅ Read-only display

### TagInput Component

**Features**
- ✅ Add tags by typing and pressing Enter
- ✅ Remove tags with X button or Backspace
- ✅ Suggestions dropdown with filtering
- ✅ Click to select from suggestions
- ✅ Max tags limit enforcement
- ✅ Duplicate prevention
- ✅ Disabled state support
- ✅ Accessibility (ARIA labels, keyboard nav)

**Props**
```typescript
{
  tags: string[];              // Current tags array
  onChange: (tags) => void;    // Callback when tags change
  placeholder?: string;        // Input placeholder
  label?: string;              // Optional label
  maxTags?: number;            // Maximum tags allowed
  disabled?: boolean;          // Disable input
  suggestions?: string[];      // Suggestions array
}
```

## API Integration

### Endpoints Used

```typescript
// User Profile
GET    /api/users/me
PUT    /api/users/me

// NGO Profile
GET    /api/ngos/:ngoId
PUT    /api/ngos/:ngoId

// File Uploads
POST   /api/files/sign        // Get signed upload URL
```

### File Upload Flow

1. **Get Signed URL**
   ```typescript
   const { signedUrl, fileUrl } = await getSignedUploadUrl({
     fileName: 'resume.pdf',
     fileType: 'application/pdf',
     fileSize: 1024000,
     category: 'resume'
   });
   ```

2. **Upload to Signed URL**
   ```typescript
   await uploadFileToSignedUrl(signedUrl, file);
   ```

3. **Update Profile**
   ```typescript
   await updateProfile({ resumeUrl: fileUrl });
   ```

### Helper Functions

**Resume Upload (Complete Flow)**
```typescript
const resumeUrl = await uploadResume(file);
await updateProfile({ resumeUrl });
```

**Avatar Upload (Complete Flow)**
```typescript
const avatarUrl = await uploadAvatar(file);
await updateProfile({ avatarUrl });
```

**Profile Completeness**
```typescript
const completeness = calculateProfileCompleteness(profile);
// Returns: 0-100 percentage

const suggestions = getProfileSuggestions(profile);
// Returns: ['Add your phone number', 'Upload your resume', ...]
```

## Usage Examples

### Using TagInput Component

```tsx
import TagInput from '@/components/forms/TagInput';

function MyForm() {
  const [skills, setSkills] = useState(['React', 'TypeScript']);
  
  return (
    <TagInput
      tags={skills}
      onChange={setSkills}
      label="Skills"
      placeholder="Type a skill and press Enter"
      maxTags={20}
      suggestions={['JavaScript', 'Python', 'Java']}
    />
  );
}
```

### Uploading Resume

```tsx
const handleResumeUpload = async (file: File) => {
  try {
    // Upload returns the URL
    const resumeUrl = await uploadResume(file);
    
    // Update profile
    await updateProfile({ resumeUrl });
    
    toast.success('Resume uploaded!');
  } catch (error) {
    toast.error('Upload failed');
  }
};
```

### Checking Profile Completeness

```tsx
const profile = await getMe();
const completeness = calculateProfileCompleteness(profile);
const suggestions = getProfileSuggestions(profile);

if (completeness < 100) {
  console.log(`Profile is ${completeness}% complete`);
  console.log('Suggestions:', suggestions);
}
```

## Validation Rules

### Resume Upload
- ✅ File type: PDF only (`application/pdf`)
- ✅ Max size: 5MB (5,242,880 bytes)
- ✅ Required: False (optional field)

### Avatar/Logo Upload
- ✅ File type: Images only (`image/*`)
- ✅ Max size: 2MB (2,097,152 bytes)
- ✅ Required: False (optional field)

### Profile Completeness Calculation

Fields considered for volunteers:
1. Name
2. Email
3. Phone
4. Bio
5. Skills (at least one)
6. Experience
7. Education
8. Availability
9. Resume URL
10. Location

**Formula**: `(filled_fields / total_fields) * 100`

## Profile Completeness Indicator

The profile page displays:
- **Progress bar** with percentage
- **Badge** showing completion status
- **Suggestions card** (only if < 100%)
- **Action items** to complete profile

Example:
```
┌─────────────────────────────────────┐
│ Complete Your Profile         90%  │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│ Suggestions:                        │
│ ✓ Upload your resume                │
│ ✓ Add your location                 │
└─────────────────────────────────────┘
```

## Security & Permissions

### Volunteer Profile
- **Access**: Only authenticated volunteers
- **Edit**: User can only edit their own profile
- **AuthGuard**: `authorize={['volunteer']}`

### NGO Profile
- **Access**: Only authenticated NGO users
- **Edit**: NGO owner only (verified by slug)
- **AuthGuard**: `authorize={['ngo']}`
- **Ownership Check**: Verifies user owns the NGO before allowing edits

## Testing

### Run Tests

```bash
# All tests
pnpm test

# Tag input tests only
pnpm test TagInput.test

# Profile integration tests
pnpm test profile-save.test

# With coverage
pnpm test --coverage
```

### Test Coverage

**TagInput Component**
- ✅ Add/remove tags
- ✅ Keyboard navigation
- ✅ Suggestions filtering
- ✅ Max tags limit
- ✅ Disabled state
- ✅ Accessibility

**Profile Save Flow**
- ✅ Profile loading
- ✅ Form updates
- ✅ Resume upload with validation
- ✅ Avatar upload with validation
- ✅ Error handling
- ✅ Loading states
- ✅ API integration

## Acceptance Criteria ✅

1. ✅ Volunteer can edit profile
2. ✅ Resume upload via signed URL
3. ✅ Avatar upload via signed URL
4. ✅ Profile updates call API
5. ✅ Local cache updates (via refresh)
6. ✅ Profile completeness indicator
7. ✅ Inline suggestions for missing fields
8. ✅ Resume preview/download
9. ✅ NGO profile editor
10. ✅ Registration docs viewer
11. ✅ Unit tests for TagInput
12. ✅ Integration tests for save flow

## Common Skills Suggestions

Volunteer profile includes 17 common skills:
- Technical: JavaScript, TypeScript, React, Node.js, Python
- Design: Graphic Design
- Communication: Communication, Content Writing, Social Media
- Leadership: Leadership, Project Management, Teamwork
- Teaching: Teaching
- Volunteering: First Aid, Event Planning, Fundraising, Community Outreach

## Areas of Work Suggestions (NGO)

14 common causes:
- Education
- Healthcare
- Environment
- Animal Welfare
- Women Empowerment
- Child Welfare
- Elderly Care
- Disaster Relief
- Community Development
- Skill Development
- Poverty Alleviation
- Clean Water
- Sanitation
- Sustainable Development

## Error Handling

All operations include comprehensive error handling:

```typescript
try {
  await updateProfile(data);
  toast.success('Profile updated!');
  await refresh(); // Update auth state
} catch (error) {
  console.error('Error:', error);
  toast.error('Failed to update profile');
}
```

## Loading States

All async operations show loading states:
- ✅ Profile loading skeleton
- ✅ Save button spinner
- ✅ Resume upload progress
- ✅ Avatar upload progress

## Future Enhancements

- [ ] Drag-and-drop file upload
- [ ] Image cropper for avatars
- [ ] PDF viewer inline (instead of external link)
- [ ] Auto-save on blur
- [ ] Profile version history
- [ ] Profile visibility settings
- [ ] Export profile as PDF
- [ ] Profile sharing links
- [ ] Skills endorsements
- [ ] Profile analytics

## File Structure

```
services/
  └── users.api.ts          # User & NGO profile API

components/
  └── forms/
      └── TagInput.tsx      # Reusable tag input

app/
  ├── dashboard/
  │   └── volunteer/
  │       └── profile/
  │           └── page.tsx  # Volunteer profile editor
  └── ngos/
      └── [slug]/
          └── edit/
              └── page.tsx  # NGO profile editor

__tests__/
  ├── components/
  │   └── forms/
  │       └── TagInput.test.tsx
  └── integration/
      └── profile-save.test.tsx
```

## Dependencies

No new dependencies required! Uses existing:
- `lucide-react` - Icons
- `sonner` - Toast notifications
- Existing UI components (Button, Input, Card, etc.)

## Notes

- **Stale-Proof**: Profile snapshots ensure data consistency
- **Type-Safe**: Full TypeScript coverage
- **Accessible**: ARIA labels, keyboard navigation
- **Responsive**: Mobile-friendly layouts
- **Error-Resilient**: Comprehensive error handling
- **User-Friendly**: Clear feedback and loading states
