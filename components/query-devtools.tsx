// import { queryClient } from '@/utils/query-client';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
// import React from 'react';
// import { View } from 'react-native';

/**
 * React Query Devtools for development only
 * 
 * This component wraps the React Query Devtools and only renders them
 * in development mode. The devtools provide:
 * - Query cache inspection
 * - Query status monitoring
 * - Manual cache manipulation
 * - Query refetching
 * - Timeline of query changes
 */
export function QueryDevtools() {
  // Only render in development
  if (!__DEV__) {
    return null;
  }

  // React Query Devtools is designed for web, but we can still use it
  // in React Native development via the Flipper plugin or by running
  // the standalone devtools.
  
  // For React Native, we typically use:
  // 1. Flipper plugin for React Query
  // 2. Standalone devtools: npx react-query-devtools
  
  // The web devtools won't work directly in RN, so we return null
  // and document how to use them.
  return null;
}

/**
 * Instructions for using React Query Devtools with React Native:
 * 
 * Option 1: Flipper Plugin (Recommended)
 * - Install Flipper desktop app
   - Install "React Query Devtools" plugin in Flipper
 * - Connect your device/simulator
 * - Open the React Query tab in Flipper
 * 
 * Option 2: Standalone Devtools
 * - Run: npx react-query-devtools
 * - Connect to your app's query client
 * 
 * Option 3: React Native Debugger
 * - Use with Redux DevTools extension
 * - React Query state will be visible
 * 
 * Option 4: Flipper with react-native-flipper
 * - Install react-native-flipper
 * - Use with TanStack Query Flipper plugin
 */

export const devtoolsInstructions = `
React Query Devtools Setup for React Native:

1. Install Flipper Desktop (https://fbflipper.com/)

2. In your terminal, run Flipper:
   npx flipper

3. Install React Query plugin in Flipper:
   - Open Flipper
   - Go to Plugin Manager
   - Search for "React Query"
   - Install the plugin

4. Connect your app:
   - Run the app on simulator/device
   - Flipper will auto-detect the app
   - Click on "React Query" tab

5. You can now:
   - View all queries and their data
   - See query status (fetching, stale, etc.)
   - Manually refetch queries
   - Clear cache
   - Inspect query keys

Alternative: Use Reactotron
- Install: npm install --save-dev reactotron-react-native
- Reactotron has TanStack Query support
`;
