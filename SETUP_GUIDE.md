# 🚀 QR Attends - Complete Setup Guide

**Version**: 1.1.0  
**Status**: ✅ Production Ready  
**Cost**: FREE to test on physical devices!

---

## 📋 Quick Setup (5 Minutes)

### Prerequisites
- Node.js 18+ installed
- A phone (Android or iOS) for testing
- NO app store accounts needed! ✅

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
```bash
# Copy example environment file
cp .env.example .env.local

# Edit .env.local with your Convex URL
# (Get this from your Convex dashboard)
```

### 3. Start Development
```bash
# Start Convex backend
npm run start:dev

# In another terminal, start Expo
npm run dev
```

### 4. Test on Your Phone (FREE!)

**Android (Easiest):**
```bash
# Build APK
eas build --profile preview --platform android

# Install APK on your phone
# See TESTING_ON_DEVICES.md for detailed steps
```

**iOS:**
```bash
# Install Expo Go on iPhone (FREE from App Store)
# Then run:
npx expo start

# Scan QR code with iPhone camera
```

---

## 📁 Project Structure

```
qr-attends/
├── app/                      # React Native screens
│   ├── (tabs)/               # Main navigation tabs
│   │   ├── index.tsx        # Home/Dashboard
│   │   ├── members.tsx      # Member management
│   │   └── profile.tsx      # Profile & settings
│   ├── event/[id].tsx       # Event details
│   ├── member/[id].tsx      # Member details
│   └── ...
│
├── components/               # UI components
│   ├── ui/                  # Base components
│   ├── event/               # Event-specific
│   └── reports/             # NEW: Reports & analytics
│       ├── BulkQRGenerator.tsx
│       ├── PDFReportGenerator.tsx
│       └── AttendanceAnalytics.tsx
│
├── convex/                   # Backend functions
│   ├── officers/            # Auth (modular)
│   ├── events.ts            # Event CRUD
│   ├── members.ts           # Member CRUD
│   └── attendance.ts        # Check-in logic
│
├── hooks/                    # Custom React hooks
│   ├── useEventDetails.ts   # With TanStack Query
│   └── useQueries.ts        # All data queries
│
├── utils/                    # Utilities
│   ├── auth-context.tsx     # Authentication
│   ├── offline-manager.ts   # Offline queue
│   ├── notifications.ts     # Push notifications
│   ├── sentry.ts           # Error tracking
│   └── query-client.ts     # TanStack Query
│
├── e2e/                      # E2E tests
│   └── flows/              # Maestro test flows
│
└── docs/                     # Documentation
    ├── TESTING_ON_DEVICES.md
    ├── NEW_FEATURES.md
    └── FREE_TESTING_SUMMARY.md
```

---

## ✨ Features Included

### Core Features
- ✅ QR code attendance tracking
- ✅ Offline-first architecture
- ✅ Event management
- ✅ Member management
- ✅ Role-based access control
- ✅ Audit logging
- ✅ CSV export

### NEW in v1.1.0
- ✅ **Bulk QR Generator** - Export all member QRs
- ✅ **PDF Reports** - Professional attendance reports
- ✅ **Analytics Dashboard** - Visual insights
- ✅ **Push Notifications** - Event reminders
- ✅ **TanStack Query** - Performance optimization
- ✅ **Sentry Integration** - Error tracking
- ✅ **E2E Testing** - Maestro test flows

---

## 🆓 Free Testing Options

### No App Store Accounts Needed!

**Option 1: Android APK (FREE)**
- Build APK with EAS (FREE tier)
- Install on any Android device
- Share APK with testers
- **Cost**: $0

**Option 2: iOS via Expo Go (FREE)**
- Install Expo Go from App Store
- Scan QR code to test
- **Limitations**: Some native features
- **Cost**: $0

**Option 3: iOS Development Build (FREE)**
- Build with EAS
- Install via QR code
- Full native features
- **Limitations**: 7-day expiry
- **Cost**: $0

See **TESTING_ON_DEVICES.md** for detailed instructions.

---

## 🧪 Testing

### Unit Tests
```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # With coverage
```

### E2E Tests
```bash
# Install Maestro first
curl -Ls "https://get.maestro.mobile.dev" | bash

# Run tests
maestro test e2e/flows/
```

### Manual Testing Checklist
- [ ] Login/logout works
- [ ] Create event
- [ ] Register member
- [ ] Scan QR code
- [ ] Manual check-in
- [ ] Offline mode
- [ ] Sync when online
- [ ] Export CSV
- [ ] Generate PDF report
- [ ] View analytics
- [ ] Bulk QR generation

