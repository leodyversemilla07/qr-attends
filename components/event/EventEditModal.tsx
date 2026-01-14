import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MsHeading, MsText } from "@/components/ui/Typography";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Modal, Platform, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface EventEditForm {
    name: string;
    date: string;
    time: string;
    location: string;
    description: string;
}

interface EventEditModalProps {
    visible: boolean;
    onClose: () => void;
    initialData: EventEditForm;
    onSave: (form: EventEditForm) => Promise<{ success: boolean }>;
}

export function EventEditModal({
    visible,
    onClose,
    initialData,
    onSave,
}: EventEditModalProps) {
    const [editForm, setEditForm] = useState<EventEditForm>(initialData);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Reset form when modal opens with new data
    const handleOpen = () => {
        setEditForm(initialData);
    };

    const handleSave = async () => {
        setIsSaving(true);
        const result = await onSave(editForm);
        setIsSaving(false);
        if (result.success) {
            onClose();
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
            onShow={handleOpen}
        >
            <SafeAreaView className="flex-1 bg-background dark:bg-dark-background">
                <View className="flex-1 px-5 pt-4">
                    <View className="flex-row justify-between items-center mb-6">
                        <MsHeading size="h3">Edit Event</MsHeading>
                        <Button variant="ghost" onPress={onClose}>Cancel</Button>
                    </View>

                    <Input
                        label="Event Name"
                        value={editForm.name}
                        onChangeText={(text) => setEditForm({ ...editForm, name: text })}
                        placeholder="Event name"
                        className="mb-4"
                    />

                    <View className="mb-4">
                        <MsText className="font-semibold mb-2">Date</MsText>
                        <Pressable
                            onPress={() => setShowDatePicker(true)}
                            className="bg-white dark:bg-dark-card border border-border dark:border-dark-border rounded-xl px-4 py-3"
                        >
                            <MsText className={editForm.date ? "" : "text-slate-400"}>
                                {editForm.date || "Select date"}
                            </MsText>
                        </Pressable>
                        {showDatePicker && (
                            <DateTimePicker
                                value={editForm.date ? new Date(editForm.date) : new Date()}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={(event, selectedDate) => {
                                    setShowDatePicker(Platform.OS === 'ios');
                                    if (selectedDate) {
                                        const dateStr = selectedDate.toISOString().split('T')[0];
                                        setEditForm({ ...editForm, date: dateStr });
                                    }
                                }}
                            />
                        )}
                        {Platform.OS === 'ios' && showDatePicker && (
                            <Button variant="ghost" className="mt-2" onPress={() => setShowDatePicker(false)}>
                                Done
                            </Button>
                        )}
                    </View>

                    <View className="mb-4">
                        <MsText className="font-semibold mb-2">Time</MsText>
                        <Pressable
                            onPress={() => setShowTimePicker(true)}
                            className="bg-white dark:bg-dark-card border border-border dark:border-dark-border rounded-xl px-4 py-3"
                        >
                            <MsText className={editForm.time ? "" : "text-slate-400"}>
                                {editForm.time || "Select time"}
                            </MsText>
                        </Pressable>
                        {showTimePicker && (
                            <DateTimePicker
                                value={(() => {
                                    if (editForm.time) {
                                        const [hours, minutes] = editForm.time.split(':');
                                        const date = new Date();
                                        date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
                                        return date;
                                    }
                                    return new Date();
                                })()}
                                mode="time"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={(event, selectedTime) => {
                                    setShowTimePicker(Platform.OS === 'ios');
                                    if (selectedTime) {
                                        const timeStr = selectedTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
                                        setEditForm({ ...editForm, time: timeStr });
                                    }
                                }}
                            />
                        )}
                        {Platform.OS === 'ios' && showTimePicker && (
                            <Button variant="ghost" className="mt-2" onPress={() => setShowTimePicker(false)}>
                                Done
                            </Button>
                        )}
                    </View>

                    <Input
                        label="Location"
                        value={editForm.location}
                        onChangeText={(text) => setEditForm({ ...editForm, location: text })}
                        placeholder="Venue or room"
                        className="mb-4"
                    />

                    <Input
                        label="Description (optional)"
                        value={editForm.description}
                        onChangeText={(text) => setEditForm({ ...editForm, description: text })}
                        placeholder="Event description"
                        multiline
                        numberOfLines={3}
                        className="mb-6"
                    />

                    <Button variant="primary" onPress={handleSave} loading={isSaving}>
                        Save Changes
                    </Button>
                </View>
            </SafeAreaView>
        </Modal>
    );
}
