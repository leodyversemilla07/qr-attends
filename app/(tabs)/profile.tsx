import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { MsHeading, MsText } from "@/components/ui/typography";
import { useAuth } from "@/utils/auth-context";
import { useAppTheme } from "@/utils/theme-context";
import { useRouter } from "expo-router";
import { Alert, Pressable, ScrollView, StyleSheet, Switch, View } from "react-native";
import { useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Profile() {
    const { officer, signOut, notificationsEnabled, toggleNotifications } = useAuth();
    const { theme, toggleTheme } = useAppTheme();
    const { colors, dark: isDark } = useTheme();
    const router = useRouter();

    if (!officer) return null;

    const handleSignOut = () => {
        Alert.alert("Sign Out", "Are you sure you want to sign out?", [
            { text: "Cancel", style: "cancel" },
            { text: "Sign Out", style: "destructive", onPress: () => signOut() }
        ]);
    };

    return (
        <SafeAreaView style={[styles.flex1, { backgroundColor: colors.background }]} edges={['top']}>
            <ScrollView style={styles.flex1} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                <MsHeading size="h2" style={styles.mb6}>Profile</MsHeading>

                <Card contentStyle={{ alignItems: 'center', paddingVertical: 24 }} style={[styles.mb6, { backgroundColor: isDark ? 'rgba(37,99,235,0.1)' : 'rgba(37,99,235,0.05)' }]} mode="outlined">
                    <View style={styles.avatar}>
                        <IconSymbol name="person.fill" size={48} color="white" />
                    </View>
                    <MsHeading size="h3">{officer.name}</MsHeading>
                    <MsText variant="muted" style={styles.mb1}>{officer.role}</MsText>
                    <MsText variant="small" style={styles.textPrimary}>Official Officer</MsText>
                </Card>

                <View style={[styles.row, styles.mb6, { gap: 16 }]}>
                    <Pressable onPress={() => router.navigate({ pathname: "/reports" } as any)} style={{ flex: 1 }}>
                        <Card contentStyle={{ alignItems: 'center', paddingVertical: 16 }}>
                            <IconSymbol name="chart.bar.xaxis" size={24} color="#2563EB" />
                            <MsHeading size="h4" style={[styles.mt2, styles.textPrimary]}>Reports</MsHeading>
                        </Card>
                    </Pressable>
                    <Card style={{ flex: 1 }} contentStyle={{ alignItems: 'center', paddingVertical: 16 }}>
                        <MsHeading size="h3" style={styles.textPrimary}>{officer.role}</MsHeading>
                        <MsText variant="small">Role</MsText>
                    </Card>
                </View>

                <MsHeading size="h4" style={styles.sectionLabel}>Settings</MsHeading>
                <Card contentStyle={{ padding: 0 }} style={styles.mb6}>
                    <View style={[styles.settingsRow, { borderBottomColor: colors.outline }]}>
                        <View style={styles.row}>
                            <IconSymbol name="bell.fill" size={20} color={colors.onSurfaceVariant} />
                            <MsText style={styles.ml3}>Push Notifications</MsText>
                        </View>
                        <Switch value={notificationsEnabled} onValueChange={toggleNotifications} trackColor={{ false: "#E2E8F0", true: "#2563EB" }} />
                    </View>
                    <View style={[styles.settingsRow, { borderBottomColor: colors.outline }]}>
                        <View style={styles.row}>
                            <IconSymbol name="moon.fill" size={20} color={colors.onSurfaceVariant} />
                            <MsText style={styles.ml3}>Dark Mode</MsText>
                        </View>
                        <Switch value={theme === "dark"} onValueChange={toggleTheme} trackColor={{ false: "#E2E8F0", true: "#2563EB" }} />
                    </View>
                    <Pressable style={styles.settingsRowLast}>
                        <View style={styles.row}>
                            <IconSymbol name="envelope.fill" size={20} color={colors.onSurfaceVariant} />
                            <MsText style={styles.ml3}>Email</MsText>
                        </View>
                        <View style={styles.row}>
                            <MsText variant="muted" numberOfLines={1} style={styles.emailText}>{officer.email}</MsText>
                            <IconSymbol name="chevron.right" size={16} color="#CBD5E1" />
                        </View>
                    </Pressable>
                </Card>

                {(officer.role === "President" || officer.role === "Admin") && (
                    <>
                        <MsHeading size="h4" style={styles.sectionLabel}>Administration</MsHeading>
                        <Card contentStyle={{ padding: 0 }} style={styles.mb6}>
                            <Pressable
                                onPress={() => router.navigate({ pathname: "/audit-logs" } as any)}
                                style={styles.settingsRowLast}
                            >
                                <View style={styles.row}>
                                    <IconSymbol name="list.bullet.rectangle.fill" size={20} color={colors.onSurfaceVariant} />
                                    <MsText style={styles.ml3}>Audit Logs</MsText>
                                </View>
                                <IconSymbol name="chevron.right" size={16} color="#CBD5E1" />
                            </Pressable>
                        </Card>
                    </>
                )}

                <Button
                    variant="outline"
                    style={{ marginBottom: 40, borderColor: isDark ? '#991B1B' : '#FECACA' }}
                    onPress={handleSignOut}
                >
                    Sign Out
                </Button>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    flex1: { flex: 1 },
    row: { flexDirection: 'row', alignItems: 'center' },
    mb1: { marginBottom: 4 },
    mb6: { marginBottom: 24 },
    mt2: { marginTop: 8 },
    ml3: { marginLeft: 12 },
    sectionLabel: { marginBottom: 12, marginLeft: 4 },
    textPrimary: { color: '#2563EB' },
    avatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    settingsRow: { padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1 },
    settingsRowLast: { padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    emailText: { marginRight: 8, fontSize: 14, maxWidth: 150 },
});


