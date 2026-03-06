import { Card } from "@/components/ui/card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { MsText } from "@/components/ui/typography";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/utils/auth-context";
import { useTheme } from "react-native-paper";
import { useQuery } from "convex/react";
import { Stack, useRouter } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface AuditLog { _id: any; _creationTime: number; action: string; details?: string; timestamp: string; officerId?: any; }

export default function AuditLogsScreen() {
    const { token } = useAuth();
    const router = useRouter();
    const { colors, dark: isDark } = useTheme();

    const logs = useQuery(api.officers.getAuditLogs, { token: token || undefined, limit: 50 });

    if (!token) {
        return (
            <SafeAreaView style={[styles.center, { backgroundColor: colors.background }]}>
                <MsText variant="muted">Please log in to view audit logs.</MsText>
            </SafeAreaView>
        );
    }

    if (logs === undefined) {
        return (
            <SafeAreaView style={[styles.center, { backgroundColor: colors.background }]}>
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
        return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    const handleBack = () => router.canGoBack() ? router.back() : router.replace("/(tabs)/profile");

    return (
        <>
            <Stack.Screen
                options={{
                    headerLeft: () => (
                        <Pressable onPress={handleBack} style={{ padding: 8 }}>
                            <IconSymbol name="chevron.left" size={24} color="#64748B" />
                        </Pressable>
                    ),
                }}
            />
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={[]}>
                <View style={styles.content}>
                    <View style={styles.subHeader}>
                        <MsText variant="muted">Activity history</MsText>
                        <MsText variant="small" style={{ color: colors.onSurfaceVariant }}>
                            Last {logs?.length || 0} events
                        </MsText>
                    </View>

                    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                        {logs?.length === 0 ? (
                            <Card style={{ padding: 32, alignItems: "center" }}>
                                <IconSymbol name="info.circle.fill" size={48} color="#6B7280" />
                                <MsText variant="muted" style={{ marginTop: 16, textAlign: "center" }}>No audit logs found yet.</MsText>
                            </Card>
                        ) : (
                            <View style={{ gap: 12, paddingBottom: 32 }}>
                                {logs?.map((log: AuditLog) => (
                                    <Card key={log._id} style={{ padding: 16 }}>
                                        <View style={styles.logRow}>
                                            <View style={[styles.iconCircle, { backgroundColor: `${getActionColor(log.action)}20` }]}>
                                                <IconSymbol name={getActionIcon(log.action) as any} size={20} color={getActionColor(log.action)} />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <View style={styles.logTopRow}>
                                                    <MsText style={{ fontWeight: "600", color: getActionColor(log.action) }}>
                                                        {log.action.replace(/_/g, " ")}
                                                    </MsText>
                                                    <MsText variant="small" style={{ color: colors.onSurfaceVariant }}>
                                                        {formatDate(log.timestamp)}
                                                    </MsText>
                                                </View>
                                                {log.details && (
                                                    <MsText variant="small" style={{ color: colors.onSurfaceVariant, marginTop: 4 }}>
                                                        {log.details}
                                                    </MsText>
                                                )}
                                            </View>
                                        </View>
                                    </Card>
                                ))}
                            </View>
                        )}
                    </ScrollView>
                </View>
            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, alignItems: "center", justifyContent: "center" },
    content: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
    subHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
    logRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
    iconCircle: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
    logTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
});
