import { TextInput, TextInputProps, View } from "react-native";
import { cn } from "../../utils/cn";
import { MsText } from "./Typography";

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    containerClassName?: string;
}

export function Input({ className, label, error, containerClassName, multiline, numberOfLines, ...props }: InputProps) {
    return (
        <View className={cn("gap-1.5", containerClassName)}>
            {label && <MsText variant="default" className="font-semibold text-sm ml-1">{label}</MsText>}
            <TextInput
                className={cn(
                    "bg-white dark:bg-dark-card border border-border dark:border-dark-border rounded-xl px-4 text-foreground dark:text-dark-foreground font-sans text-base",
                    "focus:border-primary focus:ring-1 focus:ring-primary",
                    // Ensure minimum touch target height (48dp) for single line inputs
                    multiline ? "py-3 min-h-[100px]" : "min-h-[52px] py-3.5",
                    error && "border-red-500 focus:border-red-500",
                    className
                )}
                placeholderTextColor="#94A3B8"
                multiline={multiline}
                numberOfLines={numberOfLines}
                textAlignVertical={multiline ? "top" : "center"}
                {...props}
            />
            {error && <MsText className="text-red-500 text-sm ml-1">{error}</MsText>}
        </View>
    );
}
