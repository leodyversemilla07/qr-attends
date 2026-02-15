import { Button } from "@/components/ui/button";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Input } from "@/components/ui/input";
import { MsHeading, MsText } from "@/components/ui/typography";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const requestResetMutation = useMutation(api.officers.requestPasswordReset);

    const handleRequestReset = async () => {
        if (!email) {
            Alert.alert("Error", "Please enter your email address.");
            return;
        }

        setIsLoading(true);
        try {
            const result = await requestResetMutation({ email }) as { resetToken?: string };
            if (result.resetToken) {
                router.replace({ pathname: "/reset-password", params: { token: result.resetToken } } as any);
            } else {
                router.replace({ pathname: "/reset-password", params: { token: "demo" } } as any);
            }
        } catch (e: any) {
            Alert.alert("Error", e.message || "Failed to send reset link.");
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
                        <View className="w-20 h-20 bg-orange-500 rounded-3xl items-center justify-center shadow-lg shadow-orange-500/40 mb-6">
                            <IconSymbol name="lock.circle.fill" size={40} color="white" />
                        </View>
                        <MsHeading size="h1" className="text-orange-500 mb-2">Forgot Password</MsHeading>
                        <MsText variant="muted" className="text-center">
                            Enter your email address and we&apos;ll send you a link to reset your password.
                        </MsText>
                    </View>

                    <View className="gap-6 bg-white p-6 rounded-3xl border border-border shadow-sm">
                        <Input
                            label="Official Email"
                            placeholder="name@organization.com"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />

                        <Button
                            variant="primary"
                            className="mt-4 py-4 bg-orange-500"
                            onPress={handleRequestReset}
                            loading={isLoading}
                        >
                            Send Reset Link
                        </Button>
                    </View>

                    <View className="mt-12 items-center">
                        <Button variant="ghost" onPress={() => router.back()}>
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
