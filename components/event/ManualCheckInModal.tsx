import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MsHeading, MsText } from "@/components/ui/Typography";
import { useState } from "react";
import { Modal, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ManualCheckInModalProps {
    visible: boolean;
    onClose: () => void;
    onCheckIn: (cardNo: string) => Promise<{ success: boolean }>;
}

export function ManualCheckInModal({
    visible,
    onClose,
    onCheckIn,
}: ManualCheckInModalProps) {
    const [cardNoInput, setCardNoInput] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    const handleCheckIn = async () => {
        setIsProcessing(true);
        const result = await onCheckIn(cardNoInput);
        setIsProcessing(false);
        if (result.success) {
            setCardNoInput("");
            onClose();
        }
    };

    const handleClose = () => {
        setCardNoInput("");
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={handleClose}
        >
            <SafeAreaView className="flex-1 bg-background dark:bg-dark-background">
                <View className="flex-1 px-5 pt-4">
                    <View className="flex-row justify-between items-center mb-6">
                        <MsHeading size="h3">Manual Check-in</MsHeading>
                        <Button variant="ghost" onPress={handleClose}>Cancel</Button>
                    </View>

                    <MsText className="mb-4 text-muted-foreground dark:text-dark-muted-foreground">
                        Enter the member&apos;s card number to check them in manually.
                    </MsText>

                    <Input
                        label="Card Number"
                        value={cardNoInput}
                        onChangeText={setCardNoInput}
                        placeholder="Scan or enter card number"
                        keyboardType="default"
                        className="mb-6"
                    />

                    <Button variant="primary" onPress={handleCheckIn} loading={isProcessing}>
                        Check In
                    </Button>
                </View>
            </SafeAreaView>
        </Modal>
    );
}
