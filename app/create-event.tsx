import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { api } from "@/convex/_generated/api";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useMutation } from "convex/react";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Platform, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CreateEvent() {
  const router = useRouter();
  const create = useMutation(api.events.create);

  const [name, setName] = useState("");
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [location, setLocation] = useState("");

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const onTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setTime(selectedTime);
    }
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  };

  const formatDisplayDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDisplayTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  async function handleCreate() {
    if (!name || !location) return;

    setIsLoading(true);
    try {
      await create({
        name,
        date: formatDate(date),
        time: formatTime(time),
        location,
        createdBy: "user_123", // Placeholder for unauthenticated prototype
      });
      router.replace('/(tabs)/index' as any);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['bottom', 'left', 'right']}>
      <ScrollView className="flex-1 px-5 pt-6" showsVerticalScrollIndicator={false}>

        <View className="gap-5">
          <Input
            label="Event Name"
            placeholder="e.g. Town Hall"
            value={name}
            onChangeText={setName}
          />

          <View className="gap-2">
            <Pressable onPress={() => setShowDatePicker(true)}>
              <View pointerEvents="none">
                <Input
                  label="Date"
                  value={formatDisplayDate(date)}
                  editable={false}
                  placeholder="Select Date"
                />
              </View>
              <View className="absolute right-4 bottom-3">
                <IconSymbol name="calendar" size={20} color="#64748B" />
              </View>
            </Pressable>
          </View>

          <View className="gap-2">
            <Pressable onPress={() => setShowTimePicker(true)}>
              <View pointerEvents="none">
                <Input
                  label="Time"
                  value={formatDisplayTime(time)}
                  editable={false}
                  placeholder="Select Time"
                />
              </View>
              <View className="absolute right-4 bottom-3">
                <IconSymbol name="clock" size={20} color="#64748B" />
              </View>
            </Pressable>
          </View>

          <Input
            label="Location"
            placeholder="Room 101"
            value={location}
            onChangeText={setLocation}
          />

          <Button
            variant="primary"
            onPress={handleCreate}
            loading={isLoading}
            className="mt-6"
          >
            Create Event
          </Button>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
            minimumDate={new Date()}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={time}
            mode="time"
            is24Hour={false}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onTimeChange}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
