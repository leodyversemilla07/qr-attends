import { StyleSheet, Text, TextProps } from "react-native";
import { useTheme } from "react-native-paper";

interface MsTextProps extends TextProps {
    variant?: "default" | "muted" | "small";
}

export function MsText({ variant = "default", style, ...props }: MsTextProps) {
    const { colors } = useTheme();
    return (
        <Text
            style={[
                styles.base,
                { color: colors.onBackground },
                variant === "muted" && { color: colors.onSurfaceVariant },
                variant === "small" && styles.small,
                style,
            ]}
            {...props}
        />
    );
}

interface MsHeadingProps extends TextProps {
    size?: "h1" | "h2" | "h3" | "h4";
}

export function MsHeading({ size = "h1", style, ...props }: MsHeadingProps) {
    const { colors } = useTheme();
    return (
        <Text
            style={[
                styles.headingBase,
                { color: colors.onBackground },
                size === "h1" && styles.h1,
                size === "h2" && styles.h2,
                size === "h3" && styles.h3,
                size === "h4" && styles.h4,
                style,
            ]}
            {...props}
        />
    );
}

const styles = StyleSheet.create({
    base: {
        fontFamily: 'WorkSans_400Regular',
        fontSize: 16,
    },
    small: {
        fontSize: 14,
    },
    headingBase: {
        fontFamily: 'Inter_600SemiBold',
        fontWeight: '600',
    },
    h1: { fontSize: 30 },
    h2: { fontSize: 24 },
    h3: { fontSize: 20 },
    h4: { fontSize: 18 },
});

