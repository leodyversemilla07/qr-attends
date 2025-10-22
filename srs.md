# QR-Based Attendance System for Student Organizations

## Software Requirements Specification (SRS)

---

## 1. Introduction

### Purpose

This Software Requirements Specification (SRS) document defines the functional
and non-functional requirements for the QR-Based Attendance System. It serves as
a comprehensive guide for developers, stakeholders, and quality assurance teams
to understand what the system must accomplish and how it should perform.

### Scope

The QR-Based Attendance System is designed to automate attendance tracking for
student organizations through member QR card scanning. Each member is issued a
physical QR card containing a unique UUID. Organization officers scan member
cards at events to record attendance. The system supports event creation, member
management, real-time check-in, attendance record tracking, and reporting
capabilities.

### Document Overview

This SRS is organized into five main sections that detail all requirements
necessary to build and deploy a robust, secure, and user-friendly attendance
tracking solution.

### Definitions and Abbreviations

- **QR Code:** Quick Response code; a machine-readable optical label containing
  a unique identifier
- **Member QR Card:** A physical card (similar to an ID card) issued to each
  member containing their unique UUID encoded in a QR code
- **UUID:** Universally Unique Identifier; a 128-bit number used to uniquely
  identify members
- **Officer:** An organization member with elevated permissions who scans member
  QR cards to check them in at events
- **Member:** A student registered with the student organization who has been
  issued a QR card
- **Administrator:** An authorized user with elevated permissions to manage
  events, members, and view reports
- **Event:** A meeting, activity, or gathering organized by the student
  organization
- **Check-in:** The process of recording member attendance by scanning their QR
  card
- **Dashboard:** The administrative interface for viewing data and managing
  events
- **On-the-fly Registration:** The ability for officers to register new members
  during check-in when their QR card is not found in the database

---

## 2. Functional Requirements (Features)

### 2.1 Event Management

**FR 1.1 - Create Event**

- Administrators can create a new event by providing: event name, date, time,
  location, and description
- Event details are stored for attendance tracking
- Each event is uniquely identified in the system

**FR 1.2 - Edit Event**

- Administrators can modify event details (name, time, location, description)
  before or after the event occurs
- Changes are logged with timestamp and user who made the change

**FR 1.3 - Delete Event**

- Administrators can delete past events and their associated attendance records
  (with confirmation prompt)
- Active or upcoming events require special confirmation to prevent accidental
  deletion

**FR 1.4 - View Event List**

- Administrators can view all events (past, current, upcoming) in a searchable,
  sortable list
- Display includes event name, date, time, location, and number of attendees

### 2.2 Member Management

**FR 2.1 - Member Registration**

- New members can be registered in the system with the following information:
  - Unique UUID (from their QR card)
  - First Name (required)
  - Last Name (required)
  - Middle Initial (required, single character)
  - Student ID (required, format: e.g., MBC2025-0165)
  - Year/Section (required, format: e.g., BSIT 4F1)
  - Card No. (required)
- Members can be registered through:
  1. Admin dashboard (bulk or individual entry)
  2. On-the-fly during check-in by officers

**FR 2.2 - On-the-fly Member Registration**

- When an officer scans an unknown QR card (UUID not in database):
  - Scanner pauses and displays registration form
  - Officer enters member details with all required fields
  - System validates and saves member to database
  - System automatically records attendance for current event
  - Scanner returns to ready state for next scan

**FR 2.3 - View Member List**

- Administrators can view all registered members in a searchable, sortable list
- Display includes: Full name, Student ID, Year/Section, Card No., and
  registration date
- List can be filtered by year/section or searched by name/student ID

**FR 2.4 - Edit Member Information**

- Administrators can update member information (except UUID)
- Changes are logged with timestamp and user who made the change

**FR 2.5 - Delete Member**

- Administrators can remove members from the system
- Deleting a member does not delete their historical attendance records
- System prompts for confirmation before deletion

### 2.3 Member Check-in via QR Card Scanning

**FR 3.1 - Officer Check-in Interface**

- Organization officers access the check-in interface via web browser on tablet
  or smartphone at the event venue
