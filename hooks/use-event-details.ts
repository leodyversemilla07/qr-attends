import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/utils/auth-context";
import { OfflineManager, PendingCheckIn } from "@/utils/offline-manager";
import { useOnlineStatus } from "@/utils/use-online-status";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useConvex, useMutation as useConvexMutation } from "convex/react";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";

export interface ScanResult {
    type: 'success' | 'error' | 'info' | 'processing';
    message: string;
}

// Query Keys for this module
const eventKeys = {
    all: ['events'] as const,
    detail: (id: Id<'events'>) => [...eventKeys.all, 'detail', id] as const,
    attendees: (eventId: Id<'events'>) => [...eventKeys.all, 'attendees', eventId] as const,
};

/**
 * Enhanced useEventDetails with TanStack Query for caching and optimistic updates
 */
export function useEventDetails(eventId: Id<"events">) {
    const { token } = useAuth();
    const isOnline = useOnlineStatus();
    const queryClient = useQueryClient();
    const convex = useConvex();

    // Convex mutations (for actual API calls)
    const checkInMutation = useConvexMutation(api.attendance.checkIn);
    const checkInByCardMutation = useConvexMutation(api.attendance.checkInByCard);
    const updateEventMutation = useConvexMutation(api.events.update);
    const removeEventMutation = useConvexMutation(api.events.remove);

    // TanStack Query for Event data (with caching)
    const {
        data: event,
        isLoading: isEventLoading,
        error: eventError,
        refetch: refetchEvent,
    } = useQuery({
        queryKey: eventKeys.detail(eventId),
        queryFn: async () => {
            if (!token) throw new Error('Not authenticated');
            return await convex.query(api.events.get, { id: eventId });
        },
        enabled: !!token && !!eventId,
        staleTime: 1000 * 60 * 2, // 2 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
    });

    // TanStack Query for Attendees (with caching)
    const {
        data: attendees = [],
        isLoading: isAttendeesLoading,
        error: attendeesError,
        refetch: refetchAttendees,
    } = useQuery({
        queryKey: eventKeys.attendees(eventId),
        queryFn: async () => {
            if (!token) throw new Error('Not authenticated');
            return await convex.query(api.attendance.getByEvent, { eventId });
        },
        enabled: !!token && !!eventId,
        staleTime: 1000 * 60 * 1, // 1 minute (attendees change frequently)
        gcTime: 1000 * 60 * 5, // 5 minutes
    });

    // TanStack Query Mutations with Optimistic Updates
    
    // Check-in mutation with optimistic updates
    const checkInByCardTanstack = useMutation({
        mutationFn: async ({ cardNo }: { cardNo: string }) => {
            if (!token) throw new Error('Not authenticated');
            return await checkInByCardMutation({ eventId, cardNo });
        },
        onMutate: async ({ cardNo }) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: eventKeys.attendees(eventId) });

            // Snapshot previous value
            const previousAttendees = queryClient.getQueryData(eventKeys.attendees(eventId));

            // Optimistically add a placeholder
            const optimisticAttendee = {
                _id: `optimistic-${Date.now()}`,
                eventId,
                memberId: `scanning-${cardNo}`,
                timestamp: new Date().toISOString(),
                member: null, // Will be populated on success
                isOptimistic: true,
            };

            queryClient.setQueryData(
                eventKeys.attendees(eventId),
                (old: any) => old ? [optimisticAttendee, ...old] : [optimisticAttendee]
            );

            return { previousAttendees };
        },
        onError: (err, variables, context) => {
            // Rollback on error
            if (context?.previousAttendees) {
                queryClient.setQueryData(eventKeys.attendees(eventId), context.previousAttendees);
            }
        },
        onSettled: () => {
            // Always refetch after error or success to ensure consistency
            queryClient.invalidateQueries({ queryKey: eventKeys.attendees(eventId) });
        },
    });

    // Update event mutation
    const updateEventTanstack = useMutation({
        mutationFn: async (editForm: {
            name: string;
            date: string;
            time: string;
            location: string;
            description: string;
        }) => {
            if (!token) throw new Error('Not authenticated');
            await updateEventMutation({
                id: eventId,
                ...editForm,
                token,
            });
            return editForm;
        },
        onMutate: async (newData) => {
            await queryClient.cancelQueries({ queryKey: eventKeys.detail(eventId) });
            const previousEvent = queryClient.getQueryData(eventKeys.detail(eventId));

            // Optimistically update
            queryClient.setQueryData(eventKeys.detail(eventId), (old: any) => ({
                ...old,
                ...newData,
            }));

            return { previousEvent };
        },
        onError: (err, variables, context) => {
            if (context?.previousEvent) {
                queryClient.setQueryData(eventKeys.detail(eventId), context.previousEvent);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId) });
            queryClient.invalidateQueries({ queryKey: eventKeys.all }); // Invalidate list too
        },
    });

    // Delete event mutation
    const deleteEventTanstack = useMutation({
        mutationFn: async () => {
            if (!token) throw new Error('Not authenticated');
            await removeEventMutation({ id: eventId, token });
        },
        onSuccess: () => {
            // Remove from cache
            queryClient.removeQueries({ queryKey: eventKeys.detail(eventId) });
            queryClient.invalidateQueries({ queryKey: eventKeys.all });
        },
    });

    // Offline queue state
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

    // Refresh handler with TanStack Query refetch
    async function onRefresh() {
        setRefreshing(true);
        await Promise.all([
            refetchEvent(),
            refetchAttendees(),
            refreshQueue(),
        ]);
        setRefreshing(false);
    }

    // Enhanced sync with TanStack Query integration
    async function handleSync() {
        if (!token) return;
        
        const queue = await OfflineManager.getQueueByEvent(eventId);
        if (queue.length === 0) return;

        const results = await OfflineManager.syncWithRetry(
            async (item) => {
                try {
                    await checkInMutation({
                        eventId: item.eventId as Id<"events">,
                        memberId: item.memberId as Id<"members">,
                        token,
                    });
                    return true;
                } catch (e: any) {
                    if (e.message?.includes("Already checked in")) {
                        return true; // Consider success if already checked in
                    }
                    throw e;
                }
            },
            (completed, total) => {
                console.log(`Sync progress: ${completed}/${total}`);
            }
        );

        const successCount = results.filter(r => r.success).length;
        const failedCount = results.filter(r => !r.success && !r.retryable).length;

        // Invalidate attendees cache after sync
        queryClient.invalidateQueries({ queryKey: eventKeys.attendees(eventId) });

        Alert.alert(
            "Sync Complete",
            `Uploaded ${successCount} records.${failedCount > 0 ? ` ${failedCount} failed permanently.` : ''}`
        );
        
        refreshQueue();
    }

    // Handle QR check-in with TanStack Query
    async function handleCheckIn(scannedContent: string) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setScanResult({ type: 'processing', message: 'Processing check-in...' });

        if (isOnline) {
            try {
                // Use TanStack Query mutation with optimistic updates
                const result = await checkInByCardTanstack.mutateAsync({ cardNo: scannedContent });

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
                if (e.message?.includes("Already checked in")) {
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
            const result = await checkInByCardTanstack.mutateAsync({ cardNo: cardNo.trim() });

            if (result.status === "not_registered") {
                Alert.alert("Not Found", "Member with this card number is not registered.");
                return { success: false };
            } else if (result.status === "success" && result.member) {
                Alert.alert("Success", `Checked in ${result.member.firstName}`);
                return { success: true };
            }
        } catch (e: any) {
            if (e.message?.includes("Already checked in")) {
                Alert.alert("Info", "Member already checked in.");
            } else {
                Alert.alert("Error", e.message);
            }
            return { success: false };
        }
        return { success: false };
    }

    // Update event with optimistic updates
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
            await updateEventTanstack.mutateAsync(editForm);
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
            await deleteEventTanstack.mutateAsync();
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

    // Combined loading state
    const isLoading = isEventLoading || isAttendeesLoading;
    const error = eventError || attendeesError;

    return {
        // Data (now from TanStack Query)
        event,
        attendees,
        isOnline,
        token,
        isLoading,
        error,

        // TanStack Query specific
        isEventLoading,
        isAttendeesLoading,
        refetchEvent,
        refetchAttendees,

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

        // TanStack Query mutations (for external use)
        checkInMutation: checkInByCardTanstack,
        updateEventMutation: updateEventTanstack,
        deleteEventMutation: deleteEventTanstack,
    };
}

// Export query keys for external cache invalidation
export { eventKeys };
