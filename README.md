# QR Attends - QR Code Attendance Management System

<div align="center">

![QR Attends](https://img.shields.io/badge/QR%20Attends-v1.0.0-blue?style=for-the-badge)
![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61DAFB?style=for-the-badge&logo=react)
![Expo](https://img.shields.io/badge/Expo-54-000020?style=for-the-badge&logo=expo)
![Convex](https://img.shields.io/badge/Convex-Serverless-4A0D99?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-3178C6?style=for-the-badge&logo=typescript)

**Offline-first QR code attendance tracking for organizations**

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](./docs/DOCUMENTATION.md) • [API Reference](./docs/API.md)

</div>

---

## 📱 About QR Attends

QR Attends is a mobile application designed for organization officers to efficiently track member attendance at events using QR code scanning. The app works offline-first, syncing data when connectivity is restored.

### Key Benefits

- ⚡ **Fast Check-ins** - Scan QR codes in 2-3 seconds
- 📴 **Offline Support** - Queue check-ins without internet
- 🔒 **Secure** - bcrypt hashing, audit logging, role-based access
- 📊 **Reports** - Export attendance data to CSV
- 🎨 **Modern UI** - Dark mode, haptic feedback, smooth animations

---

## ✨ Features

### Authentication & Security
- 🔐 Officer login with email/password
- 🔑 Secure session tokens (7-day expiry)
- 🔄 Password reset flow
- 📋 Audit logging of all actions
- 🚦 Rate limiting (5 login attempts/min)
- 👥 Role-based access control

### Event Management
- 📅 Create, edit, delete events
- 📋 View all events sorted by date
- 🔍 Search events by name/location
- 📆 Filter upcoming and recent events

### Member Management
- 👤 Register new members
- ✏️ Edit member information
- 🗑️ Remove members (admin only)
- 🔍 Search members by name, ID, card, section
- 📥 Bulk import via CSV

### Attendance Tracking
- 📷 QR code scanning with camera
- ⌨️ Manual card number entry
- ✅ Instant check-in with haptic feedback
- 🚫 Duplicate check-in prevention
- 📴 Offline queue with auto-sync
- 📈 Real-time attendance updates

### Reports & Analytics
- 📊 Today's check-ins, total events, total members
- 📥 Export attendance to CSV
- 📤 Export member list to CSV
- 📋 Recent activity feed

### User Interface
- 🌓 Dark mode toggle
- 🔄 Pull-to-refresh
- 💫 Haptic feedback
- 📱 Mobile-optimized design
- ⚡ Fast loading with skeleton screens

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Convex CLI (`npm install -g convex`)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/qr-attends.git
cd qr-attends

# Install dependencies
npm install

# Start Convex development server (in a separate terminal)
npx convex dev

# Start Expo development server
npx expo start
```

### First Login

```
Email: leodyversemilla07@gmail.com
Password: admin123
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

## 📁 Project Structure

```
qr-attends/
├── app/                          # React Native screens
│   ├── (tabs)/                   # Tab navigation
│   │   ├── index.tsx            # Home/Dashboard
│   │   ├── members.tsx          # Member list
│   │   └── profile.tsx          # Profile & settings
│   ├── event/[id].tsx           # Event details + QR scanner
│   ├── member/[id].tsx          # Member details
│   ├── create-event.tsx         # Create event modal
│   ├── register-member.tsx      # Add member modal
│   ├── import-members.tsx       # Bulk CSV import
│   ├── reports.tsx              # Reports & exports
│   ├── audit-logs.tsx           # Admin audit viewer
│   ├── scan-qr.tsx              # QR scanner entry
│   ├── login.tsx                # Login screen
│   ├── forgot-password.tsx      # Password reset request
│   ├── reset-password.tsx       # New password form
│   └── _layout.tsx              # Root layout
│
├── convex/                       # Backend functions
│   ├── schema.ts                # Database schema
│   ├── officers.ts              # Auth & audit
│   ├── events.ts                # Event CRUD
│   ├── members.ts               # Member CRUD
│   ├── attendance.ts            # Check-in logic
│   └── auth_helpers.ts          # Auth utilities
│
├── components/
│   └── ui/                      # UI components
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       ├── IconSymbol.tsx
│       ├── Skeleton.tsx
│       └── Typography.tsx
│
├── utils/                        # Utilities
│   ├── auth-context.tsx         # Auth state
│   ├── theme-context.tsx        # Dark mode
│   ├── offline-manager.ts       # Offline queue
│   └── cn.ts                    # ClassName utility
│
├── docs/                         # Documentation
│   ├── DOCUMENTATION.md         # Full documentation
│   └── API.md                   # API reference
│
├── constants/
│   └── theme.ts                 # Theme constants
│
├── .env.local                    # Environment variables
├── app.json                     # Expo config
├── package.json
├── tsconfig.json
└── tailwind.config.js
```

---

## 📖 Usage Guide

### Creating an Event

1. Open the app and log in
2. Tap the **Home** tab
3. Tap **New Event** (Quick Action)
4. Fill in the event details:
   - Event Name (required)
   - Date (YYYY-MM-DD)
   - Time (HH:MM)
   - Location (required)
   - Description (optional)
5. Tap **Create Event**

### Scanning a Member

1. Open an event from the Home tab
2. Tap **Scan QR** button
3. Point camera at member's QR code
4. Member is automatically checked in
5. Haptic feedback confirms success

### Registering an Unknown Member

1. Scan a card or enter UUID manually
2. If member not found, tap **Register**
3. Fill member form (card number pre-filled):
   - First Name
   - Last Name
   - Middle Initial
   - Student ID
   - Year/Section
   - Card Number (UUID)
   - Email (optional)
4. Tap **Register Member**
5. Scan again to check in

### Viewing Reports

1. Go to **Profile** tab
2. Tap **Reports** card
3. View:
   - Today's check-ins
   - Total check-ins
   - Total events
   - Total members
4. Tap **Export CSV** to download data

### Viewing Audit Logs (Admin)

1. Go to **Profile** tab
2. Tap **Audit Logs** (only visible to President/Admin)
3. View all system actions with timestamps

---

## 🔧 Configuration

### Environment Variables

Create `.env.local`:

```env
EXPO_PUBLIC_CONVEX_URL=your-convex-url
CONVEX_DEPLOYMENT=your-deployment
```

### Theme Customization

Edit `constants/theme.ts`:

```typescript
export const theme = {
  colors: {
    primary: '#2563EB',
    secondary: '#1D4ED8',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    // ...
  },
};
```

### Adding New Icons

Edit `components/ui/icon-symbol.tsx`:

```typescript
const MAPPING = {
  'your-icon': 'material-icon-name',
  // ...
};
```

---

## 🔒 Security

### Password Policy
- Minimum 8 characters
- bcrypt hashing with 12 rounds
- No plaintext storage

### Session Management
- 32-byte cryptographically secure tokens
- 7-day expiration
- Token encryption in AsyncStorage

### Rate Limiting
- Login: 5 attempts per minute
- Password reset: 3 requests per hour
- Event creation: 50 per minute
- Check-ins: 100 per minute

### Role Permissions

| Role | Members | Events | Reports | Audit |
|------|---------|--------|---------|-------|
| President | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| Admin | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| Secretary | ✅ Import | ✅ Full | ✅ Full | ❌ |
| Officer | ❌ Read | ✅ Full | ✅ Full | ❌ |

---

## 📊 Database Schema

### Tables

```typescript
// Events
events: {
  name: string,
  date: string,
  time: string,
  location: string,
  description?: string,
  createdBy: string,
  createdAt: string,
}

// Members
members: {
  firstName: string,
  lastName: string,
  middleInitial: string,
  studentId: string,  // unique
  yearSection: string,
  cardNo: string,     // UUID, unique
  email?: string,
}

// Attendance
attendance: {
  eventId: Id("events"),
  memberId: Id("members"),
  timestamp: string,
}

// Officers
officers: {
  name: string,
  email: string,
  password: string,   // bcrypt hash
  role: string,
  lastSeen?: string,
}

// Sessions
authSessions: {
  officerId: Id("officers"),
  token: string,
  expiresAt: string,
}

// Audit Logs
auditLogs: {
  officerId?: Id("officers"),
  action: string,
  details?: string,
  timestamp: string,
}
```

---

## 🧪 Testing

```bash
# Run TypeScript check
npx tsc --noEmit

# Run linting
npm run lint

# Test Convex functions
npx convex dev
```

---

## 📦 Building

### Development Build

```bash
# iOS Simulator
npx expo run:ios

# Android Emulator
npx expo run:android
```

### Production Build (EAS)

```bash
# Configure EAS
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Expo](https://expo.dev/) - React Native framework
- [Convex](https://convex.dev/) - Serverless backend
- [NativeWind](https://www.nativewind.dev/) - Tailwind for React Native
- [expo-camera](https://docs.expo.dev/versions/latest/sdk/camera/) - Camera access
- [bcryptjs](https://www.npmjs.com/package/bcryptjs) - Password hashing

---

<div align="center">

**Built with ❤️ for organizations**

[Report Bug](https://github.com/your-org/qr-attends/issues) • [Request Feature](https://github.com/your-org/qr-attends/issues)

</div>