- Officers select the specific event they are checking members into
- System displays event name and details at top of scanner interface
- Interface is optimized for tablet/mobile use with large buttons and clear
  display

**FR 3.2 - Scan Member QR Card**

- Officer points device camera at member's physical QR card
- System uses device camera to capture and decode the QR code
- QR code contains member's unique UUID
- Check-in interface provides visual feedback (e.g., "Scanning...", scanning
  crosshairs)
- Scanner continues running to allow multiple members to be scanned in
  succession

**FR 3.3 - Record Member Attendance**

- Upon successful scan, system looks up member by UUID
- If member found in database:
  - System records attendance: Event ID + Member UUID + Timestamp
  - Display shows: "✓ Checked in: [First Name] [MI]. [Last Name]"
  - Success message auto-clears after 3 seconds
  - Scanner ready for next member
- If member not found (new member):
  - Scanner pauses and displays registration form (see FR 2.2)
  - After registration, attendance is automatically recorded
- Members cannot check in to the same event more than once (duplicate
  prevention)

**FR 3.4 - Failed Check-in**

- Invalid QR codes (non-UUID format) display error message
- Error messages include guidance for officer
- Scanner remains active after error for retry

**FR 3.5 - Check-in Confirmation Display**

- Each successful check-in displays member's full name for officer verification
- Running count of total attendees displayed on screen
- Recent check-ins list shows last 5-10 members checked in

### 2.4 Attendance Tracking

**FR 4.1 - Real-time Attendance Display**

- During an event, administrators can view a live dashboard showing who has
  checked in and who is absent
- Live count displays total attendees in real-time

**FR 4.2 - Attendance Records**

- The system maintains a permanent record of all attendance data including
  member UUID, full name, event, date, and timestamp
- Records are searchable and filterable by event, date range, or member name
- Each record shows: Event name, Member name, Student ID, Year/Section, and
  check-in time

**FR 4.3 - Manual Attendance Adjustment**

- Administrators can manually add or remove individual members from an event's
  attendance record
- All manual adjustments are logged with timestamp and reason

**FR 4.4 - Bulk Attendance Upload**

- Administrators can upload a CSV file to manually add multiple attendance
  records at once
- System validates data and reports any errors before committing to database

### 2.5 Reporting and Analytics

**FR 5.1 - Attendance Report Generation**

- Administrators can generate reports showing attendance for a specific event
  (list of all attendees)
- Reports are exportable as CSV or PDF formats for external use

**FR 5.2 - Member Attendance Summary**

- System generates reports showing individual member attendance across all
  events (total attended, percentage attendance rate)
- Reports display for a specified time period

**FR 5.3 - Attendance Analytics**

- Dashboard displays visual analytics including: total events held, total
  attendance count, average attendance per event, and attendance trends over
  time
- Charts and graphs visualize attendance patterns by date or event

**FR 5.4 - Export Data**

- All reports can be exported in CSV format for use in spreadsheets or other
  tools
- PDF export option available for formal documentation

### 2.6 User Authentication and Profile

**FR 6.1 - Officer/Admin Login**

- Members log in using their organization email or username and password
- System generates JWT tokens using Deno's Web Crypto API for authentication
- Tokens stored in HTTP-only cookies for security
- System supports password reset via email verification with time-limited reset
  tokens

**FR 6.2 - Administrator Login**

- Administrators log in using organization credentials
- System generates JWT tokens using Deno's Web Crypto API for authentication
- Tokens stored in HTTP-only cookies for security
- System supports password reset via email verification with time-limited reset
  tokens
- Additional security: Optional two-factor authentication (TOTP) for admin
  accounts
- Session timeout occurs after 30 minutes of inactivity
- All admin actions are logged in audit trail

**FR 6.3 - User Profile Management**

- Officers and administrators can view and update their profile information
- Profile includes name, email, and role

**FR 6.4 - Account Registration**

- New members can register using their organization email
- Registration requires email verification to confirm valid email address
- Verification tokens expire after 24 hours
- Email sent using Deno's native SMTP support or transactional email service
  (SendGrid, Resend)

---

