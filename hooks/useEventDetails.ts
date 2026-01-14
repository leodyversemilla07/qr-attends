import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/utils/auth-context";
import { OfflineManager, PendingCheckIn } from "@/utils/offline-manager";
import { useOnlineStatus } from "@/utils/useOnlineStatus";
import { useMutation, useQuery } from "convex/react";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";

export interface ScanResult {
    type: 'success' | 'error' | 'info' | 'processing';
    message: string;
}

export function useEventDetails(eventId: Id<"events">) {
    const { token } = useAuth();
    const isOnline = useOnlineStatus();

    // Queries
    const event = useQuery(api.events.get, { id: eventId });
    const attendees = useQuery(api.attendance.getByEvent, { eventId });

    // Mutations
    const checkIn = useMutation(api.attendance.checkIn);
    const checkInByCard = useMutation(api.attendance.checkInByCard);
    const updateEvent = useMutation(api.events.update);
    const removeEvent = useMutation(api.events.remove);

    // State
    const [pendingSync, setPendingSync] = useState<PendingCheckIn[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [scanResult, setScanResult] = useState<ScanResult | null>(null);
    const [unregisteredCard, setUnregisteredCard] = useState<string | null>(null);
    const [scannedData, setScannedData] = useState<string | null>(null);

    // Refresh offline queue
    const refreshQueue = useCallback(async () => {
        const queue = await OfflineManager.getQueue();
        setPendingSync(queue.filter(q => q.eventId === eventId));
    }, [eventId]);

    useEffect(() => {
        refreshQueue();
    }, [refreshQueue]);

    // Refresh handler
    async function onRefresh() {
        setRefreshing(true);
        await refreshQueue();
        setRefreshing(false);
    }

    // Sync offline check-ins
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

    // Handle QR check-in
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
                    return { status: 'not_registered', cardNo: scannedContent };
                }

                if (result.status === "success" && result.member) {
                    setScanResult({ type: 'success', message: `✓ ${result.member.firstName} ${result.member.lastName} checked in!` });
                    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    setTimeout(() => {
                        setScanResult(null);
                        setScannedData(null);
                    }, 2500);
                    return { status: 'success' };
                }
            } catch (e: any) {
                if (e.message.includes("Already checked in")) {
                    setScanResult({ type: 'info', message: 'Member already checked in for this event.' });
                    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                    setTimeout(() => {
                        setScanResult(null);
                        setScannedData(null);
                    }, 2500);
                    return { status: 'already_checked_in' };
                }
                setScanResult({ type: 'error', message: e.message || 'Check-in failed' });
                setTimeout(() => {
                    setScanResult(null);
                    setScannedData(null);
                }, 3000);
                return { status: 'error', message: e.message };
            }
        }

        // Offline mode
        await OfflineManager.queueCheckIn(eventId, scannedContent);
        setScanResult({ type: 'info', message: 'Offline: Saved check-in locally.' });
        refreshQueue();
        setTimeout(() => {
            setScanResult(null);
            setScannedData(null);
        }, 2500);
        return { status: 'queued' };
    }

    // Manual check-in by card number
    async function handleManualCheckIn(cardNo: string) {
        if (!cardNo.trim()) {
            Alert.alert("Error", "Please enter a card number");
            return { success: false };
        }

        try {
            const result = await checkInByCard({ eventId, cardNo: cardNo.trim() });

            if (result.status === "not_registered") {
                Alert.alert("Not Found", "Member with this card number is not registered.");
                return { success: false };
            } else if (result.status === "success" && result.member) {
                Alert.alert("Success", `Checked in ${result.member.firstName}`);
                return { success: true };
            }
        } catch (e: any) {
            if (e.message.includes("Already checked in")) {
                Alert.alert("Info", "Member already checked in.");
            } else {
                Alert.alert("Error", e.message);
            }
            return { success: false };
        }
        return { success: false };
    }

    // Update event
    async function handleUpdateEvent(editForm: {
        name: string;
        date: string;
        time: string;
        location: string;
        description: string;
    }) {
        if (!token) {
            Alert.alert("Error", "Authentication required");
            return { success: false };
        }
        if (!editForm.name.trim() || !editForm.date || !editForm.time || !editForm.location.trim()) {
            Alert.alert("Error", "Please fill in all required fields");
            return { success: false };
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
            Alert.alert("Success", "Event updated successfully");
            return { success: true };
        } catch (e: any) {
            Alert.alert("Error", e.message);
            return { success: false };
        }
    }

    // Delete event
    async function handleDeleteEvent() {
        if (!token) {
            Alert.alert("Error", "Authentication required");
            return { success: false };
        }

        try {
            await removeEvent({ id: eventId, token });
            return { success: true };
        } catch (e: any) {
            Alert.alert("Error", e.message);
            return { success: false };
        }
    }

    // Clear scan result
    function clearScanResult() {
        setScanResult(null);
        setScannedData(null);
        setUnregisteredCard(null);
    }

    return {
        // Data
        event,
        attendees,
        isOnline,
        token,

        // Offline sync
        pendingSync,
        refreshing,
        onRefresh,
        handleSync,

        // Scanning
        scanResult,
        scannedData,
        setScannedData,
        unregisteredCard,
        clearScanResult,

        // Actions
        handleCheckIn,
        handleManualCheckIn,
        handleUpdateEvent,
        handleDeleteEvent,
    };
}
