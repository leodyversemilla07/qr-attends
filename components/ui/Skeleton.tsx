import React, { useEffect } from "react";
import { Animated, StyleProp, ViewStyle } from "react-native";
import { cn } from "../../utils/cn";

interface SkeletonProps {
    width?: number | string;
    height?: number | string;
    className?: string;
    style?: StyleProp<ViewStyle>;
}

export function Skeleton({ width, height, className, style }: SkeletonProps) {
    const opacity = new Animated.Value(0.3);

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 0.7,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.3,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    return (
        <Animated.View
            style={[
                {
                    width: width as any,
                    height: height as any,
                    opacity,
                },
                style,
            ]}
            className={cn("bg-slate-200 dark:bg-dark-muted rounded-lg", className)}
        />
    );
}