## 2.7 Member QR Card Specifications

### Card Overview

**Physical Member QR Cards:**

- Each member is issued a physical QR card (similar to a student ID card)
- Card contains a unique UUID encoded in QR code format
- UUID uniquely identifies the member in the system
- Cards are durable, reusable, and carried by members to events

### QR Code Requirements

**QR Code Properties:**

- QR code version: Minimum Version 2 (25 × 25 modules)
- Size on physical card: Minimum 1" × 1" (2.5cm × 2.5cm)
- Error correction level: High (30% recovery capability for damage tolerance)
- Quiet zone (border): Minimum 4 modules of white space around code
- Scannable distance: 6-24 inches (15-60cm) at recommended size

**QR Code Content:**

- QR code encodes a UUID (e.g., `550e8400-e29b-41d4-a716-446655440000`)
- UUID format: Standard UUID v4 (36 characters with hyphens)
- No additional URL or formatting - just the raw UUID string

### Physical Card Specifications

**Card Material and Format:**

- Durable material (PVC plastic card, laminated paper, or cardstock)
- Recommended size: Credit card size (3.375" × 2.125") or badge size
- QR code printed on card with clear background
- Optional: Member name, photo, student ID visible on card
- Laminated or protected to withstand daily carrying and scanning

**Card Usability:**

- QR code visible and scannable from 6-12 inches away
- High contrast between QR code and background (dark ink on white/light
  background)
- Card portable for members to carry in wallet, lanyard, or badge holder
- No power or internet connection required for the card itself
- Card remains valid indefinitely unless member leaves organization

### Card Lifecycle

**Issuance:**

1. New member joins organization
2. System generates unique UUID for member
3. QR code containing UUID is generated
4. Physical card is printed with QR code and member information
5. Card issued to member (kept by member permanently)

**Usage:**

1. Member brings card to event
2. Officer scans member's QR card with tablet/smartphone
3. System looks up member by UUID
4. Attendance recorded for that event
5. Member keeps card for future events

**Replacement:**

1. Lost/damaged cards can be replaced with new cards
2. Same UUID can be encoded on replacement card
3. Or new UUID issued and old UUID deactivated in system

---

## 3. Non-Functional Requirements (Security, Usability, etc.)

### 3.1 Security Requirements

**NFR 1.1 - Authentication Security**

- All passwords must be hashed using bcrypt 5.x with salt rounds of 12
- Authentication implemented using JWT tokens signed with Deno's Web Crypto API
  (HMAC-SHA256)
- Session tokens stored securely in HTTP-only cookies with SameSite=Strict
- Token expiration: Access tokens valid for 15 minutes, refresh tokens for 7
  days
- Passwords must be at least 8 characters with a mix of uppercase, lowercase,
  numbers, and special characters
- Failed login attempts are limited to 5 per IP address within 15 minutes (rate
  limiting via Fresh middleware)

**NFR 1.2 - Data Encryption**

- All sensitive data (emails, attendance records) is encrypted at rest using
  Deno KV's built-in AES-256 encryption
- All data transmitted between client and server uses HTTPS with TLS 1.3
  (SSL/TLS automatically provided by Deno Deploy)

**NFR 1.3 - Access Control**

- Role-based access control (RBAC) enforces permissions based on user type
  (Member, Officer, Administrator)
- Administrators can only view/modify data for their organization;
  cross-organization access is prevented
- API endpoints validate user permissions on every request using Fresh
  middleware

**NFR 1.4 - Data Integrity**

- All database transactions use ACID principles to ensure data consistency via
  Deno KV atomic operations
- Database backups occur automatically with Deno Deploy's built-in point-in-time
  recovery
- Backup retention: 7 days with restore capability tested monthly

**NFR 1.5 - Audit Logging**

- All administrative actions (event creation, deletion, record modification) are
  logged with user, timestamp, and action details
- Audit logs are immutable and retained for minimum 1 year

**NFR 1.6 - QR Code Security**

- Each member's QR card contains a unique UUID that cannot be duplicated
- Lost or stolen cards can be deactivated in the system
- Replacement cards can be issued with new UUIDs
- System logs all check-in attempts for audit trail

