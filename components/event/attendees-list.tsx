import { IconSymbol } from "@/components/ui/icon-symbol";
import { MsHeading, MsText } from "@/components/ui/typography";
import React, { useCallback } from "react";
import { FlatList, Pressable, View } from "react-native";
import { useTheme } from "react-native-paper";

interface AttendeeRecord {
    _id: string;
    timestamp: string;
    member?: { firstName?: string; lastName?: string; studentId?: string; yearSection?: string; } | null;
}

interface AttendeesListProps {
    attendees: AttendeeRecord[] | undefined;
    refreshing: boolean;
    onRefresh: () => void;
    onExport: () => void;
    isExporting: boolean;
    ListHeaderComponent?: React.ReactElement;
}

const ITEM_HEIGHT = 80;

export function AttendeesList({ attendees, refreshing, onRefresh, onExport, isExporting, ListHeaderComponent }: AttendeesListProps) {
    const renderItem = useCallback(({ item }: { item: AttendeeRecord }) => (
        <AttendeeCard attendee={item} />
    ), []);

    const keyExtractor = useCallback((item: AttendeeRecord) => item._id, []);

    const getItemLayout = useCallback((_: any, index: number) => ({
        length: ITEM_HEIGHT,
        offset: ITEM_HEIGHT * index,
        index,
    }), []);

    return (
        <View style={{ flex: 1, paddingHorizontal: 16 }}>
            {!attendees ? (
                <MsText>Loading attendees...</MsText>
            ) : (
                <FlatList 
                    data={attendees} 
                    keyExtractor={keyExtractor} 
                    refreshing={refreshing} 
                    onRefresh={onRefresh} 
                    renderItem={renderItem}
                    getItemLayout={getItemLayout}
                    removeClippedSubviews={true}
                    maxToRenderPerBatch={10}
                    windowSize={5}
                    initialNumToRender={10}
                    ListHeaderComponent={
                        <>
                            {ListHeaderComponent}
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12, marginTop: ListHeaderComponent ? 16 : 0 }}>
                                <MsHeading size="h3">Attendees ({attendees ? attendees.length : 0})</MsHeading>
                                {attendees && attendees.length > 0 && (
                                    <Pressable 
                                        onPress={onExport} 
                                        disabled={isExporting} 
                                        style={({ pressed }) => [
                                            { 
                                                flexDirection: "row", 
                                                alignItems: "center", 
                                                paddingHorizontal: 12, 
                                                paddingVertical: 6, 
                                                backgroundColor: "rgba(37,99,235,0.1)", 
                                                borderRadius: 8,
                                                minHeight: 40,
                                                justifyContent: 'center'
                                            }, 
                                            pressed && { backgroundColor: "rgba(37,99,235,0.2)" }
                                        ]}
                                    >
                                        <IconSymbol name="square.and.arrow.up" size={16} color="#2563EB" />
                                        <MsText style={{ marginLeft: 6, color: "#2563EB", fontWeight: "500", fontSize: 14 }}>
                                            {isExporting ? "Exporting..." : "Export"}
                                        </MsText>
                                    </Pressable>
                                )}
                            </View>
                        </>
                    }
                    ListEmptyComponent={
                        <MsText variant="muted" style={{ fontStyle: "italic", marginTop: 16, textAlign: "center" }}>
                            No attendees yet.
                        </MsText>
                    } 
                    contentContainerStyle={{ paddingBottom: 24 }}
                />
            )}
        </View>
    );
}

const AttendeeCard = React.memo(({ attendee }: { attendee: AttendeeRecord }) => {
    const { colors } = useTheme();
    return (
        <View style={{ 
            flexDirection: "row", 
            justifyContent: "space-between", 
            alignItems: "center", 
            padding: 12, 
            borderBottomWidth: 1, 
            borderBottomColor: colors.outline, 
            backgroundColor: colors.surface, 
            borderRadius: 8, 
            marginBottom: 8,
            height: ITEM_HEIGHT - 8, // Accounting for margin
        }}>
            <View>
                <MsText style={{ fontWeight: "600", fontSize: 18 }}>{attendee.member?.firstName} {attendee.member?.lastName}</MsText>
                <MsText variant="muted" style={{ fontSize: 12 }}>{new Date(attendee.timestamp).toLocaleTimeString()}</MsText>
            </View>
            <View style={{ alignItems: "flex-end" }}>
                {attendee.member?.studentId && <MsText variant="small" style={{ color: colors.onSurfaceVariant }}>{attendee.member.studentId}</MsText>}
                {attendee.member?.yearSection && <MsText variant="small" style={{ color: colors.onSurfaceVariant }}>{attendee.member.yearSection}</MsText>}
            </View>
        </View>
    );
});

AttendeeCard.displayName = "AttendeeCard";
