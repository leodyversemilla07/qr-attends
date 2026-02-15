# Maestro E2E Testing for QR Attends

This directory contains E2E (End-to-End) tests using [Maestro](https://maestro.mobile.dev/), a mobile UI testing framework.

## Prerequisites

1. Install Maestro:
```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
```

2. Ensure you have:
   - iOS Simulator or Android Emulator running
   - App built and installed on the device
   - Test data (test user credentials)

## Running Tests

### Run a single test:
```bash
maestro test e2e/flows/login.yaml
```

### Run all tests:
```bash
maestro test e2e/flows/
```

### Run with specific device:
```bash
maestro test e2e/flows/login.yaml --device "iPhone 15"
```

## Test Coverage

### Core Flows
- `login.yaml` - Authentication flow
- `create-event.yaml` - Event creation
- `register-member.yaml` - Member registration
- `check-in.yaml` - QR scanning and check-in

### Edge Cases
- `offline-mode.yaml` - Offline queue behavior

### Integration
- `full-journey.yaml` - Complete user workflow

## Test Data

Tests expect the following test data to exist:

**Test Officer:**
- Email: `test@example.com`
- Password: `password123`

**Test Member:**
- Card Number: `TEST-CARD-123`
- Name: Test Member

## Writing New Tests

1. Create a new `.yaml` file in `e2e/flows/`
2. Start with `appId: com.leodyversemilla07.qrattends`
3. Use Maestro commands:
   - `tapOn`: Tap an element
   - `inputText`: Enter text
   - `assertVisible`: Verify element exists
   - `waitForAnimationToEnd`: Wait for transitions
   - `takeScreenshot`: Capture screen state

### Example:
```yaml
appId: com.leodyversemilla07.qrattends
---
- launchApp
- tapOn: "Button Text"
- inputText: "Some text"
- assertVisible: "Expected Result"
```

## Best Practices

1. **Clear State**: Use `clearState: true` for isolated tests
2. **Assertions**: Always assert expected state
3. **Screenshots**: Take screenshots at key points
4. **Id Selectors**: Use `id` when possible for stability
5. **Wait Times**: Use `waitForAnimationToEnd` instead of fixed delays

## CI/CD Integration

Add to your CI pipeline:
```yaml
- name: Run E2E Tests
  run: maestro test e2e/flows/ --format junit
```

## Troubleshooting

**Test fails intermittently:**
- Add more `waitForAnimationToEnd` commands
- Use more specific selectors (id over text)

**Element not found:**
- Check if element is in a scroll view
- Use `scrollUntilVisible` if needed
- Verify element exists in the UI hierarchy

**Network requests fail:**
- Ensure backend is running
- Check network conditions in simulator

## Resources

- [Maestro Documentation](https://maestro.mobile.dev/)
- [Maestro Command Reference](https://maestro.mobile.dev/api-reference/commands)
- [Best Practices](https://maestro.mobile.dev/advanced/best-practices)
