import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { MsHeading, MsText } from "@/components/ui/typography";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/utils/auth-context";
import { useQuery } from "convex/react";
import { File, Paths } from "expo-file-system";
import { Stack, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import { useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, View } from "react-native";
import { useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

function EmptyActivity() {
  return (
    <Card style={{ alignItems: "center", paddingVertical: 48 }}>
      <IconSymbol name="tray" size={48} color="#94A3B8" />
      <MsText variant="muted" style={{ marginTop: 16, textAlign: "center" }}>No recent activity.</MsText>
    </Card>
  );
}

function ActivityItem({ item }: { item: any }) {
  const { colors, dark: isDark } = useTheme();
  const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return (
    <View style={[styles.activityCard, { backgroundColor: colors.surface, borderColor: colors.outline }]}>
      <View style={styles.activityRow}>
        <View style={{ flex: 1 }}>
          <MsText style={{ fontWeight: "600" }}>{item.member?.firstName} {item.member?.lastName}</MsText>
          <MsText variant="muted" style={{ fontSize: 14 }}>{item.event?.name || "Unknown Event"}</MsText>
          <MsText variant="small" style={{ color: colors.onSurfaceVariant, marginTop: 4 }}>{item.member?.studentId} - {item.member?.yearSection}</MsText>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <MsText variant="small" style={{ fontWeight: "500" }}>{new Date(item.timestamp).toLocaleDateString()}</MsText>
          <MsText variant="small" style={{ color: colors.onSurfaceVariant }}>{formatTime(new Date(item.timestamp))}</MsText>
        </View>
      </View>
    </View>
  );
}

export default function ReportsScreen() {
  const { token } = useAuth();
  const router = useRouter();
  const { colors, dark: isDark } = useTheme();
  const allAttendance = useQuery(api.attendance.getAll, { token: token ?? undefined });
  const members = useQuery(api.members.list, { token: token ?? undefined });
  const stats = useQuery(api.attendance.getStats, { token: token ?? undefined });
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportType, setExportType] = useState<"attendance" | "members">("attendance");

  const handleBack = () => router.canGoBack() ? router.back() : router.replace("/(tabs)");
  const onRefresh = async () => { setRefreshing(true); setTimeout(() => setRefreshing(false), 1000); };

  const exportToCSV = async () => {
    setExporting(true);
    try {
      let csvContent: string; let fileName: string;
      if (exportType === "attendance") {
        if (!allAttendance || allAttendance.length === 0) { Alert.alert("No Data", "No attendance records to export."); return; }
        const headers = ["Date", "Time", "Event", "Member Name", "Student ID", "Year/Section"];
        const rows = allAttendance.map(record => [new Date(record.timestamp).toLocaleDateString(), new Date(record.timestamp).toLocaleTimeString(), record.event?.name || "Unknown Event", `${record.member?.firstName || ""} ${record.member?.lastName || ""}`.trim(), record.member?.studentId || "", record.member?.yearSection || ""]);
        csvContent = [headers.join(","), ...rows.map(row => row.map(cell => `"${cell}"`).join(","))].join("\n");
        fileName = `attendance_report_${new Date().toISOString().split("T")[0]}.csv`;
      } else {
        if (!members || members.length === 0) { Alert.alert("No Data", "No members to export."); return; }
        const headers = ["First Name", "Last Name", "Middle Initial", "Student ID", "Year/Section", "Card No", "Email"];
        const rows = members.map(member => [member.firstName, member.lastName, member.middleInitial, member.studentId, member.yearSection, member.cardNo, member.email || ""]);
        csvContent = [headers.join(","), ...rows.map(row => row.map(cell => `"${cell}"`).join(","))].join("\n");
        fileName = `members_report_${new Date().toISOString().split("T")[0]}.csv`;
      }
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) { Alert.alert("Sharing Not Available", "Sharing is not available on this device."); return; }
      const file = new File(Paths.cache, fileName);
      await file.write(csvContent);
      await Sharing.shareAsync(file.uri, { mimeType: "text/csv", dialogTitle: `Export ${fileName}`, UTI: "public.comma-separated-values-text" });
    } catch (error: any) { Alert.alert("Export Failed", error.message); }
    finally { setExporting(false); }
  };

  const activeTab = { backgroundColor: "#2563EB", borderColor: "#2563EB" };
  const inactiveTab = { backgroundColor: colors.surface, borderColor: colors.outline };

  return (
    <>
      <Stack.Screen options={{ headerLeft: () => (<Pressable onPress={handleBack} style={{ padding: 8 }}><IconSymbol name="chevron.left" size={24} color="#64748B" /></Pressable>) }} />
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={[]}>
        <View style={styles.content}>
          <View style={styles.tabRow}>
            <Pressable onPress={() => setExportType("attendance")} style={[styles.tab, exportType === "attendance" ? activeTab : inactiveTab]}>
              <MsText style={{ textAlign: "center", fontWeight: "500", color: exportType === "attendance" ? "#FFFFFF" : colors.onBackground }}>Attendance</MsText>
            </Pressable>
            <Pressable onPress={() => setExportType("members")} style={[styles.tab, exportType === "members" ? activeTab : inactiveTab]}>
              <MsText style={{ textAlign: "center", fontWeight: "500", color: exportType === "members" ? "#FFFFFF" : colors.onBackground }}>Members</MsText>
            </Pressable>
          </View>

          <Button variant="outline" onPress={exportToCSV} loading={exporting} style={{ marginBottom: 24 }}>
            <IconSymbol name="square.and.arrow.down" size={16} color="#2563EB" />
            <MsText style={{ marginLeft: 8, color: "#2563EB", fontWeight: "700" }}>
              Export {exportType === "attendance" ? "Attendance" : "Members"} CSV
            </MsText>
          </Button>

          <View style={styles.statsGrid}>
            <Card style={[styles.statCard]}>
              <View style={styles.statRow}>
                <View>
                  <MsText variant="muted" style={{ fontSize: 12 }}>Total Check-ins</MsText>
                  <MsHeading size="h2" style={{ color: colors.primary }}>{stats?.totalCheckIns || 0}</MsHeading>
                </View>
                <View style={[styles.statIcon, { backgroundColor: "rgba(37,99,235,0.1)" }]}>
                  <IconSymbol name="checkmark.circle.fill" size={24} color={colors.primary} />
                </View>
              </View>
            </Card>
            <Card style={[styles.statCard]}>
              <View style={styles.statRow}>
                <View>
                  <MsText variant="muted" style={{ fontSize: 12 }}>Today</MsText>
                  <MsHeading size="h2" style={{ color: "#10B981" }}>{stats?.todayCheckIns || 0}</MsHeading>
                </View>
                <View style={[styles.statIcon, { backgroundColor: "rgba(16,185,129,0.1)" }]}>
                  <IconSymbol name="calendar" size={24} color="#10B981" />
                </View>
              </View>
            </Card>
            <Card style={[styles.statCard]}>
              <View style={styles.statRow}>
                <View>
                  <MsText variant="muted" style={{ fontSize: 12 }}>Total Events</MsText>
                  <MsHeading size="h3">{stats?.totalEvents || 0}</MsHeading>
                </View>
                <View style={[styles.statIcon, { backgroundColor: "rgba(147,51,234,0.1)" }]}>
                  <IconSymbol name="calendar.badge.clock" size={24} color="#9333EA" />
                </View>
              </View>
            </Card>
            <Card style={[styles.statCard]}>
              <View style={styles.statRow}>
                <View>
                  <MsText variant="muted" style={{ fontSize: 12 }}>Total Members</MsText>
                  <MsHeading size="h3">{stats?.totalMembers || 0}</MsHeading>
                </View>
                <View style={[styles.statIcon, { backgroundColor: "rgba(234,88,12,0.1)" }]}>
                  <IconSymbol name="person.2.fill" size={24} color="#EA580C" />
                </View>
              </View>
            </Card>
          </View>

          <MsHeading size="h3" style={{ marginBottom: 12 }}>Recent Activity</MsHeading>

          {!allAttendance ? (
            <MsText>Loading...</MsText>
          ) : allAttendance.length === 0 ? (
            <EmptyActivity />
          ) : (
            <FlatList
              data={allAttendance.slice(0, 50)}
              keyExtractor={(item) => item._id}
              refreshing={refreshing}
              onRefresh={onRefresh}
              renderItem={({ item }) => <ActivityItem item={item} />}
              ListEmptyComponent={<EmptyActivity />}
            />
          )}
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
  tabRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  tab: { flex: 1, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", marginBottom: 24, gap: 12 },
  statCard: { flex: 1, minWidth: "45%", padding: 16 },
  statRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  statIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  activityCard: { borderRadius: 16, marginBottom: 12, padding: 16, borderWidth: 1 },
  activityRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
});
