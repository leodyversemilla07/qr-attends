# Project Overview: QR Attends

## Introduction
QR Attends is a modern mobile solution designed to streamline attendance tracking for educational institutions and organizations. By leveraging QR code technology and a cloud-native architecture, it eliminates manual logs and provides real-time insights into attendance data.

## Architecture

The system follows a **Client-Server-Cloud** architecture optimized for mobile usage and intermittent connectivity.

### 1. Mobile Client (Frontend)
*   **Framework:** React Native (via Expo).
*   **Responsibility:** Renders the UI, handles camera access for scanning, and manages local state.
*   **Offline Layer:** Uses `AsyncStorage` to persist a "Sync Queue". When the device is offline, write operations (check-ins) are intercepted and stored locally.

### 2. Backend & Database (Convex)
*   **Platform:** Convex (Serverless).
*   **Responsibility:** 
    *   Stores relational data (Events, Members, Attendance).
    *   Exposes a type-safe RPC API (`query` and `mutation`).
    *   Handles real-time WebSocket subscriptions, pushing updates to the client instantly.

## Data Flow

1.  **Reading Data:** The app subscribes to Convex queries (e.g., `api.events.list`). Convex pushes the initial data and any subsequent updates automatically.
2.  **Writing Data (Online):** The app calls a Convex mutation (`api.attendance.checkIn`). The server validates the request and updates the database.
3.  **Writing Data (Offline):** 
    *   The app detects network failure.
    *   The record is saved to the local `AsyncStorage` queue.
    *   The UI updates optimistically to show the "Pending" status.
    *   When connectivity returns, the queue is processed, and requests are sent to Convex in batch.

## Key Modules

*   **Events Module:** creation, scheduling, and listing of events.
*   **Members Module:** Registration and management of attendees (students/staff).
*   **Attendance Module:** The core logic linking Members to Events via timestamped records.

## Member QR Cards

Members are issued **pre-printed physical ID cards** with a unique QR code containing their Card Number (UUID). The app scans these cards to record attendance.

**Important:** QR code generation and card printing are handled externally. The app only reads and matches scanned QR codes to registered member profiles in the database.
