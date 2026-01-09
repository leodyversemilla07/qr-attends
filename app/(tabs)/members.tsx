import { Card } from "@/components/ui/Card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Skeleton } from "@/components/ui/Skeleton";
import { MsHeading, MsText } from "@/components/ui/Typography";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { useState } from "react";
import { FlatList, Pressable, RefreshControl, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FilterModal, FilterOptions } from "@/components/FilterModal";

export default function MembersScreen() {
    const router = useRouter();
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

    const stats = {
        total: members?.length || 0,
    };

    const handleApplyFilters = (newFilters: FilterOptions) => {
        setFilters(newFilters);
    };

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top']}>
            <View className="flex-1 px-5 pt-4">
                <View className="flex-row items-center justify-between mb-4">
                    <MsHeading size="h2">Members</MsHeading>
                    <View className="flex-row items-center gap-2">
                        {filters.yearSection && (
                            <View className="bg-primary/10 px-3 py-1 rounded-full">
                                <MsText variant="small" className="text-primary font-medium">{filters.yearSection}</MsText>
                            </View>
                        )}
                        <Pressable onPress={() => setFilterModalVisible(true)} className="p-2 bg-slate-100 rounded-full">
                            <IconSymbol name="list.bullet.rectangle.fill" size={18} color="#64748B" />
                        </Pressable>
                    </View>
                </View>

                <View className="flex-row items-center bg-slate-100 rounded-2xl px-4 py-3 mb-4">
                    <IconSymbol name="magnifyingglass" size={18} color="#64748B" />
                    <TextInput
                        placeholder="Search by name, ID, card, or section..."
                        className="flex-1 ml-3 text-base text-foreground font-sans"
                        value={search}
                        onChangeText={setSearch}
                        placeholderTextColor="#94A3B8"
                    />
                    {search.length > 0 && (
                        <Pressable onPress={() => setSearch("")}>
                            <IconSymbol name="xmark.circle.fill" size={18} color="#94A3B8" />
                        </Pressable>
                    )}
                </View>

                {isLoading ? (
                    <FlatList
                        data={Array(6).fill(0)}
                        keyExtractor={(_, i) => i.toString()}
                        renderItem={() => (
                            <View className="bg-white border border-border rounded-2xl mb-4 p-4 flex-row items-center shadow-sm">
                                <Skeleton height={48} width={48} className="rounded-full" />
                                <View className="ml-4 flex-1 gap-2">
                                    <Skeleton height={20} width="60%" />
                                    <Skeleton height={16} width="40%" />
                                </View>
                            </View>
                        )}
                    />
                ) : members?.length === 0 ? (
                    <Card className="items-center py-12">
                        <IconSymbol name="person.2.fill" size={48} color="#94A3B8" />
                        <MsText variant="muted" className="mt-4 text-center">
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
                            <Pressable
                                onPress={() => router.push({ pathname: "/member/[id]", params: { id: item._id } } as any)}
                                className="active:opacity-70 transition-opacity mb-4"
                            >
                                <View className="bg-white border border-border rounded-2xl p-4 flex-row items-center shadow-sm">
                                    <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center">
                                        <MsText className="text-primary font-bold text-lg">
                                            {item.firstName[0]}{item.lastName[0]}
                                        </MsText>
                                    </View>

                                    <View className="ml-4 flex-1">
                                        <MsHeading size="h4">{item.firstName} {item.lastName}</MsHeading>
                                        <View className="flex-row items-center mt-1">
                                            <MsText variant="small" className="text-muted-foreground mr-3">{item.studentId}</MsText>
                                            <View className="w-1 h-1 rounded-full bg-slate-300 mr-3" />
                                            <MsText variant="small" className="text-muted-foreground">{item.yearSection}</MsText>
                                        </View>
                                    </View>

                                    <IconSymbol name="chevron.right" size={16} color="#CBD5E1" />
                                </View>
                            </Pressable>
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
