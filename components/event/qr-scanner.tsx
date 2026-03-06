import { Button } from "@/components/ui/button";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { MsHeading, MsText } from "@/components/ui/typography";
import { ScanResult } from "@/hooks/use-event-details";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Dimensions, Modal, Pressable, StyleSheet, View } from "react-native";
import { Snackbar, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SCAN_AREA_SIZE = SCREEN_WIDTH * 0.7;
const SIDE_OVERLAY_WIDTH = (SCREEN_WIDTH - SCAN_AREA_SIZE) / 2;

interface QRScannerProps {
    eventName: string;
    scanResult: ScanResult | null;
    scannedData: string | null;
    onBarcodeScanned: (data: string) => void;
    onClose: () => void;
    onManualEntry: () => void;
    showRegisterDialog: boolean;
    onRegisterDialogClose: () => void;
    onRegisterMember: () => void;
}

export function QRScanner({ eventName, scanResult, scannedData, onBarcodeScanned, onClose, onManualEntry, showRegisterDialog, onRegisterDialogClose, onRegisterMember }: QRScannerProps) {
    const [permission, requestPermission] = useCameraPermissions();
    const { colors, dark: isDark } = useTheme();

    if (!permission) return <View />;

    if (!permission.granted) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: "#151718" }}>
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
                    <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: "rgba(37,99,235,0.2)", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
                        <IconSymbol name="camera.fill" size={40} color="#2563EB" />
                    </View>
                    <MsHeading size="h3" style={{ color: "#FFFFFF", textAlign: "center", marginBottom: 8 }}>Camera Permission Required</MsHeading>
                    <MsText style={{ textAlign: "center", color: "#94A3B8", marginBottom: 32 }}>
                        We need access to your camera to scan QR codes for attendance check-in.
                    </MsText>
                    <Button variant="primary" onPress={requestPermission} style={{ width: "100%", marginBottom: 16 }}>Grant Camera Access</Button>
                    <Button variant="ghost" onPress={onClose}>
                        <MsText style={{ color: "#94A3B8" }}>Cancel</MsText>
                    </Button>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: "#000" }}>
            <CameraView
                style={{ flex: 1 }}
                facing="back"
                barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                onBarcodeScanned={({ data }) => {
                    if (data === scannedData) return;
                    onBarcodeScanned(data);
                }}
            >
                <View style={{ flex: 1 }}>
                    <SafeAreaView edges={["top"]}>
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 8 }}>
                            <Pressable onPress={onClose} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center" }}>
                                <IconSymbol name="xmark" size={20} color="white" />
                            </Pressable>
                            <View style={{ backgroundColor: "rgba(0,0,0,0.5)", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 }}>
                                <MsText style={{ color: "white", fontWeight: "600" }}>{eventName}</MsText>
                            </View>
                            <View style={{ width: 40 }} />
                        </View>
                    </SafeAreaView>

                    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                        <View style={{ position: "absolute", top: 0, left: 0, right: 0, height: "25%", backgroundColor: "rgba(0,0,0,0.6)" }} />
                        <View style={{ position: "absolute", left: 0, top: "25%", bottom: "25%", width: SIDE_OVERLAY_WIDTH, backgroundColor: "rgba(0,0,0,0.6)" }} />
                        <View style={{ position: "absolute", right: 0, top: "25%", bottom: "25%", width: SIDE_OVERLAY_WIDTH, backgroundColor: "rgba(0,0,0,0.6)" }} />
                        <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "25%", backgroundColor: "rgba(0,0,0,0.6)" }} />
                        <View style={{ width: SCAN_AREA_SIZE, height: SCAN_AREA_SIZE }}>
                            <View style={[styles.corner, { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 8 }]} />
                            <View style={[styles.corner, { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 8 }]} />
                            <View style={[styles.corner, { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 8 }]} />
                            <View style={[styles.corner, { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 8 }]} />
                        </View>
                    </View>

                    <SafeAreaView edges={["bottom"]} style={{ backgroundColor: "rgba(0,0,0,0.7)" }}>
                        <View style={{ paddingHorizontal: 24, paddingVertical: 16, alignItems: "center" }}>
                            {!scanResult && (
                                <>
                                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                                        <IconSymbol name="qrcode" size={24} color="#2563EB" />
                                        <MsText style={{ color: "white", fontWeight: "600", marginLeft: 8, fontSize: 18 }}>Scan QR Code</MsText>
                                    </View>
                                    <MsText style={{ color: "#94A3B8", textAlign: "center", marginBottom: 16 }}>
                                        Position the member&apos;s QR code within the frame to check them in
                                    </MsText>
                                </>
                            )}
                            <View style={{ flexDirection: "row", gap: 16, width: "100%", paddingTop: 16 }}>
                                <Button variant="outline" style={{ flex: 1, borderColor: "#475569" }} onPress={onManualEntry}>
                                    <MsText style={{ color: "white" }}>Manual Entry</MsText>
                                </Button>
                                <Button variant="destructive" style={{ flex: 1 }} onPress={onClose}>Close</Button>
                            </View>
                        </View>
                    </SafeAreaView>
                </View>
            </CameraView>

            <ScanResultFeedback scanResult={scanResult} />
            <RegisterMemberDialog visible={showRegisterDialog} onClose={onRegisterDialogClose} onRegister={onRegisterMember} />
        </View>
    );
}

function ScanResultFeedback({ scanResult }: { scanResult: ScanResult | null }) {
    if (!scanResult) return null;
    const getConfig = () => {
        switch (scanResult.type) {
            case "success": return { bg: "#22C55E", text: "white", icon: "checkmark.circle.fill" };
            case "error": return { bg: "#EF4444", text: "white", icon: "xmark.circle.fill" };
            case "info": return { bg: "#3B82F6", text: "white", icon: "info.circle.fill" };
            default: return { bg: "#EAB308", text: "black", icon: "clock.fill" };
        }
    };
    const config = getConfig();
    return (
        <Snackbar visible={!!scanResult} onDismiss={() => {}} duration={2500} style={{ backgroundColor: config.bg, bottom: 100 }} wrapperStyle={{ position: "absolute", zIndex: 100 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
                <IconSymbol name={config.icon as any} size={24} color={config.text} />
                <MsText style={{ marginLeft: 8, fontWeight: "600", color: config.text }}>{scanResult.message}</MsText>
            </View>
        </Snackbar>
    );
}

function RegisterMemberDialog({ visible, onClose, onRegister }: { visible: boolean; onClose: () => void; onRegister: () => void }) {
    const { colors } = useTheme();
    return (
        <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)", paddingHorizontal: 24 }}>
                <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 24, width: "100%", maxWidth: 400 }}>
                    <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: "rgba(249,115,22,0.1)", alignItems: "center", justifyContent: "center", alignSelf: "center", marginBottom: 16 }}>
                        <IconSymbol name="person.badge.plus.fill" size={32} color="#F97316" />
                    </View>
                    <MsHeading size="h3" style={{ textAlign: "center", marginBottom: 8 }}>Member Not Found</MsHeading>
                    <MsText style={{ color: colors.onSurfaceVariant, textAlign: "center", marginBottom: 24 }}>
                        This QR code is not registered in the system. Would you like to register a new member with this card?
                    </MsText>
                    <View style={{ flexDirection: "row", gap: 12 }}>
                        <Button variant="outline" style={{ flex: 1 }} onPress={onClose}>Cancel</Button>
                        <Button variant="primary" style={{ flex: 1 }} onPress={onRegister}>Register</Button>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    corner: { position: "absolute", width: 32, height: 32, borderColor: "#2563EB" },
});
