import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { MsText } from "@/components/ui/typography";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/utils/auth-context";
import { useTheme } from "react-native-paper";
import { useQuery } from "convex/react";
import { Stack, useRouter } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View, FlatList, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from "react";

export default function AuditLogsScreen() {
    const { token } = useAuth();
    const router = useRouter();
    const { colors } = useTheme();
    const [actionFilter, setActionFilter] = useState<string | undefined>(undefined);
    const [refreshing, setRefreshing] = useState(false);

    const queryResult = useQuery(api.officers.getAuditLogs, { 
        token: token || undefined, 
        limit: 100,
        actionType: actionFilter
    });

    const logs = queryResult?.logs;

    if (!token) {
        return (
            <SafeAreaView style={[styles.center, { backgroundColor: colors.background }]}>
                <MsText variant="muted">Please log in to view audit logs.</MsText>
            </SafeAreaView>
        );
    }

    const onRefresh = () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1000);
    };

    const getActionColor = (action: string) => {
        if (action.includes("LOGIN") || action.includes("LOGOUT")) return "#3B82F6";
        if (action.includes("PASSWORD")) return "#F59E0B";
        if (action.includes("CHECK_IN")) return "#10B981";
        if (action.includes("DELETE") || action.includes("REMOVE")) return "#EF4444";
        if (action.includes("OFFICER")) return "#8B5CF6";
        return "#6B7280";
    };

    const getActionIcon = (action: string) => {
        if (action.includes("LOGIN")) return "person.fill";
        if (action.includes("LOGOUT")) return "arrow.right.circle";
        if (action.includes("PASSWORD")) return "lock.circle.fill";
        if (action.includes("CHECK_IN")) return "checkmark.circle.fill";
        if (action.includes("CREATE") || action.includes("ADD") || action.includes("REGISTER")) return "plus.circle.fill";
        if (action.includes("UPDATE") || action.includes("EDIT")) return "pencil.circle.fill";
        if (action.includes("DELETE") || action.includes("REMOVE")) return "trash.fill";
        return "info.circle.fill";
    };

    const formatDate = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    const handleBack = () => router.canGoBack() ? router.back() : router.replace("/(tabs)/profile");

    const FilterChip = ({ label, value }: { label: string; value: string | undefined }) => (
        <Pressable 
            onPress={() => setActionFilter(value)}
            style={[
                styles.filterChip, 
                { backgroundColor: actionFilter === value ? colors.primary : colors.surfaceVariant }
            ]}
        >
            <MsText variant="small" style={{ color: actionFilter === value ? "white" : colors.onSurfaceVariant, fontWeight: "600" }}>
                {label}
            </MsText>
        </Pressable>
    );

    return (
        <>
            <Stack.Screen
                options={{
                    headerLeft: () => (
                        <Pressable onPress={handleBack} style={{ padding: 8 }}>
                            <IconSymbol name="chevron.left" size={24} color="#64748B" />
                        </Pressable>
                    ),
                    title: "Audit Logs"
                }}
            />
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={[]}>
                <View style={styles.content}>
                    <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false} 
                        style={styles.filterRow}
                        contentContainerStyle={{ gap: 8, paddingRight: 20 }}
                    >
                        <FilterChip label="All" value={undefined} />
                        <FilterChip label="Auth" value="LOGIN" />
                        <FilterChip label="Check-ins" value="CHECK_IN" />
                        <FilterChip label="Members" value="MEMBER" />
                        <FilterChip label="Events" value="EVENT" />
                        <FilterChip label="Admin" value="OFFICER" />
                    </ScrollView>

                    <View style={styles.subHeader}>
                        <MsText variant="muted">Activity History</MsText>
                        <MsText variant="small" style={{ color: colors.onSurfaceVariant }}>
                            {queryResult?.total || 0} total events
                        </MsText>
                    </View>

                    {logs === undefined ? (
                        <View style={styles.center}>
                            <ActivityIndicator size="large" color="#2563EB" />
                        </View>
                    ) : logs.length === 0 ? (
                        <Card style={{ padding: 32, alignItems: "center" }}>
                            <IconSymbol name="info.circle.fill" size={48} color="#6B7280" />
                            <MsText variant="muted" style={{ marginTop: 16, textAlign: "center" }}>No audit logs found for this filter.</MsText>
                            {actionFilter && (
                                <Button variant="ghost" onPress={() => setActionFilter(undefined)} style={{ marginTop: 16 }}>
                                    Clear Filter
                                </Button>
                            )}
                        </Card>
                    ) : (
                        <FlatList
                            data={logs}
                            keyExtractor={(item) => item._id}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: 100 }}
                            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                            renderItem={({ item }) => (
                                <Card style={styles.logCard} mode="outlined">
                                    <View style={styles.logRow}>
                                        <View style={[styles.iconCircle, { backgroundColor: `${getActionColor(item.action)}15` }]}>
                                            <IconSymbol name={getActionIcon(item.action) as any} size={20} color={getActionColor(item.action)} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <View style={styles.logTopRow}>
                                                <MsText style={{ fontWeight: "700", color: getActionColor(item.action), fontSize: 13 }}>
                                                    {item.action.replace(/_/g, " ")}
                                                </MsText>
                                                <MsText variant="small" style={{ color: colors.onSurfaceVariant, fontSize: 11 }}>
                                                    {formatDate(item.timestamp)}
                                                </MsText>
                                            </View>
                                            
                                            {item.details && (
                                                <MsText style={{ color: colors.onSurface, marginTop: 4, fontSize: 14 }}>
                                                    {item.details}
                                                </MsText>
                                            )}
                                            
                                            <View style={styles.officerRow}>
                                                <IconSymbol name="person.circle" size={12} color={colors.onSurfaceVariant} />
                                                <MsText variant="small" style={{ color: colors.onSurfaceVariant, marginLeft: 4 }}>
                                                    {item.officerName || "System"}
                                                </MsText>
                                            </View>
                                        </View>
                                    </View>
                                </Card>
                            )}
                        />
                    )}
                </View>
            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, alignItems: "center", justifyContent: "center" },
    content: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
    filterRow: { maxHeight: 40, marginBottom: 16 },
    filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, justifyContent: 'center' },
    subHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
    logCard: { marginBottom: 12, padding: 16, borderRadius: 16 },
    logRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
    iconCircle: { width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center" },
    logTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 2 },
    officerRow: { flexDirection: "row", alignItems: "center", marginTop: 8, opacity: 0.8 },
});
