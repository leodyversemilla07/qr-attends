import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MsHeading, MsText } from "@/components/ui/typography";
import { useTheme } from "react-native-paper";
import { useState } from "react";
import { Modal, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ManualCheckInModalProps {
    visible: boolean;
    onClose: () => void;
    onCheckIn: (cardNo: string) => Promise<{ success: boolean }>;
}

export function ManualCheckInModal({ visible, onClose, onCheckIn }: ManualCheckInModalProps) {
    const [cardNoInput, setCardNoInput] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const { colors } = useTheme();

    const handleCheckIn = async () => {
        setIsProcessing(true);
        const result = await onCheckIn(cardNoInput);
        setIsProcessing(false);
        if (result.success) { setCardNoInput(""); onClose(); }
    };

    const handleClose = () => { setCardNoInput(""); onClose(); };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
            <View style={{ flex: 1, backgroundColor: colors.background }}>
                <SafeAreaView style={{ flex: 1, paddingHorizontal: 20, paddingTop: 16 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                        <MsHeading size="h3">Manual Check-in</MsHeading>
                        <Button variant="ghost" onPress={handleClose}>Cancel</Button>
                    </View>
                    <MsText style={{ marginBottom: 16, color: colors.onSurfaceVariant }}>
                        Enter the member&apos;s card number to check them in manually.
                    </MsText>
                    <Input
                        label="Card Number"
                        value={cardNoInput}
                        onChangeText={setCardNoInput}
                        placeholder="Scan or enter card number"
                        keyboardType="default"
                        containerStyle={{ marginBottom: 24 }}
                    />
                    <Button variant="primary" onPress={handleCheckIn} loading={isProcessing}>Check In</Button>
                </SafeAreaView>
            </View>
        </Modal>
    );
}
