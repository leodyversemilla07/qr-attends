# QR Attends - Internal Distribution Guide

**⚠️ IMPORTANT: This app is for INTERNAL USE ONLY and is NOT distributed via app stores.**

This guide covers building and distributing QR Attends for internal organization use via direct APK/IPA installation.

## Prerequisites

Before you begin, ensure you have:

1. **Expo Account** with EAS access (FREE tier available)
2. **GitHub Repository** with Actions enabled
3. **NO app store accounts required!** ✅

## Distribution Methods

### ✅ Supported (FREE)
- **Android**: Direct APK installation on any Android device
- **iOS**: Internal development builds via EAS (QR code installation)
- **Expo Go**: Quick testing with limited features

### ❌ NOT Supported
- Google Play Store
- Apple App Store
- Any public app store distribution

---

## Initial Setup

### 1. Expo & EAS Configuration

```bash
# Login to Expo (FREE account)
npx expo login

# Configure EAS (if not already done)
eas build:configure

# Verify configuration
eas build --profile preview --platform android
```

### 2. Environment Variables

Create `.env.local`:

```env
# Development/Production Convex
EXPO_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_DEPLOYMENT=your-deployment-name

# Sentry (optional but recommended)
EXPO_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
EXPO_PUBLIC_APP_ENV=production
EXPO_PUBLIC_APP_VERSION=1.1.0

# Admin credentials (for initial seeding)
ADMIN_EMAIL=admin@yourorg.com
ADMIN_NAME=System Administrator
```

**Important**: Never commit `.env.local` to git. Use GitHub Secrets for CI/CD.

### 3. GitHub Secrets Setup (Optional - for CI/CD)

Go to **Settings > Secrets and variables > Actions** and add:

| Secret Name | Description | How to Get |
|------------|-------------|------------|
| `EXPO_TOKEN` | Expo access token | Run: `eas access-token:create` |
| `SLACK_WEBHOOK_URL` | For build notifications | Optional |

---

## Build Configuration

The `eas.json` is already configured for internal distribution only:

```json
{
  "build": {
    "production": {
      "distribution": "internal",  // ← Not "store"
      "android": {
        "buildType": "apk"         // ← Direct APK, not AAB
      }
    }
  }
  // NOTE: No "submit" section - app stores not used
}
```

---

## Building for Distribution

### Android APK (Recommended)

**Build APK for any Android device:**

```bash
# Build production APK
eas build --profile production --platform android

# Or use npm script
npm run build:production
```

**Download and Distribute:**
1. Wait for build completion (~10-15 minutes)
2. Download `.apk` file from EAS dashboard
3. Share APK via:
   - Email
   - Google Drive
   - Slack
   - Direct download link
4. Users install directly on their Android phones

**Installation Instructions for Users:**
1. Download the APK file
2. Open file on Android phone
3. If prompted, allow "Install from unknown sources"
4. Tap "Install"
5. Open app and start using!

---

### iOS Development Build

**Build for iOS devices (internal use only):**

```bash
# Build development client for iOS
eas build --profile development-device --platform ios
```

**Installation Process:**
1. Build completes and provides QR code
2. Scan QR code with iPhone camera
3. Follow installation prompts
4. **Important**: Trust the developer certificate:
   - Settings → General → VPN & Device Management
   - Tap your Apple ID
   - Tap "Trust"
5. Open app

**⚠️ iOS Limitations:**
- Builds expire after 7 days (must rebuild)
- Each device must be registered
- Requires accepting developer certificate
- Cannot distribute to unlimited devices easily

**Alternative for iOS: Expo Go**
```bash
# For quick testing without building
npx expo start
# Scan QR code with iPhone running Expo Go app
```

---

## Distribution Workflows

### Manual Distribution

**For small teams (recommended):**

1. Build APK: `eas build --platform android`
2. Download APK from EAS dashboard
3. Upload to shared location (Google Drive, Slack, etc.)
4. Share link with team members
5. Team members download and install

### GitHub Actions (Automated)

Use the included workflow for automated builds:

```bash
# Go to GitHub → Actions → Build Production
# Click "Run workflow"
# Select platform (Android recommended)
# Build completes and provides download link
```

---

## Release Checklist

Before each release:

### Code Quality
- [ ] All tests passing (`npm test`)
- [ ] TypeScript check passing (`npm run typecheck`)
- [ ] No lint errors (`npm run lint`)
- [ ] Version updated in `package.json`
- [ ] Changelog updated

