import React from "react";
import { Dimensions, ScrollView, View } from "react-native";
import { Card } from "@/components/ui/card";
import { MsHeading, MsText } from "@/components/ui/typography";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useTheme } from "react-native-paper";
import { useAttendanceStats } from "@/hooks/use-queries";

const { width } = Dimensions.get("window");

function BarChart({ data, maxValue }: { data: number[]; maxValue: number }) {
    const barWidth = (width - 80) / data.length;
    return (
        <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", height: 160, marginTop: 16 }}>
            {data.map((value, index) => {
                const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
                return (
                    <View key={index} style={{ alignItems: "center" }}>
                        <View style={{ width: barWidth * 0.7, height: `${Math.max(height, 5)}%` as any, backgroundColor: "#2563EB", borderTopLeftRadius: 4, borderTopRightRadius: 4 }} />
                        <MsText variant="small" style={{ marginTop: 4, color: "#64748B" }}>{index + 1}</MsText>
                    </View>
                );
            })}
        </View>
    );
}

const iconColors = { primary: "#2563EB", success: "#22C55E", warning: "#F59E0B", info: "#8B5CF6" };
const bgColors = { primary: "#EFF6FF", success: "#F0FDF4", warning: "#FEFCE8", info: "#F5F3FF" };

function StatCard({ title, value, icon, trend, color = "primary" }: { title: string; value: string | number; icon: string; trend?: { value: number; isPositive: boolean }; color?: "primary" | "success" | "warning" | "info" }) {
    return (
        <Card style={{ flex: 1, margin: 4, backgroundColor: bgColors[color] }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: `${iconColors[color]}20`, alignItems: "center", justifyContent: "center" }}>
                    <IconSymbol name={icon as any} size={20} color={iconColors[color]} />
                </View>
                {trend && (
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <IconSymbol name={trend.isPositive ? "arrow.up" : "arrow.down"} size={12} color={trend.isPositive ? "#22C55E" : "#EF4444"} />
                        <MsText variant="small" style={{ color: trend.isPositive ? "#22C55E" : "#EF4444" }}>{Math.abs(trend.value)}%</MsText>
                    </View>
                )}
            </View>
            <MsHeading size="h2">{value}</MsHeading>
            <MsText variant="small" style={{ color: "#64748B", marginTop: 4 }}>{title}</MsText>
        </Card>
    );
}

export function AttendanceAnalytics() {
    const { colors } = useTheme();
    const { data: stats, isLoading } = useAttendanceStats();
    const weeklyData = [45, 62, 38, 71, 55, 48, 66];
    const maxWeekly = Math.max(...weeklyData);

    if (isLoading) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <MsText>Loading analytics...</MsText>
            </View>
        );
    }

    return (
        <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
            <View style={{ padding: 16 }}>
                <MsHeading size="h3">Attendance Analytics</MsHeading>
                <MsText variant="muted">Insights and trends</MsText>
            </View>

            <View style={{ flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 8 }}>
                <StatCard title="Total Check-ins" value={stats?.totalCheckIns || 0} icon="checkmark.circle.fill" color="success" />
                <StatCard title="Today's Check-ins" value={stats?.todayCheckIns || 0} icon="calendar" color="primary" trend={{ value: 12, isPositive: true }} />
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 8, marginTop: 8 }}>
                <StatCard title="Total Events" value={stats?.totalEvents || 0} icon="calendar.badge.clock" color="info" />
                <StatCard title="Total Members" value={stats?.totalMembers || 0} icon="person.3.fill" color="warning" />
            </View>

            <Card style={{ margin: 16 }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <MsHeading size="h4">Weekly Check-ins</MsHeading>
                    <MsText variant="small" style={{ color: colors.onSurfaceVariant }}>Last 7 days</MsText>
                </View>
                <BarChart data={weeklyData} maxValue={maxWeekly} />
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.outline }}>
                    <View>
                        <MsText variant="small" style={{ color: colors.onSurfaceVariant }}>Average</MsText>
                        <MsText style={{ fontWeight: "600" }}>{Math.round(weeklyData.reduce((a, b) => a + b, 0) / weeklyData.length)}</MsText>
                    </View>
                    <View>
                        <MsText variant="small" style={{ color: colors.onSurfaceVariant }}>Best Day</MsText>
                        <MsText style={{ fontWeight: "600" }}>{Math.max(...weeklyData)}</MsText>
                    </View>
                    <View>
                        <MsText variant="small" style={{ color: colors.onSurfaceVariant }}>Total</MsText>
                        <MsText style={{ fontWeight: "600" }}>{weeklyData.reduce((a, b) => a + b, 0)}</MsText>
                    </View>
                </View>
            </Card>

            <Card style={{ margin: 16 }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <MsHeading size="h4">Attendance Rate</MsHeading>
                    <IconSymbol name="chart.pie.fill" size={20} color="#8B5CF6" />
                </View>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View style={{ flex: 1 }}>
                        <MsHeading size="h2" style={{ color: "#7C3AED" }}>
                            {stats?.totalCheckIns && stats?.totalEvents ? Math.round((stats.totalCheckIns / (stats.totalEvents * 50)) * 100) : 0}%
                        </MsHeading>
                        <MsText variant="small" style={{ color: colors.onSurfaceVariant, marginTop: 4 }}>Average attendance rate</MsText>
                    </View>
                    <View style={{ width: 96, height: 96, borderRadius: 48, borderWidth: 8, borderColor: "#EDE9FE", alignItems: "center", justifyContent: "center" }}>
                        <IconSymbol name="person.fill.checkmark" size={32} color="#8B5CF6" />
                    </View>
                </View>
            </Card>

            <Card style={{ margin: 16, marginBottom: 32 }}>
                <MsHeading size="h4" style={{ marginBottom: 16 }}>Quick Insights</MsHeading>
                <View style={{ gap: 12 }}>
                    {[
                        { bg: "#DCFCE7", iconBg: "#F0FDF4", icon: "arrow.up", iconColor: "#22C55E", title: "Attendance is up 12%", sub: "Compared to last week" },
                        { bg: "#DBEAFE", iconBg: "#EFF6FF", icon: "calendar.badge.clock", iconColor: "#2563EB", title: "Most active: Friday", sub: "71 check-ins on average" },
                        { bg: "#FEF9C3", iconBg: "#FEFCE8", icon: "exclamationmark.triangle", iconColor: "#F59E0B", title: "3 members haven't attended", sub: "In the last 30 days" },
                    ].map((item, i) => (
                        <View key={i} style={{ flexDirection: "row", alignItems: "center" }}>
                            <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: item.iconBg, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                                <IconSymbol name={item.icon as any} size={16} color={item.iconColor} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <MsText style={{ fontWeight: "500" }}>{item.title}</MsText>
                                <MsText variant="small" style={{ color: colors.onSurfaceVariant }}>{item.sub}</MsText>
                            </View>
                        </View>
                    ))}
                </View>
            </Card>
        </ScrollView>
    );
}
