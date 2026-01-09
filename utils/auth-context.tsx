import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import * as Notifications from "expo-notifications";

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
                const storedToken = await AsyncStorage.getItem("auth_token");
                if (storedToken) {
                    setToken(storedToken);
                }
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
        try {
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
        await AsyncStorage.setItem("auth_token", newToken);
        setToken(newToken);
    };

    const signOut = async () => {
        await AsyncStorage.removeItem("auth_token");
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
    await Notifications.scheduleNotificationAsync({
        content: {
            title,
            body,
            sound: true,
        },
        trigger: null,
    });
}
