import { Button } from "@/components/ui/Button";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { MsHeading, MsText } from "@/components/ui/Typography";
import { ScanResult } from "@/hooks/useEventDetails";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Dimensions, Modal, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SCAN_AREA_SIZE = SCREEN_WIDTH * 0.7;

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

export function QRScanner({
    eventName,
    scanResult,
    scannedData,
    onBarcodeScanned,
    onClose,
    onManualEntry,
    showRegisterDialog,
    onRegisterDialogClose,
    onRegisterMember,
}: QRScannerProps) {
    const [permission, requestPermission] = useCameraPermissions();

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
                    <Button variant="ghost" onPress={onClose}>
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
                    onBarcodeScanned(data);
                }}
            >
                {/* Dark overlay with transparent center */}
                <View className="flex-1">
                    {/* Top section with header */}
                    <SafeAreaView edges={['top']}>
                        <View className="flex-row items-center justify-between px-4 py-2">
                            <Pressable
                                onPress={onClose}
                                className="w-10 h-10 rounded-full bg-black/50 items-center justify-center"
                            >
                                <IconSymbol name="xmark" size={20} color="white" />
                            </Pressable>
                            <View className="bg-black/50 px-4 py-2 rounded-full">
                                <MsText className="text-white font-semibold">{eventName}</MsText>
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
                                <ScanResultFeedback scanResult={scanResult} />
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
                                    onPress={onManualEntry}
                                >
                                    <MsText className="text-white">Manual Entry</MsText>
                                </Button>
                                <Button
                                    variant="destructive"
                                    className="flex-1"
                                    onPress={onClose}
                                >
                                    Close
                                </Button>
                            </View>
                        </View>
                    </SafeAreaView>
                </View>
            </CameraView>

            {/* Register Member Dialog */}
            <RegisterMemberDialog
                visible={showRegisterDialog}
                onClose={onRegisterDialogClose}
                onRegister={onRegisterMember}
            />
        </View>
    );
}

function ScanResultFeedback({ scanResult }: { scanResult: ScanResult }) {
    const getStyles = () => {
        switch (scanResult.type) {
            case 'success':
                return { bg: 'bg-green-500/20 border-green-500', text: 'text-green-400', icon: 'checkmark.circle.fill', color: '#22C55E' };
            case 'error':
                return { bg: 'bg-red-500/20 border-red-500', text: 'text-red-400', icon: 'xmark.circle.fill', color: '#EF4444' };
            case 'info':
                return { bg: 'bg-blue-500/20 border-blue-500', text: 'text-blue-400', icon: 'info.circle.fill', color: '#3B82F6' };
            default:
                return { bg: 'bg-yellow-500/20 border-yellow-500', text: 'text-yellow-400', icon: 'clock.fill', color: '#EAB308' };
        }
    };

    const styles = getStyles();

    return (
        <View className={`w-full rounded-xl px-4 py-4 mb-4 border ${styles.bg}`}>
            <View className="flex-row items-center justify-center">
                <IconSymbol name={styles.icon as any} size={24} color={styles.color} />
                <MsText className={`ml-2 font-semibold text-center ${styles.text}`}>
                    {scanResult.message}
                </MsText>
            </View>
        </View>
    );
}

function RegisterMemberDialog({
    visible,
    onClose,
    onRegister,
}: {
    visible: boolean;
    onClose: () => void;
    onRegister: () => void;
}) {
    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={onClose}
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
                        <Button variant="outline" className="flex-1" onPress={onClose}>
                            Cancel
                        </Button>
                        <Button variant="primary" className="flex-1" onPress={onRegister}>
                            Register
                        </Button>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
