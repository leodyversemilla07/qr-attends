import { View, ViewProps } from "react-native";
import { cn } from "../../utils/cn";

interface CardProps extends ViewProps {
    className?: string;
}

export function Card({ className, ...props }: CardProps) {
    return (
        <View
            className={cn(
                "bg-white dark:bg-dark-card rounded-2xl border border-border dark:border-dark-border p-6 shadow-sm",
                className
            )}
            {...props}
        />
    );
}
