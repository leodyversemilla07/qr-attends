import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Skeleton } from "@/components/ui/skeleton";
import { MsHeading, MsText } from "@/components/ui/typography";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/utils/auth-context";
import { useTheme } from "react-native-paper";
import { useQuery } from "convex/react";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { TouchableRipple } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: string; color: string }) {
  return (
    <Card style={{ flex: 1, minWidth: '45%' }} contentStyle={{ padding: 0 }} mode="elevated">
      <View style={styles.statCardInner}>
        <View>
          <MsText variant="muted" style={styles.textXs}>{label}</MsText>
          <MsHeading size="h2" style={{ color }}>{value}</MsHeading>
        </View>
        <View style={[styles.iconCircle, { backgroundColor: `${color}20` }]}>
          <IconSymbol name={icon as any} size={20} color={color} />
        </View>
      </View>
    </Card>
  );
}

function QuickAction({ icon, label, color, onPress }: { icon: string; label: string; color: string; onPress: () => void }) {
  return (
    <View style={styles.quickActionWrapper}>
      <TouchableRipple onPress={onPress} style={styles.quickActionRipple} borderless>
        <View style={styles.quickActionContent}>
          <View style={[styles.quickActionIcon, { backgroundColor: `${color}15` }]}>
            <IconSymbol name={icon as any} size={24} color={color} />
          </View>
          <MsText variant="small" style={styles.textCenter}>{label}</MsText>
        </View>
      </TouchableRipple>
    </View>
  );
}

function EventCard({ event }: { event: any }) {
  const router = useRouter();
  const { colors, dark: isDark } = useTheme();
  const eventDate = new Date(event.date);
  const isToday = eventDate.toDateString() === new Date().toDateString();
  const isTomorrow = eventDate.toDateString() === new Date(Date.now() + 86400000).toDateString();
  const dateLabel = isToday ? "Today" : isTomorrow ? "Tomorrow" : eventDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <Card style={{ marginBottom: 16 }} contentStyle={{ padding: 0 }} mode="outlined">
      <TouchableRipple onPress={() => router.push(`/event/${event._id}`)} style={styles.eventRipple}>
        <View>
          <View style={styles.eventHeader}>
            <MsHeading size="h4" style={{ flex: 1, marginRight: 8 }}>{event.name}</MsHeading>
            <View style={[styles.timeBadge, { backgroundColor: isToday ? (isDark ? 'rgba(34,197,94,0.4)' : '#DCFCE7') : '#2563EB18' }]}>
              <MsText style={{ color: isToday ? (isDark ? '#86EFAC' : '#16A34A') : '#2563EB', fontWeight: 'bold', fontSize: 12 }}>{event.time}</MsText>
            </View>
          </View>
          <View style={{ gap: 8 }}>
            <View style={styles.row}>
              <IconSymbol name="calendar" size={16} color={colors.onSurfaceVariant} />
              <MsText variant="muted" style={styles.ml2sm}>{dateLabel}</MsText>
            </View>
            <View style={styles.row}>
              <IconSymbol name="location" size={16} color={colors.onSurfaceVariant} />
              <MsText variant="muted" style={styles.ml2sm}>{event.location}</MsText>
            </View>
          </View>
          <View style={[styles.eventFooter, { borderTopColor: colors.outline }]}>
            <MsText variant="small" style={styles.textPrimary}>View Details</MsText>
            <IconSymbol name="chevron.right" size={16} color="#2563EB" />
          </View>
        </View>
      </TouchableRipple>
    </Card>
  );
}

