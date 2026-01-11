import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, TouchableOpacityProps, View } from "react-native";
import { cn } from "../../utils/cn";

interface ButtonProps extends TouchableOpacityProps {
    variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
    size?: "default" | "sm" | "lg" | "icon";
    loading?: boolean;
    className?: string;
    textClassName?: string;
    children?: React.ReactNode;
}

export const Button = React.forwardRef<View, ButtonProps>(
    ({ variant = "primary", size = "default", loading, className, textClassName, children, disabled, ...props }, ref) => {
        return (
            <TouchableOpacity
                ref={ref as any}
                activeOpacity={0.8}
                disabled={loading || disabled}
                className={cn(
                    "flex-row items-center justify-center rounded-xl",
                    // Variants
                    variant === "primary" && "bg-primary active:bg-blue-700",
                    variant === "secondary" && "bg-secondary active:bg-blue-600",
                    variant === "outline" && "border border-border dark:border-dark-border bg-transparent",
                    variant === "ghost" && "bg-transparent",
                    variant === "destructive" && "bg-red-500 active:bg-red-600",

                    // Sizes
                    size === "default" && "h-12 px-5 py-3",
                    size === "sm" && "h-9 px-3",
                    size === "lg" && "h-14 px-8",
                    size === "icon" && "h-10 w-10",

                    // Disabled
                    (disabled || loading) && "opacity-50",
                    className
                )}
                {...props}
            >
                {loading ? (
                    <ActivityIndicator color={variant === "outline" || variant === "ghost" ? "#2563EB" : "white"} />
                ) : (
                    <>
                        {typeof children === 'string' ? (
                            <Text
                                className={cn(
                                    "font-heading font-semibold text-base",
                                    variant === "primary" && "text-primary-foreground",
                                    variant === "secondary" && "text-secondary-foreground",
                                    variant === "outline" && "text-foreground dark:text-dark-foreground",
                                    variant === "ghost" && "text-foreground dark:text-dark-foreground",
                                    variant === "destructive" && "text-white",
                                    textClassName
                                )}
                            >
                                {children}
                            </Text>
                        ) : (
                            children
                        )}
                    </>
                )}
            </TouchableOpacity>
        );
    }
);

Button.displayName = "Button";
