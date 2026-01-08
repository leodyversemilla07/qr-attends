import { useQuery } from "convex/react";
import { Link } from "expo-router";
import { ScrollView, View } from "react-native";
// We import from the root convex folder. 
// Ensure 'npx convex dev' has been run in the root to generate this.
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Skeleton } from "@/components/ui/Skeleton";
import { MsHeading, MsText } from "@/components/ui/Typography";
import { api } from "@/convex/_generated/api";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
  const events = useQuery(api.events.list);

  const isLoading = events === undefined;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-1 px-5 pt-4">
        <MsHeading size="h1" className="mb-6 text-primary">QR Attends</MsHeading>

        <View className="flex-row justify-between items-center mb-6">
          <MsHeading size="h3">Upcoming Events</MsHeading>
          <Link href="/create-event" asChild>
            <Button size="sm" variant="outline" className="flex-row items-center border-primary/20 bg-primary/5">
              <IconSymbol name="plus.circle.fill" size={16} color="#2563EB" />
              <MsText className="ml-2 text-primary font-bold">New Event</MsText>
            </Button>
          </Link>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {isLoading ? (
            // Skeleton State
            Array(4).fill(0).map((_, i) => (
              <View key={i} className="bg-white border border-border rounded-2xl mb-4 p-5 shadow-sm">
                <View className="flex-row justify-between items-start mb-4">
                  <Skeleton height={24} width="60%" />
                  <Skeleton height={20} width={60} />
                </View>
                <View className="gap-3">
                  <Skeleton height={16} width="40%" />
                  <Skeleton height={16} width="50%" />
                </View>
                <View className="mt-4 pt-4 border-t border-slate-50 flex-row justify-between items-center">
                  <Skeleton height={16} width={100} />
                  <Skeleton height={16} width={16} className="rounded-full" />
                </View>
              </View>
            ))
          ) : events.length === 0 ? (
            <Card className="items-center py-12">
              <IconSymbol name="plus.circle.fill" size={48} color="#94A3B8" />
              <MsText variant="muted" className="mt-4 text-center">No events found.{"\n"}Create one to get started!</MsText>
            </Card>
          ) : (
            events.map((event) => (
              <Link key={event._id} href={`/event/${event._id}`} asChild>
                <Button variant="ghost" className="bg-white border border-border rounded-2xl mb-4 h-auto items-start justify-start p-5 active:scale-[0.98] transition-all shadow-sm">
                  <View className="w-full">
                    <View className="flex-row justify-between items-start mb-3">
                      <MsHeading size="h4" className="flex-1 mr-2">{event.name}</MsHeading>
                      <View className="bg-primary/10 px-2 py-1 rounded-lg">
                        <MsText className="text-primary font-bold text-xs">{event.time}</MsText>
                      </View>
                    </View>

                    <View className="gap-2">
                      <View className="flex-row items-center">
                        <IconSymbol name="calendar" size={16} color="#64748B" />
                        <MsText variant="muted" className="ml-2 text-sm">
                          {new Date(event.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </MsText>
                      </View>

                      <View className="flex-row items-center">
                        <IconSymbol name="location" size={16} color="#64748B" />
                        <MsText variant="muted" className="ml-2 text-sm">{event.location}</MsText>
                      </View>
                    </View>

                    <View className="mt-4 pt-4 border-t border-slate-50 flex-row justify-between items-center">
                      <MsText variant="small" className="text-primary font-medium">View Details</MsText>
                      <IconSymbol name="chevron.right" size={16} color="#2563EB" />
                    </View>
                  </View>
                </Button>
              </Link>
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
