# QR Attends (Mobile)

A robust, offline-first mobile application for tracking attendance via QR codes. Built with **React Native (Expo)** and **Convex**.

## 🚀 Features

*   **QR Scanning:** Instantly check in members by scanning their ID cards.
*   **Offline First:** Works without internet. Scans are queued and synced automatically when back online.
*   **Real-time Sync:** Attendance lists update instantly across all devices.
*   **Member Management:** Register new students/members directly from the app.
*   **Event Management:** Create and manage events on the go.

## 🛠️ Tech Stack

*   **Frontend:** React Native (Expo SDK 52)
*   **Backend / Database:** Convex
*   **Styling:** NativeWind (Tailwind CSS)
*   **Routing:** Expo Router

## ⚡ Quick Start

### 1. Prerequisites
*   Node.js (LTS)
*   Expo Go app on your phone (or Android Studio / Xcode for emulators)

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Backend (Convex)
Open a new terminal and run:
```bash
npx convex dev
```
This will:
1.  Log you in to Convex.
2.  Create the database schema.
3.  Generate the API type definitions in `convex/_generated`.

### 4. Run the App
In your main terminal:
```bash
npx expo start
```
*   **Physical Device:** Scan the QR code with the **Expo Go** app.
*   **Android:** Press `a` to open in emulator.
*   **iOS:** Press `i` to open in simulator.

## 📱 Usage Guide

1.  **Create Event:** Tap "+ Event" to schedule a new attendance session.
2.  **Register Member:** Tap "+ Member" to add a new person to the database.
3.  **Take Attendance:** Open an event and tap "Scan Attendance".
4.  **Offline Mode:** If internet is lost, continue scanning. An orange banner will appear. Tap "Sync Now" when connection is restored.

## 📂 Project Structure

*   `app/`: Application screens (pages).
*   `convex/`: Backend functions and database schema.
*   `components/`: Reusable UI components.
*   `utils/`: Helper logic (Offline Manager, etc).
*   `global.css`: Tailwind global styles.