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
                activeOpacity={0.7}
                disabled={loading || disabled}
                className={cn(
                    "flex-row items-center justify-center rounded-xl",
                    // Variants
                    variant === "primary" && "bg-primary active:bg-blue-700",
                    variant === "secondary" && "bg-secondary active:bg-blue-600",
                    variant === "outline" && "border border-border dark:border-dark-border bg-transparent",
                    variant === "ghost" && "bg-transparent",
                    variant === "destructive" && "bg-red-500 active:bg-red-600",

                    // Sizes - ensure minimum 48dp touch target for accessibility
                    size === "default" && "min-h-[48px] px-6 py-3",
                    size === "sm" && "min-h-[40px] px-4 py-2",
                    size === "lg" && "min-h-[56px] px-8 py-4",
                    size === "icon" && "min-h-[48px] min-w-[48px] h-12 w-12",

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
