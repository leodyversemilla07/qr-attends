import { Button } from "@/components/ui/button";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Input } from "@/components/ui/input";
import { MsHeading, MsText } from "@/components/ui/typography";
import { api } from "@/convex/_generated/api";
import { useTheme } from "react-native-paper";
import { useMutation } from "convex/react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ResetPasswordScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const initialToken = typeof params.token === 'string' ? params.token : '';
    const [token, setToken] = useState(initialToken);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const resetPasswordMutation = useMutation(api.officers.resetPassword);

    const handleResetPassword = async () => {
        if (!token) {
            Alert.alert("Error", "Invalid reset token.");
            router.replace({ pathname: "/forgot-password" } as any);
            return;
        }

        if (!newPassword) {
            Alert.alert("Error", "Please enter a new password.");
            return;
        }

        if (newPassword.length < 8) {
            Alert.alert("Error", "Password must be at least 8 characters.");
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match.");
            return;
        }

        setIsLoading(true);
        try {
            await resetPasswordMutation({ token, newPassword });
            Alert.alert(
                "Success",
                "Your password has been reset successfully.",
                [
                    {
                        text: "OK",
                        onPress: () => router.replace({ pathname: "/login" } as any)
                    }
                ]
            );
        } catch (e: any) {
            Alert.alert("Error", e.message || "Failed to reset password.");
        } finally {
            setIsLoading(false);
        }
    };

    const { colors, dark: isDark } = useTheme();

    return (
        <SafeAreaView style={[styles.flex1, { backgroundColor: colors.background }]}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex1}>
                <ScrollView
                    style={styles.flex1}
                    contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24 }}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.header}>
                        <View style={styles.iconBox}>
                            <IconSymbol name="lock.circle.fill" size={40} color="white" />
                        </View>
                        <MsHeading size="h1" style={[styles.mb2, { color: '#22C55E' }]}>Reset Password</MsHeading>
                        <MsText variant="muted" style={styles.textCenter}>Enter your reset token and new password below.</MsText>
                    </View>

                    <View style={[styles.formCard, { backgroundColor: colors.surface, borderColor: colors.outline }]}>
                        <Input
                            label="Reset Token"
                            placeholder="Paste reset token"
                            value={token}
                            onChangeText={setToken}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        <Input
                            label="New Password"
                            placeholder="••••••••"
                            value={newPassword}
                            onChangeText={setNewPassword}
                            secureTextEntry
                            autoCapitalize="none"
                        />
                        <Input
                            label="Confirm Password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                            autoCapitalize="none"
                        />
                        <Button
                            variant="primary"
                            buttonColor="#22C55E"
                            onPress={handleResetPassword}
                            loading={isLoading}
                        >
                            Reset Password
                        </Button>
                    </View>

                    <View style={styles.footer}>
                        <Button variant="ghost" onPress={() => router.replace({ pathname: "/login" } as any)}>Back to Sign In</Button>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    flex1: { flex: 1 },
    textCenter: { textAlign: 'center' },
    mb2: { marginBottom: 8 },
    header: { alignItems: 'center', marginBottom: 40 },
    iconBox: { width: 80, height: 80, backgroundColor: '#22C55E', borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
    formCard: { gap: 24, padding: 24, borderRadius: 24, borderWidth: 1 },
    footer: { marginTop: 48, alignItems: 'center' },
});
