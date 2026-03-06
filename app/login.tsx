import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MsHeading, MsText } from "@/components/ui/typography";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/utils/auth-context";
import { useTheme } from "react-native-paper";
import { useMutation } from "convex/react";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const { colors, dark: isDark } = useTheme();
    const router = useRouter();
    const loginMutation = useMutation(api.officers.login);
    const { signIn } = useAuth();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please enter both email and password.");
            return;
        }
        setIsLoading(true);
        try {
            const result = await loginMutation({ email, password });
            await signIn(result.token);
        } catch (e: any) {
            Alert.alert("Login Failed", e.message || "Invalid credentials. Please contact the administrator.");
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
                    <View style={styles.logoSection}>
                        <View style={[styles.logoWrapper, { backgroundColor: colors.surface }]}>
                            <Image
                                source={require("@/assets/images/icon.png")}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                        </View>
                        <MsHeading size="h1" style={[styles.textPrimary, styles.mb2]}>Officer Portal</MsHeading>
                        <MsText variant="muted" style={styles.textCenter}>Secure access for organization officers only.</MsText>
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
                        <Input
                            label="Access Password"
                            placeholder="••••••••"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            autoCapitalize="none"
                        />
                        <Pressable onPress={() => router.navigate({ pathname: "/forgot-password" } as any)} style={styles.forgotBtn}>
                            <MsText variant="small" style={styles.textPrimary}>Forgot Password?</MsText>
                        </Pressable>
                        <Button variant="primary" size="lg" onPress={handleLogin} loading={isLoading}>
                            Secure Sign In
                        </Button>
                    </View>

                    <View style={styles.footer}>
                        <MsText variant="small" style={{ color: isDark ? '#64748B' : '#94A3B8' }}>
                            © 2026 QR Attends | Built for Officers
                        </MsText>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    flex1: { flex: 1 },
    textPrimary: { color: '#2563EB' },
    textCenter: { textAlign: 'center' },
    mb2: { marginBottom: 8 },
    logoSection: { alignItems: 'center', marginBottom: 40 },
    logoWrapper: { shadowColor: '#2563EB', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 4, marginBottom: 32, borderRadius: 16, padding: 4 },
    logo: { width: 80, height: 80, borderRadius: 12 },
    formCard: { gap: 24, padding: 24, borderRadius: 24, borderWidth: 1 },
    forgotBtn: { alignSelf: 'flex-end', marginTop: 4, marginBottom: 16 },
    footer: { marginTop: 48, alignItems: 'center' },
});


