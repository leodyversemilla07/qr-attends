import { Card } from "@/components/ui/Card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Skeleton } from "@/components/ui/Skeleton";
import { MsHeading, MsText } from "@/components/ui/Typography";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useState } from "react";
import { FlatList, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MembersScreen() {
    const members = useQuery(api.members.list);
    const [search, setSearch] = useState("");

    const isLoading = members === undefined;

    const filteredMembers = members?.filter(member =>
        `${member.firstName} ${member.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        member.studentId.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top']}>
            <View className="flex-1 px-5 pt-4">
                <MsHeading size="h2" className="mb-6">Members</MsHeading>

                {/* Search Bar */}
                <View className="flex-row items-center bg-slate-100 rounded-2xl px-4 py-3 mb-6">
                    <IconSymbol name="paperplane.fill" size={18} color="#64748B" style={{ transform: [{ rotate: '45deg' }] }} />
                    <TextInput
                        placeholder="Search by name or student ID..."
                        className="flex-1 ml-3 text-base text-foreground font-sans"
                        value={search}
                        onChangeText={setSearch}
                        placeholderTextColor="#94A3B8"
                    />
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
                ) : filteredMembers?.length === 0 ? (
                    <Card className="items-center py-12">
                        <IconSymbol name="person.2.fill" size={48} color="#94A3B8" />
                        <MsText variant="muted" className="mt-4 text-center">
                            {search ? "No members match your search." : "No members registered yet."}
                        </MsText>
                    </Card>
                ) : (
                    <FlatList
                        data={filteredMembers}
                        keyExtractor={(item) => item._id}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 100 }}
                        renderItem={({ item }) => (
                            <View className="bg-white border border-border rounded-2xl mb-4 p-4 flex-row items-center shadow-sm">
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
                        )}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}
