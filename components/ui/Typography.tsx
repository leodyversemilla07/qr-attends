import { Text, TextProps } from "react-native";
import { cn } from "../../utils/cn";

interface MsTextProps extends TextProps {
    className?: string;
    variant?: "default" | "muted" | "small";
}

export function MsText({ className, variant = "default", ...props }: MsTextProps) {
    return (
        <Text
            className={cn(
                "font-sans text-foreground",
                variant === "default" && "text-base",
                variant === "muted" && "text-muted-foreground",
                variant === "small" && "text-sm",
                className
            )}
            {...props}
        />
    );
}

interface MsHeadingProps extends TextProps {
    className?: string;
    size?: "h1" | "h2" | "h3" | "h4";
}

export function MsHeading({ className, size = "h1", ...props }: MsHeadingProps) {
    return (
        <Text
            className={cn(
                "font-heading font-semibold text-foreground",
                size === "h1" && "text-3xl",
                size === "h2" && "text-2xl",
                size === "h3" && "text-xl",
                size === "h4" && "text-lg",
                className
            )}
            {...props}
        />
    );
}
