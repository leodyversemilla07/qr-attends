import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MsHeading, MsText } from "@/components/ui/typography";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useTheme } from "react-native-paper";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/utils/auth-context";
import { useQuery } from "convex/react";
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
    const { colors } = useTheme();
    const { token } = useAuth();
    const [filters, setFilters] = useState<FilterOptions>(initialFilters || { yearSection: null, checkInStatus: "all" });
    const yearSections = useQuery(api.search.getYearSections, token ? { token } : "skip") as string[] | undefined;

    const handleClear = () => {
        const cleared: FilterOptions = { yearSection: null, checkInStatus: "all" };
        setFilters(cleared);
        onApply(cleared);
        onClose();
    };
    const handleApply = () => { onApply(filters); onClose(); };
    const setYearSection = (section: string | null) => setFilters({ ...filters, yearSection: section });
    const setCheckInStatus = (status: "all" | "checked-in" | "never") => setFilters({ ...filters, checkInStatus: status });

    const chipBase = { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 };
    const chipActive = { backgroundColor: "#2563EB", borderColor: "#2563EB" };
    const chipInactive = { backgroundColor: colors.surface, borderColor: colors.outline };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, borderBottomWidth: 1, borderBottomColor: colors.outline }}>
                    <Pressable onPress={onClose} style={{ padding: 8, marginLeft: -8 }}>
                        <IconSymbol name="xmark" size={24} color={colors.onSurfaceVariant} />
                    </Pressable>
                    <MsHeading size="h3">Filter Members</MsHeading>
                    <View style={{ width: 40 }} />
                </View>

                <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}>
                    <MsHeading size="h4" style={{ marginBottom: 12 }}>Year/Section</MsHeading>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
                        <Pressable onPress={() => setYearSection(null)} style={[chipBase, filters.yearSection === null ? chipActive : chipInactive]}>
                            <MsText style={{ color: filters.yearSection === null ? "white" : colors.onBackground }}>All</MsText>
                        </Pressable>
                        {yearSections?.map((section) => (
                            <Pressable key={section} onPress={() => setYearSection(section)} style={[chipBase, filters.yearSection === section ? chipActive : chipInactive]}>
                                <MsText style={{ color: filters.yearSection === section ? "white" : colors.onBackground }}>{section}</MsText>
                            </Pressable>
                        ))}
                    </View>

                    <MsHeading size="h4" style={{ marginBottom: 12 }}>Check-in Status</MsHeading>
                    <Card contentStyle={{ padding: 0 }} style={{ marginBottom: 24 }}>
                        {([
                            { key: "all" as const, label: "All Members" },
                            { key: "checked-in" as const, label: "Checked in" },
                            { key: "never" as const, label: "Never checked in" },
                        ] as const).map((option, index) => (
                            <Pressable
                                key={option.key}
                                onPress={() => setCheckInStatus(option.key)}
                                style={{ padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", ...(index < 2 ? { borderBottomWidth: 1, borderBottomColor: colors.outline } : {}) }}
                            >
                                <MsText>{option.label}</MsText>
                                {filters.checkInStatus === option.key && <IconSymbol name="checkmark" size={20} color="#2563EB" />}
                            </Pressable>
                        ))}
                    </Card>
                </View>

                <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: colors.outline, flexDirection: "row", gap: 12 }}>
                    <Button variant="outline" style={{ flex: 1 }} onPress={handleClear}>Clear</Button>
                    <Button variant="primary" style={{ flex: 1 }} onPress={handleApply}>Apply Filters</Button>
                </View>
            </SafeAreaView>
        </Modal>
    );
}
