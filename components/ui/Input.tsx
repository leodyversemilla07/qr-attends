import React from "react";
import { View } from "react-native";
import { HelperText, TextInput as PaperTextInput, useTheme } from "react-native-paper";

interface InputProps extends Omit<React.ComponentProps<typeof PaperTextInput>, "error"> {
    label?: string;
    error?: string | boolean;
    containerStyle?: object;
}

export const Input = React.forwardRef<any, InputProps>(
    ({ label, error, containerStyle, multiline, numberOfLines, style, mode = "outlined", ...props }, ref) => {
        const { colors, dark: isDark } = useTheme();

        return (
            <View style={[{ marginBottom: 8 }, containerStyle]}>
                <PaperTextInput
                    ref={ref}
                    mode={mode}
                    label={label}
                    error={!!error}
                    multiline={multiline}
                    numberOfLines={numberOfLines}
                    textColor={colors.onBackground}
                    style={[
                        {
                            backgroundColor: colors.surface,
                            minHeight: multiline ? 100 : 52,
                            fontFamily: "WorkSans_400Regular",
                        },
                        style,
                    ]}
                    outlineStyle={{ borderRadius: 12 }}
                    {...props}
                />
                {typeof error === "string" && (
                    <HelperText type="error" visible={!!error} style={{ fontFamily: "WorkSans_400Regular" }}>
                        {error}
                    </HelperText>
                )}
            </View>
        );
    }
);

Input.displayName = "Input";
