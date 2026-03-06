import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  AttendeesList,
  DeleteEventDialog,
  EventEditModal,
  ManualCheckInModal,
  QRScanner
} from "@/components/event";
import { Button } from "@/components/ui/button";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Skeleton } from "@/components/ui/skeleton";
import { MsHeading, MsText } from "@/components/ui/typography";
import { Id } from "@/convex/_generated/dataModel";
import { useEventDetails } from "@/hooks/use-event-details";
import { useExportAttendance } from "@/hooks/use-export-attendance";
import { useTheme } from "react-native-paper";

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
  const { colors, dark: isDark } = useTheme();

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
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
        <View style={{ padding: 20 }}>
          <Skeleton height={32} width="70%" style={{ marginBottom: 8 }} />
          <Skeleton height={20} width="40%" style={{ marginBottom: 24 }} />
          <Skeleton height={50} width="100%" style={{ borderRadius: 12, marginBottom: 32 }} />
          <Skeleton height={24} width="50%" style={{ marginBottom: 16 }} />
          {[1, 2, 3].map(i => (
            <Skeleton key={i} height={60} width="100%" style={{ marginBottom: 12, borderRadius: 12 }} />
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
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Custom Header with Back Button */}
      <SafeAreaView edges={['top']} style={{ backgroundColor: colors.background }}>
        <View style={[evStyles.headerBar, { borderBottomColor: colors.outline }]}>
          <Pressable
            onPress={() => canGoBack ? router.back() : router.replace("/(tabs)")}
            style={evStyles.backBtn}
          >
            <IconSymbol name="chevron.left" size={24} color="#64748B" />
          </Pressable>
          <MsHeading size="h3">Event Details</MsHeading>
        </View>
      </SafeAreaView>

      {/* Header Info */}
      <View style={[evStyles.infoBar, { borderBottomColor: colors.outline }]}>
        <View style={evStyles.infoBarRow}>
          <View style={{ flex: 1 }}>
            <MsHeading size="h2" style={{ marginBottom: 4 }}>{event.name}</MsHeading>
            <MsText variant="muted">{event.date} @ {event.time}</MsText>
            <MsText variant="muted" style={{ marginTop: 4 }}>{event.location}</MsText>
          </View>
          <View style={{ flexDirection: "row" }}>
            <Button variant="ghost" onPress={() => setEditModalVisible(true)} style={{ marginRight: 8 }}>Edit</Button>
            <Button variant="ghost" onPress={() => setDeleteDialogVisible(true)}>Delete</Button>
          </View>
        </View>
        <View style={evStyles.onlineRow}>
          <View style={[evStyles.dot, { backgroundColor: isOnline ? '#22C55E' : '#EF4444' }]} />
          <MsText variant="small" style={{ color: colors.onSurfaceVariant }}>
            {isOnline ? 'Online' : 'Offline Mode'}
          </MsText>
        </View>
        {event.description && (
          <MsText style={{ marginTop: 8, color: colors.onSurfaceVariant }}>{event.description}</MsText>
        )}
      </View>

      {/* Pending Sync Alert */}
      {pendingSync.length > 0 && (
        <Button
          variant="ghost"
          style={{ backgroundColor: isDark ? '#431407' : '#FFF7ED', borderColor: isDark ? '#92400E' : '#FED7AA', marginHorizontal: 16, marginTop: 16, justifyContent: 'space-between' }}
          onPress={isOnline ? handleSync : undefined}
        >
          <MsText style={{ color: isDark ? '#FDE68A' : '#92400E', fontWeight: '500' }}>
            {pendingSync.length} offline scans pending
          </MsText>
          {isOnline && (
            <MsText style={{ color: isDark ? '#93C5FD' : '#2563EB', fontWeight: '700' }}>Sync Now</MsText>
          )}
        </Button>
      )}

      {/* Main Actions */}
      <View style={{ flexDirection: 'row', padding: 16, gap: 8 }}>
        <Button variant="primary" style={{ flex: 1 }} onPress={() => setScanning(true)}>Scan QR</Button>
        <Button variant="secondary" style={{ flex: 1 }} onPress={() => setManualCheckInModal(true)}>Manual Check-in</Button>
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

const evStyles = StyleSheet.create({
  headerBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  backBtn: { marginRight: 12, padding: 8, marginLeft: -8, borderRadius: 20 },
  infoBar: { padding: 16, borderBottomWidth: 1 },
  infoBarRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  onlineRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
});