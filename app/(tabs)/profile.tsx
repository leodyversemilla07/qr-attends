import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { MsHeading, MsText } from "@/components/ui/Typography";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useState } from "react";
import { Alert, Pressable, ScrollView, Switch, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Profile() {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [notifications, setNotifications] = useState(true);

    // Mock user data
    const user = {
        name: "Leodyver Semilla",
        email: "leodyversemilla07@gmail.com",
        role: "Administrator",
        organization: "CodeSanctum",
    };

    const handleSignOut = () => {
        Alert.alert("Sign Out", "Are you sure you want to sign out?", [
            { text: "Cancel", style: "cancel" },
            { text: "Sign Out", style: "destructive" }
        ]);
    };

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top']}>
            <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false}>
                <MsHeading size="h2" className="mb-6">Profile</MsHeading>

                {/* User Header */}
                <Card className="items-center py-6 mb-6 bg-primary/5 border-primary/10">
                    <View className="w-24 h-24 rounded-full bg-primary items-center justify-center mb-4">
                        <IconSymbol name="person.fill" size={48} color="white" />
                    </View>
                    <MsHeading size="h3">{user.name}</MsHeading>
                    <MsText variant="muted" className="mb-1">{user.role}</MsText>
                    <MsText variant="small" className="text-primary font-medium">{user.organization}</MsText>
                </Card>

                {/* Stats Section (Mock) */}
                <View className="flex-row gap-4 mb-6">
                    <Card className="flex-1 items-center py-4">
                        <MsHeading size="h3" className="text-primary">12</MsHeading>
                        <MsText variant="small">Events</MsText>
                    </Card>
                    <Card className="flex-1 items-center py-4">
                        <MsHeading size="h3" className="text-primary">450</MsHeading>
                        <MsText variant="small">Attendees</MsText>
                    </Card>
                </View>

                {/* Settings Groups */}
                <MsHeading size="h4" className="mb-3 ml-1">Account Settings</MsHeading>
                <Card className="p-0 overflow-hidden mb-6">
                    <View className="p-4 flex-row items-center justify-between border-b border-border">
                        <View className="flex-row items-center">
                            <IconSymbol name="calendar" size={20} color="#64748B" />
                            <MsText className="ml-3">Push Notifications</MsText>
                        </View>
                        <Switch
                            value={notifications}
                            onValueChange={setNotifications}
                            trackColor={{ false: "#E2E8F0", true: "#2563EB" }}
                        />
                    </View>
                    <View className="p-4 flex-row items-center justify-between border-b border-border">
                        <View className="flex-row items-center">
                            <IconSymbol name="clock" size={20} color="#64748B" />
                            <MsText className="ml-3">Dark Mode</MsText>
                        </View>
                        <Switch
                            value={isDarkMode}
                            onValueChange={setIsDarkMode}
                            trackColor={{ false: "#E2E8F0", true: "#2563EB" }}
                        />
                    </View>
                    <PressableAction icon="paperplane.fill" label="Change Email" value={user.email} />
                </Card>

                <Button variant="outline" className="mb-10 border-red-200" onPress={handleSignOut}>
                    <MsText className="text-red-500 font-semibold">Sign Out</MsText>
                </Button>
            </ScrollView>
        </SafeAreaView>
    );
}

function PressableAction({ icon, label, value }: { icon: any, label: string, value?: string }) {
    return (
        <Pressable className="p-4 flex-row items-center justify-between active:bg-slate-50 transition-colors">
            <View className="flex-row items-center">
                <IconSymbol name={icon} size={20} color="#64748B" />
                <MsText className="ml-3">{label}</MsText>
            </View>
            <View className="flex-row items-center">
                {value && <MsText variant="muted" className="mr-2 text-sm max-w-[150px]" numberOfLines={1}>{value}</MsText>}
                <IconSymbol name="chevron.right" size={16} color="#CBD5E1" />
            </View>
        </Pressable>
    );
}
