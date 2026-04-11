import { Button } from "@/components/ui/button";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Input } from "@/components/ui/input";
import { MsHeading, MsText } from "@/components/ui/typography";
import { api } from "@/convex/_generated/api";
import { useTheme } from "react-native-paper";
import { useMutation } from "convex/react";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const { colors } = useTheme();
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
            const result = await requestResetMutation({ email }) as { message?: string; resetToken?: string };
            if (result.resetToken) {
                router.replace({ pathname: "/reset-password", params: { token: result.resetToken } } as any);
            } else {
                Alert.alert(
                    "Reset Requested",
                    result.message || "If an account exists with that email, a reset link will be sent."
                );
                router.replace({ pathname: "/login" } as any);
            }
        } catch (e: any) {
            Alert.alert("Error", e.message || "Failed to send reset link.");
        } finally {
            setIsLoading(false);
        }
    };

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
                        <MsHeading size="h1" style={[styles.mb2, { color: '#F97316' }]}>Forgot Password</MsHeading>
                        <MsText variant="muted" style={styles.textCenter}>
                            Enter your email address and we&apos;ll send you a link to reset your password.
                        </MsText>
                    </View>

                    <View style={[styles.formCard, { backgroundColor: colors.surface, borderColor: colors.outline }]}>
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
                            buttonColor="#F97316"
                            onPress={handleRequestReset}
                            loading={isLoading}
                        >
                            Send Reset Link
                        </Button>
                    </View>

                    <View style={styles.footer}>
                        <Button variant="ghost" onPress={() => router.back()}>Back to Sign In</Button>
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
    iconBox: { width: 80, height: 80, backgroundColor: '#F97316', borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
    formCard: { gap: 24, padding: 24, borderRadius: 24, borderWidth: 1 },
    footer: { marginTop: 48, alignItems: 'center' },
});
