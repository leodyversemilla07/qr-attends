import { Card } from "@/components/ui/card";
import { IconSymbol, type IconSymbolName } from "@/components/ui/icon-symbol";
import { Input } from "@/components/ui/input";
import { MsHeading, MsText } from "@/components/ui/typography";
import { useTheme } from "react-native-paper";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SearchScreen() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const { colors, dark: isDark } = useTheme();

    const handleSearch = () => {
        if (searchTerm.trim()) {
            router.push(`/search-results?query=${encodeURIComponent(searchTerm)}`);
        }
    };

    const recentSearches = [
        { id: "1", title: "General Meeting", type: "event" },
        { id: "2", title: "John Smith", type: "member" },
        { id: "3", title: "Chapter Meeting", type: "event" },
    ];

    const suggestions: { id: string; title: string; icon: IconSymbolName; color: string; action: "/create-event" | "/register-member" | "/reports" | "/scan-qr" }[] = [
        { id: "1", title: "Create Event", icon: "plus.circle.fill", color: "#2563EB", action: "/create-event" },
        { id: "2", title: "Add Member", icon: "person.badge.plus.fill", color: "#10B981", action: "/register-member" },
        { id: "3", title: "View Reports", icon: "chart.bar.xaxis", color: "#8B5CF6", action: "/reports" },
        { id: "4", title: "Scan QR", icon: "qrcode", color: "#F59E0B", action: "/scan-qr" },
    ];

    const handleBack = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace("/(tabs)");
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Pressable onPress={handleBack} style={[styles.iconBtn, { backgroundColor: isDark ? colors.surfaceVariant : "#F1F5F9" }]}>
                        <IconSymbol name="chevron.left" size={24} color="#64748B" />
                    </Pressable>
                    <MsHeading size="h2">Search</MsHeading>
                    <View style={styles.iconBtn} />
                </View>

                <Input
                    placeholder="Search events, members..."
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                    autoFocus
                    onSubmitEditing={handleSearch}
                    containerStyle={{ marginBottom: 24 }}
                />

                {searchTerm.length === 0 ? (
                    <>
                        <MsHeading size="h4" style={{ marginBottom: 12, marginLeft: 4 }}>Quick Actions</MsHeading>
                        <View style={[styles.suggestionsGrid, { marginBottom: 24 }]}>
                            {suggestions.map((item) => (
                                <View key={item.id} style={styles.suggestionItem}>
                                    <Pressable onPress={() => router.push(item.action)}>
                                        <Card style={styles.suggestionCard}>
                                            <View style={[styles.suggestionIcon, { backgroundColor: `${item.color}15` }]}>
                                                <IconSymbol name={item.icon} size={20} color={item.color} />
                                            </View>
                                            <MsText style={{ fontWeight: "500", flex: 1 }} numberOfLines={1}>{item.title}</MsText>
                                        </Card>
                                    </Pressable>
                                </View>
                            ))}
                        </View>

                        <MsHeading size="h4" style={{ marginBottom: 12, marginLeft: 4 }}>Recent Searches</MsHeading>
                        <Card contentStyle={{ padding: 0 }}>
                            {recentSearches.map((item, index) => (
                                <Pressable
                                    key={item.id}
                                    style={[
                                        styles.recentRow,
                                        index < recentSearches.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.outline },
                                    ]}
                                    onPress={() => setSearchTerm(item.title)}
                                >
                                    <View style={styles.recentLeft}>
                                        <IconSymbol name="clock" size={18} color="#94A3B8" />
                                        <MsText style={{ marginLeft: 12 }}>{item.title}</MsText>
                                    </View>
                                    <IconSymbol name="chevron.right" size={16} color="#CBD5E1" />
                                </Pressable>
                            ))}
                        </Card>
                    </>
                ) : (
                    <Pressable onPress={handleSearch}>
                        <Card style={styles.searchRow}>
                            <IconSymbol name="magnifyingglass" size={20} color="#2563EB" />
                            <MsText style={{ marginLeft: 12, color: "#2563EB" }}>Search for &quot;{searchTerm}&quot;</MsText>
                        </Card>
                    </Pressable>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
    iconBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 20 },
    suggestionsGrid: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -6 },
    suggestionItem: { width: "50%", padding: 6 },
    suggestionCard: { flexDirection: "row", alignItems: "center", padding: 16 },
    suggestionIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", marginRight: 12 },
    recentRow: { padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    recentLeft: { flexDirection: "row", alignItems: "center" },
    searchRow: { padding: 16, flexDirection: "row", alignItems: "center" },
});
