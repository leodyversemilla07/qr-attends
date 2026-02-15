# Testing on Physical Devices - FREE (No App Store Required)

This guide shows you how to test QR Attends on physical phones **without** paying for Apple Developer ($99/year) or Google Play ($25).

## 🎯 Quick Overview

**Free Testing Methods:**
1. ✅ **Android APK** - Install directly on any Android phone (FREE)
2. ✅ **iOS Development Build** - Install via QR code with EAS (FREE tier)
3. ✅ **Expo Go** - Quick testing with limited features (FREE)

**What You DON'T Need:**
- ❌ Apple Developer Account ($99/year)
- ❌ Google Play Developer Account ($25)
- ❌ App Store submission
- ❌ Play Store submission

---

## 📱 Method 1: Android APK (Easiest - FREE)

### Step 1: Build APK
```bash
# Build Android APK (FREE - no account needed)
eas build --profile preview --platform android

# Or for production-like build
eas build --profile production --platform android
```

### Step 2: Download APK
1. Wait for build to complete (~10-20 minutes)
2. EAS will provide a download link
3. Download the `.apk` file to your computer

### Step 3: Install on Android Phone
**Option A: Direct Download**
1. Upload APK to Google Drive, Dropbox, or send via email
2. Open link on Android phone
3. Tap "Download"
4. Open downloaded file
5. Tap "Install" (allow unknown sources if prompted)

**Option B: ADB (Developer Method)**
```bash
# Connect phone via USB (enable USB debugging)
adb install path/to/your-app.apk
```

**Option C: QR Code Transfer**
1. Upload APK to file sharing service
2. Generate QR code for the link
3. Scan QR code on Android phone
4. Download and install

### Step 4: Run App
- Find "QR Attends" in app drawer
- Open and test all features!

---

## 🍎 Method 2: iOS Development Build (FREE)

### Important Notes
- **iOS is more restrictive** than Android
- **FREE options are limited** but work for testing
- **Expo Go** is the easiest free method
- **EAS Build** requires Apple ID (free) but NOT Developer account

### Option A: Expo Go (Easiest - FREE)
**Best for:** Quick testing, limited features work

1. **Install Expo Go** on iPhone from App Store (FREE)
2. **Start development server:**
   ```bash
   npx expo start
   ```
3. **Scan QR code** with iPhone camera
4. **App opens in Expo Go**

**Limitations:**
- Some native features may not work
- QR scanning might be limited
- Performance not as good as native build

### Option B: EAS Development Build (FREE)
**Best for:** Full native features testing

#### Prerequisites
- Apple ID (FREE - create at apple.com if needed)
- Physical iPhone
- Mac computer (for easier setup)

#### Step 1: Build for iOS Device
```bash
# Build development client for iOS
eas build --profile development-device --platform ios
```

#### Step 2: Install on iPhone
**EAS Build will provide:**
- QR code to scan
- Or direct install link

**Installation Process:**
1. Scan QR code with iPhone
2. Follow installation prompts
3. Trust the developer certificate:
   - Settings → General → VPN & Device Management
   - Tap your Apple ID
   - Tap "Trust"
4. Open app

**Limitations:**
- App expires after 7 days (rebuild needed)
- Requires rebuilding for updates
- Must re-trust certificate weekly

---

## 🚀 Method 3: Internal Distribution (FREE)

### For Android
```bash
# Build and get shareable link
eas build --profile preview --platform android

# EAS provides install link
# Share link with anyone - they can install directly!
```

### For iOS (Limited)
```bash
# Build for physical device
eas build --profile preview --platform ios

# Share install link with testers
# They must trust your certificate (see iOS section)
```

---

## 📋 Step-by-Step Testing Workflow

### For Android Testing (Recommended)

```bash
# 1. Make sure you're logged into Expo
eas login

# 2. Build APK (FREE)
eas build --profile preview --platform android

# 3. Wait for completion (check status)
eas build:list

# 4. Download APK from provided link
# 5. Transfer to Android phone
# 6. Install and test!
```

**Total Cost:** $0  
**Time:** ~15 minutes build + install

### For iOS Testing

```bash
# 1. Install Expo Go (FREE from App Store)
# 2. Start dev server
npx expo start

# 3. Scan QR code with iPhone
# 4. Test in Expo Go

# OR for full native testing:

# 5. Build development client (FREE)
eas build --profile development-device --platform ios

# 6. Install via provided QR code
# 7. Trust certificate in Settings
# 8. Test full native app
```

**Total Cost:** $0  
**Time:** ~20 minutes build + setup

---

## 🔧 Troubleshooting

### Android Issues

**"App not installed" error:**
- Uninstall previous version first
- Check APK is fully downloaded
- Enable "Install unknown apps" for browser

**"Parse error":**
- Download may be corrupted - rebuild
- Check Android version compatibility (needs Android 6+)

### iOS Issues

**"Untrusted Developer":**
- Settings → General → VPN & Device Management
- Tap your Apple ID → Trust

**"App won't open":**
- Certificate expired (rebuild after 7 days)
- Wrong provisioning profile (rebuild)

**"Expo Go crashes":**
- Some features not supported in Expo Go
- Use development build instead

---

## 🆚 Comparison Table

| Method | Cost | Setup Time | Features | Best For |
|--------|------|------------|----------|----------|
| **Android APK** | FREE | 15 min | Full | Android testing |
| **Expo Go** | FREE | 5 min | Limited | Quick iOS tests |
| **iOS Dev Build** | FREE | 30 min | Full | Full iOS testing |
| **TestFlight** | $99/year | 1 hour | Full | Beta distribution |
| **Play Store** | $25 | 2 hours | Full | Production release |

---

## 💡 Pro Tips

### For Android
1. **Enable Developer Options** on phone for easier debugging
2. **Use APK** for testing with multiple people
3. **Google Drive** is easiest way to share APK

### For iOS
1. **Expo Go** first to verify features work
2. **Development build** for final testing
3. **Set weekly reminder** to rebuild (7-day expiry)

### For Both
1. **Test on multiple devices** if possible
2. **Check offline mode** works properly
3. **Verify camera permissions** for QR scanning
4. **Test notifications** on physical device

---

## 📱 Device Requirements

### Minimum Requirements
**Android:**
- Android 6.0+ (API 23)
- Camera with autofocus
- ~100MB storage

**iOS:**
- iOS 13.0+
- Camera access
- ~150MB storage

---

## 🎉 You're Ready!

**To test on your phone right now:**

**Android:**
```bash
eas build --profile preview --platform android
# Download APK and install
```

**iOS:**
```bash
# Option 1: Expo Go (easiest)
npx expo start
# Scan QR code

# Option 2: Development build
eas build --profile development-device --platform ios
# Install via QR code
```

**All FREE! No app store accounts needed!** 🎊

---

## 📝 Next Steps

After testing on your phone:
1. ✅ Verify all features work
2. ✅ Test QR scanning with real codes
3. ✅ Check offline functionality
4. ✅ Share with friends for beta testing
5. 🚀 When ready for stores, THEN consider paying for accounts

---

**Questions?** Check the main README.md or DEPLOYMENT.md for more details.

**Need help installing?** The EAS build output provides step-by-step instructions specific to your build.
