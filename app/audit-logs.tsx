import { Card } from "@/components/ui/Card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { MsHeading, MsText } from "@/components/ui/Typography";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/utils/auth-context";
import { useTheme } from "@/utils/theme-context";
import { useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface AuditLog {
    _id: any;
    _creationTime: number;
    action: string;
    details?: string;
    timestamp: string;
    officerId?: any;
}

export default function AuditLogsScreen() {
    const { token } = useAuth();
    const { theme } = useTheme();
    const router = useRouter();

    const logs = useQuery(api.officers.getAuditLogs, { 
        token: token || undefined,
        limit: 50 
    });

    if (!token) {
        return (
            <SafeAreaView className="flex-1 bg-background dark:bg-dark-background items-center justify-center">
                <MsText variant="muted">Please log in to view audit logs.</MsText>
            </SafeAreaView>
        );
    }

    if (logs === undefined) {
        return (
            <SafeAreaView className="flex-1 bg-background dark:bg-dark-background items-center justify-center">
                <ActivityIndicator size="large" color="#2563EB" />
            </SafeAreaView>
        );
    }

    const getActionColor = (action: string) => {
        if (action.includes("LOGIN") || action.includes("LOGOUT")) return "#3B82F6";
        if (action.includes("PASSWORD")) return "#F59E0B";
        if (action.includes("CHECK_IN")) return "#10B981";
        if (action.includes("DELETE") || action.includes("REMOVE")) return "#EF4444";
        return "#6B7280";
    };

    const getActionIcon = (action: string) => {
        if (action.includes("LOGIN")) return "person.fill";
        if (action.includes("LOGOUT")) return "arrow.right.circle";
        if (action.includes("PASSWORD")) return "lock.circle.fill";
        if (action.includes("CHECK_IN")) return "checkmark.circle.fill";
        if (action.includes("CREATE") || action.includes("ADD")) return "plus.circle.fill";
        if (action.includes("UPDATE") || action.includes("EDIT")) return "pencil.circle.fill";
        if (action.includes("DELETE") || action.includes("REMOVE")) return "minus.circle.fill";
        return "info.circle.fill";
    };

    const formatDate = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <SafeAreaView className="flex-1 bg-background dark:bg-dark-background" edges={['top']}>
            <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false}>
                <View className="flex-row items-center justify-between mb-6">
                    <MsHeading size="h2">Audit Logs</MsHeading>
                    <MsText variant="small" className="text-muted-foreground dark:text-dark-muted-foreground">
                        Last {logs.length} events
                    </MsText>
                </View>

                {logs.length === 0 ? (
                    <Card className="p-8 items-center">
                        <IconSymbol name="info.circle.fill" size={48} color="#6B7280" />
                        <MsText variant="muted" className="mt-4 text-center">
                            No audit logs found yet.
                        </MsText>
                    </Card>
                ) : (
                    <View className="gap-3">
                        {logs.map((log: AuditLog) => (
                            <Card key={log._id} className="p-4">
                                <View className="flex-row items-start gap-3">
                                    <View 
                                        className="w-10 h-10 rounded-full items-center justify-center"
                                        style={{ backgroundColor: `${getActionColor(log.action)}20` }}
                                    >
                                        <IconSymbol 
                                            name={getActionIcon(log.action) as any} 
                                            size={20} 
                                            color={getActionColor(log.action)} 
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <View className="flex-row items-center justify-between">
                                            <MsText className="font-semibold" style={{ color: getActionColor(log.action) }}>
                                                {log.action.replace(/_/g, ' ')}
                                            </MsText>
                                            <MsText variant="small" className="text-muted-foreground dark:text-dark-muted-foreground">
                                                {formatDate(log.timestamp)}
                                            </MsText>
                                        </View>
                                        {log.details && (
                                            <MsText variant="small" className="text-muted-foreground dark:text-dark-muted-foreground mt-1">
                                                {log.details}
                                            </MsText>
                                        )}
                                    </View>
                                </View>
                            </Card>
                        ))}
                    </View>
                )}

                <View className="mt-8 mb-12">
                    <Pressable onPress={() => router.back()} className="items-center">
                        <MsText variant="small" className="text-primary">
                            Back
                        </MsText>
                    </Pressable>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
