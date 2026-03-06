import { Button } from "@/components/ui/button";
import { MsHeading, MsText } from "@/components/ui/typography";
import { useTheme } from "react-native-paper";
import { Modal, View } from "react-native";

interface DeleteEventDialogProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    isDeleting: boolean;
}

export function DeleteEventDialog({ visible, onClose, onConfirm, isDeleting }: DeleteEventDialogProps) {
    const { colors, dark: isDark } = useTheme();

    return (
        <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)", paddingHorizontal: 24 }}>
                <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 24, width: "100%", maxWidth: 384 }}>
                    <MsHeading size="h3" style={{ marginBottom: 8 }}>Delete Event</MsHeading>
                    <MsText style={{ color: colors.onSurfaceVariant, marginBottom: 24 }}>
                        Are you sure you want to delete this event? This action cannot be undone.
                    </MsText>
                    <View style={{ flexDirection: "row", gap: 12 }}>
                        <Button variant="outline" style={{ flex: 1 }} onPress={onClose} disabled={isDeleting}>Cancel</Button>
                        <Button variant="destructive" style={{ flex: 1 }} onPress={onConfirm} loading={isDeleting}>Delete</Button>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
