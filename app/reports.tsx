import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { MsHeading, MsText } from "@/components/ui/Typography";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/utils/auth-context";
import { useQuery } from "convex/react";
import { File, Paths } from "expo-file-system";
import { Stack, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import { useState } from "react";
import { Alert, FlatList, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function EmptyActivity() {
  return (
    <Card className="items-center py-12">
      <IconSymbol name="tray" size={48} color="#94A3B8" />
      <MsText variant="muted" className="mt-4 text-center">No recent activity.</MsText>
    </Card>
  );
}

function ActivityItem({ item }: { item: any }) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <View className="bg-white dark:bg-dark-card border border-border dark:border-dark-border rounded-xl mb-3 p-4">
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <MsText className="font-semibold">
            {item.member?.firstName} {item.member?.lastName}
          </MsText>
          <MsText variant="muted" className="text-sm">
            {item.event?.name || "Unknown Event"}
          </MsText>
          <MsText variant="small" className="text-muted-foreground dark:text-dark-muted-foreground mt-1">
            {item.member?.studentId} - {item.member?.yearSection}
          </MsText>
        </View>
        <View className="items-end">
          <MsText variant="small" className="font-medium">
            {new Date(item.timestamp).toLocaleDateString()}
          </MsText>
          <MsText variant="small" className="text-muted-foreground dark:text-dark-muted-foreground">
            {formatTime(new Date(item.timestamp))}
          </MsText>
        </View>
      </View>
    </View>
  );
}

export default function ReportsScreen() {
  const { token } = useAuth();
  const router = useRouter();
  const allAttendance = useQuery(api.attendance.getAll, { token: token ?? undefined });
  const members = useQuery(api.members.list);
  const stats = useQuery(api.attendance.getStats, { token: token ?? undefined });
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportType, setExportType] = useState<"attendance" | "members">("attendance");

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const exportToCSV = async () => {
    setExporting(true);

    try {
      let csvContent: string;
      let fileName: string;

      if (exportType === "attendance") {
        if (!allAttendance || allAttendance.length === 0) {
          Alert.alert("No Data", "No attendance records to export.");
          return;
        }

        const headers = ["Date", "Time", "Event", "Member Name", "Student ID", "Year/Section"];
        const rows = allAttendance.map(record => [
          new Date(record.timestamp).toLocaleDateString(),
          new Date(record.timestamp).toLocaleTimeString(),
          record.event?.name || "Unknown Event",
          `${record.member?.firstName || ""} ${record.member?.lastName || ""}`.trim(),
          record.member?.studentId || "",
          record.member?.yearSection || "",
        ]);

        csvContent = [
          headers.join(","),
          ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
        ].join("\n");

        fileName = `attendance_report_${new Date().toISOString().split("T")[0]}.csv`;
      } else {
        if (!members || members.length === 0) {
          Alert.alert("No Data", "No members to export.");
          return;
        }

        const headers = ["First Name", "Last Name", "Middle Initial", "Student ID", "Year/Section", "Card No", "Email"];
        const rows = members.map(member => [
          member.firstName,
          member.lastName,
          member.middleInitial,
          member.studentId,
          member.yearSection,
          member.cardNo,
          member.email || "",
        ]);

        csvContent = [
          headers.join(","),
          ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
        ].join("\n");

        fileName = `members_report_${new Date().toISOString().split("T")[0]}.csv`;
      }
      
      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert("Sharing Not Available", "Sharing is not available on this device.");
        return;
      }

      // Write CSV content to a temporary file using the new expo-file-system API
      const file = new File(Paths.cache, fileName);
      await file.write(csvContent);

      // Share the file
      await Sharing.shareAsync(file.uri, {
        mimeType: "text/csv",
        dialogTitle: `Export ${fileName}`,
        UTI: "public.comma-separated-values-text",
      });
    } catch (error: any) {
      Alert.alert("Export Failed", error.message);
    } finally {
      setExporting(false);
    }
  };

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
      <SafeAreaView className="flex-1 bg-background dark:bg-dark-background" edges={[]}>
        <View className="flex-1 px-5 pt-4">

        <View className="flex-row gap-2 mb-4">
          <Pressable 
            onPress={() => setExportType("attendance")}
            className={`flex-1 py-2 px-4 rounded-xl border ${exportType === "attendance" ? "bg-primary border-primary" : "bg-white dark:bg-dark-card border-border dark:border-dark-border"}`}
          >
            <MsText className={`text-center font-medium ${exportType === "attendance" ? "text-white" : "text-foreground dark:text-dark-foreground"}`}>
              Attendance
            </MsText>
          </Pressable>
          <Pressable 
            onPress={() => setExportType("members")}
            className={`flex-1 py-2 px-4 rounded-xl border ${exportType === "members" ? "bg-primary border-primary" : "bg-white dark:bg-dark-card border-border dark:border-dark-border"}`}
          >
            <MsText className={`text-center font-medium ${exportType === "members" ? "text-white" : "text-foreground dark:text-dark-foreground"}`}>
              Members
            </MsText>
          </Pressable>
        </View>

        <Button 
          variant="outline" 
          onPress={exportToCSV}
          loading={exporting}
          className="flex-row items-center mb-6"
        >
          <IconSymbol name="square.and.arrow.down" size={16} color="#2563EB" />
          <MsText className="ml-2 text-primary font-bold">Export {exportType === "attendance" ? "Attendance" : "Members"} CSV</MsText>
        </Button>

        <View className="flex-row flex-wrap mb-6 gap-3">
          <Card className="flex-1 min-w-[45%] p-4">
            <View className="flex-row items-center justify-between">
              <View>
                <MsText variant="muted" className="text-xs">Total Check-ins</MsText>
                <MsHeading size="h2" className="text-primary">{stats?.totalCheckIns || 0}</MsHeading>
              </View>
              <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
                <IconSymbol name="checkmark.circle.fill" size={24} color="#2563EB" />
              </View>
            </View>
          </Card>

          <Card className="flex-1 min-w-[45%] p-4">
            <View className="flex-row items-center justify-between">
              <View>
                <MsText variant="muted" className="text-xs">Today</MsText>
                <MsHeading size="h2" className="text-green-600 dark:text-green-400">{stats?.todayCheckIns || 0}</MsHeading>
              </View>
              <View className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 items-center justify-center">
                <IconSymbol name="calendar" size={24} color="#16A34A" />
              </View>
            </View>
          </Card>

          <Card className="flex-1 min-w-[45%] p-4">
            <View className="flex-row items-center justify-between">
              <View>
                <MsText variant="muted" className="text-xs">Total Events</MsText>
                <MsHeading size="h3">{stats?.totalEvents || 0}</MsHeading>
              </View>
              <View className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 items-center justify-center">
                <IconSymbol name="calendar.badge.clock" size={24} color="#9333EA" />
              </View>
            </View>
          </Card>

          <Card className="flex-1 min-w-[45%] p-4">
            <View className="flex-row items-center justify-between">
              <View>
                <MsText variant="muted" className="text-xs">Total Members</MsText>
                <MsHeading size="h3">{stats?.totalMembers || 0}</MsHeading>
              </View>
              <View className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 items-center justify-center">
                <IconSymbol name="person.2.fill" size={24} color="#EA580C" />
              </View>
            </View>
          </Card>
        </View>

        <MsHeading size="h3" className="mb-3">Recent Activity</MsHeading>

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
