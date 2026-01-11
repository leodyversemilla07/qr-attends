import { api } from "@/convex/_generated/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "convex/react";
import Constants, { ExecutionEnvironment } from "expo-constants";
import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";

// Secure storage keys
const AUTH_TOKEN_KEY = "auth_token_secure";

/**
 * Secure token storage utilities.
 * Uses expo-secure-store on native (encrypted keychain/keystore).
 * Falls back to AsyncStorage on web (where SecureStore is unavailable).
 */
async function getSecureToken(): Promise<string | null> {
    try {
        if (Platform.OS === "web") {
            return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
        }
        return await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
    } catch (error) {
        console.error("Failed to get secure token:", error);
        return null;
    }
}

async function setSecureToken(token: string): Promise<void> {
    try {
        if (Platform.OS === "web") {
            await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
        } else {
            await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
        }
    } catch (error) {
        console.error("Failed to set secure token:", error);
        throw error;
    }
}

async function deleteSecureToken(): Promise<void> {
    try {
        if (Platform.OS === "web") {
            await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
        } else {
            await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
        }
    } catch (error) {
        console.error("Failed to delete secure token:", error);
    }
}

type OfficerWithoutPassword = {
    _id: string;
    _creationTime: number;
    name: string;
    email: string;
    role: string;
    lastSeen?: string;
};

type AuthContextType = {
    token: string | null;
    officer: OfficerWithoutPassword | null;
    isLoading: boolean;
    signIn: (token: string) => Promise<void>;
    signOut: () => Promise<void>;
    notificationsEnabled: boolean;
    toggleNotifications: () => Promise<void>;
    expoPushToken: string | null;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [isInitializing, setIsInitializing] = useState(true);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [expoPushToken, setExpoPushToken] = useState<string | null>(null);

    const officer = useQuery(api.officers.getMe, { token: token ?? undefined });

    useEffect(() => {
        async function loadSettings() {
            try {
                // Load auth token from secure storage
                const storedToken = await getSecureToken();
                if (storedToken) {
                    setToken(storedToken);
                }
                // Non-sensitive settings can stay in AsyncStorage
                const notif = await AsyncStorage.getItem("notifications_enabled");
                setNotificationsEnabled(notif === "true");
            } catch (e) {
                console.error("Failed to load settings", e);
            } finally {
                setIsInitializing(false);
            }
        }
        loadSettings();
    }, []);

    useEffect(() => {
        if (notificationsEnabled) {
            registerForPushNotifications();
        }
    }, [notificationsEnabled]);

    async function registerForPushNotifications() {
        if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
            console.warn("Push notifications are not supported in Expo Go. Use a development build.");
            return;
        }

        try {
            const Notifications = await import("expo-notifications");
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== "granted") {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus === "granted") {
                const tokenData = await Notifications.getExpoPushTokenAsync();
                setExpoPushToken(tokenData.data);
                await AsyncStorage.setItem("expo_push_token", tokenData.data);
            }
        } catch (error) {
            console.error("Failed to register for push notifications:", error);
        }
    }

    const signIn = async (newToken: string) => {
        await setSecureToken(newToken);
        setToken(newToken);
    };

    const signOut = async () => {
        await deleteSecureToken();
        setToken(null);
    };

    const toggleNotifications = async () => {
        const newValue = !notificationsEnabled;
        setNotificationsEnabled(newValue);
        await AsyncStorage.setItem("notifications_enabled", newValue.toString());

        if (newValue) {
            registerForPushNotifications();
        }
    };

    const isLoading = isInitializing || (token !== null && officer === undefined);

    return (
        <AuthContext.Provider value={{ token, officer: officer ?? null, isLoading, signIn, signOut, notificationsEnabled, toggleNotifications, expoPushToken }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

export async function sendLocalNotification(title: string, body: string) {
    if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
        console.warn("Local notifications are not supported in Expo Go.");
        return;
    }
    
    try {
        const Notifications = await import("expo-notifications");
        await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                sound: true,
            },
            trigger: null,
        });
    } catch (error) {
        console.error("Failed to send local notification:", error);
    }
}
