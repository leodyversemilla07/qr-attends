import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  AttendeesList,
  DeleteEventDialog,
  EventEditModal,
  ManualCheckInModal,
  QRScanner
} from "@/components/event";
import { Button } from "@/components/ui/Button";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Skeleton } from "@/components/ui/Skeleton";
import { MsHeading, MsText } from "@/components/ui/Typography";
import { Id } from "@/convex/_generated/dataModel";
import { useEventDetails } from "@/hooks/useEventDetails";
import { useExportAttendance } from "@/hooks/useExportAttendance";

export default function EventDetails() {
  const router = useRouter();
  const navigation = useNavigation();
  const { id } = useLocalSearchParams();
  const eventId = id as Id<"events">;
  const canGoBack = navigation.canGoBack();

  // Custom hooks
  const {
    event,
    attendees,
    isOnline,
    pendingSync,
    refreshing,
    onRefresh,
    handleSync,
    scanResult,
    scannedData,
    setScannedData,
    unregisteredCard,
    clearScanResult,
    handleCheckIn,
    handleManualCheckIn,
    handleUpdateEvent,
    handleDeleteEvent,
  } = useEventDetails(eventId);

  const { isExporting, exportAttendance } = useExportAttendance();

  // UI State
  const [scanning, setScanning] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [manualCheckInModal, setManualCheckInModal] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    date: "",
    time: "",
    location: "",
    description: ""
  });

  // Update form when event loads
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

  // Handle QR scan
  const onBarcodeScanned = async (data: string) => {
    setScannedData(data);
    const result = await handleCheckIn(data);
    if (result?.status === 'not_registered') {
      setShowRegisterDialog(true);
    }
  };

  // Handle delete confirmation
  const confirmDeleteEvent = async () => {
    setIsDeleting(true);
    const result = await handleDeleteEvent();
    if (result.success) {
      setDeleteDialogVisible(false);
      router.back();
    }
    setIsDeleting(false);
  };

  // Handle export
  const handleExport = () => {
    exportAttendance(attendees || [], event ?? null);
  };

  // Loading state
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

  // Scanner view
  if (scanning) {
    return (
      <QRScanner
        eventName={event.name}
        scanResult={scanResult}
        scannedData={scannedData}
        onBarcodeScanned={onBarcodeScanned}
        onClose={() => {
          setScanning(false);
          clearScanResult();
        }}
        onManualEntry={() => {
          setScanning(false);
          clearScanResult();
          setManualCheckInModal(true);
        }}
        showRegisterDialog={showRegisterDialog}
        onRegisterDialogClose={() => {
          setShowRegisterDialog(false);
          clearScanResult();
        }}
        onRegisterMember={() => {
          setShowRegisterDialog(false);
          setScanning(false);
          clearScanResult();
          router.push({
            pathname: "/register-member",
            params: { cardNo: unregisteredCard }
          } as any);
        }}
      />
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
            <Button variant="ghost" onPress={() => setDeleteDialogVisible(true)}>
              Delete
            </Button>
          </View>
        </View>
        <View className="flex-row items-center mt-2">
          <View className={`w-3 h-3 rounded-full mr-2 ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
          <MsText variant="small" className="text-muted-foreground dark:text-dark-muted-foreground">
            {isOnline ? 'Online' : 'Offline Mode'}
          </MsText>
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
      <AttendeesList
        attendees={attendees}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onExport={handleExport}
        isExporting={isExporting}
      />

      {/* Edit Event Modal */}
      <EventEditModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        initialData={editForm}
        onSave={handleUpdateEvent}
      />

      {/* Manual Check-in Modal */}
      <ManualCheckInModal
        visible={manualCheckInModal}
        onClose={() => setManualCheckInModal(false)}
        onCheckIn={handleManualCheckIn}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteEventDialog
        visible={deleteDialogVisible}
        onClose={() => setDeleteDialogVisible(false)}
        onConfirm={confirmDeleteEvent}
        isDeleting={isDeleting}
      />
    </View>
  );
}