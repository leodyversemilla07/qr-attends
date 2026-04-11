import React from "react";
import { Button as PaperButton } from "react-native-paper";

interface ButtonProps extends React.ComponentProps<typeof PaperButton> {
    variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
    size?: "default" | "sm" | "lg" | "icon";
}

export const Button = React.forwardRef<React.ComponentRef<typeof PaperButton>, ButtonProps>(
    ({ variant = "primary", size = "default", loading, disabled, mode, style, labelStyle, ...props }, ref) => {
        
        let paperMode: "text" | "outlined" | "contained" | "elevated" | "contained-tonal" = "contained";
        let buttonColor = undefined;
        let textColor = undefined;

        switch (variant) {
            case "primary":
                paperMode = "contained";
                buttonColor = "#2563EB";
                break;
            case "secondary":
                paperMode = "contained-tonal";
                break;
            case "outline":
                paperMode = "outlined";
                break;
            case "ghost":
                paperMode = "text";
                break;
            case "destructive":
                paperMode = "contained";
                buttonColor = "#EF4444";
                textColor = "white";
                break;
        }

        if (mode) {
            paperMode = mode;
        }

        const minHeight = size === "lg" ? 56 : size === "sm" ? 40 : 48;
        const verticalMargin = size === "lg" ? 16 : size === "sm" ? 8 : 12;
        const fontSize = size === "sm" ? 14 : 16;

        return (
            <PaperButton
                ref={ref}
                mode={paperMode}
                loading={loading}
                disabled={disabled || loading}
                buttonColor={buttonColor}
                textColor={textColor}
                style={[{ borderRadius: 12, minHeight }, style]}
                labelStyle={[{
                    fontFamily: 'Inter_600SemiBold',
                    fontSize,
                    marginVertical: verticalMargin,
                }, labelStyle]}
                {...props}
            />
        );
    }
);

Button.displayName = "Button";

