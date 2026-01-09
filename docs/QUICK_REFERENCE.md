# 🚀 QR Attends - Deployment Quick Reference

## Convex Deployments

| Environment | URL | Command |
|-------------|-----|---------|
| **Development** | http://127.0.0.1:8181 | `npx convex dev` |
| **Production** | https://glorious-axolotl-616.convex.cloud | `npx convex deploy` |

---

## One-Liner Commands

### Development
```bash
# Start everything for development
npm run dev
```

### Production
```bash
# Deploy Convex functions
npm run deploy:prod

# Build Android
eas build --platform android

# Build iOS
eas build --platform ios
```

---

## File Locations

```
qr-attends/
├── convex/           # Backend functions
├── app/              # React Native screens
├── docs/             # Documentation
│   ├── README.md     # Main docs
│   ├── DEPLOYMENT.md # This guide
│   └── API.md        # API reference
└── scripts/          # Helper scripts
```

---

## Workflow

### 1. Develop
```bash
npm run dev
# Makes changes to /convex functions
```

### 2. Test
```bash
# Open app in Expo Go
npx expo start
# Scan QR code with phone
```

### 3. Deploy
```bash
npm run deploy:prod
# Functions deployed to production
```

### 4. Build
```bash
eas build --platform android
# Download APK/AAB
```

---

## Common Issues

| Problem | Solution |
|---------|----------|
| Convex not connecting | Run `npx convex dev` first |
| Build failed | Run `npx expo start --clear` |
| Functions not updating | Run `npx convex deploy` |

---

## URLs

| Service | URL |
|---------|-----|
| Convex Dev | http://127.0.0.1:8181 |
| Convex Prod | https://glorious-axolotl-616.convex.cloud |
| Expo Dashboard | https://expo.dev/accounts/leodyversemilla07/projects/qr-attends |

---

## Emergency Commands

```bash
# Reset everything
rm -rf node_modules
npm install
npx convex dev

# Clear cache
npx expo start --clear

# Full rebuild
npm run deploy:prod
eas build --platform android
```

---

**Last Updated:** January 2026
**Version:** 1.0.0
