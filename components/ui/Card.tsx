import { View, ViewProps } from "react-native";
import { cn } from "../../utils/cn";

interface CardProps extends ViewProps {
    className?: string;
}

export function Card({ className, ...props }: CardProps) {
    return (
        <View
            className={cn(
                "bg-white rounded-2xl border border-border p-6 shadow-sm",
                className
            )}
            {...props}
        />
    );
}
