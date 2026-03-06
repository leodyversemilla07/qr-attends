// Polyfills must be imported before any Convex code
import "@/utils/convex-polyfills";

import { ErrorBoundary } from "@/components/error-boundary";
import { AuthProvider, useAuth } from "@/utils/auth-context";
import { queryClient } from "@/utils/query-client";
import { initSentry, setSentryUser } from "@/utils/sentry";
import { Inter_600SemiBold, useFonts } from "@expo-google-fonts/inter";
import { WorkSans_400Regular } from "@expo-google-fonts/work-sans";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme
} from '@react-navigation/native';
import { QueryClientProvider } from "@tanstack/react-query";
import { ConvexProvider } from "convex/react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { adaptNavigationTheme, MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { convex } from "../convex";
import { ThemeProvider, useAppTheme } from "../utils/theme-context";
import LoginScreen from "./login";
import OnboardingScreen from "./onboarding";

// Initialize Sentry
initSentry();

SplashScreen.preventAutoHideAsync();

const { LightTheme, DarkTheme } = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme,
});

const CombinedDefaultTheme = {
  ...MD3LightTheme,
  ...LightTheme,
  fonts: MD3LightTheme.fonts,
  colors: {
    ...MD3LightTheme.colors,
    ...LightTheme.colors,
    primary: '#2563EB',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceVariant: '#F1F5F9',
    onBackground: '#1E293B',
    onSurface: '#1E293B',
    onSurfaceVariant: '#64748B',
    outline: '#E2E8F0',
    outlineVariant: '#E2E8F0',
  },
};

const CombinedDarkTheme = {
  ...MD3DarkTheme,
  ...DarkTheme,
  fonts: MD3DarkTheme.fonts,
  colors: {
    ...MD3DarkTheme.colors,
    ...DarkTheme.colors,
    primary: '#3B82F6',
    background: '#151718',
    surface: '#1E293B',
    surfaceVariant: '#334155',
    onBackground: '#ECEDEE',
    onSurface: '#ECEDEE',
    onSurfaceVariant: '#94A3B8',
    outline: '#334155',
    outlineVariant: '#334155',
  },
};

function AppContent() {
  const { officer, isLoading } = useAuth();
  const { theme } = useAppTheme();
  const [fontsLoaded, fontError] = useFonts({
    Inter_600SemiBold,
    WorkSans_400Regular,
  });
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);

  const paperTheme = theme === 'dark' ? CombinedDarkTheme : CombinedDefaultTheme;

  // Set Sentry user context when officer changes
  useEffect(() => {
    if (officer) {
      setSentryUser({
        id: officer._id,
        email: officer.email,
        name: officer.name,
        role: officer.role,
      });
    } else {
      setSentryUser(null);
    }
  }, [officer]);

  useEffect(() => {
    const checkOnboarding = async () => {
      const completed = await AsyncStorage.getItem("onboardingComplete");
      setShowOnboarding(completed !== "true");
    };
    checkOnboarding();
  }, []);

  useEffect(() => {
    // Hide splash screen when we know what to show (onboarding or main app)
    if ((fontsLoaded || fontError) && !isLoading && showOnboarding !== null) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, isLoading, showOnboarding]);

  if (showOnboarding === null) {
    return (
      <View style={{ flex: 1, backgroundColor: theme === 'dark' ? '#151718' : '#F8FAFC', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (showOnboarding) {
    return <PaperProvider theme={paperTheme as any}><OnboardingScreen /></PaperProvider>;
  }

  if ((!fontsLoaded && !fontError) || isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme === 'dark' ? '#151718' : '#F8FAFC', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!officer) {
    return <PaperProvider theme={paperTheme as any}><LoginScreen /></PaperProvider>;
  }

  const isDark = theme === 'dark';

  return (
    <PaperProvider theme={paperTheme as any}>
      <Stack
        screenOptions={{
          headerShown: false,
          headerStyle: {
            backgroundColor: isDark ? '#151718' : '#F8FAFC',
          },
          headerTintColor: isDark ? '#ECEDEE' : '#1E293B',
          headerTitleStyle: {
            fontFamily: 'Inter_600SemiBold',
            color: isDark ? '#ECEDEE' : '#1E293B',
          },
          contentStyle: {
            backgroundColor: isDark ? '#151718' : '#F8FAFC',
          },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="event/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="create-event" options={{ headerShown: true, title: "Create Event", presentation: 'modal' }} />
        <Stack.Screen name="register-member" options={{ headerShown: true, title: "Register Member", presentation: 'modal' }} />
        <Stack.Screen name="reports" options={{ headerShown: true, title: "Reports", presentation: 'modal' }} />
        <Stack.Screen name="import-members" options={{ headerShown: true, title: "Import Members", presentation: 'modal' }} />
        <Stack.Screen name="member/[id]" options={{ headerShown: true, title: "Member Details", headerBackVisible: true }} />
        <Stack.Screen name="forgot-password" options={{ headerShown: true, title: "Forgot Password", headerBackVisible: true }} />
        <Stack.Screen name="reset-password" options={{ headerShown: true, title: "Reset Password", headerBackVisible: true }} />
        <Stack.Screen name="audit-logs" options={{ headerShown: true, title: "Audit Logs", headerBackVisible: true }} />
        <Stack.Screen name="scan-qr" options={{ headerShown: false }} />
        <Stack.Screen name="search" options={{ headerShown: false }} />
        <Stack.Screen name="search-results" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </PaperProvider>
  );
}
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ConvexProvider client={convex}>
          <AuthProvider>
            <ThemeProvider>
              <ErrorBoundary>
                <AppContent />
                <StatusBar style="auto" />
              </ErrorBoundary>
            </ThemeProvider>
          </AuthProvider>
        </ConvexProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}