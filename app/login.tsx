import { Button } from "@/components/ui/Button";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Input } from "@/components/ui/Input";
import { MsHeading, MsText } from "@/components/ui/Typography";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/utils/auth-context";
import { useMutation } from "convex/react";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

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
                        <View className="w-20 h-20 bg-primary rounded-3xl items-center justify-center shadow-lg shadow-primary/40 rotate-12 mb-6">
                            <IconSymbol name="plus.circle.fill" size={40} color="white" />
                        </View>
                        <MsHeading size="h1" className="text-primary mb-2">Officer Portal</MsHeading>
                        <MsText variant="muted" className="text-center">Secure access for organization officers only.</MsText>
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

                        <Input
                            label="Access Password"
                            placeholder="••••••••"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            autoCapitalize="none"
                        />

                        <Pressable onPress={() => router.navigate({ pathname: "/forgot-password" } as any)} className="self-end mt-1">
                            <MsText variant="small" className="text-primary">Forgot Password?</MsText>
                        </Pressable>

                        <Button
                            variant="primary"
                            className="mt-4 py-4"
                            onPress={handleLogin}
                            loading={isLoading}
                        >
                            Secure Sign In
                        </Button>
                    </View>

                    <View className="mt-12 items-center">
                        <MsText variant="small" className="text-slate-400">
                            © 2026 QR Attends | Built for Officers
                        </MsText>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
