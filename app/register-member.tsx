import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RegisterMember() {
  const router = useRouter();
  const { cardNo: prefilledCardNo } = useLocalSearchParams<{ cardNo?: string }>();
  const createMember = useMutation(api.members.create);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    middleInitial: "",
    studentId: "",
    yearSection: "",
    cardNo: prefilledCardNo || "",
    email: "",
  });

  // Sync pre-filled card no if it changes (though usually it's static per mount)
  useEffect(() => {
    if (prefilledCardNo) {
      setFormData(prev => ({ ...prev, cardNo: prefilledCardNo }));
    }
  }, [prefilledCardNo]);

  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit() {
    if (!formData.firstName || !formData.lastName || !formData.studentId) {
      Alert.alert("Missing Fields", "Please fill in all required fields.");
      return;
    }

    setIsLoading(true);
    try {
      await createMember(formData);
      Alert.alert("Success", "Member registered successfully!");
      router.replace('/(tabs)/index' as any);
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to register member");
    } finally {
      setIsLoading(false);
    }
  }

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['bottom', 'left', 'right']}>
      <ScrollView
        className="flex-1 px-5 pt-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >

        <View className="gap-5">
          <Input
            label="First Name *"
            value={formData.firstName}
            onChangeText={(t) => handleChange("firstName", t)}
          />
          <Input
            label="Last Name *"
            value={formData.lastName}
            onChangeText={(t) => handleChange("lastName", t)}
          />
          <Input
            label="Middle Initial"
            value={formData.middleInitial}
            onChangeText={(t) => handleChange("middleInitial", t)}
            maxLength={3}
          />

          <Input
            label="Student ID *"
            value={formData.studentId}
            onChangeText={(t) => handleChange("studentId", t)}
            placeholder="e.g. 2023-1234"
          />
          <Input
            label="Year & Section"
            value={formData.yearSection}
            onChangeText={(t) => handleChange("yearSection", t)}
            placeholder="e.g. BSCS 4-A"
          />

          <Input
            label="Card / QR Code No."
            value={formData.cardNo}
            onChangeText={(t) => handleChange("cardNo", t)}
            placeholder="Scan or type card ID"
          />
          <Input
            label="Email (Optional)"
            value={formData.email}
            onChangeText={(t) => handleChange("email", t)}
            keyboardType="email-address"
          />

          <Button
            variant="secondary"
            onPress={handleSubmit}
            loading={isLoading}
            className="mt-4"
          >
            Register Member
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
