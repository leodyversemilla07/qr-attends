// Polyfills must be imported before any Convex code
import "@/utils/convex-polyfills";

import { ErrorBoundary } from "@/components/error-boundary";
import { AuthProvider, useAuth } from "@/utils/auth-context";
import { queryClient } from "@/utils/query-client";
import { initSentry, setSentryUser } from "@/utils/sentry";
import { Inter_600SemiBold, useFonts } from "@expo-google-fonts/inter";
import { WorkSans_400Regular } from "@expo-google-fonts/work-sans";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClientProvider } from "@tanstack/react-query";
import { ConvexProvider } from "convex/react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { convex } from "../convex";
import "../global.css";
import { ThemeProvider, useTheme } from "../utils/theme-context";
import LoginScreen from "./login";
import OnboardingScreen from "./onboarding";

// Initialize Sentry
initSentry();

SplashScreen.preventAutoHideAsync();

function AppContent() {
  const { officer, isLoading } = useAuth();
  const { theme } = useTheme();
  const [fontsLoaded, fontError] = useFonts({
    Inter_600SemiBold,
    WorkSans_400Regular,
  });
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);

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
    return <OnboardingScreen />;
  }

  if ((!fontsLoaded && !fontError) || isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme === 'dark' ? '#151718' : '#F8FAFC', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!officer) {
    return <LoginScreen />;
  }

  const isDark = theme === 'dark';

  return (
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
      <Stack.Screen name="scan-qr" options={{ headerShown: true, title: "Scan QR", presentation: 'modal' }} />
      <Stack.Screen name="search" options={{ headerShown: false }} />
      <Stack.Screen name="search-results" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
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