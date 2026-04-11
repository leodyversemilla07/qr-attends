import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MsHeading, MsText } from "@/components/ui/typography";
import { useTheme } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Modal, Platform, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface EventEditForm { name: string; date: string; time: string; location: string; description: string; }
interface EventEditModalProps { visible: boolean; onClose: () => void; initialData: EventEditForm; onSave: (form: EventEditForm) => Promise<{ success: boolean }>; }

export function EventEditModal({ visible, onClose, initialData, onSave }: EventEditModalProps) {
    const [editForm, setEditForm] = useState<EventEditForm>(initialData);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const { colors } = useTheme();

    const handleOpen = () => setEditForm(initialData);
    const handleSave = async () => {
        setIsSaving(true);
        const result = await onSave(editForm);
        setIsSaving(false);
        if (result.success) onClose();
    };

    const pickerStyle = { backgroundColor: colors.surface, borderColor: colors.outline, borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12 };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose} onShow={handleOpen}>
            <View style={{ flex: 1, backgroundColor: colors.background }}>
                <SafeAreaView style={{ flex: 1, paddingHorizontal: 20, paddingTop: 16 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                        <MsHeading size="h3">Edit Event</MsHeading>
                        <Button variant="ghost" onPress={onClose}>Cancel</Button>
                    </View>

                    <Input label="Event Name" value={editForm.name} onChangeText={(text) => setEditForm({ ...editForm, name: text })} placeholder="Event name" containerStyle={{ marginBottom: 16 }} />

                    <View style={{ marginBottom: 16 }}>
                        <MsText style={{ fontWeight: "600", marginBottom: 8 }}>Date</MsText>
                        <Pressable onPress={() => setShowDatePicker(true)} style={pickerStyle}>
                            <MsText style={{ color: editForm.date ? colors.onBackground : "#94A3B8" }}>{editForm.date || "Select date"}</MsText>
                        </Pressable>
                        {showDatePicker && (
                            <DateTimePicker
                                value={editForm.date ? new Date(editForm.date) : new Date()}
                                mode="date"
                                display={Platform.OS === "ios" ? "spinner" : "default"}
                                onChange={(event, selectedDate) => {
                                    setShowDatePicker(Platform.OS === "ios");
                                    if (selectedDate) setEditForm({ ...editForm, date: selectedDate.toISOString().split("T")[0] });
                                }}
                            />
                        )}
                        {Platform.OS === "ios" && showDatePicker && (
                            <Button variant="ghost" style={{ marginTop: 8 }} onPress={() => setShowDatePicker(false)}>Done</Button>
                        )}
                    </View>

                    <View style={{ marginBottom: 16 }}>
                        <MsText style={{ fontWeight: "600", marginBottom: 8 }}>Time</MsText>
                        <Pressable onPress={() => setShowTimePicker(true)} style={pickerStyle}>
                            <MsText style={{ color: editForm.time ? colors.onBackground : "#94A3B8" }}>{editForm.time || "Select time"}</MsText>
                        </Pressable>
                        {showTimePicker && (
                            <DateTimePicker
                                value={(() => {
                                    if (editForm.time) {
                                        const [hours, minutes] = editForm.time.split(":");
                                        const date = new Date(); date.setHours(parseInt(hours, 10), parseInt(minutes, 10)); return date;
                                    }
                                    return new Date();
                                })()}
                                mode="time"
                                display={Platform.OS === "ios" ? "spinner" : "default"}
                                onChange={(event, selectedTime) => {
                                    setShowTimePicker(Platform.OS === "ios");
                                    if (selectedTime) setEditForm({ ...editForm, time: selectedTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }) });
                                }}
                            />
                        )}
                        {Platform.OS === "ios" && showTimePicker && (
                            <Button variant="ghost" style={{ marginTop: 8 }} onPress={() => setShowTimePicker(false)}>Done</Button>
                        )}
                    </View>

                    <Input label="Location" value={editForm.location} onChangeText={(text) => setEditForm({ ...editForm, location: text })} placeholder="Venue or room" containerStyle={{ marginBottom: 16 }} />
                    <Input label="Description (optional)" value={editForm.description} onChangeText={(text) => setEditForm({ ...editForm, description: text })} placeholder="Event description" multiline numberOfLines={3} containerStyle={{ marginBottom: 24 }} />

                    <Button variant="primary" onPress={handleSave} loading={isSaving}>Save Changes</Button>
                </SafeAreaView>
            </View>
        </Modal>
    );
}
