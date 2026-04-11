import { Button } from "@/components/ui/button";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/utils/auth-context";
import { useTheme } from "react-native-paper";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useMutation } from "convex/react";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Platform, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

const eventSchema = z.object({
  name: z.string().min(1, "Event name is required").max(100, "Event name too long"),
  location: z.string().min(1, "Location is required").max(100, "Location too long"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  description: z.string().max(500).optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

interface FormErrors {
  name?: string;
  location?: string;
  date?: string;
  time?: string;
  description?: string;
}

export default function CreateEvent() {
  const router = useRouter();
  const create = useMutation(api.events.create);

  const [formData, setFormData] = useState<EventFormData>({
    name: "",
    date: new Date().toISOString().split('T')[0],
    time: "",
    location: "",
    description: "",
  });

  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
      const formatted = selectedDate.toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, date: formatted }));
      if (errors.date) setErrors(prev => ({ ...prev, date: undefined }));
    }
  };

  const onTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setTime(selectedTime);
      const formatted = selectedTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      setFormData(prev => ({ ...prev, time: formatted }));
      if (errors.time) setErrors(prev => ({ ...prev, time: undefined }));
    }
  };

  const formatDisplayDate = (d: Date) => {
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDisplayTime = (t: Date) => {
    return t.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const { token } = useAuth();
  const { colors } = useTheme();

  const validateForm = (): boolean => {
    try {
      eventSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error: any) {
      const newErrors: FormErrors = {};
      if (error.errors) {
        error.errors.forEach((err: any) => {
          const path = err.path[0] as keyof FormErrors;
          newErrors[path] = err.message;
        });
      }
      setErrors(newErrors);
      return false;
    }
  };

  async function handleCreate() {
    if (!validateForm() || !token) {
      Alert.alert("Error", "Authentication required");
      return;
    }

    setIsLoading(true);
    try {
      await create({
        name: formData.name,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        token,
        description: formData.description || undefined,
      });
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to create event");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['bottom', 'left', 'right']}>
      <ScrollView 
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ gap: 20 }}>
          <Input
            label="Event Name"
            placeholder="e.g. Town Hall"
            value={formData.name}
            onChangeText={(t) => {
              setFormData(prev => ({ ...prev, name: t }));
              if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
            }}
            error={errors.name}
          />

          <View style={{ gap: 8 }}>
            <Pressable onPress={() => setShowDatePicker(true)}>
              <View pointerEvents="none">
                <Input
                  label="Date"
                  value={formatDisplayDate(date)}
                  editable={false}
                  placeholder="Select Date"
                  error={errors.date}
                />
              </View>
              <View style={{ position: 'absolute', right: 16, bottom: 12 }}>
                <IconSymbol name="calendar" size={20} color="#64748B" />
              </View>
            </Pressable>
          </View>

          <View style={{ gap: 8 }}>
            <Pressable onPress={() => setShowTimePicker(true)}>
              <View pointerEvents="none">
                <Input
                  label="Time"
                  value={formatDisplayTime(time)}
                  editable={false}
                  placeholder="Select Time"
                  error={errors.time}
                />
              </View>
              <View style={{ position: 'absolute', right: 16, bottom: 12 }}>
                <IconSymbol name="clock" size={20} color="#64748B" />
              </View>
            </Pressable>
          </View>

          <Input
            label="Location"
            placeholder="Room 101"
            value={formData.location}
            onChangeText={(t) => {
              setFormData(prev => ({ ...prev, location: t }));
              if (errors.location) setErrors(prev => ({ ...prev, location: undefined }));
            }}
            error={errors.location}
          />

          <Input
            label="Description (Optional)"
            value={formData.description}
            onChangeText={(t) => setFormData(prev => ({ ...prev, description: t }))}
            multiline
            numberOfLines={3}
            placeholder="Event details..."
          />

          <Button
            variant="primary"
            onPress={handleCreate}
            loading={isLoading}
            style={{ marginTop: 24 }}
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
