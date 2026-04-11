import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useState } from "react";
import { Alert } from "react-native";

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

interface EventInfo {
    name?: string;
    date?: string;
    time?: string;
    location?: string;
}

export function useExportAttendance() {
    const [isExporting, setIsExporting] = useState(false);

    async function exportAttendance(attendees: AttendeeRecord[], event: EventInfo | null) {
        if (!attendees || attendees.length === 0) {
            Alert.alert("No Data", "No attendance records to export for this event.");
            return { success: false };
        }

        setIsExporting(true);
        try {
            const isAvailable = await Sharing.isAvailableAsync();
            if (!isAvailable) {
                Alert.alert("Sharing Not Available", "Sharing is not available on this device.");
                return { success: false };
            }

            const headers = ["#", "Name", "Student ID", "Year/Section", "Check-in Time"];
            const rows = attendees.map((record, index) => [
                (index + 1).toString(),
                `${record.member?.firstName || ""} ${record.member?.lastName || ""}`.trim(),
                record.member?.studentId || "",
                record.member?.yearSection || "",
                new Date(record.timestamp).toLocaleString(),
            ]);

            const escapeCsvCell = (value: string) => `"${String(value).replace(/"/g, '""')}"`;

            const csvContent = [
                `Event: ${event?.name || "Unknown"}`,
                `Date: ${event?.date || ""} @ ${event?.time || ""}`,
                `Location: ${event?.location || ""}`,
                `Total Attendees: ${attendees.length}`,
                "",
                headers.map(escapeCsvCell).join(","),
                ...rows.map(row => row.map(cell => escapeCsvCell(cell)).join(","))
            ].join("\n");

            const safeEventName = (event?.name || "event").replace(/[^a-zA-Z0-9]/g, "_");
            const fileName = `${safeEventName}_attendance_${new Date().toISOString().split("T")[0]}.csv`;

            // Write CSV content to a temporary file
            const file = new File(Paths.cache, fileName);
            await file.write(csvContent);

            await Sharing.shareAsync(file.uri, {
                mimeType: "text/csv",
                dialogTitle: `Export ${event?.name} Attendance`,
                UTI: "public.comma-separated-values-text",
            });

            return { success: true };
        } catch (error: any) {
            Alert.alert("Export Failed", error.message);
            return { success: false };
        } finally {
            setIsExporting(false);
        }
    }

    return {
        isExporting,
        exportAttendance,
    };
}
