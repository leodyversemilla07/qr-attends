# QR Attends - Backup & Recovery Guide

## Overview

QR Attends uses Convex as its backend database. This document outlines the backup strategy and recovery procedures.

---

## Convex Automatic Backups

Convex provides automatic backups for all deployments:

### Backup Schedule
- **Frequency:** Daily automated backups
- **Retention:** 30 days of backup history
- **Type:** Full database snapshots

### What's Backed Up
- All tables:
  - `events` - Event definitions and metadata
  - `members` - Member registration data
  - `attendance` - Check-in records
  - `officers` - Admin/officer accounts
  - `authSessions` - Authentication tokens

### Accessing Backups

1. **Convex Dashboard:**
   ```
   https://convex.dev/dashboard
   ```
   - Navigate to your project
   - Go to Settings > Backups

2. **Export Data Manually:**
   ```bash
   npx convex export --help
   ```

---

## Manual Backup Procedures

### Export All Data
```bash
npx convex export --output ./backup-$(date +%Y-%m-%d).zip
```

### Export Specific Tables
```bash
npx convex export --tables events,members,attendance --output ./data-export.zip
```

---

## Recovery Procedures

### Option 1: Restore from Convex Dashboard
1. Go to https://convex.dev/dashboard
2. Select your project (qr-attends)
3. Navigate to Settings > Backups
4. Select a backup date
5. Click "Restore"

### Option 2: Import from Export
```bash
npx convex import ./backup-file.zip
```

---

## Best Practices

### Regular Backups
- Export critical data weekly for offline storage
- Store exports in cloud storage (Google Drive, Dropbox, etc.)

### Before Major Changes
1. Create a manual export
2. Document current state
3. Test restoration in a development environment

### Security Considerations
- Exports contain sensitive data (password hashes, PII)
- Store backups encrypted
- Limit access to authorized personnel only

---

## Emergency Contacts

- **Convex Support:** https://convex.dev/support
- **Documentation:** https://docs.convex.dev

---

## Disaster Recovery Checklist

- [ ] Verify backup availability
- [ ] Test restoration process in dev environment
- [ ] Document recovery time objectives (RTO)
- [ ] Document data loss tolerance (RPO)
- [ ] Update emergency contacts

---

## Related Documentation

- [README.md](../README.md) - Project overview
- [srs.md](./srs.md) - System requirements
- [overview.md](./overview.md) - Architecture details
