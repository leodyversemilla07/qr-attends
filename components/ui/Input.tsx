import { TextInput, TextInputProps, View } from "react-native";
import { cn } from "../../utils/cn";
import { MsText } from "./Typography";

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    containerClassName?: string;
}

export function Input({ className, label, error, containerClassName, ...props }: InputProps) {
    return (
        <View className={cn("gap-2", containerClassName)}>
            {label && <MsText variant="default" className="font-semibold">{label}</MsText>}
            <TextInput
                className={cn(
                    "bg-white dark:bg-dark-card border border-border dark:border-dark-border rounded-xl px-4 py-3 text-foreground dark:text-dark-foreground font-sans text-base",
                    "focus:border-primary focus:ring-1 focus:ring-primary",
                    error && "border-red-500 focus:border-red-500",
                    className
                )}
                placeholderTextColor="#94A3B8"
                {...props}
            />
            {error && <MsText className="text-red-500 text-sm">{error}</MsText>}
        </View>
    );
}
