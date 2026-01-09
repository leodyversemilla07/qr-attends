import { Card } from "@/components/ui/Card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { MsHeading, MsText } from "@/components/ui/Typography";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { FlatList, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface SearchResultEvent {
    _id: string;
    name: string;
    date: string;
    time: string;
    location: string;
}

interface SearchResultMember {
    _id: string;
    firstName: string;
    lastName: string;
    studentId: string;
    yearSection: string;
}

interface SearchResults {
    events: SearchResultEvent[];
    members: SearchResultMember[];
}

export default function SearchResultsScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const query = typeof params.query === 'string' ? params.query : "";
    const [searchTerm, setSearchTerm] = useState(query);

    const results = useQuery(api.search.globalSearch, { 
        searchTerm: searchTerm || undefined 
    }) as SearchResults | undefined;

    const isLoading = results === undefined;

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
        });
    };

    const handleSearch = () => {
        if (searchTerm.trim()) {
            router.replace({ pathname: "/search-results", params: { query: searchTerm } } as any);
        }
    };

    const renderItem = () => null;

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top']}>
            <View className="flex-1 px-5 pt-4">
                <View className="flex-row items-center justify-between mb-4">
                    <Pressable onPress={() => router.back()} className="p-2 -ml-2">
                        <IconSymbol name="chevron.left" size={24} color="#64748B" />
                    </Pressable>
                    <MsHeading size="h2">Results</MsHeading>
                    <Pressable onPress={() => router.push({ pathname: "/search" } as any)} className="p-2">
                        <IconSymbol name="xmark" size={20} color="#64748B" />
                    </Pressable>
                </View>

                <Pressable 
                    onPress={handleSearch}
                    className="bg-slate-100 rounded-2xl px-4 py-3 flex-row items-center mb-4"
                >
                    <IconSymbol name="magnifyingglass" size={18} color="#64748B" />
                    <Pressable 
                        className="flex-1 ml-3"
                        onPress={() => router.push({ pathname: "/search" } as any)}
                    >
                        <MsText className="text-foreground">{searchTerm}</MsText>
                    </Pressable>
                </Pressable>

                {isLoading ? (
                    <View className="flex-1">
                        {[1, 2, 3].map((i) => (
                            <Card key={i} className="p-4 mb-3">
                                <View className="flex-row items-center">
                                    <View className="w-10 h-10 rounded-full bg-gray-200 animate-pulse mr-3" />
                                    <View className="flex-1">
                                        <View className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2" />
                                        <View className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
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
                                        <MsHeading size="h4" className="mb-3 ml-1">Events ({results.events.length})</MsHeading>
                                        {results.events.map((event) => (
                                            <Link key={event._id} href={`/event/${event._id}`} asChild>
                                                <Pressable className="mb-3">
                                                    <Card className="p-4 flex-row items-center">
                                                        <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mr-3">
                                                            <IconSymbol name="calendar" size={20} color="#2563EB" />
                                                        </View>
                                                        <View className="flex-1">
                                                            <MsHeading size="h4">{event.name}</MsHeading>
                                                            <MsText variant="small" className="text-muted-foreground">
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
                                        <MsHeading size="h4" className="mb-3 ml-1 mt-4">Members ({results.members.length})</MsHeading>
                                        {results.members.map((member) => (
                                            <Link key={member._id} href={`/member/${member._id}`} asChild>
                                                <Pressable className="mb-3">
                                                    <Card className="p-4 flex-row items-center">
                                                        <View className="w-10 h-10 rounded-full bg-green-500/10 items-center justify-center mr-3">
                                                            <MsText className="text-green-600 font-bold">
                                                                {member.firstName[0]}{member.lastName[0]}
                                                            </MsText>
                                                        </View>
                                                        <View className="flex-1">
                                                            <MsHeading size="h4">{member.firstName} {member.lastName}</MsHeading>
                                                            <MsText variant="small" className="text-muted-foreground">
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
                                    <Card className="p-8 items-center">
                                        <IconSymbol name="magnifyingglass" size={48} color="#94A3B8" />
                                        <MsText variant="muted" className="mt-4 text-center">
                                            No results found for "{searchTerm}"
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
