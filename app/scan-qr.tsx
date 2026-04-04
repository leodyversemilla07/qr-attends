import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { MsHeading, MsText } from "@/components/ui/typography";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/utils/auth-context";
import { useMutation } from "convex/react";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

interface CheckInResult {
    status: string;
    member?: { firstName: string; lastName: string };
}

export default function ScanQRScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const eventId = typeof params.eventId === "string" ? params.eventId : null;
    const { token } = useAuth();
    const { colors, dark: isDark } = useTheme();

    const [lastScanned, setLastScanned] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const checkInMutation = useMutation(api.attendance.checkInByCard);

    const handleCheckIn = async (cardNo: string) => {
        if (!eventId) {
            Alert.alert("Error", "No event selected. Please open this from an event.");
            return;
        }
        if (!token) {
            Alert.alert("Error", "You must be signed in to check members in.");
            return;
        }
        if (isProcessing) return;
        setIsProcessing(true);
        try {
            const result = await checkInMutation({
                eventId: eventId as any,
                cardNo: cardNo.trim(),
                token,
            }) as CheckInResult;

            if (result.status === "success" && result.member) {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                Alert.alert(
                    "Check-in Successful",
                    `${result.member.firstName} ${result.member.lastName}`,
                    [{ text: "OK", onPress: () => setLastScanned(cardNo) }]
                );
                setLastScanned(cardNo);
            } else if (result.status === "not_registered") {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                Alert.alert("Not Found", "Card not registered");
            }
        } catch (e: any) {
            if (e.message === "Already checked in") {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                Alert.alert("Already Checked In", "This member is already checked in.");
            } else {
                Alert.alert("Error", e.message);
            }
        } finally {
            setIsProcessing(false);
        }
    };

    if (!eventId) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <Card style={styles.noEventCard}>
                    <IconSymbol name="qrcode" size={64} color="#64748B" />
                    <MsHeading size="h3" style={{ marginTop: 16 }}>QR Scanner</MsHeading>
                    <MsText variant="muted" style={{ marginTop: 8, textAlign: "center", marginBottom: 16 }}>
                        Open this screen from an event to scan member QR codes.
                    </MsText>
                    <Button variant="primary" onPress={() => router.canGoBack() ? router.back() : router.replace("/(tabs)")}>
                        Go Back
                    </Button>
                </Card>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace("/(tabs)")} style={[styles.backBtn, { backgroundColor: colors.surfaceVariant }]}>
                        <IconSymbol name="chevron.left" size={24} color={colors.onSurfaceVariant} />
                    </Pressable>
                    <MsHeading size="h2">Check-in</MsHeading>
                    <View style={styles.headerSpacer} />
                </View>

                <Card style={styles.scanCard}>
                    <IconSymbol name="qrcode" size={80} color="#2563EB" />
                    <MsHeading size="h3" style={{ marginTop: 16 }}>Scan Member Card</MsHeading>
                    <MsText variant="muted" style={{ marginTop: 8, textAlign: "center" }}>
                        Use the camera to scan the QR code on the member&apos;s attendance card.
                    </MsText>
                </Card>

                <Card style={{ marginBottom: 16 }}>
                    <View style={styles.cameraRow}>
                        <View style={styles.cameraRowLeft}>
                            <View style={styles.cameraIcon}>
                                <IconSymbol name="camera.fill" size={20} color="#2563EB" />
                            </View>
                            <View>
                                <MsText style={{ fontWeight: "500" }}>Camera Scanner</MsText>
                                <MsText variant="small">Open event and tap &quot;Scan QR&quot;</MsText>
                            </View>
                        </View>
                        <IconSymbol name="chevron.right" size={20} color="#CBD5E1" />
                    </View>
                </Card>

                <MsHeading size="h4" style={{ marginBottom: 12 }}>Manual Entry</MsHeading>

                <Card style={{ marginBottom: 16 }}>
                    <View style={{ marginBottom: 12 }}>
                        <MsText style={{ fontWeight: "500" }}>Card Number (UUID)</MsText>
                        <MsText variant="small">Type the UUID from member&apos;s card</MsText>
                    </View>
                    <Button
                        variant="primary"
                        onPress={() => {
                            Alert.prompt(
                                "Manual Check-in",
                                "Enter the card number (UUID) from the member's attendance card:",
                                [
                                    { text: "Cancel", style: "cancel" },
                                    { text: "Check In", onPress: (text?: string) => { if (text) handleCheckIn(text); } }
                                ],
                                "plain-text"
                            );
                        }}
                        loading={isProcessing}
                    >
                        Enter Card Number
                    </Button>
                </Card>

                {lastScanned && (
                    <View style={styles.successBanner}>
                        <View style={styles.successRow}>
                            <IconSymbol name="checkmark.circle.fill" size={20} color="#10B981" />
                            <MsText style={{ marginLeft: 8, color: "#10B981", fontWeight: "500" }}>
                                Last: {lastScanned.substring(0, 12)}...
                            </MsText>
                        </View>
                    </View>
                )}

                <View style={[styles.tipBanner, { backgroundColor: colors.surfaceVariant, borderColor: colors.outline }]}>
                    <MsText variant="small" style={{ color: colors.onSurfaceVariant }}>
                        Tip: On the event page, tap &quot;Scan QR&quot; to use the camera for faster check-ins.
                    </MsText>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 24 },
    backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
    headerSpacer: { width: 40, height: 40 },
    noEventCard: { padding: 32, alignItems: "center" },
    scanCard: { padding: 24, alignItems: "center", marginBottom: 16 },
    cameraRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    cameraRowLeft: { flexDirection: "row", alignItems: "center" },
    cameraIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(37,99,235,0.1)", alignItems: "center", justifyContent: "center", marginRight: 12 },
    successBanner: { marginTop: 16, padding: 16, backgroundColor: "rgba(16,185,129,0.1)", borderRadius: 16, borderWidth: 1, borderColor: "rgba(16,185,129,0.25)" },
    successRow: { flexDirection: "row", alignItems: "center" },
    tipBanner: { marginTop: 32, padding: 16, borderRadius: 16, borderWidth: 1 },
});
