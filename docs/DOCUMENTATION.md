# QR Attends - Mobile Attendance System

## Documentation v1.0

---

## Table of Contents

1. [App Overview](#app-overview)
2. [Features List](#features-list)
3. [User Guide](#user-guide)
4. [UI/UX Analysis](#uiux-analysis)
5. [Technical Architecture](#technical-architecture)
6. [Security Features](#security-features)
7. [Setup & Deployment](#setup--deployment)

---

## App Overview

**QR Attends** is an offline-first React Native mobile application for QR code-based attendance tracking. Designed for organization officers to efficiently track member attendance at events using QR code scanning.

### Purpose
- Scan member QR codes for instant check-in
- Manage events and members
- Generate attendance reports
- Track system activity via audit logs

### Target Users
- Organization Officers
- Event Administrators
- System Administrators (President/Admin role)

---

## Features List

### 🔐 Authentication
| Feature | Description |
|---------|-------------|
| Login | Email/password authentication |
| Session Management | Secure token-based sessions (7-day expiry) |
| Password Reset | Request and complete password reset |
| Auto Sign-out | Session expiry handling |

### 📅 Event Management
| Feature | Description |
|---------|-------------|
| Create Event | Add events with name, date, time, location, description |
| Edit Event | Modify event details |
| Delete Event | Remove events (owner or admin only) |
| View Events | List all events sorted by date |
| Event Search | Filter by name, location, description |
| Upcoming Events | View future events |
| Recent Events | View past events |

### 👥 Member Management
| Feature | Description |
|---------|-------------|
| Register Member | Add new members with full details |
| Edit Member | Update member information |
| Delete Member | Remove members (admin only) |
| Member List | Alphabetically sorted member display |
| Member Search | Search by name, ID, card, section |
| Bulk Import | Import members via CSV |

### ✅ Attendance & Check-in
| Feature | Description |
|---------|-------------|
| QR Scanner | Camera-based QR code scanning |
| Manual Entry | Enter card number manually |
| Auto Check-in | Instant check-in on successful scan |
| Duplicate Prevention | Block double check-ins |
| Offline Queue | Queue check-ins, sync when online |
| Haptic Feedback | Vibration on successful scan |
| Real-time Sync | WebSocket-powered live updates |

### 📊 Reports & Analytics
| Feature | Description |
|---------|-------------|
| Attendance Stats | Today's check-ins, totals |
| Export CSV | Download attendance data |
| Member Reports | Export member list |
| Recent Activity | Live check-in feed |

### 🎨 User Interface
| Feature | Description |
|---------|-------------|
| Dark Mode | Toggle light/dark themes |
| Pull-to-Refresh | Refresh data by pulling down |
| Loading States | Skeleton loaders |
| Haptic Feedback | Vibration feedback |
| Responsive Design | Mobile-optimized |

### 📋 Audit & Monitoring
| Feature | Description |
|---------|-------------|
| Audit Logs | View all system actions |
| Action Filtering | Filter by LOGIN, CHECK_IN, etc. |
| Timestamps | Full date/time for each action |
| Role-based Access | Admin only viewing |

---

## User Guide

### Getting Started

#### 1. Login
```
1. Open the app
2. Enter email: leodyver@admin.com
3. Enter password: admin
4. Tap "Secure Sign In"
```

#### 2. Create an Event
```
1. Go to Home tab
2. Tap "New Event" (Quick Action)
3. Fill in event details:
   - Event Name
   - Date (YYYY-MM-DD)
   - Time (HH:MM)
   - Location
   - Description (optional)
4. Tap "Create Event"
```

#### 3. Scan Member for Check-in
```
1. Open the event from Home
2. Tap "Scan QR" button
3. Point camera at member's QR code
4. Auto check-in with haptic feedback
```

#### 4. Register Unknown Member
```
1. Scan QR or enter card number
2. If not found, tap "Register"
3. Fill member form:
   - First Name
   - Last Name
   - Middle Initial
   - Student ID
   - Year/Section
   - Card Number (pre-filled)
   - Email (optional)
4. Tap "Register Member"
```

#### 5. View Reports
```
1. Go to Profile tab
2. Tap "Reports" card
3. View stats and recent activity
4. Tap "Export CSV" for reports
```

#### 6. View Audit Logs (Admin)
```
1. Go to Profile tab
2. Tap "Audit Logs" (admin only)
3. View all system actions
```

---

## UI/UX Analysis

### Design System

#### Color Palette
| Color | Hex | Usage |
|-------|-----|-------|
| Primary | `#2563EB` | Main actions, links, accents |
| Secondary | `#1D4ED8` | Secondary buttons |
| Success | `#10B981` | Success states, check-ins |
| Warning | `#F59E0B` | Warnings, pending states |
| Error | `#EF4444` | Errors, delete actions |
| Background | `#F8FAFC` | Light mode background |
| Surface | `#FFFFFF` | Cards, modals |
| Text Primary | `#1E293B` | Headings, important text |
| Text Muted | `#64748B` | Secondary text |

#### Typography
```
h1: 32px, Bold - App titles
h2: 24px, Bold - Screen headings
h3: 20px, Bold - Section headers
h4: 16px, Bold - Card titles
Body: 16px, Regular - Normal text
Small: 14px, Regular - Secondary text
XSmall: 12px, Regular - Captions
```

#### Spacing Scale
```
xs: 4px
sm: 8px
md: 12px
lg: 16px
xl: 20px
2xl: 24px
3xl: 32px
```

#### Border Radius
```
sm: 8px
md: 12px
lg: 16px
xl: 20px
2xl: 24px (Cards)
full: 9999px (Circular elements)
```

### Component Analysis

#### 1. Button Component

**Design Pattern:** Material/TouchableOpacity with variants

**Variants:**
| Variant | Style | Use Case |
|---------|-------|----------|
| Primary | Blue background, white text | Main actions |
| Secondary | Darker blue | Secondary actions |
| Outline | Transparent, border | Less important |
| Ghost | Transparent | Navigation, tertiary |
| Destructive | Red background | Delete, dangerous actions |

**Sizes:**
| Size | Height | Padding |
|------|--------|---------|
| sm | 36px | 12px |
| default | 48px | 20px |
| lg | 56px | 32px |
| icon | 40px | - |

**UX Strengths:**
✅ Clear visual hierarchy  
✅ Loading state with spinner  
✅ Disabled state with opacity  
✅ Icon + text support  
✅ Touch feedback (activeOpacity)

**Improvements:**
⚠️ Could add pressed state color

#### 2. Card Component

**Design Pattern:** Rounded container with border and shadow

**Default Style:**
- Background: White
- Border: 1px, #E2E8F0
- Border Radius: 16px
- Padding: 24px
- Shadow: Small (shadow-sm)

**UX Strengths:**
✅ Consistent elevation  
✅ Clear borders distinguish from background  
✅ Generous padding for readability  
✅ Flexible composition

#### 3. Input Component

**Design Pattern:** Label + TextInput with error states

**Features:**
- Floating label or top label
- Placeholder text
- Keyboard type support
- Secure text entry (passwords)
- Error message display
- Icon integration

**UX Strengths:**
✅ Clear labels  
✅ Visual feedback for errors  
✅ Appropriate keyboard types  
✅ Secure entry toggle

#### 4. Icon System

**Pattern:** Material Icons with SF Symbols naming

**Mapping:**
```
house.fill → home
checkmark.circle.fill → check-circle
plus.circle.fill → add-circle
person.fill → person
calendar → calendar-today
etc.
```

**UX Strengths:**
✅ Consistent icon style  
✅ Semantic naming  
✅ Color support  
✅ Size flexibility

### Screen-by-Screen Analysis

#### Login Screen (`/login`)

**Layout:**
```
[Logo + App Name]
[Subtitle: Secure access...]

[Email Input]
[Password Input]
[Forgot Password link]

[Sign In Button]

[Footer: © 2026 QR Attends]
```

**UX Evaluation:**
| Aspect | Rating | Notes |
|--------|--------|-------|
| Clarity | ⭐⭐⭐⭐⭐ | Clear purpose, helpful subtitle |
| Efficiency | ⭐⭐⭐⭐⭐ | 2 inputs, 1 action |
| Error Prevention | ⭐⭐⭐⭐ | Validation on submit |
| Visual Design | ⭐⭐⭐⭐ | Clean, professional |
| Accessibility | ⭐⭐⭐⭐ | Labels, keyboard types |

**Strengths:**
- Clear visual hierarchy
- Helpful subtitle sets expectations
- Forgot password link visible
- Loading state prevents double submit

**Improvements:**
- Could add "Show password" toggle
- Focus auto-advance between fields

#### Home Screen (`/(tabs)/index`)

**Layout:**
```
[App Name + Welcome Message]

[Stats Row: Today | Total | Events | Members]

[Quick Actions: New Event | Add Member | Import | Reports]

[Upcoming Events section]
  [Event Card 1]
  [Event Card 2]
  ...
```

**UX Evaluation:**
| Aspect | Rating | Notes |
|--------|--------|-------|
| Information Architecture | ⭐⭐⭐⭐⭐ | Logical grouping |
| Quick Actions | ⭐⭐⭐⭐⭐ | One-tap access |
| Visual Hierarchy | ⭐⭐⭐⭐⭐ | Clear importance order |
| Feedback | ⭐⭐⭐⭐ | Loading states, refresh |
| Empty States | ⭐⭐⭐⭐ | Helpful empty state |

**Strengths:**
- Dashboard pattern with stats at top
- Quick actions for frequent tasks
- Event cards show key info (date, time, location)
- "Today/Tomorrow" badges for quick recognition
- Pull-to-refresh support
- Helpful empty state with call-to-action

**Improvements:**
- Could add search for events
- Event count badge on tabs

#### Members Screen (`/(tabs)/members`)

**Layout:**
```
[Header: Members + Count badge]

[Search Bar]

[Member List]
  [Avatar + Name + ID + Section]
  [Avatar + Name + ID + Section]
  ...
```

**UX Evaluation:**
| Aspect | Rating | Notes |
|--------|--------|-------|
| Search | ⭐⭐⭐⭐⭐ | Server-side, multi-field |
| List Design | ⭐⭐⭐⭐ | Clean, shows key info |
| Navigation | ⭐⭐⭐⭐ | Tap to view details |
| Performance | ⭐⭐⭐⭐ | Virtual list, pagination |

**Strengths:**
- Server-side search (handles large lists)
- Searches name, ID, card, section
- Avatar with initials
- Shows student ID and year section
- Pull-to-refresh

**Improvements:**
- Could add filter by year section
- Could add sort options

#### Event Details (`/event/[id]`)

**Layout:**
```
[Event Header: Name, date, time, location]
[Online/Offline indicator]

[Pending sync alert (if offline)]

[Action Buttons: Scan QR | Manual Check-in]

[Attendees section with count]
  [Attendee list]
```

**UX Evaluation:**
| Aspect | Rating | Notes |
|--------|--------|-------|
| Check-in Flow | ⭐⭐⭐⭐⭐ | Scanner + manual fallback |
| Status Visibility | ⭐⭐⭐⭐⭐ | Online/offline clear |
| Attendee List | ⭐⭐⭐⭐ | Shows check-in time |
| Error Handling | ⭐⭐⭐⭐ | Duplicate detection |

**Strengths:**
- Camera scanner with expo-camera
- Manual entry fallback
- Offline queue with sync button
- Duplicate check-in prevention
- Real-time attendee updates
- Haptic feedback on success

**Improvements:**
- Could add search in attendees
- Could add bulk check-in

#### Profile Screen (`/(tabs)/profile`)

**Layout:**
```
[Header: Profile]

[Avatar + Name + Role + "Official Officer" badge]

[Stats Row: Reports | Role]

[Settings section]
  [Push Notifications toggle]
  [Dark Mode toggle]
  [Email display]

[Admin section: Audit Logs (admin only)]

[Sign Out button]
```

**UX Evaluation:**
| Aspect | Rating | Notes |
|--------|--------|-------|
| Personalization | ⭐⭐⭐⭐ | Dark mode, notifications |
| Role Awareness | ⭐⭐⭐⭐ | Shows role clearly |
| Settings | ⭐⭐⭐⭐ | Essential settings only |
| Admin Features | ⭐⭐⭐⭐ | Conditional visibility |

**Strengths:**
- Clear officer profile
- Dark mode toggle
- Admin-only Audit Logs link
- Sign out with confirmation
- Role-specific UI

**Improvements:**
- Could add edit profile
- Could add account security settings

### Overall UX Assessment

#### Strengths
1. **Consistent Design System** - Unified color, typography, spacing
2. **Clear Navigation** - Bottom tabs, consistent back buttons
3. **Offline-First** - Works without internet, syncs later
4. **Quick Actions** - Easy access to frequent tasks
5. **Feedback** - Haptic, loading states, alerts
6. **Error Handling** - Validation, duplicate prevention
7. **Accessibility** - Labels, keyboard types, contrast

#### Areas for Improvement
1. **Search Enhancement** - Add global search
2. **Filters** - Add filtering to lists
3. **Animations** - Add micro-interactions
4. **Empty States** - More contextual empty states
5. **Onboarding** - First-time user guide
6. **Notifications** - Push notification support

#### UX Score: 8.5/10

| Category | Score |
|----------|-------|
| Visual Design | 9/10 |
| Navigation | 9/10 |
| Ease of Use | 8/10 |
| Performance | 9/10 |
| Accessibility | 8/10 |
| Offline Experience | 9/10 |
| **Overall** | **8.5/10** |

---

## Technical Architecture

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React Native 0.81.5 |
| Framework | Expo SDK 54 |
| Styling | NativeWind (Tailwind CSS) |
| Backend | Convex (Serverless) |
| Database | Convex Document Store |
| Real-time | WebSocket |
| State Management | React Context + Hooks |
| Navigation | Expo Router |
| Icons | Material Icons |
| Camera | expo-camera |
| Storage | AsyncStorage |

### Project Structure

```
qr-attends/
├── app/
│   ├── (tabs)/              # Tab navigation screens
│   │   ├── index.tsx        # Home/Dashboard
│   │   ├── members.tsx      # Member list
│   │   └── profile.tsx      # Profile & settings
│   ├── event/
│   │   └── [id].tsx         # Event details + scanner
│   ├── member/
│   │   └── [id].tsx         # Member details
│   ├── create-event.tsx     # Create event modal
│   ├── register-member.tsx  # Add member modal
│   ├── import-members.tsx   # Bulk import
│   ├── reports.tsx          # Reports & exports
│   ├── audit-logs.tsx       # Admin audit viewer
│   ├── scan-qr.tsx          # QR scanner entry
│   ├── login.tsx            # Login screen
│   ├── forgot-password.tsx  # Password reset request
│   ├── reset-password.tsx   # New password form
│   └── _layout.tsx          # Root layout + providers
│
├── convex/                  # Backend functions
│   ├── schema.ts            # Database schema
│   ├── officers.ts          # Auth + audit queries
│   ├── events.ts            # Event CRUD
│   ├── members.ts           # Member CRUD
│   ├── attendance.ts        # Check-in logic
│   └── auth_helpers.ts      # Auth utilities
│
├── components/
│   └── ui/                  # Reusable UI components
│       ├── Button.tsx       # Button with variants
│       ├── Card.tsx         # Card container
│       ├── Input.tsx        # Text input
│       ├── IconSymbol.tsx   # Icon component
│       ├── Skeleton.tsx     # Loading skeleton
│       └── Typography.tsx   # Heading, Text
│
├── utils/
│   ├── auth-context.tsx     # Auth state management
│   ├── theme-context.tsx    # Dark mode state
│   ├── offline-manager.ts   # Offline queue manager
│   ├── cn.ts                # Classname utility
│   └── use-online-status.ts # Network status
│
└── constants/
    └── theme.ts             # Theme constants
```

### Database Schema

```typescript
// Events
events: {
  name: string,
  date: string,           // YYYY-MM-DD
  time: string,           // HH:MM
  location: string,
  description?: string,
  createdBy: string,      // Officer name
  createdAt: string,
}

// Members
members: {
  firstName: string,
  lastName: string,
  middleInitial: string,
  studentId: string,      // Unique
  yearSection: string,
  cardNo: string,         // UUID, Unique
  email?: string,
}

// Attendance
attendance: {
  eventId: Id("events"),
  memberId: Id("members"),
  timestamp: string,
}

// Officers (Auth)
officers: {
  name: string,
  email: string,
  password: string,       // bcrypt hash
  role: string,           // President, Vice President, Secretary, Officer, Admin
  lastSeen?: string,
}

// Sessions
authSessions: {
  officerId: Id("officers"),
  token: string,
  expiresAt: string,
}

// Password Resets
passwordResets: {
  officerId: Id("officers"),
  token: string,
  expiresAt: string,
  used: boolean,
}

// Audit Logs
auditLogs: {
  officerId?: Id("officers"),
  action: string,
  details?: string,
  ipAddress?: string,
  timestamp: string,
}
```

---

## Security Features

### Authentication
- **bcrypt** password hashing (12 rounds)
- **Secure session tokens** (32-byte crypto random)
- **Token encryption** before AsyncStorage
- **Session expiry** (7 days)
- **Rate limiting** (5 login attempts/minute)

### Authorization
- **Role-based access control**
- **President/Admin** - Full access
- **Secretary** - Import members
- **Officer** - Basic access

### Data Protection
- **Offline data encryption**
- **Audit logging** of all actions
- **Input validation** with Zod

---

## Setup & Deployment

### Development Setup

```bash
# Clone the repository
cd qr-attends

# Install dependencies
npm install

# Start Convex backend
npx convex dev

# Start Expo development server
npx expo start
```

### Environment Variables

Create `.env.local`:
```env
EXPO_PUBLIC_CONVEX_URL=your-convex-url
CONVEX_DEPLOYMENT=your-deployment
```

### Build for Production

```bash
# Build for iOS
npx expo run:ios

# Build for Android
npx expo run:android

# Build with EAS
eas build
```

---

## API Reference

### Convex Functions

#### Events
```typescript
api.events.list()                    // All events
api.events.get({ id })              // Single event
api.events.create({ ... })          // Create event
api.events.update({ id, ... })      // Update event
api.events.remove({ id })           // Delete event
api.events.getUpcoming()            // Next 5 events
api.events.getRecent()              // Last 5 events
```

#### Members
```typescript
api.members.list()                  // All members
api.members.get({ id })             // Single member
api.members.create({ ... })         // Create member
api.members.update({ id, ... })     // Update member
api.members.remove({ id })          // Delete member
api.members.search({ term })        // Search members
api.members.bulkImport({ members }) // CSV import
```

#### Attendance
```typescript
api.attendance.checkInByCard({ eventId, cardNo })  // QR scan
api.attendance.checkIn({ eventId, memberId })      // Manual
api.attendance.getByEvent({ eventId })             // Event attendees
api.attendance.getStats()                          // Stats
```

#### Officers
```typescript
api.officers.login({ email, password })          // Login
api.officers.getMe({ token })                    // Current user
api.officers.requestPasswordReset({ email })     // Reset request
api.officers.resetPassword({ token, password })  // Reset password
api.officers.getAuditLogs({ limit })             // Admin only
```

---

## Changelog

### v1.0.0 (Initial Release)
- Officer authentication
- Event management
- Member management
- QR code check-in
- Manual check-in
- Offline support
- Reports & exports
- Audit logging
- Dark mode

---

## License

MIT License

---

## Support

For questions or issues, please open a GitHub issue.

---

*Documentation generated for QR Attends v1.0*
