# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- TanStack Query integration for caching and optimistic updates
- Sentry error tracking and monitoring
- E2E testing with Maestro
- GitHub Actions CI/CD pipeline
- Production deployment automation

### Changed
- Refactored convex/officers.ts into modular files
- Enhanced offline manager with retry logic and sync statistics
- Improved error boundaries with Sentry integration

### Fixed
- Code organization with Single Responsibility Principle
- Test coverage expanded to 85 tests

## [1.0.0] - 2026-02-15

### Added
- Initial release of QR Attends
- QR code attendance tracking
- Offline-first architecture
- Event management
- Member management
- Role-based access control
- Audit logging
- CSV export functionality
- Dark mode support
- iOS and Android support

### Features
- ⚡ Fast QR code scanning
- 📴 Offline support with auto-sync
- 🔒 Secure authentication
- 📊 Reports and analytics
- 🎨 Modern UI with haptic feedback
- 👥 Multi-role support (President, Admin, Secretary, Officer)

### Security
- bcrypt password hashing
- Secure session tokens
- Rate limiting
- Input validation
- Audit trail

---

## Release Notes Template

When creating a new release, use this template:

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added
- New features

### Changed
- Changes to existing functionality

### Deprecated
- Soon-to-be removed features

### Removed
- Removed features

### Fixed
- Bug fixes

### Security
- Security improvements
```
