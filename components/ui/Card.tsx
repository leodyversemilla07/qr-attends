import React from "react";
import { StyleProp, ViewStyle } from "react-native";
import { Card as PaperCard, useTheme } from "react-native-paper";

interface CardProps {
    children?: React.ReactNode;
    mode?: "elevated" | "outlined" | "contained";
    style?: StyleProp<ViewStyle>;
    contentStyle?: StyleProp<ViewStyle>;
    className?: string;
}

export function Card({ children, mode = "elevated", style, contentStyle, className, ...props }: CardProps) {
    const { colors } = useTheme();
    return (
        <PaperCard
            mode={mode}
            {...(className ? { className } as any : {})}
            style={[
                { borderRadius: 16, backgroundColor: colors.surface },
                mode === "outlined" && { borderColor: colors.outline },
                style,
            ]}
            {...props}
        >
            <PaperCard.Content style={[{ padding: 16 }, contentStyle]}>
                {children}
            </PaperCard.Content>
        </PaperCard>
    );
}

