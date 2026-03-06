import { FilterModal, FilterOptions } from "@/components/filter-modal";
import { Card } from "@/components/ui/card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Skeleton } from "@/components/ui/skeleton";
import { MsHeading, MsText } from "@/components/ui/typography";
import { api } from "@/convex/_generated/api";
import { useTheme } from "react-native-paper";
import { useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from "react-native";
import { Searchbar, TouchableRipple } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MembersScreen() {
    const router = useRouter();
    const { colors, dark: isDark } = useTheme();
    const [search, setSearch] = useState("");
    const [refreshing, setRefreshing] = useState(false);
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [filters, setFilters] = useState<FilterOptions>({ yearSection: null, checkInStatus: "all" });

    const members = useQuery(api.members.search, {
        searchTerm: search || undefined,
        limit: 100
    });

    const isLoading = members === undefined;

    const onRefresh = async () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1000);
    };

    const handleApplyFilters = (newFilters: FilterOptions) => {
        setFilters(newFilters);
    };

    return (
        <SafeAreaView style={[styles.flex1, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={styles.container}>
                <View style={styles.headerRow}>
                    <MsHeading size="h2">Members</MsHeading>
                    <View style={styles.headerRight}>
                        {filters.yearSection && (
                            <View style={styles.filterBadge}>
                                <MsText variant="small" style={styles.textPrimary}>{filters.yearSection}</MsText>
                            </View>
                        )}
                        <Pressable
                            onPress={() => setFilterModalVisible(true)}
                            style={[styles.filterBtn, { backgroundColor: colors.surfaceVariant }]}
                        >
                            <IconSymbol name="list.bullet.rectangle.fill" size={18} color={colors.onSurfaceVariant} />
                        </Pressable>
                    </View>
                </View>

                <Searchbar
                    placeholder="Search by name, ID, card, or section..."
                    onChangeText={setSearch}
                    value={search}
                    style={[styles.searchbar, { backgroundColor: colors.surfaceVariant }]}
                    inputStyle={{ fontFamily: 'WorkSans_400Regular' }}
                    iconColor={colors.onSurfaceVariant}
                    elevation={0}
                />

                {isLoading ? (
                    <FlatList
                        data={Array(6).fill(0)}
                        keyExtractor={(_, i) => i.toString()}
                        renderItem={() => (
                            <View style={[styles.skeletonRow, { backgroundColor: colors.surface, borderColor: colors.outline }]}>
                                <Skeleton height={48} width={48} style={{ borderRadius: 24 }} />
                                <View style={[styles.skeletonText, { gap: 8 }]}>
                                    <Skeleton height={20} width="60%" />
                                    <Skeleton height={16} width="40%" />
                                </View>
                            </View>
                        )}
                    />
                ) : members?.length === 0 ? (
                    <Card contentStyle={{ alignItems: 'center', paddingVertical: 48 }} mode="outlined">
                        <IconSymbol name="person.2.fill" size={48} color="#94A3B8" />
                        <MsText variant="muted" style={styles.emptyText}>
                            {search ? "No members match your search." : "No members registered yet."}
                        </MsText>
                    </Card>
                ) : (
                    <FlatList
                        data={members}
                        keyExtractor={(item) => item._id}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 100 }}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                        }
                        renderItem={({ item }) => (
                            <Card style={{ marginBottom: 16 }} contentStyle={{ padding: 0 }} mode="outlined">
                                <TouchableRipple
                                    onPress={() => router.push({ pathname: "/member/[id]", params: { id: item._id } } as any)}
                                    style={styles.memberRow}
                                >
                                    <>
                                        <View style={styles.avatar}>
                                            <MsText style={styles.avatarText}>
                                                {item.firstName[0]}{item.lastName[0]}
                                            </MsText>
                                        </View>

                                        <View style={styles.memberInfo}>
                                            <MsHeading size="h4" numberOfLines={1}>{item.firstName} {item.lastName}</MsHeading>
                                            <View style={styles.memberMeta}>
                                                <MsText variant="small" numberOfLines={1} style={styles.metaText}>{item.studentId}</MsText>
                                                <View style={[styles.dot, { backgroundColor: isDark ? '#475569' : '#CBD5E1' }]} />
                                                <MsText variant="small" numberOfLines={1} style={[styles.metaText, { flexShrink: 1 }]}>{item.yearSection}</MsText>
                                            </View>
                                        </View>

                                        <IconSymbol name="chevron.right" size={16} color="#CBD5E1" />
                                    </>
                                </TouchableRipple>
                            </Card>
                        )}
                    />
                )}
            </View>
            <FilterModal
                visible={filterModalVisible}
                onClose={() => setFilterModalVisible(false)}
                onApply={handleApplyFilters}
                initialFilters={filters}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    flex1: { flex: 1 },
    container: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    filterBadge: { backgroundColor: 'rgba(37,99,235,0.1)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 9999 },
    filterBtn: { padding: 8, borderRadius: 9999 },
    textPrimary: { color: '#2563EB', fontWeight: '500' },
    searchbar: { marginBottom: 16, borderRadius: 16 },
    skeletonRow: { borderWidth: 1, borderRadius: 16, marginBottom: 16, padding: 16, flexDirection: 'row', alignItems: 'center' },
    skeletonText: { marginLeft: 16, flex: 1 },
    emptyText: { marginTop: 16, textAlign: 'center' },
    memberRow: { padding: 16, flexDirection: 'row', alignItems: 'center' },
    avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(37,99,235,0.1)', alignItems: 'center', justifyContent: 'center' },
    avatarText: { color: '#2563EB', fontWeight: 'bold', fontSize: 18 },
    memberInfo: { marginLeft: 16, flex: 1, minWidth: 0 },
    memberMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 4, flexWrap: 'wrap' },
    metaText: { marginRight: 12 },
    dot: { width: 4, height: 4, borderRadius: 2, marginRight: 12 },
});

