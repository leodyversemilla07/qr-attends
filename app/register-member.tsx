import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/utils/auth-context";
import { useMutation } from "convex/react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

const memberSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50, "First name too long"),
  lastName: z.string().min(1, "Last name is required").max(50, "Last name too long"),
  middleInitial: z.string().max(5).optional(),
  studentId: z.string().min(1, "Student ID is required").max(20, "Student ID too long"),
  yearSection: z.string().max(30).optional(),
  cardNo: z.string().max(50).optional(),
  email: z.string().email("Invalid email address").or(z.literal("")).optional(),
});

type MemberFormData = z.infer<typeof memberSchema>;
interface FormErrors { firstName?: string; lastName?: string; middleInitial?: string; studentId?: string; yearSection?: string; cardNo?: string; email?: string; }

export default function RegisterMember() {
  const router = useRouter();
  const { cardNo: prefilledCardNo } = useLocalSearchParams<{ cardNo?: string }>();
  const { token } = useAuth();
  const createMember = useMutation(api.members.create);
  const { colors, dark: isDark } = useTheme();

  const [formData, setFormData] = useState<MemberFormData>({
    firstName: "", lastName: "", middleInitial: "", studentId: "", yearSection: "", cardNo: prefilledCardNo || "", email: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (prefilledCardNo) setFormData(prev => ({ ...prev, cardNo: prefilledCardNo }));
  }, [prefilledCardNo]);

  const validateForm = (): boolean => {
    try { memberSchema.parse(formData); setErrors({}); return true; }
    catch (error: any) {
      const newErrors: FormErrors = {};
      if (error.errors) error.errors.forEach((err: any) => { newErrors[err.path[0] as keyof FormErrors] = err.message; });
      setErrors(newErrors); return false;
    }
  };

  async function handleSubmit() {
    if (!validateForm() || !token) { Alert.alert("Error", "Authentication required"); return; }
    setIsLoading(true);
    try {
      await createMember({ firstName: formData.firstName, lastName: formData.lastName, middleInitial: formData.middleInitial || "", studentId: formData.studentId, yearSection: formData.yearSection || "", cardNo: formData.cardNo || "", email: formData.email || undefined, token });
      Alert.alert("Success", "Member registered successfully!");
      router.replace("/(tabs)");
    } catch (e: any) { Alert.alert("Error", e.message || "Failed to register member"); }
    finally { setIsLoading(false); }
  }

  const handleChange = (field: keyof MemberFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["bottom", "left", "right"]}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <View style={{ gap: 20 }}>
          <Input label="First Name *" value={formData.firstName} onChangeText={(t) => handleChange("firstName", t)} error={errors.firstName} />
          <Input label="Last Name *" value={formData.lastName} onChangeText={(t) => handleChange("lastName", t)} error={errors.lastName} />
          <Input label="Middle Initial" value={formData.middleInitial} onChangeText={(t) => handleChange("middleInitial", t)} maxLength={3} error={errors.middleInitial} />
          <Input label="Student ID *" value={formData.studentId} onChangeText={(t) => handleChange("studentId", t)} placeholder="e.g. 2023-1234" error={errors.studentId} />
          <Input label="Year & Section" value={formData.yearSection} onChangeText={(t) => handleChange("yearSection", t)} placeholder="e.g. BSCS 4-A" error={errors.yearSection} />
          <Input label="Card / QR Code No." value={formData.cardNo} onChangeText={(t) => handleChange("cardNo", t)} placeholder="Scan or type card ID" error={errors.cardNo} />
          <Input label="Email (Optional)" value={formData.email} onChangeText={(t) => handleChange("email", t)} keyboardType="email-address" error={errors.email} placeholder="email@example.com" />
          <Button variant="primary" onPress={handleSubmit} loading={isLoading} style={{ marginTop: 8 }}>
            Register Member
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ container: { flex: 1 } });
