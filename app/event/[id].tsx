import { useMutation, useQuery } from "convex/react";
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, FlatList, View } from "react-native";
import { Button } from "../../components/ui/Button";
import { MsHeading, MsText } from "../../components/ui/Typography";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { OfflineManager, PendingCheckIn } from "../../utils/offline-manager";
import { useOnlineStatus } from "../../utils/useOnlineStatus";

import { SafeAreaView } from "react-native-safe-area-context";
import { Skeleton } from "../../components/ui/Skeleton";

export default function EventDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const eventId = id as Id<"events">;

  // Convex Hooks
  const event = useQuery(api.events.get, { id: eventId });
  const attendees = useQuery(api.attendance.getByEvent, { eventId });
  const checkIn = useMutation(api.attendance.checkIn);
  const checkInByCard = useMutation(api.attendance.checkInByCard);

  // Local State
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [pendingSync, setPendingSync] = useState<PendingCheckIn[]>([]);
  const isOnline = useOnlineStatus();

  // Load pending queue on mount
  useEffect(() => {
    refreshQueue();
  }, []);

  async function refreshQueue() {
    const queue = await OfflineManager.getQueue();
    // Filter queue for this event only (optional, but good for UI)
    setPendingSync(queue.filter(q => q.eventId === eventId));
  }

  // Handle syncing
  async function handleSync() {
    const queue = await OfflineManager.getQueue();
    if (queue.length === 0) return;

    let successCount = 0;

    for (const item of queue) {
      try {
        await checkIn({
          eventId: item.eventId as Id<"events">,
          memberId: item.memberId as Id<"members">
        });
        await OfflineManager.removeFromQueue(item.id);
        successCount++;
      } catch (e: any) {
        console.error("Sync failed for item", item, e);
        if (e.message.includes("Already checked in")) {
          // If already checked in, we can safely remove it
          await OfflineManager.removeFromQueue(item.id);
        }
      }
    }

    Alert.alert("Sync Complete", `Uploaded ${successCount} records.`);
    refreshQueue();
  }

  async function handleCheckIn(scannedContent: string) {
    // 1. If Online, try direct upload/lookup
    if (isOnline) {
      try {
        const result = await checkInByCard({
          eventId: eventId,
          cardNo: scannedContent
        });

        if (result.status === "not_registered") {
          setScanning(false);
          Alert.alert(
            "Member Not Found",
            "This QR code is not registered. Would you like to register this member now?",
            [
              { text: "Cancel", onPress: () => setScannedData(null), style: "cancel" },
              {
                text: "Register",
                onPress: () => router.push({
                  pathname: "/register-member",
                  params: { cardNo: scannedContent }
                } as any)
              }
            ]
          );
          return;
        }

        if (result.status === "success" && result.member) {
          Alert.alert("Success", `Checked in ${result.member.firstName}`);
          setTimeout(() => setScannedData(null), 2500);
          return;
        }
      } catch (e: any) {
        console.error(e);
        if (e.message.includes("Already checked in")) {
          Alert.alert("Info", "Member already checked in.");
          setTimeout(() => setScannedData(null), 2500);
          return;
        }
      }
    }

    // 2. Offline Fallback (Assuming scannedContent is a memberId for simplicity in prototype)
    // In a real app, we'd need a local lookup or store raw scans.
    await OfflineManager.queueCheckIn(eventId, scannedContent);
    Alert.alert("Offline", "Saved check-in locally.");
    refreshQueue();

    // Reset scanner
    setTimeout(() => setScannedData(null), 2500);
  }

  if (!event) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <View className="p-5">
          <Skeleton height={32} width="70%" className="mb-2" />
          <Skeleton height={20} width="40%" className="mb-6" />
          <Skeleton height={50} width="100%" className="rounded-xl mb-8" />
          <Skeleton height={24} width="50%" className="mb-4" />
          {[1, 2, 3].map(i => (
            <Skeleton key={i} height={60} width="100%" className="mb-3 rounded-xl" />
          ))}
        </View>
      </SafeAreaView>
    );
  }

  if (scanning) {
    if (!permission) return <View />;
    if (!permission.granted) {
      return (
        <View className="flex-1 justify-center p-4">
          <MsText className="text-center mb-4 text-base">We need your permission to show the camera</MsText>
          <Button onPress={requestPermission}>
            Grant Permission
          </Button>
        </View>
      );
    }

    return (
      <View className="flex-1 bg-black">
        <CameraView
          style={{ flex: 1 }}
          facing="back"
          onBarcodeScanned={({ data }) => {
            if (data === scannedData) return;
            setScannedData(data);
            handleCheckIn(data);
          }}
        >
          <View className="flex-1 justify-end p-8">
            <Button
              variant="destructive"
              onPress={() => setScanning(false)}
            >
              Close Scanner
            </Button>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background p-4">
      {/* Header Info */}
      <View className="mb-4">
        <MsHeading size="h2" className="mb-1">{event.name}</MsHeading>
        <MsText variant="muted">{event.date} @ {event.time}</MsText>
        <View className="flex-row items-center mt-2">
          <View className={`w-3 h-3 rounded-full mr-2 ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
          <MsText variant="small" className="text-muted-foreground">{isOnline ? 'Online' : 'Offline Mode'}</MsText>
        </View>
      </View>

      {/* Pending Sync Alert */}
      {pendingSync.length > 0 && (
        <Button
          variant="ghost"
          className="bg-orange-50 border-orange-200 mb-4 justify-between"
          onPress={isOnline ? handleSync : undefined}
        >
          <MsText className="text-orange-800 font-medium">
            {pendingSync.length} offline scans pending
          </MsText>
          {isOnline && (
            <MsText className="text-blue-600 font-bold">Sync Now</MsText>
          )}
        </Button>
      )}

      {/* Main Action */}
      <Button
        variant="primary"
        className="mb-6"
        onPress={() => setScanning(true)}
      >
        Scan Attendance
      </Button>

      {/* Attendees List */}
      <MsHeading size="h3" className="mb-3">
        Attendees ({attendees ? attendees.length : 0})
      </MsHeading>

      {!attendees ? (
        <MsText>Loading attendees...</MsText>
      ) : (
        <FlatList
          data={attendees}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View className="flex-row justify-between items-center p-3 border-b border-border">
              <View>
                <MsText className="font-semibold text-lg">
                  {item.member?.firstName} {item.member?.lastName}
                </MsText>
                <MsText variant="muted" className="text-xs">
                  {new Date(item.timestamp).toLocaleTimeString()}
                </MsText>
              </View>
              {item.member?.studentId && (
                <MsText variant="small" className="text-muted-foreground">{item.member.studentId}</MsText>
              )}
            </View>
          )}
          ListEmptyComponent={
            <MsText variant="muted" className="italic mt-4 text-center">No attendees yet.</MsText>
          }
        />
      )}
    </View>
  );
}