# Convex Deployment Guide

## Overview

QR Attends uses Convex for its backend. This guide covers development and production deployment.

---

## Convex Deployments

### Development
- **URL:** http://127.0.0.1:8181 (local)
- **Deployment ID:** dev:dazzling-anaconda-162
- **Team:** lunar-spectre
- **Project:** qr-attends
- **Command:** `npx convex dev`

### Production
- **URL:** https://glorious-axolotl-616.convex.cloud
- **HTTP Actions:** https://glorious-axolotl-616.convex.site
- **Command:** `npx convex deploy`

---

## Quick Start

### Development Mode
```bash
# Start Convex dev server AND Expo
npm run dev

# Or separately:
npx convex dev          # Terminal 1
npx expo start          # Terminal 2
```

### Production Deployment
```bash
# Deploy Convex functions to production
npm run deploy:prod

# Build the app
npm run build:android   # For Android
npm run build:ios       # For iOS
```

---

## Environment Configuration

### .env.local
Create a `.env.local` file in the root directory:

```env
# Development (local)
EXPO_PUBLIC_CONVEX_URL=http://127.0.0.1:8181
ACTIVE_ENVIRONMENT=dev

# Production
CONVEX_PRODUCTION_URL=https://glorious-axolotl-616.convex.cloud
ACTIVE_ENVIRONMENT=production
```

### Current Settings
- **Development:** Uses local Convex server (`npx convex dev`)
- **Production:** https://glorious-axolotl-616.convex.cloud

---

## Deployment Workflow

### 1. Develop Locally
```bash
# Make changes to Convex functions in /convex directory
# Test changes locally
npx convex dev
npx expo start
```

### 2. Deploy to Production
```bash
# Deploy Convex functions
npx convex deploy

# The production URL is already configured
# https://glorious-axolotl-616.convex.cloud
```

### 3. Build Mobile App
```bash
# Build for Android (APK/AAB)
eas build --platform android

# Build for iOS (IPA)
eas build --platform ios

# Build for both
eas build
```

### 4. Distribute
```bash
# Submit to Google Play
eas submit --platform android

# Submit to App Store
eas submit --platform ios
```

---

## Switching Environments

### Option 1: Edit .env.local
Change `ACTIVE_ENVIRONMENT` in `.env.local`:
```env
ACTIVE_ENVIRONMENT=dev      # Local development
ACTIVE_ENVIRONMENT=production  # Production
```

### Option 2: Environment Variable
```bash
# Linux/Mac
ACTIVE_ENVIRONMENT=production npx convex deploy

# Windows
set ACTIVE_ENVIRONMENT=production
npx convex deploy
```

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Convex + Expo together |
| `npm run start:dev` | Start Convex dev server only |
| `npm run deploy:prod` | Deploy Convex to production |
| `npm run build:android` | Build Android APK |
| `npm run build:ios` | Build iOS IPA |
| `npm run build` | Build for all platforms |

---

## Convex File Structure

```
qr-attends/
├── convex/
│   ├── schema.ts           # Database schema
│   ├── officers.ts         # Auth & audit functions
│   ├── events.ts           # Event CRUD
│   ├── members.ts          # Member CRUD
│   ├── attendance.ts       # Check-in logic
│   ├── search.ts           # Search functions
│   ├── auth_helpers.ts     # Auth utilities
│   └── _generated/         # Auto-generated types
```

---

## Database Schema

### Tables
- `events` - Event records
- `members` - Member records
- `attendance` - Check-in records
- `officers` - User accounts
- `authSessions` - Session tokens
- `passwordResets` - Password reset tokens
- `auditLogs` - Audit trail

### Indexes
- Events indexed by date
- Members indexed by studentId, cardNo
- Attendance indexed by event, member

---

## Troubleshooting

### Convex not connecting
```bash
# Check Convex is running
npx convex dev

# Verify URL in .env.local
cat .env.local
```

### Deployment failed
```bash
# Check for errors in convex functions
npx convex dev --verbose

# Verify environment
echo $ACTIVE_ENVIRONMENT
```

### Build errors
```bash
# Clear cache
npx expo start --clear

# Reinstall dependencies
rm -rf node_modules
npm install
```

---

## Production Checklist

- [ ] All Convex functions tested locally
- [ ] Deployed to production: `npx convex deploy`
- [ ] App built: `eas build`
- [ ] Tested on physical device
- [ ] Backup created
- [ ] Team trained

---

## Support

- Convex Docs: https://docs.convex.dev
- Expo Docs: https://docs.expo.dev
- EAS Build: https://docs.expo.dev/build/introduction
