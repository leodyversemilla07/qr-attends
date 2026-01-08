# Software Requirements Specification (SRS)
**Project:** QR Attends Mobile
**Version:** 2.0 (Migration to React Native)

## 1. Functional Requirements

### 1.1 Authentication & User Roles
*   *Note: Currently simplified for prototype. Future version will include Admin/Staff Login.*
*   **FR-01:** System shall identify the device/user creating events.

### 1.2 Event Management
*   **FR-02:** User shall be able to create a new event with Name, Date, Time, and Location.
*   **FR-03:** User shall be able to view a list of upcoming and past events.
*   **FR-04:** User shall be able to view detailed information for a specific event.

### 1.3 Member Management
*   **FR-05:** User shall be able to register a new member with the following details:
    *   First Name, Last Name, Middle Initial
    *   Student ID (Unique Identifier)
    *   Year & Section
    *   Card Number / QR Code Value
*   **FR-06:** System shall prevent duplicate Student ID registrations.

### 1.4 Attendance Tracking
*   **FR-07:** User shall be able to activate the device camera to scan QR codes.
*   **FR-08:** System shall parse the QR code to extract the Member ID.
*   **FR-09:** System shall record the timestamp and Member ID against the current Event.
*   **FR-10:** System shall prevent duplicate check-ins for the same member at the same event.
*   **FR-11:** System shall provide immediate visual and haptic feedback upon successful scan.

### 1.5 Offline Capabilities
*   **FR-12:** System shall detect network connectivity status.
*   **FR-13:** When offline, scanned data shall be stored securely in local device storage.
*   **FR-14:** User shall be notified of pending offline records.
*   **FR-15:** User shall be able to trigger a synchronization process to upload pending records when online.

## 2. Non-Functional Requirements

### 2.1 Performance
*   **NFR-01:** Camera scanner shall recognize a valid QR code within 1 second.
*   **NFR-02:** Attendance list shall update on all connected devices within 2 seconds of a new check-in (when online).

### 2.2 Usability
*   **NFR-03:** Application shall be usable with one hand for scanning operations.
*   **NFR-04:** Interface shall clearly indicate online/offline status.

### 2.3 Reliability
*   **NFR-05:** No data shall be lost if the app is closed while offline records are pending.
