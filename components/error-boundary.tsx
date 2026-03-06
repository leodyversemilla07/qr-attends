import { IconSymbol } from "@/components/ui/icon-symbol";
import { MsHeading, MsText } from "@/components/ui/typography";
import { logError } from "@/utils/sentry";
import React, { Component, ErrorInfo, ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";

interface Props { children: ReactNode; fallback?: ReactNode; onError?: (error: Error, errorInfo: ErrorInfo) => void; }
interface State { hasError: boolean; error: Error | null; errorInfo: ErrorInfo | null; }

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        this.setState({ errorInfo });
        console.error("ErrorBoundary caught an error:", error, errorInfo);
        logError(error, { componentStack: errorInfo.componentStack, boundary: "ErrorBoundary" });
        if (this.props.onError) this.props.onError(error, errorInfo);
    }

    resetError = (): void => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render(): ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;
            return (
                <View style={styles.container}>
                    <View style={styles.iconCircle}>
                        <IconSymbol name="exclamationmark.triangle" size={40} color="#EF4444" />
                    </View>
                    <MsHeading size="h2" style={{ textAlign: "center", marginBottom: 8 }}>Something went wrong</MsHeading>
                    <MsText variant="muted" style={{ textAlign: "center", marginBottom: 32 }}>
                        We apologize for the inconvenience. Please try again.
                    </MsText>
                    {__DEV__ && this.state.error && (
                        <View style={styles.errorBox}>
                            <MsText variant="small" style={{ color: "#991B1B", fontFamily: "monospace" }}>
                                {this.state.error.toString()}
                            </MsText>
                            {this.state.errorInfo && (
                                <MsText variant="small" style={{ color: "#DC2626", fontFamily: "monospace", marginTop: 8 }}>
                                    {this.state.errorInfo.componentStack}
                                </MsText>
                            )}
                        </View>
                    )}
                    <Pressable onPress={this.resetError} style={({ pressed }) => [styles.button, pressed && { opacity: 0.8 }]}>
                        <MsText style={{ color: "white", fontWeight: "600" }}>Try Again</MsText>
                    </Pressable>
                </View>
            );
        }
        return this.props.children;
    }
}

export function useErrorHandler() {
    return {
        handleError: (error: Error, context?: string) => {
            console.error(`Error${context ? ` in ${context}` : ""}:`, error);
            logError(error, { context });
        },
    };
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: "#F8FAFC" },
    iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#FEE2E2", alignItems: "center", justifyContent: "center", marginBottom: 24 },
    errorBox: { width: "100%", backgroundColor: "#FEF2F2", padding: 16, borderRadius: 8, marginBottom: 24 },
    button: { paddingHorizontal: 32, paddingVertical: 12, backgroundColor: "#2563EB", borderRadius: 12 },
});