### 3.2 Usability Requirements

**NFR 2.1 - User Interface Simplicity**

- Check-in process requires: 1) Select event, 2) Scan member card - completed in
  under 5 seconds per member
- Registration form for new members uses simple, single-page layout with clear
  labels
- All screens use clear, readable fonts (minimum 14px) and sufficient color
  contrast (WCAG AA standard)

**NFR 2.2 - Responsive Design**

- System is fully responsive and functional on mobile devices (phones, tablets)
  and desktop browsers
- Interface automatically adapts to screen size without loss of functionality
  (Tailwind CSS responsive utilities)
- Fresh's islands architecture ensures optimal performance on all devices

**NFR 2.3 - Accessibility**

- System complies with WCAG 2.1 Level A accessibility standards
- All images have alt text, forms have labels, and keyboard navigation is fully
  supported

**NFR 2.4 - Help and Documentation**

- In-app help text and tooltips guide users through key features
- Admin dashboard includes a help section with FAQs and user guides
- New users receive an onboarding tutorial on first login (implemented as Fresh
  islands for interactivity)

**NFR 2.5 - Error Handling**

- Error messages are clear, written in plain language, and suggest solutions
- Invalid inputs are caught and reported to users with specific guidance on
  correction

### 3.3 Performance Requirements

**NFR 3.1 - Response Time**

- Check-in page with scanner loads in under 2 seconds on a standard 4G
  connection (optimized with Fresh's SSR)
- Member QR card scanning completes within 2 seconds of capturing the code
- Member lookup by UUID completes in under 500ms
- Dashboard displays live attendance updates with maximum 5-second delay (using
  Preact Signals for reactivity)
- Registration form submission completes within 2 seconds

**NFR 3.2 - Scalability**

- System supports simultaneous check-ins by multiple officers at a single event
- Can handle 500+ members checking in within a 30-minute window
- Database can store records for 10,000+ members, 10,000+ events, and 100,000+
  attendance entries
- Member lookup by UUID optimized with indexing for fast retrieval
- Deno Deploy's edge network ensures low latency globally

**NFR 3.3 - Uptime and Reliability**

- System maintains 99.5% uptime during scheduled event hours
- Planned maintenance is scheduled outside typical event hours

### 3.4 Compatibility Requirements

**NFR 4.1 - Browser Compatibility**

- System is compatible with all modern browsers: Chrome, Firefox, Safari, and
  Edge (latest two versions)
- Mobile browsers including iOS Safari and Chrome for Android are fully
  supported

**NFR 4.2 - Device Compatibility**

- QR code scanning works on any smartphone or tablet with an integrated camera
- No proprietary app installation required; web-based access only
- Member QR cards (credit card size) are easily scannable from mobile devices
- Progressive Web App (PWA) manifest included for "add to home screen"
  functionality
- Offline capability for viewing cached member list and attendance history (via
  service workers)

---

## 4. User Roles and Permissions

### 4.1 Member Role

**Note:** Members do not log into the system. They simply present their QR card
for scanning.

**Data Stored:**

- Personal information (name, student ID, year/section, card number)
- Attendance history linked to their UUID
- All data viewable by administrators and officers

### 4.2 Officer Role

**Permissions:**

- Access check-in interface for events
- Scan member QR cards to record attendance
- Register new members on-the-fly during check-in
- View real-time attendance for current event
- Cannot create, edit, or delete events
- Cannot view full reports or analytics

**Restrictions:**

- Can only check in members during active event sessions
- Cannot modify historical attendance records
- Cannot access member management features outside of check-in

### 4.3 Administrator Role

**Permissions:**

- Full access to all system features
- Create, edit, and delete events
- View and manage all member records
- Register, edit, and delete members
- View all attendance records across all events
- Generate reports and export data
- Manually add or remove individual attendance records
- Upload bulk attendance via CSV
- View and export audit logs
- Access dashboard and analytics
- Manage officer accounts

**Restrictions:**

- Can only manage events and members within their assigned organization
- Cannot modify system-level settings or access other organizations' data

### 4.4 Super Administrator Role (Optional)

**Permissions:**

- All permissions of Administrator role
- Manage multiple organizations
- Create new administrator accounts
- Access system-wide analytics and reports
- Configure system settings

---

## 5. System Constraints

### 5.1 Technical Constraints

**TC 1.1 - Technology Stack**

- **Runtime**: Deno 2.x (secure JavaScript/TypeScript runtime)
- **Framework**: Fresh 2.x (full-stack framework with islands architecture)
- **Build Tool**: Vite 7.x (fast development and build tooling)
- **Frontend Library**: Preact 10.27.x (lightweight 3KB React alternative)
- **Styling**: Tailwind CSS 4.1.x (utility-first CSS framework)
- **State Management**: Preact Signals 2.3.x (reactive state for interactive
  components)
- **Database**: Deno KV (built-in distributed key-value store with ACID
  transactions)
- **Authentication**: Custom JWT-based auth using Deno's Web Crypto API (no
  third-party dependencies)
