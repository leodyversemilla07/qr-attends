import DateTimePicker from '@react-native-community/datetimepicker';
import { useMutation, useQuery } from "convex/react";
import { CameraView, useCameraPermissions } from 'expo-camera';
import { File, Paths } from "expo-file-system";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import { useCallback, useEffect, useState } from "react";
import { Alert, Dimensions, FlatList, Modal, Platform, Pressable, View } from "react-native";
import { Button } from "../../components/ui/Button";
import { IconSymbol } from "../../components/ui/icon-symbol";
import { Input } from "../../components/ui/Input";
import { MsHeading, MsText } from "../../components/ui/Typography";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useAuth } from "../../utils/auth-context";
import { OfflineManager, PendingCheckIn } from "../../utils/offline-manager";
import { useOnlineStatus } from "../../utils/useOnlineStatus";

import { SafeAreaView } from "react-native-safe-area-context";
import { Skeleton } from "../../components/ui/Skeleton";

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SCAN_AREA_SIZE = SCREEN_WIDTH * 0.7;

export default function EventDetails() {
  const router = useRouter();
  const navigation = useNavigation();
  const { id } = useLocalSearchParams();
  const eventId = id as Id<"events">;
  const { token } = useAuth();

  const canGoBack = navigation.canGoBack();

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
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [cardNoInput, setCardNoInput] = useState("");
  const [editForm, setEditForm] = useState({ name: "", date: "", time: "", location: "", description: "" });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [scanResult, setScanResult] = useState<{ type: 'success' | 'error' | 'info' | 'processing'; message: string } | null>(null);
  const [unregisteredCard, setUnregisteredCard] = useState<string | null>(null);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);

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

  const refreshQueue = useCallback(async () => {
    const queue = await OfflineManager.getQueue();
    setPendingSync(queue.filter(q => q.eventId === eventId));
  }, [eventId]);

  useEffect(() => {
    refreshQueue();
  }, [refreshQueue]);

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
    setScanResult({ type: 'processing', message: 'Processing check-in...' });
    
    if (isOnline) {
      try {
        const result = await checkInByCard({
          eventId: eventId,
          cardNo: scannedContent
        });

        if (result.status === "not_registered") {
          setScanResult({ type: 'error', message: 'Member not found. QR code not registered.' });
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          setUnregisteredCard(scannedContent);
          setShowRegisterDialog(true);
          return;
        }

        if (result.status === "success" && result.member) {
          setScanResult({ type: 'success', message: `✓ ${result.member.firstName} ${result.member.lastName} checked in!` });
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setTimeout(() => {
            setScanResult(null);
            setScannedData(null);
          }, 2500);
          return;
        }
      } catch (e: any) {
        if (e.message.includes("Already checked in")) {
          setScanResult({ type: 'info', message: 'Member already checked in for this event.' });
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          setTimeout(() => {
            setScanResult(null);
            setScannedData(null);
          }, 2500);
          return;
        }
        setScanResult({ type: 'error', message: e.message || 'Check-in failed' });
        setTimeout(() => {
          setScanResult(null);
          setScannedData(null);
        }, 3000);
        return;
      }
    }

    await OfflineManager.queueCheckIn(eventId, scannedContent);
    setScanResult({ type: 'info', message: 'Offline: Saved check-in locally.' });
    refreshQueue();
    setTimeout(() => {
      setScanResult(null);
      setScannedData(null);
    }, 2500);
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
    setDeleteDialogVisible(true);
  }

  async function confirmDeleteEvent() {
    if (!token) return;
    
    setIsDeleting(true);
    try {
      await removeEvent({ id: eventId, token });
      setDeleteDialogVisible(false);
      router.back();
    } catch (e: any) {
      Alert.alert("Error", e.message);
      setIsDeleting(false);
    }
  }

  async function handleExportAttendance() {
    if (!attendees || attendees.length === 0) {
      Alert.alert("No Data", "No attendance records to export for this event.");
      return;
    }

    setIsExporting(true);
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert("Sharing Not Available", "Sharing is not available on this device.");
        return;
      }

      const headers = ["#", "Name", "Student ID", "Year/Section", "Check-in Time"];
      const rows = attendees.map((record, index) => [
        (index + 1).toString(),
        `${record.member?.firstName || ""} ${record.member?.lastName || ""}`.trim(),
        record.member?.studentId || "",
        record.member?.yearSection || "",
        new Date(record.timestamp).toLocaleString(),
      ]);

      const csvContent = [
        `Event: ${event?.name || "Unknown"}`,
        `Date: ${event?.date || ""} @ ${event?.time || ""}`,
        `Location: ${event?.location || ""}`,
        `Total Attendees: ${attendees.length}`,
        "",
        headers.join(","),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
      ].join("\n");

      const safeEventName = (event?.name || "event").replace(/[^a-zA-Z0-9]/g, "_");
      const fileName = `${safeEventName}_attendance_${new Date().toISOString().split("T")[0]}.csv`;
      
      // Write CSV content to a temporary file using the new expo-file-system API
      const file = new File(Paths.cache, fileName);
      await file.write(csvContent);

      await Sharing.shareAsync(file.uri, {
        mimeType: "text/csv",
        dialogTitle: `Export ${event?.name} Attendance`,
        UTI: "public.comma-separated-values-text",
      });
    } catch (error: any) {
      Alert.alert("Export Failed", error.message);
    } finally {
      setIsExporting(false);
    }
  }

  if (!event) {
    return (
      <SafeAreaView className="flex-1 bg-background dark:bg-dark-background" edges={['top']}>
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
        <SafeAreaView className="flex-1 bg-dark-background">
          <View className="flex-1 justify-center items-center p-6">
            <View className="w-20 h-20 rounded-full bg-primary/20 items-center justify-center mb-6">
              <IconSymbol name="camera.fill" size={40} color="#2563EB" />
            </View>
            <MsHeading size="h3" className="text-white text-center mb-2">Camera Permission Required</MsHeading>
            <MsText className="text-center text-slate-400 mb-8">
              We need access to your camera to scan QR codes for attendance check-in.
            </MsText>
            <Button variant="primary" onPress={requestPermission} className="w-full mb-4">
              Grant Camera Access
            </Button>
            <Button variant="ghost" onPress={() => setScanning(false)}>
              <MsText className="text-slate-400">Cancel</MsText>
            </Button>
          </View>
        </SafeAreaView>
      );
    }

    return (
      <View className="flex-1 bg-black">
        <CameraView
          style={{ flex: 1 }}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
          onBarcodeScanned={({ data }) => {
            if (data === scannedData) return;
            setScannedData(data);
            handleCheckIn(data);
          }}
        >
          {/* Dark overlay with transparent center */}
          <View className="flex-1">
            {/* Top section with header */}
            <SafeAreaView edges={['top']}>
              <View className="flex-row items-center justify-between px-4 py-2">
                <Pressable 
                  onPress={() => setScanning(false)}
                  className="w-10 h-10 rounded-full bg-black/50 items-center justify-center"
                >
                  <IconSymbol name="xmark" size={20} color="white" />
                </Pressable>
                <View className="bg-black/50 px-4 py-2 rounded-full">
                  <MsText className="text-white font-semibold">{event?.name}</MsText>
                </View>
                <View className="w-10" />
              </View>
            </SafeAreaView>

            {/* Center scan area */}
            <View className="flex-1 items-center justify-center">
              {/* Top dark overlay */}
              <View className="absolute top-0 left-0 right-0 bg-black/60" style={{ height: '25%' }} />
              
              {/* Scan frame */}
              <View 
                style={{ width: SCAN_AREA_SIZE, height: SCAN_AREA_SIZE }}
                className="relative"
              >
                {/* Corner decorations */}
                <View className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                <View className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                <View className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                <View className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />
              </View>

              {/* Bottom dark overlay */}
              <View className="absolute bottom-0 left-0 right-0 bg-black/60" style={{ height: '25%' }} />
              
              {/* Left dark overlay */}
              <View className="absolute left-0 bg-black/60" style={{ top: '25%', bottom: '25%', width: (SCREEN_WIDTH - SCAN_AREA_SIZE) / 2 }} />
              
              {/* Right dark overlay */}
              <View className="absolute right-0 bg-black/60" style={{ top: '25%', bottom: '25%', width: (SCREEN_WIDTH - SCAN_AREA_SIZE) / 2 }} />
            </View>

            {/* Bottom section with instructions */}
            <SafeAreaView edges={['bottom']} className="bg-black/70">
              <View className="px-6 py-4 items-center">
                {/* Scan Result Feedback */}
                {scanResult ? (
                  <View className={`w-full rounded-xl px-4 py-4 mb-4 ${
                    scanResult.type === 'success' ? 'bg-green-500/20 border border-green-500' :
                    scanResult.type === 'error' ? 'bg-red-500/20 border border-red-500' :
                    scanResult.type === 'info' ? 'bg-blue-500/20 border border-blue-500' :
                    'bg-yellow-500/20 border border-yellow-500'
                  }`}>
                    <View className="flex-row items-center justify-center">
                      <IconSymbol 
                        name={
                          scanResult.type === 'success' ? 'checkmark.circle.fill' :
                          scanResult.type === 'error' ? 'xmark.circle.fill' :
                          scanResult.type === 'info' ? 'info.circle.fill' :
                          'clock.fill'
                        } 
                        size={24} 
                        color={
                          scanResult.type === 'success' ? '#22C55E' :
                          scanResult.type === 'error' ? '#EF4444' :
                          scanResult.type === 'info' ? '#3B82F6' :
                          '#EAB308'
                        } 
                      />
                      <MsText className={`ml-2 font-semibold text-center ${
                        scanResult.type === 'success' ? 'text-green-400' :
                        scanResult.type === 'error' ? 'text-red-400' :
                        scanResult.type === 'info' ? 'text-blue-400' :
                        'text-yellow-400'
                      }`}>
                        {scanResult.message}
                      </MsText>
                    </View>
                  </View>
                ) : (
                  <>
                    <View className="flex-row items-center mb-3">
                      <IconSymbol name="qrcode" size={24} color="#2563EB" />
                      <MsText className="text-white font-semibold ml-2 text-lg">Scan QR Code</MsText>
                    </View>
                    <MsText className="text-slate-400 text-center mb-4">
                      Position the member&apos;s QR code within the frame to check them in
                    </MsText>
                  </>
                )}

                <View className="flex-row gap-4 w-full">
                  <Button 
                    variant="outline" 
                    className="flex-1 border-slate-600"
                    onPress={() => {
                      setScanning(false);
                      setScanResult(null);
                      setManualCheckInModal(true);
                    }}
                  >
                    <MsText className="text-white">Manual Entry</MsText>
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="flex-1"
                    onPress={() => {
                      setScanning(false);
                      setScanResult(null);
                    }}
                  >
                    Close
                  </Button>
                </View>
              </View>
            </SafeAreaView>
          </View>
        </CameraView>

        {/* Register Member Dialog - inside scanner view */}
        <Modal
          visible={showRegisterDialog}
          animationType="fade"
          transparent={true}
          onRequestClose={() => {
            setShowRegisterDialog(false);
            setScanResult(null);
            setScannedData(null);
            setUnregisteredCard(null);
          }}
        >
          <View className="flex-1 justify-center items-center bg-black/50 px-6">
            <View className="bg-white dark:bg-dark-card rounded-2xl p-6 w-full max-w-sm shadow-xl">
              <View className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 items-center justify-center self-center mb-4">
                <IconSymbol name="person.badge.plus.fill" size={32} color="#F97316" />
              </View>
              <MsHeading size="h3" className="text-center mb-2">Member Not Found</MsHeading>
              <MsText className="text-muted-foreground dark:text-dark-muted-foreground text-center mb-6">
                This QR code is not registered in the system. Would you like to register a new member with this card?
              </MsText>
              <View className="flex-row gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onPress={() => {
                    setShowRegisterDialog(false);
                    setScanResult(null);
                    setScannedData(null);
                    setUnregisteredCard(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onPress={() => {
                    setShowRegisterDialog(false);
                    setScanning(false);
                    setScanResult(null);
                    router.push({
                      pathname: "/register-member",
                      params: { cardNo: unregisteredCard }
                    } as any);
                  }}
                >
                  Register
                </Button>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background dark:bg-dark-background">
      {/* Custom Header with Back Button */}
      <SafeAreaView edges={['top']} className="bg-background dark:bg-dark-background">
        <View className="flex-row items-center px-4 py-3 border-b border-border dark:border-dark-border">
          <Pressable 
            onPress={() => canGoBack ? router.back() : router.replace("/(tabs)")} 
            className="mr-3 p-2 -ml-2 rounded-full active:bg-muted dark:active:bg-dark-muted"
          >
            <IconSymbol name="chevron.left" size={24} color="#2563EB" />
          </Pressable>
          <MsHeading size="h3">Event Details</MsHeading>
        </View>
      </SafeAreaView>

      {/* Header Info */}
      <View className="p-4 border-b border-border dark:border-dark-border">
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
          <MsText variant="small" className="text-muted-foreground dark:text-dark-muted-foreground">{isOnline ? 'Online' : 'Offline Mode'}</MsText>
        </View>
        {event.description && (
          <MsText className="mt-2 text-muted-foreground dark:text-dark-muted-foreground">{event.description}</MsText>
        )}
      </View>

      {/* Pending Sync Alert */}
      {pendingSync.length > 0 && (
        <Button
          variant="ghost"
          className="bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800 mx-4 mt-4 justify-between"
          onPress={isOnline ? handleSync : undefined}
        >
          <MsText className="text-orange-800 dark:text-orange-200 font-medium">
            {pendingSync.length} offline scans pending
          </MsText>
          {isOnline && (
            <MsText className="text-blue-600 dark:text-blue-400 font-bold">Sync Now</MsText>
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
        <View className="flex-row items-center justify-between mb-3">
          <MsHeading size="h3">
            Attendees ({attendees ? attendees.length : 0})
          </MsHeading>
          {attendees && attendees.length > 0 && (
            <Pressable 
              onPress={handleExportAttendance}
              disabled={isExporting}
              className="flex-row items-center px-3 py-1.5 bg-primary/10 rounded-lg active:bg-primary/20"
            >
              <IconSymbol name="square.and.arrow.up" size={16} color="#2563EB" />
              <MsText className="ml-1.5 text-primary font-medium text-sm">
                {isExporting ? "Exporting..." : "Export"}
              </MsText>
            </Pressable>
          )}
        </View>

        {!attendees ? (
          <MsText>Loading attendees...</MsText>
        ) : (
          <FlatList
            data={attendees}
            keyExtractor={(item) => item._id}
            refreshing={refreshing}
            onRefresh={onRefresh}
            renderItem={({ item }) => (
              <View className="flex-row justify-between items-center p-3 border-b border-border dark:border-dark-border bg-white dark:bg-dark-card rounded-lg mb-2">
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
                    <MsText variant="small" className="text-muted-foreground dark:text-dark-muted-foreground">{item.member.studentId}</MsText>
                  )}
                  {item.member?.yearSection && (
                    <MsText variant="small" className="text-muted-foreground dark:text-dark-muted-foreground">{item.member.yearSection}</MsText>
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
        <SafeAreaView className="flex-1 bg-background dark:bg-dark-background">
          <View className="flex-1 px-5 pt-4">
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
            
            <View className="mb-4">
              <MsText className="font-semibold mb-2">Date</MsText>
              <Pressable
                onPress={() => setShowDatePicker(true)}
                className="bg-white dark:bg-dark-card border border-border dark:border-dark-border rounded-xl px-4 py-3"
              >
                <MsText className={editForm.date ? "" : "text-slate-400"}>
                  {editForm.date || "Select date"}
                </MsText>
              </Pressable>
              {showDatePicker && (
                <DateTimePicker
                  value={editForm.date ? new Date(editForm.date) : new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(Platform.OS === 'ios');
                    if (selectedDate) {
                      const dateStr = selectedDate.toISOString().split('T')[0];
                      setEditForm({ ...editForm, date: dateStr });
                    }
                  }}
                />
              )}
              {Platform.OS === 'ios' && showDatePicker && (
                <Button variant="ghost" className="mt-2" onPress={() => setShowDatePicker(false)}>
                  Done
                </Button>
              )}
            </View>
            
            <View className="mb-4">
              <MsText className="font-semibold mb-2">Time</MsText>
              <Pressable
                onPress={() => setShowTimePicker(true)}
                className="bg-white dark:bg-dark-card border border-border dark:border-dark-border rounded-xl px-4 py-3"
              >
                <MsText className={editForm.time ? "" : "text-slate-400"}>
                  {editForm.time || "Select time"}
                </MsText>
              </Pressable>
              {showTimePicker && (
                <DateTimePicker
                  value={(() => {
                    if (editForm.time) {
                      const [hours, minutes] = editForm.time.split(':');
                      const date = new Date();
                      date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
                      return date;
                    }
                    return new Date();
                  })()}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedTime) => {
                    setShowTimePicker(Platform.OS === 'ios');
                    if (selectedTime) {
                      const timeStr = selectedTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
                      setEditForm({ ...editForm, time: timeStr });
                    }
                  }}
                />
              )}
              {Platform.OS === 'ios' && showTimePicker && (
                <Button variant="ghost" className="mt-2" onPress={() => setShowTimePicker(false)}>
                  Done
                </Button>
              )}
            </View>
            
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
          </View>
        </SafeAreaView>
      </Modal>

      {/* Manual Check-in Modal */}
      <Modal
        visible={manualCheckInModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setManualCheckInModal(false)}
      >
        <SafeAreaView className="flex-1 bg-background dark:bg-dark-background">
          <View className="flex-1 px-5 pt-4">
            <View className="flex-row justify-between items-center mb-6">
              <MsHeading size="h3">Manual Check-in</MsHeading>
              <Button variant="ghost" onPress={() => setManualCheckInModal(false)}>Cancel</Button>
            </View>
            
            <MsText className="mb-4 text-muted-foreground dark:text-dark-muted-foreground">
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
          </View>
        </SafeAreaView>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <Modal
        visible={deleteDialogVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setDeleteDialogVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50 px-6">
          <View className="bg-white dark:bg-dark-card rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <MsHeading size="h3" className="mb-2">Delete Event</MsHeading>
            <MsText className="text-muted-foreground dark:text-dark-muted-foreground mb-6">
              Are you sure you want to delete this event? This action cannot be undone.
            </MsText>
            <View className="flex-row gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onPress={() => setDeleteDialogVisible(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onPress={confirmDeleteEvent}
                loading={isDeleting}
              >
                Delete
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}