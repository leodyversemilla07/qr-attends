import { Card } from "@/components/ui/card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Input } from "@/components/ui/input";
import { MsHeading, MsText } from "@/components/ui/typography";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SearchScreen() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");

    const handleSearch = () => {
        if (searchTerm.trim()) {
            router.push({ pathname: "/search-results", params: { query: searchTerm } } as any);
        }
    };

    const recentSearches = [
        { id: "1", title: "General Meeting", type: "event" },
        { id: "2", title: "John Smith", type: "member" },
        { id: "3", title: "Chapter Meeting", type: "event" },
    ];

    const suggestions = [
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
        <SafeAreaView className="flex-1 bg-background dark:bg-dark-background" edges={['top']}>
            <View className="flex-1 px-5 pt-4">
                <View className="flex-row items-center justify-between mb-4">
                    <Pressable 
                        onPress={handleBack} 
                        className="w-10 h-10 items-center justify-center rounded-full bg-slate-100 dark:bg-dark-muted active:bg-slate-200 dark:active:bg-dark-border"
                    >
                        <IconSymbol name="chevron.left" size={24} color="#64748B" />
                    </Pressable>
                    <MsHeading size="h2">Search</MsHeading>
                    <View className="w-10" />
                </View>

                <Input
                    placeholder="Search events, members..."
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                    autoFocus
                    onSubmitEditing={handleSearch}
                    className="mb-6"
                />

                {searchTerm.length === 0 ? (
                    <>
                        <MsHeading size="h4" className="mb-3 ml-1">Quick Actions</MsHeading>
                        <View className="flex-row flex-wrap mb-6" style={{ marginHorizontal: -6 }}>
                            {suggestions.map((item) => (
                                <View key={item.id} className="w-1/2 p-1.5">
                                    <Pressable
                                        onPress={() => router.push({ pathname: item.action } as any)}
                                        className="active:scale-95"
                                    >
                                        <Card className="p-4 flex-row items-center">
                                            <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: `${item.color}15` }}>
                                                <IconSymbol name={item.icon as any} size={20} color={item.color} />
                                            </View>
                                            <MsText className="font-medium flex-1" numberOfLines={1}>{item.title}</MsText>
                                        </Card>
                                    </Pressable>
                                </View>
                            ))}
                        </View>

                        <MsHeading size="h4" className="mb-3 ml-1">Recent Searches</MsHeading>
                        <Card className="p-0 overflow-hidden">
                            {recentSearches.map((item, index) => (
                                <Pressable 
                                    key={item.id} 
                                    className={`p-4 flex-row items-center justify-between ${index < recentSearches.length - 1 ? 'border-b border-border dark:border-dark-border' : ''}`}
                                    onPress={() => setSearchTerm(item.title)}
                                >
                                    <View className="flex-row items-center">
                                        <IconSymbol name="clock" size={18} color="#94A3B8" />
                                        <MsText className="ml-3">{item.title}</MsText>
                                    </View>
                                    <IconSymbol name="chevron.right" size={16} color="#CBD5E1" />
                                </Pressable>
                            ))}
                        </Card>
                    </>
                ) : (
                    <Pressable onPress={handleSearch}>
                        <Card className="p-4 flex-row items-center">
                            <IconSymbol name="magnifyingglass" size={20} color="#2563EB" />
                            <MsText className="ml-3 text-primary">Search for &quot;{searchTerm}&quot;</MsText>
                        </Card>
                    </Pressable>
                )}
            </View>
        </SafeAreaView>
    );
}
