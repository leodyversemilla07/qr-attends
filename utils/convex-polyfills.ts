/**
 * Polyfills for Convex to work in React Native
 * 
 * Convex uses browser APIs like window.addEventListener for network monitoring.
 * These APIs don't exist in React Native, so we need to provide polyfills.
 * 
 * This file must be imported BEFORE any Convex imports.
 */

import * as Network from "expo-network";
import { AppState, AppStateStatus, NativeEventSubscription } from "react-native";

// Types for event listeners
type NetworkEventCallback = (event: Event) => void;
type StorageEventCallback = (event: StorageEvent) => void;
type EventCallback = NetworkEventCallback | StorageEventCallback;
type GlobalWithWindow = typeof globalThis & { window?: Window & typeof globalThis };

// Store event listeners
const onlineListeners: Set<NetworkEventCallback> = new Set();
const offlineListeners: Set<NetworkEventCallback> = new Set();
let isOnline = true;
let networkPollingInterval: ReturnType<typeof setInterval> | null = null;
let appStateSubscription: NativeEventSubscription | null = null;

// Check network state using expo-network
async function checkNetworkState(): Promise<boolean> {
  try {
    const networkState = await Network.getNetworkStateAsync();
    return networkState.isConnected ?? true;
  } catch (e) {
    console.warn("Error checking network state:", e);
    return true; // Assume online if we can't check
  }
}

// Initialize network monitoring using polling (expo-network doesn't have addEventListener)
function initNetworkMonitoring() {
  if (networkPollingInterval) return; // Already initialized

  // Poll network state every 3 seconds
  networkPollingInterval = setInterval(async () => {
    const wasOnline = isOnline;
    isOnline = await checkNetworkState();

    if (wasOnline && !isOnline) {
      // Went offline
      const event = new Event("offline");
      offlineListeners.forEach((callback) => {
        try {
          callback(event);
        } catch (e) {
          console.warn("Error in offline listener:", e);
        }
      });
    } else if (!wasOnline && isOnline) {
      // Came online
      const event = new Event("online");
      onlineListeners.forEach((callback) => {
        try {
          callback(event);
        } catch (e) {
          console.warn("Error in online listener:", e);
        }
      });
    }
  }, 3000);

  // Also listen for app state changes
  appStateSubscription = AppState.addEventListener(
    "change",
    async (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        // App came to foreground, check network status immediately
        const wasOnline = isOnline;
        isOnline = await checkNetworkState();

        if (!wasOnline && isOnline) {
          const event = new Event("online");
          onlineListeners.forEach((callback) => {
            try {
              callback(event);
            } catch (e) {
              console.warn("Error in online listener:", e);
            }
          });
        } else if (wasOnline && !isOnline) {
          const event = new Event("offline");
          offlineListeners.forEach((callback) => {
            try {
              callback(event);
            } catch (e) {
              console.warn("Error in offline listener:", e);
            }
          });
        }
      }
    }
  );
}

// Custom Event class for React Native
class Event {
  static readonly NONE = 0;
  static readonly CAPTURING_PHASE = 1;
  static readonly AT_TARGET = 2;
  static readonly BUBBLING_PHASE = 3;

  type: string;
  bubbles: boolean;
  cancelable: boolean;
  defaultPrevented: boolean;
  isTrusted: boolean;
  timeStamp: number;

  constructor(type: string, eventInitDict?: EventInit) {
    this.type = type;
    this.bubbles = eventInitDict?.bubbles ?? false;
    this.cancelable = eventInitDict?.cancelable ?? false;
    this.defaultPrevented = false;
    this.isTrusted = true;
    this.timeStamp = Date.now();
  }

  preventDefault() {
    this.defaultPrevented = true;
  }

  stopPropagation() {}
  stopImmediatePropagation() {}
}

// Make Event available globally
if (typeof global !== "undefined" && !global.Event) {
  global.Event = Event as unknown as typeof globalThis.Event;
}

// Polyfill window object for React Native
if (typeof global !== "undefined") {
  const globalRef = global as GlobalWithWindow;
  // Initialize window if it doesn't exist
  if (!globalRef.window) {
    globalRef.window = {} as Window & typeof globalThis;
  }

  const win = globalRef.window;

  // Polyfill addEventListener
  if (typeof win.addEventListener !== "function") {
    win.addEventListener = ((
      type: string,
      callback: EventCallback,
      _options?: boolean | AddEventListenerOptions
    ): void => {
      if (type === "online") {
        onlineListeners.add(callback as NetworkEventCallback);
        initNetworkMonitoring();
      } else if (type === "offline") {
        offlineListeners.add(callback as NetworkEventCallback);
        initNetworkMonitoring();
      } else if (type === "storage") {
        // Storage events not applicable in React Native
        // Just ignore them silently
      }
      // Other events can be safely ignored
    }) as Window["addEventListener"];
  }

  // Polyfill removeEventListener
  if (typeof win.removeEventListener !== "function") {
    win.removeEventListener = ((
      type: string,
      callback: EventCallback,
      _options?: boolean | EventListenerOptions
    ): void => {
      if (type === "online") {
        onlineListeners.delete(callback as NetworkEventCallback);
      } else if (type === "offline") {
        offlineListeners.delete(callback as NetworkEventCallback);
      }
      // Clean up if no more listeners
      if (onlineListeners.size === 0 && offlineListeners.size === 0) {
        if (networkPollingInterval) {
          clearInterval(networkPollingInterval);
          networkPollingInterval = null;
        }
        if (appStateSubscription) {
          appStateSubscription.remove();
          appStateSubscription = null;
        }
      }
    }) as Window["removeEventListener"];
  }

  // Polyfill navigator.onLine
  if (!win.navigator) {
    win.navigator = {} as Navigator;
  }
  Object.defineProperty(win.navigator, "onLine", {
    get: () => isOnline,
    configurable: true,
  });

  // Polyfill dispatchEvent
  if (typeof win.dispatchEvent !== "function") {
    win.dispatchEvent = function (event: Event): boolean {
      if (event.type === "online") {
        onlineListeners.forEach((callback) => {
          try {
            callback(event);
          } catch (e) {
            console.warn("Error in online listener:", e);
          }
        });
      } else if (event.type === "offline") {
        offlineListeners.forEach((callback) => {
          try {
            callback(event);
          } catch (e) {
            console.warn("Error in offline listener:", e);
          }
        });
      }
      return true;
    };
  }

  // Initialize network state
  checkNetworkState().then((connected) => {
    isOnline = connected;
  }).catch(() => {
    isOnline = true; // Assume online on error
  });
}

export { };

