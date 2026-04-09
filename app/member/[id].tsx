import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { MsHeading, MsText } from "@/components/ui/typography";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/utils/auth-context";
import { useMutation, useQuery } from "convex/react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useTheme } from "react-native-paper";
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
  const { colors, dark: isDark } = useTheme();

  const member = useQuery(api.members.get, token ? { id: memberId, token } : "skip");
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
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
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
          },
        },
      ]
    );
  }

  if (!member) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? "#151718" : "#F8FAFC" }} edges={[]}>
        <View style={styles.loadingWrap}>
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

      <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? "#151718" : "#F8FAFC" }} edges={[]}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          <Card mode="outlined" style={styles.profileCard} contentStyle={{ alignItems: "center", paddingVertical: 24 }}>
            <View style={styles.avatar}>
              <MsText style={styles.avatarText}>
                {member.firstName[0]}
                {member.lastName[0]}
              </MsText>
            </View>
            <MsHeading size="h3">{member.firstName} {member.lastName}</MsHeading>
            {member.middleInitial ? (
              <MsText variant="muted" style={{ marginTop: 4 }}>M.I.: {member.middleInitial}</MsText>
            ) : null}
          </Card>

          <MsHeading size="h4" style={{ marginBottom: 12 }}>Information</MsHeading>
          <Card mode="outlined" style={{ marginBottom: 24 }} contentStyle={{ padding: 16 }}>
            <InfoRow label="Student ID" value={member.studentId} />
            <InfoRow label="Year/Section" value={member.yearSection} />
            <InfoRow label="Card Number" value={member.cardNo} />
            <InfoRow label="Email" value={member.email || "Not provided"} />
          </Card>

          <View style={styles.actionsRow}>
            <Button variant="primary" style={styles.actionBtn} onPress={() => setEditModalVisible(true)}>
              Edit
            </Button>
            <Button variant="destructive" style={styles.actionBtn} onPress={handleDelete}>
              Delete
            </Button>
          </View>
        </ScrollView>

        <Modal
          visible={editModalVisible}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setEditModalVisible(false)}
        >
          <View style={{ flex: 1, backgroundColor: isDark ? "#151718" : "#F8FAFC" }}>
            <SafeAreaView style={{ flex: 1, padding: 16 }}>
              <View style={styles.modalHeader}>
                <MsHeading size="h3">Edit Member</MsHeading>
                <Button variant="ghost" onPress={() => setEditModalVisible(false)}>
                  Cancel
                </Button>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <Input
                  label="First Name *"
                  value={formData.firstName}
                  onChangeText={(t: string) => handleChange("firstName", t)}
                  error={errors.firstName}
                  containerStyle={styles.inputGap}
                />
                <Input
                  label="Last Name *"
                  value={formData.lastName}
                  onChangeText={(t: string) => handleChange("lastName", t)}
                  error={errors.lastName}
                  containerStyle={styles.inputGap}
                />
                <Input
                  label="Middle Initial"
                  value={formData.middleInitial}
                  onChangeText={(t: string) => handleChange("middleInitial", t)}
                  maxLength={3}
                  containerStyle={styles.inputGap}
                />
                <Input
                  label="Student ID *"
                  value={formData.studentId}
                  onChangeText={(t: string) => handleChange("studentId", t)}
                  error={errors.studentId}
                  containerStyle={styles.inputGap}
                />
                <Input
                  label="Year/Section"
                  value={formData.yearSection}
                  onChangeText={(t: string) => handleChange("yearSection", t)}
                  placeholder="e.g. BSCS 4-A"
                  containerStyle={styles.inputGap}
                />
                <Input
                  label="Card Number"
                  value={formData.cardNo}
                  onChangeText={(t: string) => handleChange("cardNo", t)}
                  containerStyle={styles.inputGap}
                />
                <Input
                  label="Email"
                  value={formData.email}
                  onChangeText={(t: string) => handleChange("email", t)}
                  keyboardType="email-address"
                  error={errors.email}
                  placeholder="email@example.com"
                  containerStyle={styles.inputGapLarge}
                />

                <Button variant="primary" onPress={handleUpdate} loading={isLoading}>
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
  const { colors } = useTheme();

  return (
    <View style={[styles.infoRow, { borderBottomColor: colors.outlineVariant }]}> 
      <MsText variant="muted" style={styles.infoLabel}>{label}</MsText>
      <MsText style={styles.infoValue} numberOfLines={1} ellipsizeMode="tail">
        {value}
      </MsText>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingWrap: { padding: 20 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  profileCard: { marginBottom: 24 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    backgroundColor: "#2563EB",
  },
  avatarText: { color: "white", fontWeight: "700", fontSize: 24 },
  actionsRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  actionBtn: { flex: 1 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  inputGap: { marginBottom: 8 },
  inputGapLarge: { marginBottom: 16 },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  infoLabel: { flexShrink: 0, marginRight: 12 },
  infoValue: { fontWeight: "500", flex: 1, textAlign: "right" },
});
