import { Button } from "@/components/ui/Button";
import { MsHeading, MsText } from "@/components/ui/Typography";
import { Modal, View } from "react-native";

interface DeleteEventDialogProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    isDeleting: boolean;
}

export function DeleteEventDialog({
    visible,
    onClose,
    onConfirm,
    isDeleting,
}: DeleteEventDialogProps) {
    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-center items-center bg-black/50 px-6">
                <View className="bg-white dark:bg-dark-card rounded-2xl p-6 w-full max-w-sm shadow-xl">
                    <MsHeading size="h3" className="mb-2">Delete Event</MsHeading>
                    <MsText className="text-muted-foreground dark:text-dark-muted-foreground mb-6">
                        Are you sure you want to delete this event? This action cannot be undone.
                    </MsText>
                    <View className="flex-row gap-3">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onPress={onClose}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            className="flex-1"
                            onPress={onConfirm}
                            loading={isDeleting}
                        >
                            Delete
                        </Button>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
