import React from 'react';
import { View, ScrollView, Dimensions } from 'react-native';
import { Card } from '@/components/ui/card';
import { MsHeading, MsText } from '@/components/ui/typography';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAttendanceStats } from '@/hooks/use-queries';


const { width } = Dimensions.get('window');

// Simple bar chart component
function BarChart({ data, maxValue }: { data: number[]; maxValue: number }) {
  const barWidth = (width - 80) / data.length;
  
  return (
    <View className="flex-row items-end justify-between h-40 mt-4">
      {data.map((value, index) => {
        const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
        return (
          <View key={index} className="items-center">
            <View 
              className="bg-primary rounded-t-md"
              style={{ 
                width: barWidth * 0.7, 
                height: `${Math.max(height, 5)}%`,
              }}
            />
            <MsText variant="small" className="mt-1 text-muted-foreground">
              {index + 1}
            </MsText>
          </View>
        );
      })}
    </View>
  );
}

// Stat card component
function StatCard({ 
  title, 
  value, 
  icon, 
  trend,
  color = 'primary' 
}: { 
  title: string; 
  value: string | number; 
  icon: string;
  trend?: { value: number; isPositive: boolean };
  color?: 'primary' | 'success' | 'warning' | 'info';
}) {
  const colorClasses = {
    primary: 'bg-blue-50 dark:bg-blue-900/30',
    success: 'bg-green-50 dark:bg-green-900/30',
    warning: 'bg-yellow-50 dark:bg-yellow-900/30',
    info: 'bg-purple-50 dark:bg-purple-900/30',
  };

  const iconColors = {
    primary: '#2563EB',
    success: '#22C55E',
    warning: '#F59E0B',
    info: '#8B5CF6',
  };

  return (
    <Card className={`flex-1 m-1 ${colorClasses[color]}`}>
      <View className="flex-row items-center justify-between mb-2">
        <View 
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: `${iconColors[color]}20` }}
        >
          <IconSymbol name={icon as any} size={20} color={iconColors[color]} />
        </View>
        {trend && (
          <View className={`flex-row items-center ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            <IconSymbol 
              name={trend.isPositive ? 'arrow.up' : 'arrow.down'} 
              size={12} 
              color={trend.isPositive ? '#22C55E' : '#EF4444'} 
            />
            <MsText 
              variant="small" 
              className={trend.isPositive ? 'text-green-600' : 'text-red-600'}
            >
              {Math.abs(trend.value)}%
            </MsText>
          </View>
        )}
      </View>
      <MsHeading size="h2" className="text-2xl">{value}</MsHeading>
      <MsText variant="small" className="text-muted-foreground mt-1">{title}</MsText>
    </Card>
  );
}

export function AttendanceAnalytics() {
  const { data: stats, isLoading } = useAttendanceStats();

  // Generate sample weekly data (in production, this would come from API)
  const weeklyData = [45, 62, 38, 71, 55, 48, 66];
  const maxWeekly = Math.max(...weeklyData);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <MsText>Loading analytics...</MsText>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background dark:bg-dark-background">
      {/* Header */}
      <View className="p-4">
        <MsHeading size="h3">Attendance Analytics</MsHeading>
        <MsText variant="muted">Insights and trends</MsText>
      </View>

      {/* Key Metrics */}
      <View className="flex-row flex-wrap px-2">
        <StatCard
          title="Total Check-ins"
          value={stats?.totalCheckIns || 0}
          icon="checkmark.circle.fill"
          color="success"
        />
        <StatCard
          title="Today's Check-ins"
          value={stats?.todayCheckIns || 0}
          icon="calendar"
          color="primary"
          trend={{ value: 12, isPositive: true }}
        />
      </View>

      <View className="flex-row flex-wrap px-2 mt-2">
        <StatCard
          title="Total Events"
          value={stats?.totalEvents || 0}
          icon="calendar.badge.clock"
          color="info"
        />
        <StatCard
          title="Total Members"
          value={stats?.totalMembers || 0}
          icon="person.3.fill"
          color="warning"
        />
      </View>

      {/* Weekly Trend Chart */}
      <Card className="m-4">
        <View className="flex-row items-center justify-between mb-2">
          <MsHeading size="h4">Weekly Check-ins</MsHeading>
          <MsText variant="small" className="text-muted-foreground">
            Last 7 days
          </MsText>
        </View>
        <BarChart data={weeklyData} maxValue={maxWeekly} />
        <View className="flex-row justify-between mt-4 pt-4 border-t border-border dark:border-dark-border">
          <View>
            <MsText variant="small" className="text-muted-foreground">Average</MsText>
            <MsText className="font-semibold">
              {Math.round(weeklyData.reduce((a, b) => a + b, 0) / weeklyData.length)}
            </MsText>
          </View>
          <View>
            <MsText variant="small" className="text-muted-foreground">Best Day</MsText>
            <MsText className="font-semibold">{Math.max(...weeklyData)}</MsText>
          </View>
          <View>
            <MsText variant="small" className="text-muted-foreground">Total</MsText>
            <MsText className="font-semibold">{weeklyData.reduce((a, b) => a + b, 0)}</MsText>
          </View>
        </View>
      </Card>

      {/* Attendance Rate */}
      <Card className="m-4">
        <View className="flex-row items-center justify-between mb-4">
          <MsHeading size="h4">Attendance Rate</MsHeading>
          <IconSymbol name="chart.pie.fill" size={20} color="#8B5CF6" />
        </View>
        <View className="flex-row items-center">
          <View className="flex-1">
            <MsHeading size="h2" className="text-purple-600">
              {stats?.totalCheckIns && stats?.totalEvents
                ? Math.round((stats.totalCheckIns / (stats.totalEvents * 50)) * 100) // Assuming avg 50 per event
                : 0}%
            </MsHeading>
            <MsText variant="small" className="text-muted-foreground mt-1">
              Average attendance rate
            </MsText>
          </View>
          <View className="w-24 h-24 rounded-full border-8 border-purple-100 dark:border-purple-900/30 items-center justify-center">
            <IconSymbol name="person.fill.checkmark" size={32} color="#8B5CF6" />
          </View>
        </View>
      </Card>

      {/* Quick Insights */}
      <Card className="m-4 mb-8">
        <MsHeading size="h4" className="mb-4">Quick Insights</MsHeading>
        <View className="space-y-3">
          <View className="flex-row items-center">
            <View className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 items-center justify-center mr-3">
              <IconSymbol name="arrow.up" size={16} color="#22C55E" />
            </View>
            <View className="flex-1">
              <MsText className="font-medium">Attendance is up 12%</MsText>
              <MsText variant="small" className="text-muted-foreground">
                Compared to last week
              </MsText>
            </View>
          </View>
          <View className="flex-row items-center">
            <View className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 items-center justify-center mr-3">
              <IconSymbol name="calendar.badge.clock" size={16} color="#2563EB" />
            </View>
            <View className="flex-1">
              <MsText className="font-medium">Most active: Friday</MsText>
              <MsText variant="small" className="text-muted-foreground">
                71 check-ins on average
              </MsText>
            </View>
          </View>
          <View className="flex-row items-center">
            <View className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 items-center justify-center mr-3">
              <IconSymbol name="exclamationmark.triangle" size={16} color="#F59E0B" />
            </View>
            <View className="flex-1">
              <MsText className="font-medium">3 members haven&apos;t attended</MsText>
              <MsText variant="small" className="text-muted-foreground">
                In the last 30 days
              </MsText>
            </View>
          </View>
        </View>
      </Card>
    </ScrollView>
  );
}
