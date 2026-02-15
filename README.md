# QR Attends - Internal Attendance Management System

<div align="center">

![QR Attends](https://img.shields.io/badge/QR%20Attends-v1.1.0-blue?style=for-the-badge)
![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61DAFB?style=for-the-badge&logo=react)
![Expo](https://img.shields.io/badge/Expo-54-000020?style=for-the-badge&logo=expo)
![Convex](https://img.shields.io/badge/Convex-Serverless-4A0D99?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-3178C6?style=for-the-badge&logo=typescript)

**⚠️ INTERNAL USE ONLY - Not for App Store Distribution ⚠️**

**Offline-first QR code attendance tracking for organizations**

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](./docs/DOCUMENTATION.md)

</div>

---

## 📱 About QR Attends

QR Attends is an **internal mobile application** designed for organization officers to efficiently track member attendance at events using QR code scanning. This app is intended for **private distribution only** and is NOT published on any app stores.

### Distribution Method
- ✅ **Android**: Direct APK installation
- ✅ **iOS**: Internal development builds via EAS
- ❌ **NOT available** on Google Play Store
- ❌ **NOT available** on Apple App Store

### Key Benefits

- ⚡ **Fast Check-ins** - Scan QR codes in 2-3 seconds
- 📴 **Offline Support** - Queue check-ins without internet
- 🔒 **Secure** - bcrypt hashing, audit logging, role-based access
- 📊 **Reports** - Export attendance data to CSV/PDF
- 🎨 **Modern UI** - Dark mode, haptic feedback, smooth animations
- 💰 **Free** - No app store fees or accounts required

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
- 📱 **Bulk QR Generation** - Generate QR codes for all members

### Attendance Tracking
- 📷 QR code scanning with camera
- ⌨️ Manual card number entry
- ✅ Instant check-in with haptic feedback
- 🚫 Duplicate check-in prevention
- 📴 Offline queue with auto-sync
- 📈 Real-time attendance updates

### Reports & Analytics (NEW!)
- 📊 Today's check-ins, total events, total members
- 📈 **Visual Analytics Dashboard** - Charts and insights
- 📄 **PDF Reports** - Professional attendance reports
- 📥 Export attendance to CSV
- 📤 Export member list to CSV
- 📋 Recent activity feed

### User Interface
- 🌓 Dark mode toggle
- 🔄 Pull-to-refresh
- 💫 Haptic feedback
- 📱 Mobile-optimized design
- ⚡ Fast loading with skeleton screens
- 🔔 **Push Notifications** - Event reminders

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

After initial setup, run the seed script to create your first admin account:

```bash
# Open Convex dashboard
npx convex dashboard

# Navigate to Functions → officers → seedInitialOfficer
# Click "Run" to create the initial admin account
```

The seed script will create an admin account. Check your Convex logs for the credentials, or update them via the dashboard.

> ⚠️ **Security Note**: Never commit actual credentials to version control. The seed script generates a secure initial password that should be changed immediately after first login.

### Build for Internal Distribution

**⚠️ This app is NOT distributed via app stores. Use the following methods:**

```bash
# Android - Build APK for direct installation
eas build --profile production --platform android
# Download APK and install on Android devices

# iOS - Build for internal testing
eas build --profile development-device --platform ios
# Install via QR code (requires device registration)
```

See [TESTING_ON_DEVICES.md](./TESTING_ON_DEVICES.md) for detailed installation instructions.

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
│   ├── officers/                # Auth (modular)
│   ├── events.ts                # Event CRUD
│   ├── members.ts               # Member CRUD
│   ├── attendance.ts            # Check-in logic
│   └── auth_helpers.ts          # Auth utilities
│
├── components/
│   ├── ui/                      # UI components
│   └── reports/                 # Reporting components
│       ├── BulkQRGenerator.tsx
│       ├── PDFReportGenerator.tsx
│       └── AttendanceAnalytics.tsx
│
├── hooks/                        # Custom React hooks
├── utils/                        # Utilities
├── e2e/                          # E2E tests
└── docs/                         # Documentation
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

### Generating Bulk QR Codes

1. Go to **Members** tab
2. Tap **Generate QR Codes**
3. Select members (or all)
4. Export as CSV or PDF
5. Print or share QR codes

### Viewing Reports & Analytics

1. Go to **Profile** tab
2. Tap **Reports** or **Analytics**
3. View:
   - Today's check-ins
   - Total check-ins
   - Total events
   - Total members
   - Visual charts and trends
4. Tap **Export PDF** for professional reports

---

## 🔧 Configuration

### Environment Variables

Create `.env.local`:

```env
EXPO_PUBLIC_CONVEX_URL=your-convex-url
CONVEX_DEPLOYMENT=your-deployment
```

### Internal Distribution Setup

This app is designed for internal use only. To distribute:

**Android:**
- Build APK using `eas build --platform android`
- Download APK from EAS dashboard
- Share APK file with users
- Users install directly (allow unknown sources)

**iOS:**
- Build using `eas build --platform ios --profile development-device`
- Install via QR code on registered devices
- Rebuild every 7 days (development build limitation)

See [TESTING_ON_DEVICES.md](./TESTING_ON_DEVICES.md) for complete instructions.

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

## 🧪 Testing

```bash
# Run TypeScript check
npx tsc --noEmit

# Run linting
npm run lint

# Run tests
npm test

# E2E tests
maestro test e2e/flows/
```

---

## 📦 Building for Internal Use

### Development Build

```bash
# iOS Simulator
npx expo run:ios

# Android Emulator
npx expo run:android
```

### Internal Distribution (APK/IPA)

```bash
# Configure EAS
eas build:configure

# Build Android APK (for direct installation)
eas build --platform android --profile production

# Build iOS for internal testing
eas build --platform ios --profile development-device
```

**⚠️ Important**: This app is NOT submitted to app stores. All distribution is internal via APK/IPA files.

---

## ⚠️ Important Notes

### Not for App Store Distribution
- ❌ This app will NOT be published on Google Play Store
- ❌ This app will NOT be published on Apple App Store
- ✅ Designed for internal/private organization use only
- ✅ Distributed via direct APK/IPA installation

### iOS Limitations
- iOS development builds expire after 7 days
- Must rebuild periodically for continued use
- Requires device registration for installation

### Android Advantages
- APK can be installed on any Android device
- No expiration on APK builds
- Easy to share and distribute

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

**Built with ❤️ for internal organization use**

**⚠️ NOT FOR APP STORE DISTRIBUTION ⚠️**

[Report Bug](https://github.com/your-org/qr-attends/issues) • [Request Feature](https://github.com/your-org/qr-attends/issues)

</div>
