import { IconSymbol } from "@/components/ui/icon-symbol";
import { MsHeading, MsText } from "@/components/ui/Typography";
import { FlatList, Pressable, View } from "react-native";

interface AttendeeRecord {
    _id: string;
    timestamp: string;
    member?: {
        firstName?: string;
        lastName?: string;
        studentId?: string;
        yearSection?: string;
    } | null;
}

interface AttendeesListProps {
    attendees: AttendeeRecord[] | undefined;
    refreshing: boolean;
    onRefresh: () => void;
    onExport: () => void;
    isExporting: boolean;
}

export function AttendeesList({
    attendees,
    refreshing,
    onRefresh,
    onExport,
    isExporting,
}: AttendeesListProps) {
    return (
        <View className="flex-1 px-4">
            <View className="flex-row items-center justify-between mb-3">
                <MsHeading size="h3">
                    Attendees ({attendees ? attendees.length : 0})
                </MsHeading>
                {attendees && attendees.length > 0 && (
                    <Pressable
                        onPress={onExport}
                        disabled={isExporting}
                        className="flex-row items-center px-3 py-1.5 bg-primary/10 rounded-lg active:bg-primary/20"
                    >
                        <IconSymbol name="square.and.arrow.up" size={16} color="#2563EB" />
                        <MsText className="ml-1.5 text-primary font-medium text-sm">
                            {isExporting ? "Exporting..." : "Export"}
                        </MsText>
                    </Pressable>
                )}
            </View>

            {!attendees ? (
                <MsText>Loading attendees...</MsText>
            ) : (
                <FlatList
                    data={attendees}
                    keyExtractor={(item) => item._id}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    renderItem={({ item }) => <AttendeeCard attendee={item} />}
                    ListEmptyComponent={
                        <MsText variant="muted" className="italic mt-4 text-center">No attendees yet.</MsText>
                    }
                />
            )}
        </View>
    );
}

function AttendeeCard({ attendee }: { attendee: AttendeeRecord }) {
    return (
        <View className="flex-row justify-between items-center p-3 border-b border-border dark:border-dark-border bg-white dark:bg-dark-card rounded-lg mb-2">
            <View>
                <MsText className="font-semibold text-lg">
                    {attendee.member?.firstName} {attendee.member?.lastName}
                </MsText>
                <MsText variant="muted" className="text-xs">
                    {new Date(attendee.timestamp).toLocaleTimeString()}
                </MsText>
            </View>
            <View className="items-end">
                {attendee.member?.studentId && (
                    <MsText variant="small" className="text-muted-foreground dark:text-dark-muted-foreground">{attendee.member.studentId}</MsText>
                )}
                {attendee.member?.yearSection && (
                    <MsText variant="small" className="text-muted-foreground dark:text-dark-muted-foreground">{attendee.member.yearSection}</MsText>
                )}
            </View>
        </View>
    );
}
