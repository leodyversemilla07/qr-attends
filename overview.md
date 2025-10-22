# QR-Based Attendance System for Student Organizations

## Project Overview Document

---

## 1. System Title and Description

**System Name:** QR-Based Attendance Tracker

**Description:** A digital attendance management system that utilizes QR code
technology to streamline the check-in process for student organization meetings,
events, and activities. Each member is issued a **physical QR code card**
(similar to an ID card) containing a unique UUID. Organization officers scan
member QR cards using a tablet or smartphone to record attendance at events. The
system verifies the member's QR code, links it to the current event, and records
attendance with timestamp. The system provides administrators with real-time
tracking, attendance records, and analytics to support organizational management
and member accountability.

---

## 2. Background / Problem Statement

**Current Challenges:**

Student organizations traditionally rely on manual attendance methods such as
sign-in sheets, verbal roll calls, or email confirmations. These approaches are
time-consuming, prone to errors, and difficult to maintain for large events.
Common issues include:

- **Time inefficiency:** Taking attendance manually can consume 10-15 minutes of
  valuable event time
- **Inaccuracy:** Physical sign-in sheets are susceptible to forgery or
  misrecorded names
- **Data management:** Scattered records across multiple sheets or documents
  make it difficult to track trends or generate reports
- **Lack of accountability:** Manual systems make it hard to enforce attendance
  requirements or identify members who are consistently absent
- **Poor member experience:** Traditional methods feel outdated and create
  friction in the check-in process

**Opportunity:** By implementing a QR code-based system, organizations can
modernize their attendance tracking, reduce administrative overhead, and create
a seamless experience for members.

---

## 3. Member QR Card Workflow

The system uses **pre-printed physical QR code cards** issued to each member
(similar to student ID cards). Organization officers scan member cards to record
attendance:

1. **Member Registration:** When a member joins the organization, they are
   issued a physical QR card containing a unique UUID
2. **Event Created:** Administrator creates event in system (name, date, time,
   location)
3. **Check-In Begins:** Officer selects the event and opens the check-in scanner
   on their tablet/smartphone
4. **Member Arrives:** A member arrives at event venue with their QR card
5. **Officer Scans:** Officer scans the member's physical QR code card using the
   device camera
6. **Member Verified:** System recognizes the UUID and looks up member
   information
7. **New Member Handling:** If member is not in database, officer registers them
   on-the-fly with required details
8. **Attendance Recorded:** System records the member's attendance for the
   specific event with timestamp
9. **Confirmation:** Officer receives on-screen confirmation showing member's
   name
10. **Repeat:** Officer scans next member's card (process takes 5-10 seconds per
    member)

---

## 4. Project Objectives

The primary objectives of this project are to:

- **Streamline check-in:** Enable officers to quickly record member attendance
  by scanning individual member QR cards
- **Centralize data:** Create a unified digital repository for all member
  information and attendance records that is accessible to authorized
  administrators
- **Improve accuracy:** Eliminate manual transcription errors through automated
  member identification via QR code
- **On-the-fly registration:** Allow officers to register new members during
  check-in without disrupting the process
- **Generate insights:** Provide administrators with attendance reports,
  patterns, and analytics to support decision-making
- **Enhance member experience:** Offer a modern, fast check-in process with
  physical QR cards (5-10 seconds per member)
- **Increase accountability:** Make it easier to identify attendance patterns
  and enforce organizational policies
- **Scale efficiently:** Design a system that can accommodate growing
  organizations and multiple concurrent events
- **Member tracking:** Maintain comprehensive member profiles with student ID,
  year/section, and card information

---

## 5. Target Users

**Primary Users:**

- **Organization Officers:** Officers responsible for checking in members at
  events using the QR card scanning interface
- **Organization Administrators:** Leadership team members who manage the
  organization, configure events, review attendance data, and manage member
  records
- **Members:** Students attending meetings and events who present their QR cards
  for check-in

**Secondary Users:**

- **Organization President/Leadership:** May access attendance reports for
  compliance, eligibility verification, or strategic planning
- **Advisors/Faculty Sponsors:** May need viewing access to verify
  organizational activity and member participation

---

## 6. Scope and Limitations

**What is Included:**

- Physical QR code cards issued to each member (containing unique UUID)
- Member registration system with comprehensive profile information:
  - First Name, Last Name, Middle Initial
  - Student ID (e.g., MBC2025-0165)
  - Year/Section (e.g., BSIT 4F1)
  - Card Number
