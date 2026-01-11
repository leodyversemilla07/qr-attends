import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Skeleton } from "@/components/ui/Skeleton";
import { MsHeading, MsText } from "@/components/ui/Typography";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/utils/auth-context";
import { useQuery } from "convex/react";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, RefreshControl, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: string; color: string }) {
  return (
    <Card className="flex-1 min-w-[45%] p-4">
      <View className="flex-row items-center justify-between">
        <View>
          <MsText variant="muted" className="text-xs">{label}</MsText>
          <MsHeading size="h2" className={color === "#2563EB" ? "text-primary" : ""}>{value}</MsHeading>
        </View>
        <View className={`w-10 h-10 rounded-full items-center justify-center`} style={{ backgroundColor: `${color}20` }}>
          <IconSymbol name={icon as any} size={20} color={color} />
        </View>
      </View>
    </Card>
  );
}

function QuickAction({ icon, label, color, onPress }: { icon: string; label: string; color: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className="items-center active:scale-95 transition-transform">
      <View className="w-14 h-14 rounded-2xl items-center justify-center mb-2" style={{ backgroundColor: `${color}15` }}>
        <IconSymbol name={icon as any} size={24} color={color} />
      </View>
      <MsText variant="small" className="text-center font-medium">{label}</MsText>
    </Pressable>
  );
}

function EventCard({ event }: { event: any }) {
  const eventDate = new Date(event.date);
  const isToday = eventDate.toDateString() === new Date().toDateString();
  const isTomorrow = eventDate.toDateString() === new Date(Date.now() + 86400000).toDateString();

  const dateLabel = isToday ? "Today" : isTomorrow ? "Tomorrow" : eventDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <Link href={`/event/${event._id}`} asChild>
      <Button variant="ghost" className="bg-white dark:bg-dark-card border border-border dark:border-dark-border rounded-2xl mb-4 h-auto items-start justify-start p-5 active:scale-[0.98] transition-all shadow-sm">
        <View className="w-full">
          <View className="flex-row justify-between items-start mb-3">
            <MsHeading size="h4" className="flex-1 mr-2">{event.name}</MsHeading>
            <View className={`px-2 py-1 rounded-lg ${isToday ? "bg-green-100 dark:bg-green-900/40" : "bg-primary/10"}`}>
              <MsText className={`${isToday ? "text-green-600 dark:text-green-400" : "text-primary"} font-bold text-xs`}>{event.time}</MsText>
            </View>
          </View>

          <View className="gap-2">
            <View className="flex-row items-center">
              <IconSymbol name="calendar" size={16} color="#64748B" />
              <MsText variant="muted" className="ml-2 text-sm">{dateLabel}</MsText>
            </View>

            <View className="flex-row items-center">
              <IconSymbol name="location" size={16} color="#64748B" />
              <MsText variant="muted" className="ml-2 text-sm">{event.location}</MsText>
            </View>
          </View>

          <View className="mt-4 pt-4 border-t border-slate-50 dark:border-dark-border flex-row justify-between items-center">
            <MsText variant="small" className="text-primary font-medium">View Details</MsText>
            <IconSymbol name="chevron.right" size={16} color="#2563EB" />
          </View>
        </View>
      </Button>
    </Link>
  );
}

export default function Home() {
  const { token, officer } = useAuth();
  const router = useRouter();
  const upcomingEvents = useQuery(api.events.getUpcoming);
  const recentEvents = useQuery(api.events.getRecent);
  const stats = useQuery(api.attendance.getStats, { token: token ?? undefined });
  const [refreshing, setRefreshing] = useState(false);

  const isLoading = upcomingEvents === undefined || stats === undefined;

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-dark-background" edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View className="flex-1 px-5 pt-4">
          <View className="flex-row items-center justify-between mb-6">
            <View>
              <MsHeading size="h1" className="text-primary">QR Attends</MsHeading>
              <MsText variant="muted">Welcome back, {officer?.name?.split(" ")[0] || "Officer"}</MsText>
            </View>
            <Pressable onPress={() => router.push({ pathname: "/search" } as any)} className="p-2 bg-white dark:bg-dark-card rounded-full border border-border dark:border-dark-border">
              <IconSymbol name="magnifyingglass" size={20} color="#2563EB" />
            </Pressable>
          </View>

          <View className="flex-row flex-wrap mb-6 gap-3">
            <StatCard label="Today" value={stats?.todayCheckIns || 0} icon="calendar" color="#10B981" />
            <StatCard label="Total" value={stats?.totalCheckIns || 0} icon="checkmark.circle.fill" color="#2563EB" />
            <StatCard label="Events" value={stats?.totalEvents || 0} icon="calendar.badge.clock" color="#8B5CF6" />
            <StatCard label="Members" value={stats?.totalMembers || 0} icon="person.2.fill" color="#F59E0B" />
          </View>

          <View className="mb-6">
            <MsHeading size="h3" className="mb-4">Quick Actions</MsHeading>
            <View className="flex-row justify-between">
              <QuickAction 
                icon="plus.circle.fill" 
                label="New Event" 
                color="#2563EB" 
                onPress={() => router.push({ pathname: "/create-event" } as any)}
              />
              <QuickAction 
                icon="person.badge.plus.fill" 
                label="Add Member" 
                color="#10B981" 
                onPress={() => router.push({ pathname: "/register-member" } as any)}
              />
              <QuickAction 
                icon="square.and.arrow.down" 
                label="Import CSV" 
                color="#F59E0B" 
                onPress={() => router.push({ pathname: "/import-members" } as any)}
              />
              <QuickAction 
                icon="chart.bar.xaxis" 
                label="Reports" 
                color="#8B5CF6" 
                onPress={() => router.push({ pathname: "/reports" } as any)}
              />
            </View>
          </View>

          <View className="flex-row justify-between items-center mb-4">
            <MsHeading size="h3">Upcoming Events</MsHeading>
            <Link href="/create-event" asChild>
              <Pressable className="flex-row items-center px-2 py-1">
                <MsText variant="small" className="text-primary font-medium">See All</MsText>
                <IconSymbol name="chevron.right" size={14} color="#2563EB" />
              </Pressable>
            </Link>
          </View>

          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <View key={i} className="bg-white dark:bg-dark-card border border-border dark:border-dark-border rounded-2xl mb-4 p-5 shadow-sm">
                <View className="flex-row justify-between items-start mb-4">
                  <Skeleton height={24} width="60%" />
                  <Skeleton height={20} width={60} />
                </View>
                <View className="gap-3">
                  <Skeleton height={16} width="40%" />
                  <Skeleton height={16} width="50%" />
                </View>
              </View>
            ))
          ) : upcomingEvents && upcomingEvents.length > 0 ? (
            upcomingEvents.map((event) => <EventCard key={event._id} event={event} />)
          ) : recentEvents && recentEvents.length > 0 ? (
            <>
              <MsText variant="muted" className="mb-4">No upcoming events. Recent events:</MsText>
              <View className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-xl mb-4">
                <MsText variant="small" className="text-blue-800 dark:text-blue-200">Tip: Create a new event to get started with attendance tracking.</MsText>
              </View>
              {recentEvents.slice(0, 2).map((event) => <EventCard key={event._id} event={event} />)}
            </>
          ) : (
            <Card className="items-center py-12">
              <IconSymbol name="plus.circle.fill" size={48} color="#94A3B8" />
              <MsText variant="muted" className="mt-4 text-center">No events found.{"\n"}Create one to get started!</MsText>
              <Link href="/create-event" asChild>
                <Button variant="primary" className="mt-4">Create Event</Button>
              </Link>
            </Card>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
