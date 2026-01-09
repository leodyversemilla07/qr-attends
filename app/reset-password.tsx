import { Button } from "@/components/ui/Button";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Input } from "@/components/ui/Input";
import { MsHeading, MsText } from "@/components/ui/Typography";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ResetPasswordScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const token = typeof params.token === 'string' ? params.token : '';
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

    return (
        <SafeAreaView className="flex-1 bg-background">
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <ScrollView
                    className="flex-1 px-6"
                    contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
                    showsVerticalScrollIndicator={false}
                >
                    <View className="items-center mb-10">
                        <View className="w-20 h-20 bg-green-500 rounded-3xl items-center justify-center shadow-lg shadow-green-500/40 mb-6">
                            <IconSymbol name="lock.circle.fill" size={40} color="white" />
                        </View>
                        <MsHeading size="h1" className="text-green-500 mb-2">Reset Password</MsHeading>
                        <MsText variant="muted" className="text-center">
                            Enter your new password below.
                        </MsText>
                    </View>

                    <View className="gap-6 bg-white p-6 rounded-3xl border border-border shadow-sm">
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
                            className="mt-4 py-4 bg-green-500"
                            onPress={handleResetPassword}
                            loading={isLoading}
                        >
                            Reset Password
                        </Button>
                    </View>

                    <View className="mt-12 items-center">
                        <Button variant="ghost" onPress={() => router.replace({ pathname: "/login" } as any)}>
                            <MsText variant="small" className="text-primary">
                                Back to Sign In
                            </MsText>
                        </Button>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