---

## 📱 Build Commands

### Development
```bash
npm run dev          # Start everything
npm run android      # Android emulator
npm run ios          # iOS simulator
```

### Build for Testing (FREE)
```bash
# Android APK (FREE)
npm run build:android
# OR
eas build --profile preview --platform android

# iOS (FREE - requires device setup)
npm run build:ios
# OR
eas build --profile development-device --platform ios
```

### Build for Production
```bash
npm run build:production
```

---

## 🔧 Environment Variables

Create `.env.local`:

```env
# Convex (Required)
EXPO_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_DEPLOYMENT=dev:your-deployment

# Sentry (Optional)
EXPO_PUBLIC_SENTRY_DSN=your_sentry_dsn

# App Info
EXPO_PUBLIC_APP_ENV=development
EXPO_PUBLIC_APP_VERSION=1.1.0
```

---

## 🚀 Deployment (When Ready)

### Current Setup: FREE Testing
- ✅ No app store accounts needed
- ✅ Build APK for Android
- ✅ Build for iOS via QR code
- ✅ Test on physical devices

### Future: App Stores (Optional)
If you want to distribute via app stores later:
- Apple Developer: $99/year
- Google Play: $25 one-time
- Update eas.json to add submission config
- See DEPLOYMENT.md for details

---

## 📊 Monitoring

### Sentry (Error Tracking)
```typescript
import { logError } from '@/utils/sentry';

// In your error handler
logError(error, { context: 'checkout' });
```

### Analytics
Built-in analytics dashboard shows:
- Total check-ins
- Attendance trends
- Member statistics
- Event analytics

---

## 🐛 Troubleshooting

### Common Issues

**"Module not found" errors:**
```bash
npm install
```

**Convex connection failed:**
- Check `.env.local` has correct Convex URL
- Run `npx convex dev` to start backend

**Build fails:**
```bash
eas login  # Make sure logged in
echo " EXPO_TOKEN"  # Check token is set
```

**iOS won't install:**
- Trust certificate in Settings
- Rebuild if expired (7 days)

**Android won't install:**
- Enable "Install unknown apps"
- Check APK downloaded fully

See **TESTING_ON_DEVICES.md** for more.

---

## 📚 Documentation

| File | Description |
|------|-------------|
| **TESTING_ON_DEVICES.md** | FREE testing on physical phones |
| **NEW_FEATURES.md** | All v1.1.0 features detailed |
| **FREE_TESTING_SUMMARY.md** | Cost comparison & free options |
| **DEPLOYMENT.md** | Production deployment (optional) |
| **PRODUCTION_READY.md** | Release checklist |
| **IMPLEMENTATION_SUMMARY.md** | All engineering improvements |
| **RELEASE_NOTES_v1.1.0.md** | Version release notes |

---

## 🎯 Quick Commands Reference

```bash
# Development
npm run dev                    # Start dev server
npm run android               # Android emulator
npm run ios                   # iOS simulator

# Testing
npm test                      # Unit tests
npm run e2e                   # E2E tests
npm run validate              # Pre-deployment check

# Building
npm run build:android         # Build Android APK
npm run build:ios            # Build iOS
npm run build:production     # Production build

# Quality
npm run lint                  # Check code style
npm run typecheck            # TypeScript check
npm run test:coverage        # Test coverage
```

---

## 💡 Next Steps

After setup:

1. **Test Core Features**
   - Create an event
   - Register members
   - Scan QR codes
   - Check offline mode

2. **Try New Features**
   - Generate bulk QR codes
   - Create PDF reports
   - View analytics
   - Set up notifications

3. **Share with Testers**
   - Build APK for Android
   - Share install link for iOS
   - Gather feedback

4. **Iterate**
   - Fix any issues
   - Add more features
   - Prepare for launch (if desired)

---

## 🎉 You're Ready!

**What you have:**
- ✅ Complete attendance app
- ✅ All features working
- ✅ FREE testing on phones
- ✅ Professional codebase
- ✅ Full documentation

**Total Cost:** $0  
**Time to Test:** ~15 minutes

---

## 📞 Support

### Resources
- Check documentation files in repo
- Expo docs: https://docs.expo.dev/
- Convex docs: https://docs.convex.dev/

### Issues
- TypeScript errors → Run `npm run typecheck`
- Test failures → Run `npm test`
- Build issues → Check `TESTING_ON_DEVICES.md`

---

**Built with ❤️ using React Native + Expo + Convex**

**Version 1.1.0 - Production Ready** 🚀
