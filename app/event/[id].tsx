import { useMutation, useQuery } from "convex/react";
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, FlatList, Modal, View } from "react-native";
import * as Haptics from "expo-haptics";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { MsHeading, MsText } from "../../components/ui/Typography";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { OfflineManager, PendingCheckIn } from "../../utils/offline-manager";
import { useOnlineStatus } from "../../utils/useOnlineStatus";
import { useAuth } from "../../utils/auth-context";

import { SafeAreaView } from "react-native-safe-area-context";
import { Skeleton } from "../../components/ui/Skeleton";

export default function EventDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const eventId = id as Id<"events">;
  const { token } = useAuth();

  const event = useQuery(api.events.get, { id: eventId });
  const attendees = useQuery(api.attendance.getByEvent, { eventId });
  const checkIn = useMutation(api.attendance.checkIn);
  const checkInByCard = useMutation(api.attendance.checkInByCard);
  const updateEvent = useMutation(api.events.update);
  const removeEvent = useMutation(api.events.remove);

  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [pendingSync, setPendingSync] = useState<PendingCheckIn[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const isOnline = useOnlineStatus();
  
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [manualCheckInModal, setManualCheckInModal] = useState(false);
  const [cardNoInput, setCardNoInput] = useState("");
  const [editForm, setEditForm] = useState({ name: "", date: "", time: "", location: "", description: "" });

  useEffect(() => {
    if (event) {
      setEditForm({
        name: event.name,
        date: event.date,
        time: event.time,
        location: event.location,
        description: event.description || "",
      });
    }
  }, [event]);

  useEffect(() => {
    refreshQueue();
  }, []);

  async function refreshQueue() {
    const queue = await OfflineManager.getQueue();
    setPendingSync(queue.filter(q => q.eventId === eventId));
  }

  async function onRefresh() {
    setRefreshing(true);
    await refreshQueue();
    setRefreshing(false);
  }

  async function handleSync() {
    if (!token) return;
    const queue = await OfflineManager.getQueue();
    if (queue.length === 0) return;

    let successCount = 0;

    for (const item of queue) {
      try {
        await checkIn({
          eventId: item.eventId as Id<"events">,
          memberId: item.memberId as Id<"members">,
          token,
        });
        await OfflineManager.removeFromQueue(item.id);
        successCount++;
      } catch (e: any) {
        if (e.message.includes("Already checked in")) {
          await OfflineManager.removeFromQueue(item.id);
        }
      }
    }

    Alert.alert("Sync Complete", `Uploaded ${successCount} records.`);
    refreshQueue();
  }

  async function handleCheckIn(scannedContent: string) {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
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
        if (e.message.includes("Already checked in")) {
          Alert.alert("Info", "Member already checked in.");
          setTimeout(() => setScannedData(null), 2500);
          return;
        }
      }
    }

    await OfflineManager.queueCheckIn(eventId, scannedContent);
    Alert.alert("Offline", "Saved check-in locally.");
    refreshQueue();
    setTimeout(() => setScannedData(null), 2500);
  }

  async function handleManualCheckIn() {
    if (!cardNoInput.trim()) {
      Alert.alert("Error", "Please enter a card number");
      return;
    }

    try {
      const result = await checkInByCard({ eventId, cardNo: cardNoInput.trim() });
      
      if (result.status === "not_registered") {
        Alert.alert("Not Found", "Member with this card number is not registered.");
      } else if (result.status === "success" && result.member) {
        Alert.alert("Success", `Checked in ${result.member.firstName}`);
        setCardNoInput("");
        setManualCheckInModal(false);
      }
    } catch (e: any) {
      if (e.message.includes("Already checked in")) {
        Alert.alert("Info", "Member already checked in.");
      } else {
        Alert.alert("Error", e.message);
      }
    }
  }

  async function handleUpdateEvent() {
    if (!token) {
      Alert.alert("Error", "Authentication required");
      return;
    }
    if (!editForm.name.trim() || !editForm.date || !editForm.time || !editForm.location.trim()) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    try {
      await updateEvent({
        id: eventId,
        name: editForm.name,
        date: editForm.date,
        time: editForm.time,
        location: editForm.location,
        description: editForm.description,
        token,
      });
      setEditModalVisible(false);
      Alert.alert("Success", "Event updated successfully");
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  }

  async function handleDeleteEvent() {
    if (!token) {
      Alert.alert("Error", "Authentication required");
      return;
    }
    Alert.alert(
      "Delete Event",
      "Are you sure you want to delete this event? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await removeEvent({ id: eventId, token });
              router.back();
            } catch (e: any) {
              Alert.alert("Error", e.message);
            }
          }
        }
      ]
    );
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
    <View className="flex-1 bg-background">
      {/* Header Info */}
      <View className="p-4 border-b border-border">
        <View className="flex-row justify-between items-start">
          <View className="flex-1">
            <MsHeading size="h2" className="mb-1">{event.name}</MsHeading>
            <MsText variant="muted">{event.date} @ {event.time}</MsText>
            <MsText variant="muted" className="mt-1">{event.location}</MsText>
          </View>
          <View className="flex-row">
            <Button variant="ghost" onPress={() => setEditModalVisible(true)} className="mr-2">
              Edit
            </Button>
            <Button variant="ghost" onPress={handleDeleteEvent}>
              Delete
            </Button>
          </View>
        </View>
        <View className="flex-row items-center mt-2">
          <View className={`w-3 h-3 rounded-full mr-2 ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
          <MsText variant="small" className="text-muted-foreground">{isOnline ? 'Online' : 'Offline Mode'}</MsText>
        </View>
        {event.description && (
          <MsText className="mt-2 text-muted-foreground">{event.description}</MsText>
        )}
      </View>

      {/* Pending Sync Alert */}
      {pendingSync.length > 0 && (
        <Button
          variant="ghost"
          className="bg-orange-50 border-orange-200 mx-4 mt-4 justify-between"
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

      {/* Main Actions */}
      <View className="flex-row p-4 gap-2">
        <Button
          variant="primary"
          className="flex-1"
          onPress={() => setScanning(true)}
        >
          Scan QR
        </Button>
        <Button
          variant="secondary"
          className="flex-1"
          onPress={() => setManualCheckInModal(true)}
        >
          Manual Check-in
        </Button>
      </View>

      {/* Attendees List */}
      <View className="flex-1 px-4">
        <MsHeading size="h3" className="mb-3">
          Attendees ({attendees ? attendees.length : 0})
        </MsHeading>

        {!attendees ? (
          <MsText>Loading attendees...</MsText>
        ) : (
          <FlatList
            data={attendees}
            keyExtractor={(item) => item._id}
            refreshing={refreshing}
            onRefresh={onRefresh}
            renderItem={({ item }) => (
              <View className="flex-row justify-between items-center p-3 border-b border-border bg-white rounded-lg mb-2">
                <View>
                  <MsText className="font-semibold text-lg">
                    {item.member?.firstName} {item.member?.lastName}
                  </MsText>
                  <MsText variant="muted" className="text-xs">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </MsText>
                </View>
                <View className="items-end">
                  {item.member?.studentId && (
                    <MsText variant="small" className="text-muted-foreground">{item.member.studentId}</MsText>
                  )}
                  {item.member?.yearSection && (
                    <MsText variant="small" className="text-muted-foreground">{item.member.yearSection}</MsText>
                  )}
                </View>
              </View>
            )}
            ListEmptyComponent={
              <MsText variant="muted" className="italic mt-4 text-center">No attendees yet.</MsText>
            }
          />
        )}
      </View>

      {/* Edit Event Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <SafeAreaView className="flex-1 bg-background p-4">
          <View className="flex-row justify-between items-center mb-6">
            <MsHeading size="h3">Edit Event</MsHeading>
            <Button variant="ghost" onPress={() => setEditModalVisible(false)}>Cancel</Button>
          </View>
          
          <Input
            label="Event Name"
            value={editForm.name}
            onChangeText={(text) => setEditForm({ ...editForm, name: text })}
            placeholder="Event name"
            className="mb-4"
          />
          
          <Input
            label="Date"
            value={editForm.date}
            onChangeText={(text) => setEditForm({ ...editForm, date: text })}
            placeholder="YYYY-MM-DD"
            className="mb-4"
          />
          
          <Input
            label="Time"
            value={editForm.time}
            onChangeText={(text) => setEditForm({ ...editForm, time: text })}
            placeholder="HH:MM"
            className="mb-4"
          />
          
          <Input
            label="Location"
            value={editForm.location}
            onChangeText={(text) => setEditForm({ ...editForm, location: text })}
            placeholder="Venue or room"
            className="mb-4"
          />
          
          <Input
            label="Description (optional)"
            value={editForm.description}
            onChangeText={(text) => setEditForm({ ...editForm, description: text })}
            placeholder="Event description"
            multiline
            numberOfLines={3}
            className="mb-6"
          />
          
          <Button variant="primary" onPress={handleUpdateEvent}>
            Save Changes
          </Button>
        </SafeAreaView>
      </Modal>

      {/* Manual Check-in Modal */}
      <Modal
        visible={manualCheckInModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setManualCheckInModal(false)}
      >
        <SafeAreaView className="flex-1 bg-background p-4">
          <View className="flex-row justify-between items-center mb-6">
            <MsHeading size="h3">Manual Check-in</MsHeading>
            <Button variant="ghost" onPress={() => setManualCheckInModal(false)}>Cancel</Button>
          </View>
          
          <MsText className="mb-4 text-muted-foreground">
            Enter the member&apos;s card number to check them in manually.
          </MsText>
          
          <Input
            label="Card Number"
            value={cardNoInput}
            onChangeText={setCardNoInput}
            placeholder="Scan or enter card number"
            keyboardType="numeric"
            className="mb-6"
          />
          
          <Button variant="primary" onPress={handleManualCheckIn}>
            Check In
          </Button>
        </SafeAreaView>
      </Modal>
    </View>
  );
}