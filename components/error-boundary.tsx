import { IconSymbol } from '@/components/ui/icon-symbol';
import { MsHeading, MsText } from '@/components/ui/typography';
import { logError } from '@/utils/sentry';
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Pressable, View } from 'react-native';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    
    // Log error to console in development
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Send to Sentry
    logError(error, {
      componentStack: errorInfo.componentStack,
      boundary: 'ErrorBoundary',
    });
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetError = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View className="flex-1 items-center justify-center p-6 bg-background dark:bg-dark-background">
          <View className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 items-center justify-center mb-6">
            <IconSymbol name="exclamationmark.triangle" size={40} color="#EF4444" />
          </View>
          
          <MsHeading size="h2" className="text-center mb-2">
            Something went wrong
          </MsHeading>
          
          <MsText variant="muted" className="text-center mb-8">
            We apologize for the inconvenience. Please try again.
          </MsText>

          {__DEV__ && this.state.error && (
            <View className="w-full bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mb-6">
              <MsText variant="small" className="text-red-800 dark:text-red-200 font-mono">
                {this.state.error.toString()}
              </MsText>
              {this.state.errorInfo && (
                <MsText variant="small" className="text-red-600 dark:text-red-300 font-mono mt-2">
                  {this.state.errorInfo.componentStack}
                </MsText>
              )}
            </View>
          )}

          <Pressable
            onPress={this.resetError}
            className="px-8 py-3 bg-primary dark:bg-dark-primary rounded-xl active:opacity-80"
          >
            <MsText className="text-white font-semibold">Try Again</MsText>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}

// Hook for functional components to handle errors
export function useErrorHandler() {
  return {
    handleError: (error: Error, context?: string) => {
      console.error(`Error${context ? ` in ${context}` : ''}:`, error);
      // Send to Sentry
      logError(error, { context });
    },
  };
}