- Mobile-friendly check-in interface for officers (tablet/smartphone optimized)
- On-the-fly member registration during check-in
- Attendance data storage with member names, timestamps, and event details
- Basic reporting features (attendance lists, attendance counts, member history)
- User authentication to ensure only authorized officers and admins can access
  the system
- Admin dashboard to manage events and view attendance data
- Real-time attendance display during events
- Manual check-in fallback if QR scan fails

**What is NOT Included:**

- Integration with university registration or student information systems (out
  of initial scope)
- Excused absence management or appeal process (can be added in future versions)
- Automatic penalty or notification systems for missed meetings
- Native mobile app development (web-based solution accessible via browsers)
- Payment or financial tracking features
- Communication features such as event notifications or messaging
- Bulk QR card printing service (organization handles physical card production)

**Limitations:**

- Officers must be present at venue with device (tablet or smartphone with
  camera and internet connection)
- Requires one officer per check-in station for optimal performance
- Members must have their physical QR card to check in (lost cards require
  manual entry or card replacement)
- Manual entry still requires officer judgment and verification
- No offline mode; requires active internet connectivity at the event
- Limited to one organization per instance (though system can be replicated for
  other groups)

---

## 6. Expected Outcomes

**For the Organization:**

- Attendance data is centralized and easily retrievable within minutes rather
  than hours or days
- Reduced administrative workload for tracking and managing attendance
- Ability to generate attendance reports for compliance, funding applications,
  or activity verification
- Clear visibility into member engagement and participation trends
- More professional and modern operational approach to event management

**For Members:**

- Faster check-in process (5-10 seconds per person)
- Transparent access to their own attendance records
- Modern, tech-forward experience that feels convenient and professional
- Reduced friction or confusion about attendance requirements

**For Leadership:**

- Data-driven insights into member participation and event effectiveness
- Ability to identify at-risk members or declining engagement
- Documentation of organizational activity for annual reports or university
  requirements
- Improved decision-making regarding event scheduling and member retention
  strategies

**Success Metrics:**

- System adoption rate of at least 80% among organization members within first
  month
- Average check-in time reduced to under 10 seconds per person
- 100% accuracy in recorded attendance versus actual attendance
- 90%+ uptime during scheduled events
- Positive feedback from administrators on ease of use and data accessibility

---

## 7. Technology Stack

**Runtime & Framework:**

- **Deno 2.x**: Modern, secure JavaScript/TypeScript runtime with built-in
  tooling
- **Fresh 2.x**: Full-stack web framework for Deno with server-side rendering
  and islands architecture
- **Vite 7.x**: Fast build tool with hot module replacement for development

**Frontend:**

- **Preact 10.x**: Lightweight React alternative (3KB) with full React API
  compatibility
- **Preact Signals**: Reactive state management for client-side interactivity
- **Tailwind CSS 4.x**: Utility-first CSS framework for responsive design
- **Islands Architecture**: Selective hydration for optimal performance (only
  interactive components load JavaScript)

**Backend & Data:**

- **Fresh File-based Routing**: Convention-based routing system
- **Fresh API Routes**: Built-in REST API endpoint creation
- **Deno KV**: Built-in key-value database with ACID transactions and automatic
  replication
- **Deno Standard Library**: Built-in utilities for HTTP, crypto, and file
  operations

**Development Tools:**

- **TypeScript**: Full type safety across frontend and backend
- **Deno Formatter**: Built-in code formatting (no Prettier needed)
- **Deno Linter**: Built-in linting (no ESLint needed)
- **Deno Test**: Built-in testing framework

**Deployment:**

- **Deno Deploy**: Serverless edge platform optimized for Deno/Fresh
  applications
- **Database**: Deno KV (automatically included with Deno Deploy)

**Third-party Libraries (to be integrated):**

- **QR Code Generation**: `npm:qrcode@1.5.x` for creating QR codes
- **QR Code Scanning**: `npm:html5-qrcode@2.3.x` for browser camera access
- **Authentication**: Custom JWT-based auth using Deno's Web Crypto API
- **Session Management**: Deno KV for secure session storage
- **Password Hashing**: `npm:bcrypt@5.x` for secure password storage
- **PDF Export**: `npm:jspdf@2.x` for report generation
- **CSV Export**: Deno Standard Library `std/csv` (built-in)

**Key Technology Benefits:**

- **Single Runtime**: TypeScript everywhere (no Node.js/npm complexity)
- **Security**: Deno's permission-based security model
- **Performance**: Islands architecture loads minimal JavaScript
- **Developer Experience**: Built-in tooling, fast refresh, type safety
- **Modern Standards**: Web-standard APIs, ES modules, top-level await
- **Zero Config**: No webpack/babel configuration needed
