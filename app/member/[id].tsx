import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MsHeading, MsText } from "@/components/ui/typography";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/utils/auth-context";
import { useTheme } from "react-native-paper";
import { useMutation, useQuery } from "convex/react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

const memberSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  middleInitial: z.string().max(5).optional(),
  studentId: z.string().min(2, "Student ID must be at least 2 characters"),
  yearSection: z.string().max(30).optional(),
  cardNo: z.string().max(50).optional(),
  email: z.string().email("Invalid email").or(z.literal("")).optional(),
});

type MemberFormData = z.infer<typeof memberSchema>;

interface FormErrors {
  firstName?: string;
  lastName?: string;
  middleInitial?: string;
  studentId?: string;
  yearSection?: string;
  cardNo?: string;
  email?: string;
}

export default function MemberDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const memberId = id as Id<"members">;
  const { token } = useAuth();
  const { dark: isDark } = useTheme();

  const member = useQuery(api.members.get, { id: memberId });
  const updateMember = useMutation(api.members.update);
  const removeMember = useMutation(api.members.remove);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  
  const [formData, setFormData] = useState<MemberFormData>({
    firstName: "",
    lastName: "",
    middleInitial: "",
    studentId: "",
    yearSection: "",
    cardNo: "",
    email: "",
  });

  useEffect(() => {
    if (member) {
      setFormData({
        firstName: member.firstName,
        lastName: member.lastName,
        middleInitial: member.middleInitial || "",
        studentId: member.studentId,
        yearSection: member.yearSection || "",
        cardNo: member.cardNo || "",
        email: member.email || "",
      });
    }
  }, [member]);

  const validateForm = (): boolean => {
    try {
      memberSchema.parse(formData);
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

  const handleChange = (field: keyof MemberFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  async function handleUpdate() {
    if (!token || !validateForm()) return;

    setIsLoading(true);
    try {
      await updateMember({
        id: memberId,
        ...formData,
        token,
      });
      setEditModalVisible(false);
      Alert.alert("Success", "Member updated successfully");
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to update member");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete() {
    if (!token) return;

    Alert.alert(
      "Delete Member",
      "Are you sure you want to delete this member? This will also remove their attendance records.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await removeMember({ id: memberId, token });
              router.back();
            } catch (e: any) {
              Alert.alert("Error", e.message || "Failed to delete member");
            }
          }
        }
      ]
    );
  }

  if (!member) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#151718' : '#F8FAFC' }} edges={[]}>
        <View className="p-5">
          <MsText>Loading...</MsText>
        </View>
      </SafeAreaView>
    );
  }

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/members");
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{
          headerLeft: () => (
            <Pressable onPress={handleBack} style={{ padding: 8 }}>
              <IconSymbol name="chevron.left" size={24} color="#64748B" />
            </Pressable>
          ),
        }}
      />
      <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#151718' : '#F8FAFC' }} edges={[]}>
        <ScrollView className="flex-1 px-5 pt-4">
          <Card className="items-center py-6 mb-6 bg-primary/5 border-primary/10">
            <View className="w-20 h-20 rounded-full bg-primary items-center justify-center mb-4">
            <MsText className="text-white font-bold text-2xl">
              {member.firstName[0]}{member.lastName[0]}
            </MsText>
          </View>
          <MsHeading size="h3">{member.firstName} {member.lastName}</MsHeading>
          {member.middleInitial && (
            <MsText variant="muted" className="mt-1">M.I.: {member.middleInitial}</MsText>
          )}
        </Card>

        <MsHeading size="h4" className="mb-3">Information</MsHeading>
        <Card className="p-4 mb-6">
          <InfoRow label="Student ID" value={member.studentId} />
          <InfoRow label="Year/Section" value={member.yearSection} />
          <InfoRow label="Card Number" value={member.cardNo} />
          <InfoRow label="Email" value={member.email || "Not provided"} />
        </Card>

        <View className="flex-row gap-3 mb-10">
          <Button
            variant="primary"
            className="flex-1"
            onPress={() => setEditModalVisible(true)}
          >
            <IconSymbol name="pencil" size={18} color="white" />
            <MsText className="text-white ml-2">Edit</MsText>
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onPress={handleDelete}
          >
            <IconSymbol name="trash" size={18} color="white" />
            <MsText className="text-white ml-2">Delete</MsText>
          </Button>
        </View>
      </ScrollView>

      <Modal
        visible={editModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: isDark ? '#151718' : '#F8FAFC' }}>
          <SafeAreaView className="flex-1 p-4">
            <View className="flex-row justify-between items-center mb-6">
              <MsHeading size="h3">Edit Member</MsHeading>
              <Button variant="ghost" onPress={() => setEditModalVisible(false)}>Cancel</Button>
            </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Input
              label="First Name *"
              value={formData.firstName}
              onChangeText={(t) => handleChange("firstName", t)}
              error={errors.firstName}
              className="mb-4"
            />
            <Input
              label="Last Name *"
              value={formData.lastName}
              onChangeText={(t) => handleChange("lastName", t)}
              error={errors.lastName}
              className="mb-4"
            />
            <Input
              label="Middle Initial"
              value={formData.middleInitial}
              onChangeText={(t) => handleChange("middleInitial", t)}
              maxLength={3}
              className="mb-4"
            />
            <Input
              label="Student ID *"
              value={formData.studentId}
              onChangeText={(t) => handleChange("studentId", t)}
              error={errors.studentId}
              className="mb-4"
            />
            <Input
              label="Year/Section"
              value={formData.yearSection}
              onChangeText={(t) => handleChange("yearSection", t)}
              placeholder="e.g. BSCS 4-A"
              className="mb-4"
            />
            <Input
              label="Card Number"
              value={formData.cardNo}
              onChangeText={(t) => handleChange("cardNo", t)}
              className="mb-4"
            />
            <Input
              label="Email"
              value={formData.email}
              onChangeText={(t) => handleChange("email", t)}
              keyboardType="email-address"
              error={errors.email}
              placeholder="email@example.com"
              className="mb-6"
            />

            <Button
              variant="primary"
              onPress={handleUpdate}
              loading={isLoading}
            >
              Save Changes
            </Button>
          </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between items-center py-2 border-b border-border last:border-0">
      <MsText variant="muted" className="flex-shrink-0 mr-3">{label}</MsText>
      <MsText className="font-medium flex-1 text-right" numberOfLines={1} ellipsizeMode="tail">{value}</MsText>
    </View>
  );
}
