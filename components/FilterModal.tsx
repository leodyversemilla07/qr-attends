import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { MsHeading, MsText } from "@/components/ui/Typography";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Modal, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface FilterModalProps {
    visible: boolean;
    onClose: () => void;
    onApply: (filters: FilterOptions) => void;
    initialFilters?: FilterOptions;
}

export interface FilterOptions {
    yearSection: string | null;
    checkInStatus: "all" | "checked-in" | "never";
}

export function FilterModal({ visible, onClose, onApply, initialFilters }: FilterModalProps) {
    const [filters, setFilters] = useState<FilterOptions>(initialFilters || {
        yearSection: null,
        checkInStatus: "all",
    });

    const yearSections = useQuery(api.search.getYearSections) as string[] | undefined;

    const handleClear = () => {
        const cleared: FilterOptions = { yearSection: null, checkInStatus: "all" };
        setFilters(cleared);
        onApply(cleared);
        onClose();
    };

    const handleApply = () => {
        onApply(filters);
        onClose();
    };

    const setYearSection = (section: string | null) => {
        setFilters({ ...filters, yearSection: section });
    };

    const setCheckInStatus = (status: "all" | "checked-in" | "never") => {
        setFilters({ ...filters, checkInStatus: status });
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
            <SafeAreaView className="flex-1 bg-background">
                <View className="flex-row items-center justify-between p-4 border-b border-border">
                    <Pressable onPress={onClose} className="p-2 -ml-2">
                        <IconSymbol name="xmark" size={24} color="#64748B" />
                    </Pressable>
                    <MsHeading size="h3">Filter Members</MsHeading>
                    <View className="w-10" />
                </View>

                <View className="flex-1 px-4 pt-4">
                    <MsHeading size="h4" className="mb-3">Year/Section</MsHeading>
                    <View className="flex-row flex-wrap gap-2 mb-6">
                        <Pressable
                            onPress={() => setYearSection(null)}
                            className={`px-4 py-2 rounded-full border ${filters.yearSection === null ? "bg-primary border-primary" : "bg-white border-border"}`}
                        >
                            <MsText className={filters.yearSection === null ? "text-white" : "text-foreground"}>All</MsText>
                        </Pressable>
                        {yearSections?.map((section) => (
                            <Pressable
                                key={section}
                                onPress={() => setYearSection(section)}
                                className={`px-4 py-2 rounded-full border ${filters.yearSection === section ? "bg-primary border-primary" : "bg-white border-border"}`}
                            >
                                <MsText className={filters.yearSection === section ? "text-white" : "text-foreground"}>{section}</MsText>
                            </Pressable>
                        ))}
                    </View>

                    <MsHeading size="h4" className="mb-3">Check-in Status</MsHeading>
                    <Card className="p-0 overflow-hidden mb-6">
                        {[
                            { key: "all" as const, label: "All Members" },
                            { key: "checked-in" as const, label: "Checked in" },
                            { key: "never" as const, label: "Never checked in" },
                        ].map((option, index) => (
                            <Pressable
                                key={option.key}
                                onPress={() => setCheckInStatus(option.key)}
                                className={`p-4 flex-row items-center justify-between ${index < 2 ? "border-b border-border" : ""}`}
                            >
                                <MsText>{option.label}</MsText>
                                {filters.checkInStatus === option.key && (
                                    <IconSymbol name="checkmark" size={20} color="#2563EB" />
                                )}
                            </Pressable>
                        ))}
                    </Card>
                </View>

                <View className="p-4 border-t border-border flex-row gap-3">
                    <Button variant="outline" className="flex-1" onPress={handleClear}>
                        Clear
                    </Button>
                    <Button variant="primary" className="flex-1" onPress={handleApply}>
                        Apply Filters
                    </Button>
                </View>
            </SafeAreaView>
        </Modal>
    );
}
