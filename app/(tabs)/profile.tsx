import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { MsHeading, MsText } from "@/components/ui/Typography";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAuth } from "@/utils/auth-context";
import { useTheme } from "@/utils/theme-context";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, Switch, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Profile() {
    const { officer, signOut } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const router = useRouter();
    const [notifications, setNotifications] = useState(true);

    if (!officer) return null;

    const handleSignOut = () => {
        Alert.alert("Sign Out", "Are you sure you want to sign out?", [
            { text: "Cancel", style: "cancel" },
            { text: "Sign Out", style: "destructive", onPress: () => signOut() }
        ]);
    };

    return (
        <SafeAreaView className="flex-1 bg-background dark:bg-dark-background" edges={['top']}>
            <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                <MsHeading size="h2" className="mb-6">Profile</MsHeading>

                <Card className="items-center py-6 mb-6 bg-primary/5 dark:bg-primary/10 border-primary/10 dark:border-primary/20">
                    <View className="w-24 h-24 rounded-full bg-primary items-center justify-center mb-4">
                        <IconSymbol name="person.fill" size={48} color="white" />
                    </View>
                    <MsHeading size="h3">{officer.name}</MsHeading>
                    <MsText variant="muted" className="mb-1">{officer.role}</MsText>
                    <MsText variant="small" className="text-primary font-medium">Official Officer</MsText>
                </Card>

                <View className="flex-row gap-4 mb-6">
                    <Pressable onPress={() => router.navigate({ pathname: "/reports" } as any)} className="flex-1">
                        <Card className="items-center py-4 active:scale-[0.98] transition-transform">
                            <IconSymbol name="chart.bar.xaxis" size={24} color="#2563EB" />
                            <MsHeading size="h4" className="mt-2 text-primary">Reports</MsHeading>
                        </Card>
                    </Pressable>
                    <Card className="flex-1 items-center py-4">
                        <MsHeading size="h3" className="text-primary">{officer.role}</MsHeading>
                        <MsText variant="small">Role</MsText>
                    </Card>
                </View>

                <MsHeading size="h4" className="mb-3 ml-1">Settings</MsHeading>
                <Card className="p-0 overflow-hidden mb-6">
                    <View className="p-4 flex-row items-center justify-between border-b border-border dark:border-dark-border">
                        <View className="flex-row items-center">
                            <IconSymbol name="bell.fill" size={20} color="#64748B" />
                            <MsText className="ml-3">Push Notifications</MsText>
                        </View>
                        <Switch
                            value={notifications}
                            onValueChange={setNotifications}
                            trackColor={{ false: "#E2E8F0", true: "#2563EB" }}
                        />
                    </View>
                    <View className="p-4 flex-row items-center justify-between border-b border-border dark:border-dark-border">
                        <View className="flex-row items-center">
                            <IconSymbol name="moon.fill" size={20} color="#64748B" />
                            <MsText className="ml-3">Dark Mode</MsText>
                        </View>
                        <Switch
                            value={theme === "dark"}
                            onValueChange={toggleTheme}
                            trackColor={{ false: "#E2E8F0", true: "#2563EB" }}
                        />
                    </View>
                    <Pressable className="p-4 flex-row items-center justify-between active:bg-slate-50 dark:active:bg-dark-muted transition-colors">
                        <View className="flex-row items-center">
                            <IconSymbol name="envelope.fill" size={20} color="#64748B" />
                            <MsText className="ml-3">Email</MsText>
                        </View>
                        <View className="flex-row items-center">
                            <MsText variant="muted" className="mr-2 text-sm max-w-[150px]" numberOfLines={1}>{officer.email}</MsText>
                            <IconSymbol name="chevron.right" size={16} color="#CBD5E1" />
                        </View>
                    </Pressable>
                </Card>

                {(officer.role === "President" || officer.role === "Admin") && (
                    <>
                        <MsHeading size="h4" className="mb-3 ml-1">Administration</MsHeading>
                        <Card className="p-0 overflow-hidden mb-6">
                            <Pressable 
                                onPress={() => router.navigate({ pathname: "/audit-logs" } as any)} 
                                className="p-4 flex-row items-center justify-between active:bg-slate-50 dark:active:bg-dark-muted transition-colors"
                            >
                                <View className="flex-row items-center">
                                    <IconSymbol name="list.bullet.rectangle.fill" size={20} color="#64748B" />
                                    <MsText className="ml-3">Audit Logs</MsText>
                                </View>
                                <IconSymbol name="chevron.right" size={16} color="#CBD5E1" />
                            </Pressable>
                        </Card>
                    </>
                )}

                <Button variant="outline" className="mb-10 border-red-200 dark:border-red-800" onPress={handleSignOut}>
                    <MsText className="text-red-500 dark:text-red-400 font-semibold">Sign Out</MsText>
                </Button>
            </ScrollView>
        </SafeAreaView>
    );
}
