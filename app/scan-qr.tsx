import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { MsHeading, MsText } from "@/components/ui/Typography";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface CheckInResult {
    status: string;
    member?: { firstName: string; lastName: string };
}

export default function ScanQRScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const eventId = typeof params.eventId === "string" ? params.eventId : null;

    const [lastScanned, setLastScanned] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const checkInMutation = useMutation(api.attendance.checkInByCard);

    const handleCheckIn = async (cardNo: string) => {
        if (!eventId) {
            Alert.alert("Error", "No event selected. Please open this from an event.");
            return;
        }

        if (isProcessing) return;
        setIsProcessing(true);

        try {
            const result = await checkInMutation({
                eventId: eventId as any,
                cardNo: cardNo.trim(),
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
            <SafeAreaView className="flex-1 bg-background items-center justify-center p-5">
                <Card className="p-8 items-center">
                    <IconSymbol name="qrcode" size={64} color="#64748B" />
                    <MsHeading size="h3" className="mt-4">QR Scanner</MsHeading>
                    <MsText variant="muted" className="mt-2 text-center mb-4">
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
        <SafeAreaView className="flex-1 bg-background">
            <View className="flex-1 px-5 pt-4">
                <View className="flex-row items-center justify-between mb-6">
                    <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace("/(tabs)")} className="p-2">
                        <IconSymbol name="chevron.left" size={24} color="#64748B" />
                    </Pressable>
                    <MsHeading size="h2">Check-in</MsHeading>
                    <View className="w-10" />
                </View>

                <Card className="p-6 items-center mb-4">
                    <IconSymbol name="qrcode" size={80} color="#2563EB" />
                    <MsHeading size="h3" className="mt-4">Scan Member Card</MsHeading>
                    <MsText variant="muted" className="mt-2 text-center">
                        Use the camera to scan the QR code on the member&apos;s attendance card.
                    </MsText>
                </Card>

                <Card className="p-4 mb-4">
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mr-3">
                                <IconSymbol name="camera.fill" size={20} color="#2563EB" />
                            </View>
                            <View>
                                <MsText className="font-medium">Camera Scanner</MsText>
                                <MsText variant="small" className="text-muted-foreground">Open event and tap &quot;Scan QR&quot;</MsText>
                            </View>
                        </View>
                        <IconSymbol name="chevron.right" size={20} color="#CBD5E1" />
                    </View>
                </Card>

                <MsHeading size="h4" className="mb-3">Manual Entry</MsHeading>

                <Card className="p-4 mb-4">
                    <View className="flex-row items-center justify-between mb-3">
                        <View>
                            <MsText className="font-medium">Card Number (UUID)</MsText>
                            <MsText variant="small" className="text-muted-foreground">Type the UUID from member&apos;s card</MsText>
                        </View>
                    </View>
                    <Button
                        variant="primary"
                        onPress={() => {
                            Alert.prompt(
                                "Manual Check-in",
                                "Enter the card number (UUID) from the member's attendance card:",
                                [
                                    { text: "Cancel", style: "cancel" },
                                    {
                                        text: "Check In", onPress: (text?: string) => {
                                            if (text) handleCheckIn(text);
                                        }
                                    }
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
                    <View className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200">
                        <View className="flex-row items-center">
                            <IconSymbol name="checkmark.circle.fill" size={20} color="#10B981" />
                            <MsText className="ml-2 text-green-700">
                                Last: {lastScanned.substring(0, 12)}...
                            </MsText>
                        </View>
                    </View>
                )}

                <View className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <MsText variant="small" className="text-blue-800">
                        💡 Tip: On the event page, tap &quot;Scan QR&quot; to use the camera for faster check-ins.
                    </MsText>
                </View>
            </View>
        </SafeAreaView>
    );
}
