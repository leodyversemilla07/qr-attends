# QR-Based Attendance System for Student Organizations

A modern, **security-hardened** full-stack web application that uses QR code
technology to streamline attendance tracking for student organization events.
Members are issued physical QR cards containing unique UUIDs, and officers scan
these cards to record attendance at events.

## 🚀 Deploy to Production in 5 Minutes

**✨ NEW: Now fully compatible with Deno Deploy via GitHub!**

**Recommended**: Deploy to Deno Deploy using GitHub integration for automatic
continuous deployment

[![Deploy to Deno Deploy](https://deno.com/deno-deploy-button.svg)](https://dash.deno.com/new?url=https://github.com/yourusername/qr-attends)

📖 **GitHub Deployment**: [GITHUB_DEPLOYMENT.md](./GITHUB_DEPLOYMENT.md) -
**Complete GitHub integration guide**\
📖 **Quick Start**: [DEPLOY_TO_DENO.md](./DEPLOY_TO_DENO.md) - **Step-by-step in
10 minutes**\
� **Checklist**: [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) -
**Pre/post-deployment verification**\
🐳 **Self-Host**: [DEPLOYMENT.md](./DEPLOYMENT.md) - **Docker deployment for
self-hosting**

### Why Deploy via GitHub + Deno Deploy?

✅ **5-minute setup** - Connect GitHub, auto-deploy\
✅ **Continuous deployment** - Push code → Auto-deploy\
✅ **Free tier** - 1M requests/month included\
✅ **Global CDN** - Fast worldwide\
✅ **Auto HTTPS** - SSL certificates managed\
✅ **Auto scaling** - Handles traffic spikes\
✅ **Zero maintenance** - Platform managed\
✅ **Managed KV Database** - Automatic backups included\
✅ **Rollback ready** - One-click revert to previous version ✅ **Managed KV
Database** - Automatic backups included

## �🔒 Security Features (NEW!)

✅ **Production-Ready Security** - Comprehensive hardening implemented Oct 2025:

- **Strong Authentication**: JWT with enforced 32+ character secrets, secure
  cookies (HttpOnly, Secure, SameSite)
- **Account Protection**: Automatic lockout after 5 failed login attempts
  (30-minute duration)
- **Rate Limiting**: Protection against brute force (5 login attempts/15min, 100
  API requests/15min per IP)
- **Input Validation**: Zod-based schema validation on all inputs to prevent
  injection attacks
- **Security Headers**: CSP, X-Frame-Options, HSTS, X-Content-Type-Options, and
  more
- **Request Protection**: 5MB size limits, CORS configuration, API
  authentication
- **Secure Defaults**: Random admin passwords, no sensitive logging

📚 **Security Documentation**: See [SECURITY.md](./SECURITY.md) for details and
[SECURITY_SETUP.md](./SECURITY_SETUP.md) for quick setup.

## 📱 Offline Mode (NEW!)

✅ **Works Without Internet** - Full offline support added Oct 2025:

- **Record Attendance Offline**: Scan QR codes and save locally when no
  connection
- **Automatic Sync**: Data syncs automatically when connection returns
- **PWA Support**: Install as app on home screen for native-like experience
- **IndexedDB Storage**: Secure local storage for pending attendance records
- **Background Sync**: Smart sync with retry logic and conflict resolution

📱 **Offline Documentation**: See [OFFLINE_MODE.md](./OFFLINE_MODE.md) for
complete setup and usage guide.

## 🚀 Features

### ✅ Completed Features

- **Authentication System**: JWT-based auth with bcrypt password hashing, user
  registration/login, and role management (Member, Officer, Admin)
- **Member Management**:
  - Comprehensive member profiles with First Name, Last Name, Middle Initial
  - Student ID tracking (e.g., MBC2025-0165)
  - Year/Section information (e.g., BSIT 4F1)
  - Card Number tracking
  - On-the-fly member registration during check-in
- **Event Management**: Full CRUD operations for events with name, date, time,
  location, and description
- **Member QR Card System**: Each member has a physical QR card containing their
  unique UUID
- **QR Code Scanning**: Browser-based QR code scanner using device camera to
  scan member cards
- **Attendance Recording**:
  - Officers scan member QR cards to record attendance
  - Automatic member lookup by UUID
  - New member registration during check-in
  - Duplicate prevention and timestamp tracking
- **Attendance Dashboard**: View attendance records by event with filtering and
  export capabilities
- **CSV Export**: Export attendance data as CSV files for use in spreadsheets
- **Analytics Dashboard**: View total events, total attendance, average
  attendance per event, and recent event statistics
- **Responsive Design**: Mobile-friendly UI built with Tailwind CSS optimized
  for tablets and smartphones
- **🆕 Offline Mode**: Full offline support with automatic sync when connection
  returns (PWA)
  - Record attendance without internet connection
  - Local IndexedDB storage for pending records
  - Background sync and manual sync options
  - Install as Progressive Web App (PWA)

## 🛠️ Technology Stack

- **Runtime**: Deno 2.5.4
- **Framework**: Fresh 2.1.2 (full-stack framework with islands architecture)
- **Build Tool**: Vite 7.1.10
- **Frontend**: Preact 10.27.2 with Preact Signals 2.3.2 for state management
- **Styling**: Tailwind CSS 4.1.14 with Vite plugin 4.1.14
- **Icons**: Lucide Preact 0.545.0 (modern icon library)
- **Database**: Deno KV (built-in distributed key-value store)
- **Authentication**: Custom JWT with Deno Web Crypto API
- **Password Hashing**: bcryptjs 3.0.2
- **QR Code Generation**: qrcode 1.5.4
- **QR Code Scanning**: html5-qrcode 2.3.8

## 📦 Installation

### Option 1: Docker (Recommended for Production) 🐳

1. **Prerequisites**:
   - Docker and Docker Compose installed on your system

2. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd qr-attends
   ```

3. **Configure environment variables**:
   ```bash
   # Copy the example environment file
   cp .env.example .env

   # Edit .env and set your JWT secret
   # JWT_SECRET=your-long-random-secret-key-here
   ```

4. **Build and run with Docker Compose**:
   ```bash
   # Build and start the container
   docker-compose up -d

   # View logs
   docker-compose logs -f

   # Stop the container
   docker-compose down
   ```

5. **Access the application**: Open your browser and navigate to
   `http://localhost:8000`

**Docker Compose Commands**:

```bash
# Rebuild after code changes
docker-compose up -d --build

# View container status
docker-compose ps

# Access container shell
docker-compose exec qr-attends sh

# View Deno KV data location
docker-compose exec qr-attends ls -la /data
```

**Data Persistence**:

- Deno KV database is stored in a Docker volume named `kv-data`
- Data persists across container restarts
- To backup:
  `docker run --rm -v qr-attends_kv-data:/data -v $(pwd):/backup alpine tar czf /backup/kv-backup.tar.gz /data`

### Option 2: Local Development

1. **Install Deno** (if not already installed):
   ```bash
   # Windows (PowerShell)
   irm https://deno.land/install.ps1 | iex

   # macOS/Linux
   curl -fsSL https://deno.land/install.sh | sh
   ```

2. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd qr-attends
   ```

3. **Set environment variables** (optional): Create a `.env` file in the root
   directory:
   ```
   JWT_SECRET=your-secret-key-here
   ```

4. **Install dependencies**: Dependencies are automatically installed on first
   run by Deno.

## 🏃 Running the Application

### Development Mode

```bash
deno task dev
```

The application will start on `http://localhost:5173` (or the next available
port).

### Production Build

```bash
deno task build
```

### Start Production Server

```bash
deno task start
```

## 📖 Usage Guide

### System Workflow

#### Phase 1: Member Setup

1. **Member Registration**: New members are issued physical QR cards containing
   unique UUIDs
2. **Card Distribution**: Members receive their QR cards (similar to ID cards)

#### Phase 2: Event Creation (Admin)

1. **Login**: Navigate to `/admin` and log in as administrator
2. **Create Event**: Click "**+ Create Event**" and fill in:
   - Event Name
   - Date and Time
   - Location
   - Description (optional)
3. **Save Event**: Event is now ready for check-in

#### Phase 3: Check-In Process (Officer)

**For Existing Members:**

1. **Select Event**: From admin dashboard, click "**Check-In**" next to the
   event
2. **Start Scanner**: Click "**Start Camera**" to activate QR scanner
3. **Scan Member Card**: Point camera at member's QR card
4. **Confirm**: System displays "**✓ Checked in: [Member Name]**"
5. **Repeat**: Scan next member's card (auto-ready after 3 seconds)

**For New Members (Not in Database):**

1. **Scan Card**: Officer scans the new member's QR card
2. **Registration Form Appears**: System detects member not found
3. **Enter Details**: Officer fills in member information:
   - First Name
   - Last Name
   - Middle Initial
   - Student ID (e.g., MBC2025-0165)
   - Year/Section (e.g., BSIT 4F1)
   - Card No.
4. **Register & Check In**: Click button to save member and record attendance
5. **Confirmation**: System displays success and returns to scanner

### For Officers

1. **Access Check-In**: Go to `/admin` and click "**Check-In**" on the event
   you're managing
2. **Scan Member Cards**: Use your tablet/smartphone camera to scan each
   member's QR card
3. **Register New Members**: Fill out the registration form when scanning
   unknown QR cards
4. **Monitor**: View real-time check-in confirmations on screen

### For Administrators

1. **Create Events**:
   - Go to `/admin`
   - Click "**+ Create Event**"
   - Fill in event details (name, date, time, location, description)
   - Save the event

2. **Manage Members**:
   - Members are automatically added when first scanned
   - View member database with all registered members
   - Edit member information as needed

3. **View Attendance**:
   - Go to `/attendance`
   - Select an event from the dropdown
   - View attendee list with check-in times
   - Export to CSV for reports

4. **View Analytics**:
   - Go to `/analytics`
   - See total events, total attendance, and averages
   - View member participation trends
   - Generate reports for compliance or funding applications

### Member Information Tracked

Each member record contains:

- **UUID**: Unique identifier from QR card
- **First Name**: Member's first name
- **Last Name**: Member's last name
- **Middle Initial**: Single character middle initial
- **Student ID**: Format like MBC2025-0165
- **Year/Section**: Format like BSIT 4F1
- **Card No.**: Physical card number for tracking

## 🗂️ Project Structure

```
qr-attends/
├── routes/                 # File-based routing
│   ├── api/               # API endpoints
│   │   ├── auth.ts        # Authentication API
│   │   ├── events.ts      # Event management API
│   │   ├── members.ts     # Member management API
│   │   ├── attendance.ts  # Attendance recording API
│   │   └── qr-generate.ts # QR code generation API (legacy)
│   ├── index.tsx          # Home page
│   ├── auth.tsx           # Login/Register page
│   ├── admin/
│   │   └── index.tsx      # Admin dashboard (event management)
│   ├── check-in.tsx       # QR scanner page for officers
│   ├── attendance/
│   │   └── index.tsx      # Attendance records page
│   └── analytics/
│       └── index.tsx      # Analytics dashboard
├── islands/               # Interactive components (client-side)
│   ├── AuthForm.tsx
│   ├── EventManagement.tsx
│   ├── QRScanner.tsx      # Member card scanner
│   ├── AttendanceDashboard.tsx
│   └── AnalyticsDashboard.tsx
├── components/            # Server-side components
│   ├── AuthForm.tsx
│   ├── EventForm.tsx
│   ├── EventList.tsx
│   ├── MemberRegistrationForm.tsx  # New member registration
│   ├── Button.tsx
│   └── Icons.tsx
├── middleware/
│   └── auth.ts            # Authentication middleware
├── assets/
│   └── styles.css
├── utils.ts               # Shared utilities
├── main.ts                # Application entry point
├── vite.config.ts         # Vite configuration
└── deno.json              # Deno configuration
```

## 🔐 Security Features

- JWT-based authentication with HTTP-only cookies
- Password hashing with bcrypt (12 rounds)
- CSRF protection with SameSite cookies
- Deno KV encryption at rest
- HTTPS/TLS 1.3 (when deployed)
- Role-based access control (RBAC)

## 📝 API Endpoints

### Authentication

- `POST /api/auth` - Register/Login (body:
  `{ action, email, password, name?, role? }`)

### Events

- `GET /api/events` - List all events
- `GET /api/events?id={id}` - Get single event
- `POST /api/events` - Create event
- `PUT /api/events` - Update event
- `DELETE /api/events?id={id}` - Delete event

### Attendance

- `GET /api/attendance?eventId={id}` - Get event attendance
- `GET /api/attendance?userId={id}` - Get user attendance history
- `POST /api/attendance` - Record attendance
- `DELETE /api/attendance?eventId={id}&recordId={id}` - Delete record

### QR Code

- `GET /api/qr-generate?eventId={id}` - Generate QR code for event

## � Deployment

### Docker Deployment (Recommended)

The application is fully containerized and ready for production deployment with
Docker.

**Quick Deploy**:

```bash
# 1. Set production environment variables
echo "JWT_SECRET=$(openssl rand -base64 32)" > .env

# 2. Build and deploy
docker-compose up -d --build

# 3. Check status
docker-compose ps
docker-compose logs -f qr-attends
```

**Production Considerations**:

- Always set a strong `JWT_SECRET` in production
- Use a reverse proxy (nginx/traefik) for HTTPS
- Set up automated backups for the KV database
- Configure health checks and monitoring
- Use Docker secrets for sensitive data in production

**Backup & Restore**:

```bash
# Backup Deno KV database
docker-compose exec qr-attends tar czf /data/backup.tar.gz /data/kv.db

# Copy backup to host
docker cp qr-attends-app:/data/backup.tar.gz ./backups/

# Restore from backup
docker cp ./backups/backup.tar.gz qr-attends-app:/data/
docker-compose exec qr-attends tar xzf /data/backup.tar.gz -C /
docker-compose restart
```

### Cloud Deployment Options

**Deno Deploy** (Easiest):

```bash
# Install deployctl
deno install -Arf https://deno.land/x/deploy/deployctl.ts

# Deploy
deployctl deploy --project=qr-attends main.ts
```

**AWS/GCP/Azure**:

- Use the Dockerfile to build a container image
- Push to container registry (ECR, GCR, ACR)
- Deploy to container service (ECS, Cloud Run, Container Instances)
- Mount persistent volumes for KV data

**VPS (DigitalOcean, Linode, etc.)**:

```bash
# SSH into your VPS
ssh user@your-server

# Install Docker and Docker Compose
curl -fsSL https://get.docker.com | sh

# Clone and deploy
git clone <your-repo>
cd qr-attends
cp .env.example .env
nano .env  # Set JWT_SECRET
docker-compose up -d
```

## �🚧 Future Enhancements

- [ ] Email verification for registration
- [ ] Password reset functionality
- [ ] Two-factor authentication (TOTP)
- [ ] PDF report generation with jsPDF
- [ ] Advanced analytics with charts
- [ ] Multi-organization support
- [ ] Mobile app (React Native/Flutter)
- [ ] Excused absence management
- [ ] Automated notifications
- [ ] Integration with university systems

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Deno team for the excellent runtime and Fresh framework
- Preact team for the lightweight React alternative
- Tailwind CSS team for the utility-first CSS framework

Your new Fresh project is ready to go. You can follow the Fresh "Getting
Started" guide here: https://fresh.deno.dev/docs/getting-started

### Usage

Make sure to install Deno:
https://docs.deno.com/runtime/getting_started/installation

Then start the project in development mode:

```
deno task dev
```

This will watch the project directory and restart as necessary.
