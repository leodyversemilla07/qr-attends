import * as Sentry from '@sentry/react-native';

const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;

export function initSentry() {
  if (!SENTRY_DSN) {
    console.warn('Sentry DSN not configured. Skipping Sentry initialization.');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: __DEV__ ? 'development' : 'production',
    
    // Performance monitoring
    tracesSampleRate: __DEV__ ? 1.0 : 0.1, // 100% in dev, 10% in production
    
    // Session replay (for debugging user interactions)
    replaysSessionSampleRate: __DEV__ ? 1.0 : 0.01,
    replaysOnErrorSampleRate: 1.0, // Always capture on error
    
    // Enable native crash reporting
    enableNativeCrashHandling: true,
    enableNativeNagger: false,
    
    // Attach screenshots on error
    attachScreenshot: true,
    
    // Before send hook to filter sensitive data
    beforeSend: (event) => {
      // Remove sensitive data from breadcrumbs
      if (event.breadcrumbs) {
        event.breadcrumbs = event.breadcrumbs.map((crumb) => {
          if (crumb.data?.url?.includes('token') || crumb.data?.url?.includes('password')) {
            return {
              ...crumb,
              data: { ...crumb.data, url: '[Filtered]' },
            };
          }
          return crumb;
        });
      }

      // Filter sensitive context
      if (event.contexts?.app) {
        delete event.contexts.app.device_app_hash;
      }

      return event;
    },

    // Ignore certain errors
    ignoreErrors: [
      'Network request failed',
      'Cancelled',
      'Request timeout',
      /API rate limit exceeded/,
    ],
  });

  // Set user context if available
  Sentry.setTag('app.version', process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0');
  Sentry.setTag('app.build', process.env.EXPO_PUBLIC_BUILD_NUMBER || '1');
}

/**
 * Set user information for Sentry
 */
export function setSentryUser(user: {
  id: string;
  email: string;
  role?: string;
  name?: string;
} | null) {
  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.name,
    });
    Sentry.setTag('user.role', user.role || 'unknown');
  } else {
    Sentry.setUser(null);
  }
}

/**
 * Log an error to Sentry
 */
export function logError(error: Error, context?: Record<string, any>) {
  if (__DEV__) {
    console.error('Sentry Error:', error, context);
  }
  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Log a message to Sentry
 */
export function logMessage(message: string, level: Sentry.SeverityLevel = 'info', context?: Record<string, any>) {
  if (__DEV__) {
    console.log(`Sentry [${level}]:`, message, context);
  }
  Sentry.captureMessage(message, level);
}

/**
 * Start a span for performance monitoring
 */
export function startSpan(name: string, op: string, fn: () => void) {
  return Sentry.startSpan({ name, op }, fn);
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(
  message: string,
  category: string,
  level: Sentry.SeverityLevel = 'info',
  data?: Record<string, any>
) {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
  });
}

export { Sentry };