export default function Home() {
  const { token, officer } = useAuth();
  const { colors, dark: isDark } = useTheme();
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
    <SafeAreaView style={[styles.flex1, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.container}>
          <View style={[styles.row, styles.headerRow]}>
            <View>
              <MsHeading size="h1" style={styles.textPrimary}>QR Attends</MsHeading>
              <MsText variant="muted">Welcome back, {officer?.name?.split(" ")[0] || "Officer"}</MsText>
            </View>
            <Pressable
              onPress={() => router.push({ pathname: "/search" } as any)}
              style={[styles.searchBtn, { backgroundColor: colors.surface, borderColor: colors.outline }]}
            >
              <IconSymbol name="magnifyingglass" size={20} color="#2563EB" />
            </Pressable>
          </View>

          <View style={styles.statsRow}>
            <StatCard label="Today" value={stats?.todayCheckIns || 0} icon="calendar" color="#10B981" />
            <StatCard label="Total" value={stats?.totalCheckIns || 0} icon="checkmark.circle.fill" color="#2563EB" />
            <StatCard label="Events" value={stats?.totalEvents || 0} icon="calendar.badge.clock" color="#8B5CF6" />
            <StatCard label="Members" value={stats?.totalMembers || 0} icon="person.2.fill" color="#F59E0B" />
          </View>

          <View style={styles.section}>
            <MsHeading size="h3" style={styles.mb4}>Quick Actions</MsHeading>
            <View style={styles.quickActionsRow}>
              <QuickAction icon="plus.circle.fill" label="New Event" color="#2563EB" onPress={() => router.push({ pathname: "/create-event" } as any)} />
              <QuickAction icon="person.badge.plus.fill" label="Add Member" color="#10B981" onPress={() => router.push({ pathname: "/register-member" } as any)} />
              <QuickAction icon="square.and.arrow.down" label="Import CSV" color="#F59E0B" onPress={() => router.push({ pathname: "/import-members" } as any)} />
              <QuickAction icon="chart.bar.xaxis" label="Reports" color="#8B5CF6" onPress={() => router.push({ pathname: "/reports" } as any)} />
            </View>
          </View>

          <View style={[styles.row, styles.sectionHeader]}>
            <MsHeading size="h3">Upcoming Events</MsHeading>
            <Link href="/create-event" asChild>
              <Pressable style={styles.row}>
                <MsText variant="small" style={styles.textPrimary}>See All</MsText>
                <IconSymbol name="chevron.right" size={14} color="#2563EB" />
              </Pressable>
            </Link>
          </View>

          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <View key={i} style={[styles.skeletonCard, { backgroundColor: colors.surface, borderColor: colors.outline }]}>
                <View style={[styles.row, styles.skeletonHeader]}>
                  <Skeleton height={24} width="60%" />
                  <Skeleton height={20} width={60} />
                </View>
                <View style={{ gap: 12 }}>
                  <Skeleton height={16} width="40%" />
                  <Skeleton height={16} width="50%" />
                </View>
              </View>
            ))
          ) : upcomingEvents && upcomingEvents.length > 0 ? (
            upcomingEvents.map((event) => <EventCard key={event._id} event={event} />)
          ) : recentEvents && recentEvents.length > 0 ? (
            <>
              <MsText variant="muted" style={styles.mb4}>No upcoming events. Recent events:</MsText>
              <View style={[styles.tipBox, { backgroundColor: isDark ? 'rgba(37,99,235,0.3)' : '#EFF6FF', borderColor: isDark ? 'rgba(37,99,235,0.5)' : '#BFDBFE' }]}>
                <MsText variant="small" style={{ color: isDark ? '#93C5FD' : '#1D4ED8' }}>Tip: Create a new event to get started with attendance tracking.</MsText>
              </View>
              {recentEvents.slice(0, 2).map((event) => <EventCard key={event._id} event={event} />)}
            </>
          ) : (
            <Card contentStyle={{ alignItems: 'center', paddingVertical: 48 }}>
              <IconSymbol name="plus.circle.fill" size={48} color="#94A3B8" />
              <MsText variant="muted" style={[styles.mt4, styles.textCenter]}>No events found.{"\n"}Create one to get started!</MsText>
              <Link href="/create-event" asChild>
                <Button variant="primary" style={{ marginTop: 16 }}>Create Event</Button>
              </Link>
            </Card>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
  row: { flexDirection: 'row', alignItems: 'center' },
  headerRow: { justifyContent: 'space-between', marginBottom: 24 },
  searchBtn: { padding: 8, borderRadius: 9999, borderWidth: 1 },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 24, gap: 12 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  statCardInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  textXs: { fontSize: 12 },
  section: { marginBottom: 24 },
  mb4: { marginBottom: 16 },
  mt4: { marginTop: 16 },
  quickActionsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  quickActionWrapper: { alignItems: 'center', borderRadius: 16, overflow: 'hidden' },
  quickActionRipple: { padding: 8, alignItems: 'center' },
  quickActionContent: { alignItems: 'center' },
  quickActionIcon: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  sectionHeader: { justifyContent: 'space-between', marginBottom: 16 },
  eventRipple: { padding: 20 },
  eventHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  timeBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  eventFooter: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ml2sm: { marginLeft: 8, fontSize: 14 },
  textPrimary: { color: '#2563EB' },
  textCenter: { textAlign: 'center' },
  skeletonCard: { borderWidth: 1, borderRadius: 16, marginBottom: 16, padding: 20 },
  skeletonHeader: { justifyContent: 'space-between', marginBottom: 16 },
  tipBox: { padding: 12, borderRadius: 12, marginBottom: 16, borderWidth: 1 },
});