- **Session Management**: Deno KV for secure, encrypted session storage
- **Password Hashing**: bcrypt 5.x for secure credential storage
- **QR Code Generation**: qrcode 1.5.x (npm package)
- **QR Code Scanning**: html5-qrcode 2.3.x (browser camera integration)
- **PDF Export**: jsPDF 2.x for attendance report generation
- **CSV Export**: Deno Standard Library std/csv module
- **Type System**: TypeScript 5.x (full type safety across entire stack)

**TC 1.2 - Browser Requirements**

- Minimum browser support: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- JavaScript must be enabled for all functionality

**TC 1.3 - Camera Access**

- Member QR card scanning requires camera permission (browser will prompt user
  for access via MediaDevices Web API)
- System gracefully handles denied camera permissions with manual UUID entry
  fallback
- Uses html5-qrcode 2.3.x library for cross-browser camera compatibility
- Supports both rear and front-facing cameras on mobile devices
- Auto-focus enabled for clear QR code capture

### 5.2 Operational Constraints

**OC 1.1 - Data Privacy Regulations**

- System must comply with FERPA (Family Educational Rights and Privacy Act)
  regarding student data
- Student data is not shared with third parties without explicit consent

**OC 1.2 - Deployment Environment**

- System deployed on Deno Deploy (serverless edge deployment with global CDN)
- SSL/TLS certificates automatically provisioned and renewed by Deno Deploy
- Custom domain support with automatic HTTPS configuration
- Edge deployment ensures low latency for users worldwide

**OC 1.3 - Backup and Recovery**

- Automated point-in-time backups provided by Deno Deploy (7-day retention)
- Recovery time objective (RTO) of 1 hour for critical data restoration
- Manual data exports (CSV/JSON) available for long-term archival beyond 7 days

### 5.3 Business Constraints

**BC 1.1 - Single Organization Instance**

- Initial deployment supports one student organization
- Future versions may support multi-organization instances

**BC 1.2 - User Base**

- System designed for organizations with 50-500 active members
- Each member issued one physical QR card
- Can scale to handle larger organizations with infrastructure upgrades
- Member database optimized for fast UUID lookups

**BC 1.3 - Event Frequency**

- Typical organizations hold 2-4 events per week
- System is optimized for this frequency but can handle up to daily events

### 5.4 Resource Constraints

**RC 1.1 - Development Resources**

- Estimated development timeline: 4-8 weeks for MVP (Minimum Viable Product)
- Team composition: 1-2 developers, 1 QA specialist, 1 project manager

**RC 1.2 - Hosting and Infrastructure**

- Deployment Platform: Deno Deploy Pro ($20/month per project)
- Features: 5 million requests/month, 100 GB bandwidth, 99.9% SLA
- Database: Deno KV included (1 GB storage, automatic replication)
- Additional costs: None (all infrastructure included in Deno Deploy Pro)

**RC 1.3 - Maintenance**

- Ongoing maintenance: 4-8 hours per month for updates, security patches, and
  support
- Deno and Fresh updates can be applied with `deno task update` command
- Zero-downtime deployments supported via Deno Deploy
