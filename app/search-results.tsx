import { Card } from "@/components/ui/card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { MsHeading, MsText } from "@/components/ui/typography";
import { useTheme } from "react-native-paper";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/utils/auth-context";
import { useQuery } from "convex/react";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface SearchResultEvent { _id: string; name: string; date: string; time: string; location: string; }
interface SearchResultMember { _id: string; firstName: string; lastName: string; studentId: string; yearSection: string; }
interface SearchResults { events: SearchResultEvent[]; members: SearchResultMember[]; }

export default function SearchResultsScreen() {
    const router = useRouter();
    const { token } = useAuth();
    const params = useLocalSearchParams();
    const query = typeof params.query === "string" ? params.query : "";
    const { colors, dark: isDark } = useTheme();

    const results = useQuery(api.search.globalSearch, token ? { token, searchTerm: query || undefined } : "skip") as SearchResults | undefined;
    const isLoading = results === undefined;

    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

    const handleBack = () => router.canGoBack() ? router.back() : router.replace("/(tabs)");
    const renderItem = () => null;

    const slateLight = isDark ? colors.surfaceVariant : "#F1F5F9";
    const borderColor = colors.outline;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Pressable onPress={handleBack} style={[styles.iconBtn, { backgroundColor: slateLight }]}>
                        <IconSymbol name="chevron.left" size={24} color="#64748B" />
                    </Pressable>
                    <MsHeading size="h2">Results</MsHeading>
                    <Pressable onPress={() => router.replace("/(tabs)")} style={[styles.iconBtn, { backgroundColor: slateLight }]}>
                        <IconSymbol name="xmark" size={20} color="#64748B" />
                    </Pressable>
                </View>

                <Pressable
                    onPress={() => router.push({ pathname: "/search" } as any)}
                    style={[styles.searchBar, { backgroundColor: slateLight }]}
                >
                    <IconSymbol name="magnifyingglass" size={18} color="#64748B" />
                    <MsText style={{ marginLeft: 12, flex: 1, color: colors.onBackground }}>{query}</MsText>
                </Pressable>

                {isLoading ? (
                    <View style={{ flex: 1 }}>
                        {[1, 2, 3].map((i) => (
                            <Card key={i} style={{ padding: 16, marginBottom: 12 }}>
                                <View style={styles.skeletonRow}>
                                    <View style={[styles.skeletonCircle, { backgroundColor: isDark ? colors.outline : "#E2E8F0" }]} />
                                    <View style={{ flex: 1 }}>
                                        <View style={[styles.skeletonLine, { width: 96, backgroundColor: isDark ? colors.outline : "#E2E8F0", marginBottom: 8 }]} />
                                        <View style={[styles.skeletonLine, { width: 128, backgroundColor: isDark ? colors.outline : "#E2E8F0" }]} />
                                    </View>
                                </View>
                            </Card>
                        ))}
                    </View>
                ) : (
                    <FlatList
                        data={[]}
                        renderItem={renderItem}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 100 }}
                        ListHeaderComponent={
                            <>
                                {results?.events && results.events.length > 0 && (
                                    <>
                                        <MsHeading size="h4" style={{ marginBottom: 12, marginLeft: 4 }}>Events ({results.events.length})</MsHeading>
                                        {results.events.map((event) => (
                                            <Link key={event._id} href={`/event/${event._id}`} asChild>
                                                <Pressable style={{ marginBottom: 12 }}>
                                                    <Card style={styles.resultCard}>
                                                        <View style={[styles.resultIcon, { backgroundColor: "#EFF6FF" }]}>
                                                            <IconSymbol name="calendar" size={20} color="#2563EB" />
                                                        </View>
                                                        <View style={{ flex: 1 }}>
                                                            <MsHeading size="h4">{event.name}</MsHeading>
                                                            <MsText variant="small" style={{ color: colors.onSurfaceVariant }}>
                                                                {formatDate(event.date)} at {event.time}
                                                            </MsText>
                                                        </View>
                                                        <IconSymbol name="chevron.right" size={16} color="#CBD5E1" />
                                                    </Card>
                                                </Pressable>
                                            </Link>
                                        ))}
                                    </>
                                )}
                                {results?.members && results.members.length > 0 && (
                                    <>
                                        <MsHeading size="h4" style={{ marginBottom: 12, marginLeft: 4, marginTop: 16 }}>Members ({results.members.length})</MsHeading>
                                        {results.members.map((member) => (
                                            <Link key={member._id} href={`/member/${member._id}`} asChild>
                                                <Pressable style={{ marginBottom: 12 }}>
                                                    <Card style={styles.resultCard}>
                                                        <View style={[styles.resultIcon, { backgroundColor: isDark ? "#14532D40" : "#DCFCE7" }]}>
                                                            <MsText style={{ color: isDark ? "#86EFAC" : "#16A34A", fontWeight: "700" }}>
                                                                {member.firstName[0]}{member.lastName[0]}
                                                            </MsText>
                                                        </View>
                                                        <View style={{ flex: 1 }}>
                                                            <MsHeading size="h4">{member.firstName} {member.lastName}</MsHeading>
                                                            <MsText variant="small" style={{ color: colors.onSurfaceVariant }}>
                                                                {member.studentId} • {member.yearSection}
                                                            </MsText>
                                                        </View>
                                                        <IconSymbol name="chevron.right" size={16} color="#CBD5E1" />
                                                    </Card>
                                                </Pressable>
                                            </Link>
                                        ))}
                                    </>
                                )}
                                {results && results.events.length === 0 && results.members.length === 0 && (
                                    <Card style={{ padding: 32, alignItems: "center" }}>
                                        <IconSymbol name="magnifyingglass" size={48} color="#94A3B8" />
                                        <MsText variant="muted" style={{ marginTop: 16, textAlign: "center" }}>
                                            No results found for &ldquo;{query}&rdquo;
                                        </MsText>
                                    </Card>
                                )}
                            </>
                        }
                    />
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
    searchBar: { flexDirection: "row", alignItems: "center", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 16 },
    resultCard: { padding: 16, flexDirection: "row", alignItems: "center" },
    resultIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", marginRight: 12 },
    skeletonRow: { flexDirection: "row", alignItems: "center" },
    skeletonCircle: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
    skeletonLine: { height: 12, borderRadius: 6 },
});