### Testing
- [ ] Tested on physical Android device
- [ ] Tested on physical iOS device (if applicable)
- [ ] Offline mode tested
- [ ] QR scanning tested
- [ ] Critical user flows verified

### Build
- [ ] Android APK builds successfully
- [ ] iOS build completes (if needed)
- [ ] APK file size reasonable (< 100MB)
- [ ] App launches without crashes

### Distribution
- [ ] APK uploaded to shared location
- [ ] Installation instructions shared
- [ ] Team notified of new version
- [ ] Previous version backed up

---

## Troubleshooting

### Android Issues

**"App not installed" error:**
- Uninstall previous version first
- Check APK downloaded completely
- Enable "Install unknown apps" for browser/file manager

**"Parse error":**
- Download may be corrupted - rebuild
- Check Android version (requires Android 6.0+)

**App crashes on launch:**
- Check Convex URL is correct
- Verify API endpoints are accessible
- Check device has enough storage

### iOS Issues

**"Untrusted Developer":**
- Settings → General → VPN & Device Management
- Tap your Apple ID → Trust

**"App won't open" or "Expired":**
- Build has expired (7-day limit for free builds)
- Rebuild and reinstall
- Trust new certificate

**"Unable to install":**
- Device may not be registered
- Build for different architecture
- Check iOS version compatibility (requires iOS 13+)

---

## Version Management

### Version Numbering

Use semantic versioning:
- **MAJOR**: Major features or breaking changes
- **MINOR**: New features, backwards compatible
- **PATCH**: Bug fixes, small improvements

```bash
# Bump version
npm version patch   # 1.0.0 → 1.0.1
npm version minor   # 1.0.0 → 1.1.0
npm version major   # 1.0.0 → 2.0.0
```

### Release Notes

Create release notes for each version:

```markdown
## Version 1.1.0

### New Features
- Bulk QR code generation
- PDF report export
- Analytics dashboard

### Bug Fixes
- Fixed offline sync issue
- Improved QR scanning speed

### Installation
Download: [qr-attends-1.1.0.apk](link)
```

---

## Security Considerations

### APK Distribution
- Share APK via secure channels (not public links)
- Consider password-protecting download
- Inform users to only install from trusted sources

### Data Protection
- Ensure Convex deployment is secure
- Use strong admin passwords
- Enable audit logging
- Regular security reviews

### Device Management
- Keep track of which devices have the app
- Plan for app updates across devices
- Have rollback plan if issues arise

---

## Best Practices

### For Android
1. **Test on multiple devices** if possible (different screen sizes, Android versions)
2. **Use Google Drive** for easy APK sharing
3. **Enable auto-updates** by notifying users of new versions
4. **Version your builds** clearly (qr-attends-v1.1.0.apk)

### For iOS
1. **Set calendar reminder** to rebuild every 6 days (before expiry)
2. **Keep device list** of who has the app installed
3. **Use TestFlight alternative** - consider enterprise distribution if scaling
4. **Document certificate trust** process for users

### General
1. **Keep builds small** - remove unused assets
2. **Test thoroughly** before distribution
3. **Backup old versions** in case rollback needed
4. **Monitor error tracking** (Sentry) for issues

---

## Quick Commands Reference

```bash
# Development
npm run dev              # Start development
npm run android          # Android emulator
npm run ios             # iOS simulator

# Testing
npm test                # Run tests
npm run validate        # Pre-build validation

# Building
npm run build:android   # Build Android APK
eas build --platform ios --profile development-device  # iOS
npm run build:production # Production build

# Quality
npm run lint            # Check code style
npm run typecheck       # TypeScript check
```

---

## Summary

### What You DON'T Need
- ❌ Apple Developer Account ($99/year)
- ❌ Google Play Developer Account ($25)
- ❌ App store submission process
- ❌ App review wait times
- ❌ App store compliance requirements

### What You DO Need
- ✅ Expo Account (FREE)
- ✅ Android devices (any)
- ✅ iOS devices (for iOS testing)
- ✅ Internal distribution method (email, drive, etc.)

### Total Cost
**$0** - This app is designed for FREE internal distribution!

---

## Support

### Documentation
- **TESTING_ON_DEVICES.md** - Phone installation guide
- **SETUP_GUIDE.md** - Complete setup instructions
- **NEW_FEATURES.md** - Feature documentation

### Getting Help
1. Check error logs in Sentry
2. Review Convex dashboard for backend issues
3. Check EAS build logs for build failures
4. Test on different devices to isolate issues

---

**Remember**: This app is for internal use only. Do not attempt to submit to app stores as it requires compliance with store policies and additional fees.

**Happy internal distributing!** 🚀
